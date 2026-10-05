import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { pool } from "./db";

export const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  database: pool,
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          prompt: "select_account",
        },
      }
    : {},
  // The Android app (mobile/) signs in through this server and comes back via its ilegoods:// scheme.
  trustedOrigins: ["ilegoods://", ...(process.env.NODE_ENV === "development" ? ["exp://", "exp://**"] : [])],
  plugins: [expo(), nextCookies()],
});

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
