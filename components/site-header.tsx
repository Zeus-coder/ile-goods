import Link from "next/link";
import { HandbagIcon } from "@phosphor-icons/react/ssr";
import { getSession } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { Logo } from "./logo";

export async function SiteHeader() {
  const [session, cart] = await Promise.all([getSession(), getCart()]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 text-[15px] sm:gap-2">
          <Link href="/#shop" className="hidden rounded-md px-3 py-2 text-ink hover:bg-bone sm:block">
            Shop
          </Link>
          <Link href="/#rooms" className="hidden rounded-md px-3 py-2 text-ink hover:bg-bone sm:block">
            Rooms
          </Link>
          {session ? (
            <Link href="/account" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-bone">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" className="size-6 rounded-full" referrerPolicy="no-referrer" />
              ) : null}
              <span className="hidden sm:inline">Orders</span>
            </Link>
          ) : (
            <Link href="/sign-in" className="rounded-md px-3 py-2 hover:bg-bone">
              Sign in
            </Link>
          )}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-md px-3 py-2 hover:bg-bone"
            aria-label={`Bag, ${cart.count} ${cart.count === 1 ? "item" : "items"}`}
          >
            <HandbagIcon size={22} weight="bold" />
            {cart.count > 0 && (
              <span className="absolute right-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-ink-strong px-1 font-mono text-[11px] leading-5 text-white">
                {cart.count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
