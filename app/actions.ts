"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ensureCartId, readCartId } from "@/lib/cart";
import { checkoutSchema, type CheckoutField } from "@/lib/checkout-schema";
import { query, withTransaction } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/mail";
import { priceBreakdown } from "@/lib/money";
import type { Order, OrderItem } from "@/lib/orders";

export async function addToCart(productId: number, quantity = 1) {
  const cartId = await ensureCartId();
  await query(
    `insert into cart_items (cart_id, product_id, quantity)
     select $1, p.id, least($3, p.stock) from products p where p.id = $2 and p.stock > 0
     on conflict (cart_id, product_id)
     do update set quantity = least(cart_items.quantity + excluded.quantity,
                                    (select stock from products where id = $2))`,
    [cartId, productId, Math.max(1, Math.floor(quantity))],
  );
  await query("update carts set updated_at = now() where id = $1", [cartId]);
  revalidatePath("/", "layout");
}

export async function setCartQuantity(productId: number, quantity: number) {
  const cartId = await readCartId();
  if (!cartId) return;
  if (quantity <= 0) {
    await query("delete from cart_items where cart_id = $1 and product_id = $2", [cartId, productId]);
  } else {
    await query(
      `update cart_items set quantity = least($3, (select stock from products where id = $2))
       where cart_id = $1 and product_id = $2`,
      [cartId, productId, Math.floor(quantity)],
    );
  }
  revalidatePath("/", "layout");
}

export type CheckoutState = {
  fieldErrors?: Partial<Record<CheckoutField, string>>;
  formError?: string;
  values?: Record<string, string>;
};

class StockError extends Error {}

function orderNumber() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alphabet[randomInt(alphabet.length)];
  return `ILE-${code}`;
}

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const values = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string") as [string, string][],
  );
  const parsed = checkoutSchema.safeParse({ ...values, deliveryNotes: values.deliveryNotes || undefined });
  if (!parsed.success) {
    const fieldErrors: CheckoutState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as CheckoutField;
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors, values };
  }
  const data = parsed.data;

  const cartId = await readCartId();
  if (!cartId) return { formError: "Your bag is empty. Add something before checking out.", values };

  const session = await getSession();
  const userId = session?.user.id ?? null;

  let result: { order: Order; items: OrderItem[] };
  try {
    result = await withTransaction(async (db) => {
      // Lock the products in this cart so two shoppers can't buy the last item twice.
      const { rows: lines } = await db.query<{
        product_id: number; name: string; image_url: string; category: string; price_kobo: number; stock: number; quantity: number;
      }>(
        `select p.id as product_id, p.name, p.image_url, p.category, p.price_kobo, p.stock, ci.quantity
         from cart_items ci join products p on p.id = ci.product_id
         where ci.cart_id = $1 order by ci.added_at for update of p`,
        [cartId],
      );
      if (lines.length === 0) throw new StockError("Your bag is empty. Add something before checking out.");
      const short = lines.find((l) => l.quantity > l.stock);
      if (short) {
        throw new StockError(
          short.stock === 0
            ? `${short.name} just sold out. Remove it from your bag to continue.`
            : `Only ${short.stock} of ${short.name} left. Lower the quantity in your bag to continue.`,
        );
      }

      const subtotal = lines.reduce((s, l) => s + l.price_kobo * l.quantity, 0);
      const { shipping, vat, total } = priceBreakdown(subtotal);
      const { rows: [order] } = await db.query<Order>(
        `insert into orders (order_number, user_id, email, full_name, phone, address, city, state, delivery_notes,
                             payment_method, subtotal_kobo, shipping_kobo, vat_kobo, total_kobo)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) returning *`,
        [orderNumber(), userId, data.email.toLowerCase(), data.fullName, data.phone, data.address, data.city,
         data.state, data.deliveryNotes ?? null, data.paymentMethod, subtotal, shipping, vat, total],
      );

      const items: OrderItem[] = [];
      for (const l of lines) {
        await db.query(
          `insert into order_items (order_id, product_id, name, image_url, unit_price_kobo, quantity)
           values ($1, $2, $3, $4, $5, $6)`,
          [order.id, l.product_id, l.name, l.image_url, l.price_kobo, l.quantity],
        );
        await db.query("update products set stock = stock - $2 where id = $1", [l.product_id, l.quantity]);
        items.push({ product_id: l.product_id, name: l.name, image_url: l.image_url, category: l.category, unit_price_kobo: l.price_kobo, quantity: l.quantity });
      }
      await db.query("delete from cart_items where cart_id = $1", [cartId]);
      if (userId) await db.query("update carts set user_id = $2 where id = $1", [cartId, userId]);
      return { order, items };
    });
  } catch (error) {
    if (error instanceof StockError) return { formError: error.message, values };
    console.error("placeOrder failed", error);
    return { formError: "We couldn't place your order. Nothing was charged. Please try again in a moment.", values };
  }

  // The order is saved; a failed email shouldn't undo it. The confirmation page says so if it fails.
  const h = await headers();
  const siteUrl = process.env.BETTER_AUTH_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  try {
    await sendOrderConfirmation(result.order, result.items, siteUrl);
    await query("update orders set email_sent_at = now() where id = $1", [result.order.id]);
  } catch (error) {
    console.error("Confirmation email failed", error);
  }

  revalidatePath("/", "layout");
  redirect(`/orders/${result.order.id}?placed=1`);
}
