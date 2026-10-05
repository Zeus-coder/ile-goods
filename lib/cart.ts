import { cookies } from "next/headers";
import { getSession } from "./auth";
import { query } from "./db";
import { priceBreakdown } from "./money";

export const CART_COOKIE = "ile_cart";

export type CartLine = {
  product_id: number;
  slug: string;
  name: string;
  maker: string;
  image_url: string;
  category: string;
  price_kobo: number;
  stock: number;
  quantity: number;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function readCookieCartId() {
  const id = (await cookies()).get(CART_COOKIE)?.value;
  return id && UUID.test(id) ? id : null;
}

async function oldestUserCart(userId: string) {
  const [row] = await query<{ id: string }>("select id from carts where user_id = $1 order by created_at limit 1", [userId]);
  return row?.id ?? null;
}

// Signed-in shoppers have one cart tied to their account (their oldest), shared by the website
// and the mobile app. Guests get a cookie cart, which is claimed by the account on sign-in, or
// merged into the account cart if one already exists.
export async function currentCartId() {
  const [session, cookieCartId] = await Promise.all([getSession(), readCookieCartId()]);

  if (!session) {
    if (!cookieCartId) return null;
    // A cart left behind by a signed-out account stays private to that account.
    const rows = await query<{ id: string }>("select id from carts where id = $1 and user_id is null", [cookieCartId]);
    return rows[0]?.id ?? null;
  }

  const userId = session.user.id;
  const own = await oldestUserCart(userId);
  if (cookieCartId && cookieCartId !== own) {
    // Claim atomically so concurrent renders can't merge the same guest cart twice.
    const claimed = await query("update carts set user_id = $2 where id = $1 and user_id is null returning id", [cookieCartId, userId]);
    if (claimed.length && own) {
      await query(
        `insert into cart_items (cart_id, product_id, quantity, added_at)
         select $1, ci.product_id, least(ci.quantity, p.stock), ci.added_at
         from cart_items ci join products p on p.id = ci.product_id
         where ci.cart_id = $2 and p.stock > 0
         on conflict (cart_id, product_id)
         do update set quantity = least(cart_items.quantity + excluded.quantity,
                                        (select stock from products where id = excluded.product_id))`,
        [own, cookieCartId],
      );
      await query("delete from carts where id = $1", [cookieCartId]);
    }
  }
  return oldestUserCart(userId);
}

// Only callable from a server action or route handler, since it may set a cookie.
export async function ensureCartId() {
  const existing = await currentCartId();
  if (existing) return existing;

  const session = await getSession();
  const [cart] = await query<{ id: string }>("insert into carts (user_id) values ($1) returning id", [session?.user.id ?? null]);
  if (!session) {
    (await cookies()).set(CART_COOKIE, cart.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return cart.id;
}

export async function addItem(cartId: string, productId: number, quantity: number) {
  await query(
    `insert into cart_items (cart_id, product_id, quantity)
     select $1, p.id, least($3, p.stock) from products p where p.id = $2 and p.stock > 0
     on conflict (cart_id, product_id)
     do update set quantity = least(cart_items.quantity + excluded.quantity,
                                    (select stock from products where id = $2))`,
    [cartId, productId, Math.max(1, Math.floor(quantity))],
  );
  await query("update carts set updated_at = now() where id = $1", [cartId]);
}

export async function setItemQuantity(cartId: string, productId: number, quantity: number) {
  if (quantity <= 0) {
    await query("delete from cart_items where cart_id = $1 and product_id = $2", [cartId, productId]);
  } else {
    await query(
      `update cart_items set quantity = least($3, (select stock from products where id = $2))
       where cart_id = $1 and product_id = $2`,
      [cartId, productId, Math.floor(quantity)],
    );
  }
  await query("update carts set updated_at = now() where id = $1", [cartId]);
}

export async function getCart() {
  const cartId = await currentCartId();
  const lines = cartId
    ? await query<CartLine>(
        `select p.id as product_id, p.slug, p.name, p.maker, p.image_url, p.category, p.price_kobo, p.stock, ci.quantity
         from cart_items ci join products p on p.id = ci.product_id
         where ci.cart_id = $1
         order by ci.added_at`,
        [cartId],
      )
    : [];
  const subtotal = lines.reduce((sum, l) => sum + l.price_kobo * l.quantity, 0);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { cartId, lines, count, ...priceBreakdown(subtotal) };
}

export type Cart = Awaited<ReturnType<typeof getCart>>;
