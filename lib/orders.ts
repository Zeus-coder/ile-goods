import { query } from "./db";

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  delivery_notes: string | null;
  payment_method: "pay_on_delivery" | "bank_transfer";
  status: string;
  subtotal_kobo: number;
  shipping_kobo: number;
  vat_kobo: number;
  total_kobo: number;
  email_sent_at: string | null;
  created_at: string;
};

export type OrderItem = {
  product_id: number | null;
  name: string;
  image_url: string;
  category: string;
  unit_price_kobo: number;
  quantity: number;
};

export const PAYMENT_LABELS: Record<Order["payment_method"], string> = {
  pay_on_delivery: "Pay on delivery",
  bank_transfer: "Bank transfer",
};

export async function getOrder(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [order] = await query<Order>("select * from orders where id = $1", [id]);
  if (!order) return null;
  const items = await query<OrderItem>(
    `select oi.product_id, oi.name, oi.image_url, coalesce(p.category, '') as category, oi.unit_price_kobo, oi.quantity
     from order_items oi left join products p on p.id = oi.product_id
     where oi.order_id = $1 order by oi.id`,
    [id],
  );
  return { order, items };
}

// Includes guest orders placed with the same (Google-verified) email before the shopper signed in.
export function listOrdersForUser(userId: string, email: string) {
  return query<Order & { item_count: number }>(
    `select o.*, (select coalesce(sum(quantity), 0)::int from order_items where order_id = o.id) as item_count
     from orders o
     where o.user_id = $1 or (o.user_id is null and o.email = lower($2))
     order by o.created_at desc`,
    [userId, email],
  );
}
