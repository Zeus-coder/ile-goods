import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircleIcon, EnvelopeSimpleIcon, WarningIcon } from "@phosphor-icons/react/ssr";
import { GoogleSignInButton } from "@/components/auth-buttons";
import { ProductImage } from "@/components/product-image";
import { getSession, googleConfigured } from "@/lib/auth";
import { formatNaira } from "@/lib/money";
import { getOrder, PAYMENT_LABELS } from "@/lib/orders";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> };

const dateFormat = new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Lagos" });

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ id }, { placed }, session] = await Promise.all([params, searchParams, getSession()]);
  const data = await getOrder(id);
  if (!data) notFound();
  const { order, items } = data;
  const justPlaced = placed === "1";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      {justPlaced && (
        <div className="mb-10 flex gap-4 rounded-xl bg-sage p-5 text-sage-ink" role="status">
          <CheckCircleIcon size={28} weight="fill" className="shrink-0" />
          <div>
            <p className="font-medium">Order placed. Thank you, {order.full_name.split(" ")[0]}.</p>
            <p className="mt-1 text-[15px]">
              {order.payment_method === "bank_transfer"
                ? "We'll email our bank details within the hour. Your order ships as soon as the transfer lands."
                : "Have the exact amount ready when the rider calls. Lagos orders usually arrive in 2-3 working days, other states in 4-6."}
            </p>
          </div>
        </div>
      )}

      <p className="font-mono text-sm text-muted">{order.order_number}</p>
      <h1 className="mt-2 font-serif text-5xl tracking-[-0.02em] text-ink-strong">
        {justPlaced ? "Your order is in" : "Order details"}
      </h1>
      <p className="mt-3 text-muted">Placed {dateFormat.format(new Date(order.created_at))}</p>

      <p className="mt-6 flex items-start gap-3 text-[15px]">
        {order.email_sent_at ? (
          <>
            <EnvelopeSimpleIcon size={20} weight="bold" className="mt-0.5 shrink-0" />
            <span>A confirmation with these details went to <span className="text-ink-strong">{order.email}</span>.</span>
          </>
        ) : (
          <>
            <WarningIcon size={20} weight="bold" className="mt-0.5 shrink-0 text-sand-ink" />
            <span>
              Your order is saved, but the confirmation email to {order.email} didn't send. Bookmark this page, or email hello@ilegoods.ng and we'll resend it.
            </span>
          </>
        )}
      </p>

      <section className="mt-10 rounded-xl border border-line p-6 sm:p-8">
        <ul className="space-y-4">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-4">
              <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-md border border-line bg-bone">
                <ProductImage src={item.image_url} alt="" category={item.category} sizes="56px" iconSize={22} />
              </div>
              <div className="flex-1">
                <p className="text-ink-strong">{item.name}</p>
                <p className="text-sm text-muted">{formatNaira(item.unit_price_kobo)} x {item.quantity}</p>
              </div>
              <p className="font-mono text-sm tabular-nums">{formatNaira(item.unit_price_kobo * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-3 border-t border-line pt-6 text-[15px]">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-mono tabular-nums">{formatNaira(order.subtotal_kobo)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="font-mono tabular-nums">{order.shipping_kobo ? formatNaira(order.shipping_kobo) : "Free"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Includes VAT (7.5%)</dt><dd className="font-mono tabular-nums text-muted">{formatNaira(order.vat_kobo)}</dd></div>
          <div className="flex justify-between border-t border-line pt-4 text-base font-medium text-ink-strong"><dt>Total</dt><dd className="font-mono tabular-nums">{formatNaira(order.total_kobo)}</dd></div>
        </dl>
      </section>

      <section className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-line p-6">
          <h2 className="text-sm text-muted">Delivering to</h2>
          <p className="mt-2 leading-relaxed text-ink-strong">
            {order.full_name}<br />{order.address}<br />{order.city}, {order.state}<br />{order.phone}
          </p>
          {order.delivery_notes && <p className="mt-3 text-sm text-muted">Note: {order.delivery_notes}</p>}
        </div>
        <div className="rounded-xl border border-line p-6">
          <h2 className="text-sm text-muted">Payment</h2>
          <p className="mt-2 text-ink-strong">{PAYMENT_LABELS[order.payment_method]}</p>
          <h2 className="mt-5 text-sm text-muted">Status</h2>
          <span className="mt-2 inline-block rounded-full bg-sky px-3 py-1 text-xs uppercase tracking-[0.05em] text-sky-ink">{order.status}</span>
        </div>
      </section>

      {!session && googleConfigured && (
        <section className="mt-10 rounded-xl bg-bone p-6 sm:p-8">
          <h2 className="font-serif text-2xl text-ink-strong">Keep track of this order</h2>
          <p className="mt-2 text-muted">
            Sign in with the Google account for {order.email} and this order, plus any future ones, will show up in your order history.
          </p>
          <div className="mt-5 sm:w-72">
            <GoogleSignInButton callbackURL="/account" label="Save with Google" />
          </div>
        </section>
      )}

      <Link href="/#shop" className="mt-10 inline-block text-[15px] text-ink-strong underline underline-offset-4">
        Continue shopping
      </Link>
    </div>
  );
}
