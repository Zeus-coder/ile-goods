// Creates the Better Auth tables, the shop tables, and seeds the catalogue.
// Safe to run more than once.
import pg from "pg";
import { getMigrations } from "better-auth/db/migration";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const { runMigrations, toBeCreated, toBeAdded } = await getMigrations({ database: pool });
if (toBeCreated.length || toBeAdded.length) {
  await runMigrations();
  console.log(`Auth tables: created ${toBeCreated.map((t) => t.table).join(", ") || "none"}`);
} else {
  console.log("Auth tables: up to date");
}

await pool.query(`
  create table if not exists products (
    id serial primary key,
    slug text unique not null,
    name text not null,
    category text not null,
    maker text not null,
    description text not null,
    price_kobo integer not null check (price_kobo >= 0),
    image_url text not null,
    stock integer not null default 0 check (stock >= 0),
    created_at timestamptz not null default now()
  );

  create table if not exists carts (
    id uuid primary key default gen_random_uuid(),
    user_id text references "user"(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

  create table if not exists cart_items (
    cart_id uuid not null references carts(id) on delete cascade,
    product_id integer not null references products(id) on delete cascade,
    quantity integer not null check (quantity > 0),
    added_at timestamptz not null default now(),
    primary key (cart_id, product_id)
  );

  create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    order_number text unique not null,
    user_id text references "user"(id) on delete set null,
    email text not null,
    full_name text not null,
    phone text not null,
    address text not null,
    city text not null,
    state text not null,
    delivery_notes text,
    payment_method text not null check (payment_method in ('pay_on_delivery', 'bank_transfer')),
    status text not null default 'placed',
    subtotal_kobo integer not null,
    shipping_kobo integer not null,
    vat_kobo integer not null,
    total_kobo integer not null,
    email_sent_at timestamptz,
    created_at timestamptz not null default now()
  );

  create table if not exists order_items (
    id serial primary key,
    order_id uuid not null references orders(id) on delete cascade,
    product_id integer references products(id) on delete set null,
    name text not null,
    image_url text not null,
    unit_price_kobo integer not null,
    quantity integer not null check (quantity > 0)
  );

  create index if not exists orders_user_id_idx on orders(user_id);
  create index if not exists order_items_order_id_idx on order_items(order_id);
`);
console.log("Shop tables: ready");

const products = [
  ["adire-indigo-throw", "Adire indigo throw", "Textiles", "Mama Ronke's studio, Abeokuta",
    "Hand-dyed cotton throw using the oniko tie-resist method. Each one comes out a little different. 130 x 180 cm, machine wash cold.", 4850000, 14],
  ["stoneware-mug-pair", "Stoneware mugs, set of two", "Ceramics", "Kiln House, Ilorin",
    "Thick-walled mugs with a speckled oat glaze. Holds 340 ml, keeps tea hot through a long call. Dishwasher safe.", 1800000, 32],
  ["clay-water-pot", "Clay water pot", "Ceramics", "Dada Pottery, Ọ̀yọ́",
    "Unglazed terracotta pot that keeps water cool the old way. 9 litre capacity with a fitted lid and wooden stand.", 3200000, 6],
  ["shea-vetiver-candle", "Shea and vetiver candle", "Home fragrance", "Ewà Candle Co., Lagos",
    "Shea and soy wax blend poured into a reusable amber jar. Earthy vetiver with a little lime. Around 45 hours of burn time.", 1450000, 40],
  ["raffia-basket-large", "Raffia storage basket, large", "Storage", "Weavers' collective, Ìsẹ́yìn",
    "Tightly woven raffia with leather handles. Fits two bath towels or a week of laundry. 40 cm across, 35 cm tall.", 2650000, 18],
  ["jos-plateau-coffee", "Jos Plateau coffee, 340 g", "Pantry", "Highland Roasters, Jos",
    "Single-origin arabica, medium roast. Notes of cocoa, dates and a bit of citrus. Whole bean, roasted to order every Monday.", 1180000, 55],
  ["aso-oke-table-runner", "Aso-oke table runner", "Textiles", "Ìṣẹ́yìn loom workshop",
    "Strip-woven aso-oke in charcoal and gold thread. 35 x 180 cm, dry clean or gentle hand wash.", 2200000, 11],
  ["iroko-serving-board", "Iroko serving board", "Kitchen", "Ọmọ Igi Woodworks, Ibadan",
    "Cut from reclaimed iroko and finished with food-safe oil. 50 x 22 cm with a carved handle. Oil it once a month.", 2950000, 9],
  ["black-soap-shea-duo", "Black soap and shea bar duo", "Bath", "Àdùn Naturals, Ọ̀ṣogbo",
    "Traditional dudu-osun black soap with an unrefined shea butter bar. No added fragrance, wrapped in kraft paper.", 740000, 70],
];

for (const [slug, name, category, maker, description, price, stock] of products) {
  await pool.query(
    `insert into products (slug, name, category, maker, description, price_kobo, image_url, stock)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (slug) do nothing`,
    [slug, name, category, maker, description, price, `https://picsum.photos/seed/ile-${slug}/900/1100`, stock],
  );
}
const { rows } = await pool.query("select count(*)::int as n from products");
console.log(`Products: ${rows[0].n} in catalogue`);

await pool.end();
