import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth-buttons";
import { getSession } from "@/lib/auth";
import { formatNaira } from "@/lib/money";
import { listOrdersForUser } from "@/lib/orders";

export const metadata: Metadata = { title: "Your orders" };

const dateFormat = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "Africa/Lagos" });

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const orders = await listOrdersForUser(session.user.id, session.user.email);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          {session.user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" className="size-14 rounded-full border border-line" referrerPolicy="no-referrer" />
          )}
          <div>
            <h1 className="font-serif text-4xl tracking-[-0.02em] text-ink-strong">{session.user.name}</h1>
            <p className="text-muted">{session.user.email}</p>
          </div>
        </div>
        <SignOutButton />
      </div>

      <h2 className="mt-14 text-lg font-medium text-ink-strong">Order history</h2>
      {orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-surface p-10 text-center">
          <p className="text-ink-strong">No orders yet.</p>
          <p className="mt-1 text-muted">When you check out, your orders will show up here.</p>
          <Link href="/#shop" className="mt-6 inline-flex h-11 items-center rounded-md bg-ink-strong px-5 text-white hover:bg-press">Browse the collection</Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-surface sm:p-6">
                <div>
                  <p className="font-mono text-sm text-ink-strong">{o.order_number}</p>
                  <p className="text-sm text-muted">{dateFormat.format(new Date(o.created_at))}, {o.item_count} {o.item_count === 1 ? "item" : "items"}</p>
                </div>
                <div className="flex items-center gap-5">
                  <span className="rounded-full bg-sky px-3 py-1 text-xs uppercase tracking-[0.05em] text-sky-ink">{o.status}</span>
                  <span className="font-mono tabular-nums text-ink-strong">{formatNaira(o.total_kobo)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
