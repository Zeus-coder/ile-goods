import { cookies } from "next/headers";
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

export async function readCartId() {
  const id = (await cookies()).get(CART_COOKIE)?.value;
  return id && UUID.test(id) ? id : null;
}

// Only callable from a server action or route handler, since it may set a cookie.
export async function ensureCartId() {
  const existing = await readCartId();
  if (existing) {
    const rows = await query<{ id: string }>("select id from carts where id = $1", [existing]);
    if (rows[0]) return existing;
  }
  const [cart] = await query<{ id: string }>("insert into carts default values returning id");
  (await cookies()).set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return cart.id;
}

export async function getCart() {
  const cartId = await readCartId();
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
