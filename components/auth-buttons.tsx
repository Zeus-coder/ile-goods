"use client";

import { useState } from "react";
import { GoogleLogoIcon, SignOutIcon } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";

export function GoogleSignInButton({ callbackURL = "/account", label = "Continue with Google" }: { callbackURL?: string; label?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const { error } = await authClient.signIn.social({ provider: "google", callbackURL });
          if (error) {
            setError(error.message ?? "Google sign-in didn't start. Try again.");
            setPending(false);
          }
        }}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-line bg-white px-5 text-[15px] font-medium text-ink-strong transition hover:bg-bone active:scale-[0.98] disabled:opacity-60"
      >
        <GoogleLogoIcon size={20} weight="bold" />
        {pending ? "Opening Google..." : label}
      </button>
      {error && <p className="mt-2 text-sm text-rose-ink" role="alert">{error}</p>}
    </div>
  );
}

export function SignOutButton() {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        window.location.href = "/";
      }}
      className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm hover:bg-bone"
    >
      <SignOutIcon size={16} weight="bold" />
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
