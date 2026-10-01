// Creates the Better Auth tables and the shop tables. Products come from `npm run db:import`.
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

console.log("Next: run `npm run db:import` to load the catalogue.");

await pool.end();
