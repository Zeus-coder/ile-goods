import { authClient } from "./auth-client";
import { API_URL } from "./config";

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  maker: string;
  description: string;
  price_kobo: number;
  image_url: string;
  stock: number;
};

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

export type Cart = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
};

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookie = await authClient.getCookie();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    // Send the session cookie by hand; "include" would interfere with it.
    credentials: "omit",
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}), ...init.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status);
  return data as T;
}

export const api = {
  products: () => request<{ products: Product[] }>("/api/products").then((d) => d.products),
  cart: () => request<Cart>("/api/cart"),
  addToCart: (productId: number, quantity = 1) =>
    request<Cart>("/api/cart", { method: "POST", body: JSON.stringify({ productId, quantity }) }),
  setQuantity: (productId: number, quantity: number) =>
    request<Cart>("/api/cart", { method: "PATCH", body: JSON.stringify({ productId, quantity }) }),
};
