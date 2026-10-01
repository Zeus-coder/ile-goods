import Link from "next/link";
import { ArrowRightIcon, PlusIcon, TruckIcon } from "@phosphor-icons/react/ssr";
import { ProductImage } from "@/components/product-image";
import { Reveal } from "@/components/reveal";
import { FREE_SHIPPING_FROM_KOBO, formatNaira } from "@/lib/money";
import { listProducts, type Product } from "@/lib/products";

export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Lagos orders usually arrive in 2-3 working days. Everywhere else takes 4-6. You'll get an email with the rider's number the day it leaves our Lagos warehouse.",
  },
  {
    q: "What does delivery cost?",
    a: `A flat ${formatNaira(350_000)} anywhere in Nigeria, and free on orders over ${formatNaira(FREE_SHIPPING_FROM_KOBO)}. The full cost shows in your bag before you check out.`,
  },
  {
    q: "Can I pay when it arrives?",
    a: "Yes. Choose pay on delivery at checkout and pay the rider by cash or card. You can also pay by bank transfer before we ship.",
  },
  {
    q: "What if something arrives broken?",
    a: "Send us a photo within 7 days and we'll replace it or refund you in full. Glass and fragile pieces are packed in shredded paper and double-boxed, so this is rare.",
  },
  {
    q: "Do I need an account?",
    a: "No. You can check out as a guest with just your email. Signing in with Google saves your details and keeps your order history in one place.",
  },
];

function ProductCard({ product, featured }: { product: Product; featured?: boolean }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div
        className={`relative overflow-hidden rounded-xl border border-line bg-bone ${featured ? "aspect-[4/5] md:aspect-auto md:h-full md:min-h-[560px]" : "aspect-[4/5]"}`}
      >
        <ProductImage
          src={product.image_url}
          alt={product.name}
          category={product.category}
          sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
          iconSize={featured ? 120 : 56}
          className="transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink-strong">{product.name}</p>
          <p className="text-sm text-muted">{product.category}</p>
        </div>
        <p className="shrink-0 font-mono text-sm tabular-nums text-ink">{formatNaira(product.price_kobo)}</p>
      </div>
      {product.stock === 0 && <p className="mt-1 text-sm text-rose-ink">Sold out</p>}
    </Link>
  );
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const products = await listProducts();
  // First product of each category, in catalogue order; doubles as the hero picks and room cards.
  const rooms = [...new Map(products.map((p) => [p.category, p])).values()].map((cover) => ({
    cover,
    count: products.filter((p) => p.category === cover.category).length,
  }));
  const heroPicks = rooms.map((r) => r.cover).slice(0, 3);

  const requested = (await searchParams).category;
  const active = rooms.some((r) => r.cover.category === requested) ? (requested as string) : null;
  const shown = active ? products.filter((p) => p.category === active) : products;
  const [featured, ...rest] = shown;
  const inStock = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 -top-40 size-[640px] rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, #fbf3db 0%, transparent 65%)" }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pb-28 md:pt-20">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.08em] text-muted">Homeware, delivered across Nigeria</p>
            <h1 className="mt-5 font-serif text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.05] tracking-[-0.03em] text-ink-strong">
              Good things for every room in the house.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted">
              Lamps and planters, beds and sofas, and the kitchen tools you reach for every day. Priced in naira and delivered to all 36 states and Abuja.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#shop"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-ink-strong px-6 font-medium text-white transition hover:bg-press active:scale-[0.98]"
              >
                Shop the collection
                <ArrowRightIcon size={18} weight="bold" />
              </a>
              <p className="flex items-center gap-2 text-sm text-muted">
                <TruckIcon size={18} weight="bold" />
                Free delivery over {formatNaira(FREE_SHIPPING_FROM_KOBO)}
              </p>
            </div>
          </Reveal>
          <Reveal index={1} className="grid grid-cols-2 gap-3 sm:gap-4">
            {heroPicks.map((p, i) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className={`group relative overflow-hidden rounded-xl border border-line bg-bone ${i === 0 ? "row-span-2" : "aspect-square"}`}
              >
                <ProductImage src={p.image_url} alt={p.name} category={p.category} priority sizes="(min-width: 768px) 22vw, 50vw" iconSize={i === 0 ? 72 : 44}
                  className="transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" />
                <span className="absolute inset-x-0 bottom-0 bg-white/90 px-3 py-2 text-[13px] text-ink-strong backdrop-blur-sm">{p.name}</span>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="shop" className="scroll-mt-20 border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-4xl tracking-[-0.02em] text-ink-strong md:text-5xl">{active ?? "The collection"}</h2>
              <p className="mt-3 max-w-lg text-muted">
                A short list for each room, chosen to be used every day. Everything shown is in stock and ships from Lagos.
              </p>
            </div>
            <p className="font-mono text-sm text-muted">{shown.length} pieces</p>
          </Reveal>

          <nav aria-label="Filter by category" className="mt-8 flex flex-wrap gap-2">
            {[null, ...rooms.map((r) => r.cover.category)].map((c) => (
              <Link
                key={c ?? "all"}
                href={c ? `/?category=${encodeURIComponent(c)}#shop` : "/#shop"}
                scroll={false}
                aria-current={c === active ? "page" : undefined}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  c === active ? "border-ink-strong bg-ink-strong text-white" : "border-line bg-white text-ink hover:border-muted"
                }`}
              >
                {c ?? "All"}
              </Link>
            ))}
          </nav>

          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {featured && (
              <Reveal className="col-span-2 md:row-span-2">
                <ProductCard product={featured} featured />
              </Reveal>
            )}
            {rest.map((p, i) => (
              <Reveal key={p.id} index={(i % 4) + 1}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="rooms" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-28 sm:px-6">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-4xl tracking-[-0.02em] text-ink-strong md:text-5xl">Shop by room</h2>
              <p className="mt-3 max-w-lg text-muted">
                {inStock.toLocaleString("en-NG")} pieces in stock today across {rooms.length} rooms.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {rooms.map(({ cover, count }, i) => (
              <Reveal key={cover.category} index={i + 1}>
                <Link href={`/?category=${encodeURIComponent(cover.category)}#shop`} scroll={false} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-bone">
                    <ProductImage src={cover.image_url} alt="" category={cover.category} sizes="(min-width: 640px) 33vw, 100vw"
                      className="transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-3">
                    <p className="flex items-center gap-2 font-medium text-ink-strong">
                      {cover.category}
                      <ArrowRightIcon size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                    </p>
                    <p className="font-mono text-sm text-muted">{count} pieces</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 md:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <h2 className="font-serif text-4xl tracking-[-0.02em] text-ink-strong md:text-5xl">Delivery and returns</h2>
            <p className="mt-4 text-muted">Still unsure? Email hello@ilegoods.ng and a person will reply the same day.</p>
          </Reveal>
          <Reveal index={1}>
            {faqs.map((f) => (
              <details key={f.q} className="group border-b border-line py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-6 text-lg text-ink-strong">
                  {f.q}
                  <PlusIcon size={18} weight="bold" className="shrink-0 transition-transform duration-200 group-open:rotate-45" />
                </summary>
                <p className="mt-3 max-w-prose text-muted">{f.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
