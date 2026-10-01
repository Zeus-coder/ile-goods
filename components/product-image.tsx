import Image from "next/image";
import { ArmchairIcon, CookingPotIcon, LampIcon, PackageIcon } from "@phosphor-icons/react/ssr";

const art: Record<string, { bg: string; ink: string; Icon: typeof PackageIcon }> = {
  Decor: { bg: "bg-rose", ink: "text-rose-ink", Icon: LampIcon },
  Furniture: { bg: "bg-sand", ink: "text-sand-ink", Icon: ArmchairIcon },
  Kitchen: { bg: "bg-sage", ink: "text-sage-ink", Icon: CookingPotIcon },
};

// A product without a usable photo shows a category tile instead. Picsum URLs count as
// missing because picsum returns unrelated random photos.
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
