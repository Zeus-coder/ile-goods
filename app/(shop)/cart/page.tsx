import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, HandbagIcon } from "@phosphor-icons/react/ssr";
import { CartLineControls } from "@/components/cart-line-controls";
import { ProductImage } from "@/components/product-image";
import { getCart } from "@/lib/cart";
import { FREE_SHIPPING_FROM_KOBO, formatNaira } from "@/lib/money";

export const metadata: Metadata = { title: "Your bag" };

export default async function CartPage() {
  const cart = await getCart();

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-32 text-center">
        <div className="grid size-14 place-items-center rounded-xl bg-bone">
          <HandbagIcon size={26} weight="bold" />
        </div>
        <h1 className="mt-6 font-serif text-4xl tracking-[-0.02em] text-ink-strong">Your bag is empty</h1>
        <p className="mt-3 text-muted">Pieces you add will wait here for 30 days.</p>
        <Link href="/#shop" className="mt-8 inline-flex h-12 items-center rounded-md bg-ink-strong px-6 font-medium text-white hover:bg-press">
          Browse the collection
        </Link>
      </div>
    );
  }

  const toFree = FREE_SHIPPING_FROM_KOBO - cart.subtotal;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-5xl tracking-[-0.02em] text-ink-strong">Your bag</h1>
      <p className="mt-2 text-muted">
        {cart.count} {cart.count === 1 ? "item" : "items"}
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <ul>
          {cart.lines.map((line) => (
            <li key={line.product_id} className="flex gap-5 border-b border-line py-6 first:pt-0">
              <Link href={`/products/${line.slug}`} className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-bone sm:w-28">
                <ProductImage src={line.image_url} alt={line.name} category={line.category} sizes="112px" iconSize={32} />
              </Link>
              <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <Link href={`/products/${line.slug}`} className="font-medium text-ink-strong hover:underline">
                    {line.name}
                  </Link>
                  <p className="text-sm text-muted">{line.maker}</p>
                  <p className="mt-1 font-mono text-sm tabular-nums text-muted">{formatNaira(line.price_kobo)} each</p>
                  {line.quantity > line.stock && (
                    <p className="mt-2 text-sm text-rose-ink">
                      {line.stock === 0 ? "Sold out. Remove it to check out." : `Only ${line.stock} left. Lower the quantity to check out.`}
                    </p>
                  )}
                  <div className="mt-4">
                    <CartLineControls productId={line.product_id} quantity={line.quantity} stock={line.stock} name={line.name} />
                  </div>
                </div>
                <p className="font-mono tabular-nums text-ink-strong sm:text-right">{formatNaira(line.price_kobo * line.quantity)}</p>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-xl border border-line bg-surface p-6 sm:p-8 lg:sticky lg:top-24">
          <h2 className="text-lg font-medium text-ink-strong">Order summary</h2>
          <dl className="mt-6 space-y-3 text-[15px]">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-mono tabular-nums">{formatNaira(cart.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="font-mono tabular-nums">{cart.shipping ? formatNaira(cart.shipping) : "Free"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Includes VAT (7.5%)</dt><dd className="font-mono tabular-nums text-muted">{formatNaira(cart.vat)}</dd></div>
            <div className="flex justify-between border-t border-line pt-4 text-base font-medium text-ink-strong"><dt>Total</dt><dd className="font-mono tabular-nums">{formatNaira(cart.total)}</dd></div>
          </dl>
          {toFree > 0 && (
            <p className="mt-5 rounded-md bg-sand px-4 py-3 text-sm text-sand-ink">
              Add {formatNaira(toFree)} more for free delivery.
            </p>
          )}
          {cart.lines.some((l) => l.quantity > l.stock) ? (
            <p className="mt-6 text-sm text-rose-ink">Fix the items marked above to continue.</p>
          ) : (
            <Link href="/checkout" className="mt-6 flex h-12 items-center justify-center gap-2 rounded-md bg-ink-strong font-medium text-white transition hover:bg-press active:scale-[0.98]">
              Check out
              <ArrowRightIcon size={18} weight="bold" />
            </Link>
          )}
          <p className="mt-4 text-center text-sm text-muted">No account needed. Pay on delivery or by transfer.</p>
        </aside>
      </div>
    </div>
  );
}
