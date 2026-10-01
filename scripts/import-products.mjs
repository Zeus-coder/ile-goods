// Imports home products with real photos from DummyJSON (https://dummyjson.com/docs/products).
// Safe to re-run: rows are upserted by slug.
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL?.replace("sslmode=require", "sslmode=verify-full") });

const NAIRA_PER_DOLLAR = 1500;
const categories = {
  "home-decoration": { label: "Decor", fallbackMaker: "Ilé Goods Home" },
  furniture: { label: "Furniture", fallbackMaker: "Ilé Goods Home" },
  "kitchen-accessories": { label: "Kitchen", fallbackMaker: "Ilé Goods Kitchen" },
};

// Round to the nearest ₦500 so prices read like shelf prices, then store in kobo.
const toKobo = (usd) => Math.max(500, Math.round((usd * NAIRA_PER_DOLLAR) / 500) * 500) * 100;
const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

let imported = 0;
for (const [apiCategory, { label, fallbackMaker }] of Object.entries(categories)) {
  const res = await fetch(`https://dummyjson.com/products/category/${apiCategory}?limit=0`);
  if (!res.ok) throw new Error(`DummyJSON ${apiCategory}: HTTP ${res.status}`);
  const { products } = await res.json();

  for (const p of products) {
    await pool.query(
      `insert into products (slug, name, category, maker, description, price_kobo, image_url, stock)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (slug) do update set
         name = excluded.name, category = excluded.category, maker = excluded.maker,
         description = excluded.description, price_kobo = excluded.price_kobo, image_url = excluded.image_url`,
      [slugify(p.title), p.title, label, p.brand || fallbackMaker, p.description, toKobo(p.price), p.images[0] ?? p.thumbnail, p.stock],
    );
    imported++;
  }
  console.log(`${label}: ${products.length} products`);
}

const { rows } = await pool.query("select count(*)::int as n from products");
console.log(`Imported ${imported}. Products: ${rows[0].n} in catalogue`);

await pool.end();
