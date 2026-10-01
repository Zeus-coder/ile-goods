# Ilé Goods

A small online shop: product catalogue, a cart saved in the database, guest or Google checkout, and order confirmation emails.

- **Next.js 16** (App Router, server actions) + Tailwind v4
- **Neon Postgres**: products, carts, orders, users and sessions (project `sweet-thunder-74692153`, branch `production`)
- **Better Auth** with Google sign-in (OAuth client from Google Cloud Console)
- **Mailgun** for order confirmation emails

## Run it

```bash
npm install
npm run db:setup   # creates tables and seeds products (safe to re-run)
npm run dev        # http://localhost:3000
```

Environment variables live in `.env.local` (git-ignored). `.env.example` lists them all.

## Google sign-in setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. **APIs & Services > OAuth consent screen**: choose *External*, fill in the app name and your email, and add yourself as a test user.
3. **APIs & Services > Credentials > Create credentials > OAuth client ID**, type *Web application*:
   - Authorized JavaScript origin: `http://localhost:3000`
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy the client ID and secret into `.env.local` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, then restart `npm run dev`.

When you deploy, add the production origin and `https://<your-domain>/api/auth/callback/google` to the same client, and set `BETTER_AUTH_URL` to the production URL.

Sign-in is optional for buying. Signed-in shoppers get their email pre-filled and an order history at `/account`, which also picks up guest orders placed with the same email.

## Mailgun

The sandbox domain only delivers to **authorized recipients** (Mailgun dashboard > Sending > Overview > Authorized recipients). Add any address you want to test with, or verify your own domain and update `MAILGUN_DOMAIN` / `MAILGUN_FROM`.

If an email fails, the order is still saved and the confirmation page says the email didn't go out.

## Payments

Checkout offers *pay on delivery* and *bank transfer*. No card details are collected. Hooking up Paystack or Flutterwave would be the next step for online card payments.

## Product photos

The seeded products have no real photos yet, so the shop shows a coloured tile per category. Set `products.image_url` to a real image URL (for example, uploaded to the `hnglesson2` Neon bucket declared in `neon.ts`) and the photo replaces the tile everywhere.

## Neon

```bash
npx neon config plan   # preview changes in neon.ts
npx neon deploy        # apply them
npx neon env pull      # refresh DATABASE_URL etc. in .env.local
```
