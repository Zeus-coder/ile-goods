import Image from "next/image";
import {
  BasketIcon, CoffeeBeanIcon, CoffeeIcon, CookingPotIcon, DropIcon, FlameIcon, NeedleIcon, PackageIcon,
} from "@phosphor-icons/react/ssr";

const art: Record<string, { bg: string; ink: string; Icon: typeof PackageIcon }> = {
  Textiles: { bg: "bg-sky", ink: "text-sky-ink", Icon: NeedleIcon },
  Ceramics: { bg: "bg-sand", ink: "text-sand-ink", Icon: CoffeeIcon },
  "Home fragrance": { bg: "bg-rose", ink: "text-rose-ink", Icon: FlameIcon },
  Storage: { bg: "bg-sage", ink: "text-sage-ink", Icon: BasketIcon },
  Pantry: { bg: "bg-sand", ink: "text-sand-ink", Icon: CoffeeBeanIcon },
  Kitchen: { bg: "bg-sage", ink: "text-sage-ink", Icon: CookingPotIcon },
  Bath: { bg: "bg-sky", ink: "text-sky-ink", Icon: DropIcon },
};

// Seeded products point at picsum, which returns unrelated random photos. Until a real
// photo is uploaded (set products.image_url), show a category tile instead.
const isPlaceholder = (src: string) => !src || src.startsWith("https://picsum.photos/");

export function ProductImage({
  src,
  alt,
  category,
  sizes,
  priority,
  iconSize = 56,
  className = "",
}: {
  src: string;
  alt: string;
  category: string;
  sizes: string;
  priority?: boolean;
  iconSize?: number;
  className?: string;
}) {
  if (!isPlaceholder(src)) {
    return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={`object-cover saturate-[0.85] ${className}`} />;
  }
  const { bg, ink, Icon } = art[category] ?? { bg: "bg-bone", ink: "text-muted", Icon: PackageIcon };
  return (
    <div role={alt ? "img" : undefined} aria-label={alt || undefined} className={`absolute inset-0 grid place-items-center ${bg} ${ink} ${className}`}>
      <Icon size={iconSize} weight="duotone" />
    </div>
  );
}
