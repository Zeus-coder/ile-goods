import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowCounterClockwiseIcon, TruckIcon } from "@phosphor-icons/react/ssr";
import { AddToCart } from "@/components/add-to-cart";
import { ProductImage } from "@/components/product-image";
import { FREE_SHIPPING_FROM_KOBO, formatNaira } from "@/lib/money";
import { getProduct } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return { title: product?.name ?? "Not found" };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
      <Link href="/#shop" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeftIcon size={16} weight="bold" />
        All products
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-[1.15fr_1fr] md:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-line bg-bone">
          <ProductImage src={product.image_url} alt={product.name} category={product.category} priority sizes="(min-width: 768px) 55vw, 100vw" iconSize={120} />
        </div>

        <div className="md:sticky md:top-24 md:self-start">
          <span className="inline-block rounded-full bg-sage px-3 py-1 text-xs uppercase tracking-[0.05em] text-sage-ink">
            {product.category}
          </span>
          <h1 className="mt-4 font-serif text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.08] tracking-[-0.03em] text-ink-strong">
            {product.name}
          </h1>
          <p className="mt-2 text-muted">Made by {product.maker}</p>
          <p className="mt-6 font-mono text-xl tabular-nums text-ink-strong">{formatNaira(product.price_kobo)}</p>
          <p className="mt-6 text-lg leading-relaxed">{product.description}</p>

          <div className="mt-8">
            <AddToCart productId={product.id} stock={product.stock} />
          </div>

          <ul className="mt-10 space-y-4 border-t border-line pt-8 text-[15px]">
            <li className="flex gap-3">
              <TruckIcon size={20} weight="bold" className="mt-0.5 shrink-0" />
              <span>
                {formatNaira(350_000)} delivery anywhere in Nigeria, free over {formatNaira(FREE_SHIPPING_FROM_KOBO)}.
              </span>
            </li>
            <li className="flex gap-3">
              <ArrowCounterClockwiseIcon size={20} weight="bold" className="mt-0.5 shrink-0" />
              <span>Arrived broken? Send a photo within 7 days for a replacement or full refund.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
