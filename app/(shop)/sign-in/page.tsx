import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth-buttons";
import { getSession, googleConfigured } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  if (await getSession()) redirect("/account");

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="font-serif text-4xl tracking-[-0.02em] text-ink-strong">Sign in</h1>
      <p className="mt-3 text-muted">See your order history and check out faster next time.</p>
      <div className="mt-8">
        {googleConfigured ? (
          <GoogleSignInButton />
        ) : (
          <p className="rounded-md bg-sand px-4 py-3 text-sm text-sand-ink">
            Google sign-in isn't set up yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local and restart the server.
          </p>
        )}
      </div>
      <p className="mt-8 text-sm text-muted">
        You don't need an account to buy. <Link href="/cart" className="text-ink-strong underline underline-offset-4">Go to your bag</Link>
      </p>
    </div>
  );
}
