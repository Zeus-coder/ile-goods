import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-line bg-bone">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl text-ink-strong">Ilé Goods</p>
          <p className="mt-3 max-w-sm text-muted">
            Decor, furniture and kitchen pieces for every room, delivered from Lagos to all 36 states and Abuja.
          </p>
        </div>
        <div className="text-[15px]">
          <p className="font-medium text-ink-strong">Shop</p>
          <ul className="mt-3 space-y-2 text-muted">
            <li><Link href="/#shop" className="hover:text-ink">All products</Link></li>
            <li><Link href="/cart" className="hover:text-ink">Your bag</Link></li>
            <li><Link href="/account" className="hover:text-ink">Order history</Link></li>
          </ul>
        </div>
        <div className="text-[15px]">
          <p className="font-medium text-ink-strong">Help</p>
          <ul className="mt-3 space-y-2 text-muted">
            <li><Link href="/#faq" className="hover:text-ink">Delivery and returns</Link></li>
            <li><a href="mailto:hello@ilegoods.ng" className="hover:text-ink">hello@ilegoods.ng</a></li>
            <li><a href="tel:+2348091447320" className="hover:text-ink">+234 809 144 7320</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
