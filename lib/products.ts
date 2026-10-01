import { query } from "./db";

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

const columns = "id, slug, name, category, maker, description, price_kobo, image_url, stock";

export function listProducts() {
  return query<Product>(`select ${columns} from products order by id`);
}

export async function getProduct(slug: string) {
  const rows = await query<Product>(`select ${columns} from products where slug = $1`, [slug]);
  return rows[0] ?? null;
}
