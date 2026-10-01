import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import { GoogleSignInButton } from "@/components/auth-buttons";
import { CheckoutForm } from "@/components/checkout-form";
import { Logo } from "@/components/logo";
import { ProductImage } from "@/components/product-image";
import { getSession, googleConfigured } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { formatNaira } from "@/lib/money";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [cart, session] = await Promise.all([getCart(), getSession()]);
  if (cart.lines.length === 0) redirect("/cart");
  if (cart.lines.some((l) => l.quantity > l.stock)) redirect("/cart");

  return (
    <div className="min-h-dvh bg-white">
      {/* Checkout keeps only what helps finish the order: logo, a way back, and help. */}
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-5 text-sm">
            <a href="mailto:hello@ilegoods.ng" className="hidden text-muted hover:text-ink sm:block">Need help?</a>
            <Link href="/cart" className="inline-flex items-center gap-2 text-muted hover:text-ink">
              <ArrowLeftIcon size={16} weight="bold" />
              Back to bag
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div>
          <h1 className="font-serif text-5xl tracking-[-0.02em] text-ink-strong">Checkout</h1>

          {session ? (
            <p className="mt-4 text-muted">
              Signed in as <span className="text-ink-strong">{session.user.email}</span>. This order will appear in your order history.
            </p>
          ) : (
            <div className="mt-6 rounded-xl border border-line bg-surface p-5">
              <p className="text-[15px]">
                <span className="font-medium text-ink-strong">Checking out as a guest.</span>{" "}
                <span className="text-muted">Just fill in the form below.</span>
              </p>
              {googleConfigured && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="sm:w-64">
                    <GoogleSignInButton callbackURL="/checkout" label="Sign in with Google" />
                  </div>
                  <p className="text-sm text-muted">Optional. Fills in your email and keeps your order history.</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-10">
            <CheckoutForm
              total={formatNaira(cart.total)}
              defaults={{ email: session?.user.email ?? "", fullName: session?.user.name ?? "" }}
            />
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-line bg-surface p-6 sm:p-8 lg:sticky lg:top-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-ink-strong">Order summary</h2>
            <Link href="/cart" className="text-sm text-muted underline underline-offset-4 hover:text-ink">Edit bag</Link>
          </div>
          <ul className="mt-6 space-y-4">
            {cart.lines.map((l) => (
              <li key={l.product_id} className="flex items-center gap-4">
                <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-md border border-line bg-bone">
                  <ProductImage src={l.image_url} alt="" category={l.category} sizes="56px" iconSize={22} />
                  <span className="absolute -right-0 top-0 grid min-w-5 place-items-center rounded-bl-md bg-ink-strong px-1 font-mono text-[11px] leading-5 text-white">{l.quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${l.slug}`} className="block truncate text-[15px] text-ink-strong hover:underline">{l.name}</Link>
                  <p className="text-sm text-muted">{formatNaira(l.price_kobo)} x {l.quantity}</p>
                </div>
                <p className="font-mono text-sm tabular-nums">{formatNaira(l.price_kobo * l.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-3 border-t border-line pt-6 text-[15px]">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-mono tabular-nums">{formatNaira(cart.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="font-mono tabular-nums">{cart.shipping ? formatNaira(cart.shipping) : "Free"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Includes VAT (7.5%)</dt><dd className="font-mono tabular-nums text-muted">{formatNaira(cart.vat)}</dd></div>
            <div className="flex justify-between border-t border-line pt-4 text-base font-medium text-ink-strong"><dt>Total</dt><dd className="font-mono tabular-nums">{formatNaira(cart.total)}</dd></div>
          </dl>
        </aside>
      </main>
    </div>
  );
}
