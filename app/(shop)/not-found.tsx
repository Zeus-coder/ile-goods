import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-32 text-center">
      <h1 className="font-serif text-4xl text-ink-strong">We couldn't find that page</h1>
      <p className="mt-3 text-muted">It may have sold out and been taken down.</p>
      <Link href="/#shop" className="mt-8 inline-flex h-11 items-center rounded-md bg-ink-strong px-5 text-white hover:bg-press">Back to the shop</Link>
    </div>
  );
}
