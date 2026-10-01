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
    a: "Lagos orders usually arrive in 2-3 working days. Everywhere else takes 4-6. You'll get an email with the rider's number the day it leaves our Yaba studio.",
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
    a: "Send us a photo within 7 days and we'll replace it or refund you in full. Ceramics are packed in shredded paper and double-boxed, so this is rare.",
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
          <p className="text-sm text-muted">{product.maker}</p>
        </div>
        <p className="shrink-0 font-mono text-sm tabular-nums text-ink">{formatNaira(product.price_kobo)}</p>
      </div>
      {product.stock === 0 && <p className="mt-1 text-sm text-rose-ink">Sold out</p>}
    </Link>
  );
}

export default async function HomePage() {
  const products = await listProducts();
  const [featured, ...rest] = products;
  const makerCount = new Set(products.map((p) => p.maker)).size;
  const inStock = products.reduce((sum, p) => sum + p.stock, 0);
  const makers = [...new Map(products.map((p) => [p.maker, p])).values()];
  const heroPicks = products.slice(0, 3);

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
            <p className="text-sm uppercase tracking-[0.08em] text-muted">Homeware from Nigerian studios</p>
            <h1 className="mt-5 font-serif text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.05] tracking-[-0.03em] text-ink-strong">
              Things for the house, made by people you can name.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted">
              Adire throws, stoneware, raffia and Jos coffee. Small batches from independent studios, delivered to all 36 states and Abuja.
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
              <h2 className="font-serif text-4xl tracking-[-0.02em] text-ink-strong md:text-5xl">The collection</h2>
              <p className="mt-3 max-w-lg text-muted">
                Every piece is made in batches of fewer than 80. When a batch sells out, it's gone until the maker finishes the next.
              </p>
            </div>
            <p className="font-mono text-sm text-muted">{products.length} pieces</p>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
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

      <section id="makers" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-28 sm:px-6 md:grid-cols-2">
          <Reveal className="rounded-xl border border-line bg-surface p-6 sm:p-8">
            <h3 className="text-sm uppercase tracking-[0.08em] text-muted">The studios</h3>
            <ul className="mt-4">
              {makers.map((p) => (
                <li key={p.maker} className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-0">
                  <span className="text-ink-strong">{p.maker}</span>
                  <span className="shrink-0 text-sm text-muted">{p.category}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal index={1}>
            <h2 className="font-serif text-4xl tracking-[-0.02em] text-ink-strong md:text-5xl">We pay makers first</h2>
            <p className="mt-5 text-lg text-muted">
              Most shops take stock on credit and pay studios months later. We buy every batch outright, at the price the maker sets, before it goes on this page.
            </p>
            <dl className="mt-10 grid grid-cols-2 gap-6">
              <div className="rounded-xl border border-line bg-white p-6">
                <dt className="text-sm text-muted">Studios we buy from</dt>
                <dd className="mt-1 font-serif text-4xl text-ink-strong">{makerCount}</dd>
              </div>
              <div className="rounded-xl border border-line bg-white p-6">
                <dt className="text-sm text-muted">Pieces in stock today</dt>
                <dd className="mt-1 font-serif text-4xl text-ink-strong">{inStock}</dd>
              </div>
            </dl>
          </Reveal>
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
