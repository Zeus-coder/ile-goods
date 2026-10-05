# Ilé Goods

A small online shop: product catalogue, a cart saved in the database, guest or Google checkout, and order confirmation emails.

- **Next.js 16** (App Router, server actions) + Tailwind v4
- **Neon Postgres**: products, carts, orders, users and sessions (project `sweet-thunder-74692153`, branch `production`)
- **Better Auth** with Google sign-in (OAuth client from Google Cloud Console)
- **Mailgun** for order confirmation emails

## Run it

```bash
npm install
npm run db:setup   # creates tables (safe to re-run)
npm run db:import  # loads the product catalogue (safe to re-run)
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

Emails send from the verified domain `ile-goods.usezana.app`, so they reach any address. A Mailgun sandbox domain would only deliver to **authorized recipients** (Mailgun dashboard > Sending > Overview > Authorized recipients).

If an email fails, the order is still saved and the confirmation page says the email didn't go out.

## Payments

Checkout offers *pay on delivery* and *bank transfer*. No card details are collected. Hooking up Paystack or Flutterwave would be the next step for online card payments.

## Products

The catalogue comes from [DummyJSON](https://dummyjson.com/docs/products), a free product API with real photos. `npm run db:import` pulls its decor, furniture and kitchen products into Neon, converting dollar prices to naira at ₦1,500/$ rounded to the nearest ₦500. Re-running it updates the same rows by slug.

Products are ordinary rows in the `products` table, so you can add or edit them directly. A product without a usable `image_url` shows a coloured category tile instead of a photo.

## Android app (`mobile/`)

An Expo (React Native) app that shares accounts and the cart with the website.

- **Same account**: the app signs in with Google through this site's Better Auth server (Expo plugin, `ilegoods://` scheme), so no extra Google client is needed.
- **Same cart**: a signed-in user's cart is stored against their account, not the browser. The website and the app both read and write it, so items added on one show up on the other. A guest cart is merged into the account cart on sign-in.
- **API used by the app**: `GET /api/products`, and `GET`/`POST`/`PATCH /api/cart` (session cookie required).

```bash
cd mobile
npm install
npx expo run:android            # dev build on a connected device or emulator
```

Build an installable APK locally (Java 17 and the Android SDK required):

```bash
cd mobile
npx expo prebuild -p android
cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a,x86_64
# arm64-v8a / armeabi-v7a: physical phones. x86_64: the Android emulator on an Intel Mac.
# → android/app/build/outputs/apk/release/app-release.apk
```

The app talks to `https://ile-goods.netlify.app` by default; set `EXPO_PUBLIC_API_URL` to point it elsewhere.

## Neon

```bash
npx neon config plan   # preview changes in neon.ts
npx neon deploy        # apply them
npx neon env pull      # refresh DATABASE_URL etc. in .env.local
```
