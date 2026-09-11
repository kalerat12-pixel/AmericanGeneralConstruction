import Image from "next/image";

/**
 * Product imagery.
 *
 * These are clearly-labelled placeholders we generated — not Ghost's product
 * photography, which we neither copy nor hotlink. Replace per flavor by adding
 * public/cans/<slug>.jpg and passing ext="jpg".
 */
export function CanImage({
  slug,
  name,
  size = 400,
  priority = false,
  className = "",
  ext = "svg",
  sizes,
}: {
  slug: string;
  name: string;
  size?: number;
  priority?: boolean;
  className?: string;
  ext?: "svg" | "jpg" | "webp";
  sizes?: string;
}) {
  return (
    <Image
      src={`/cans/${slug}.${ext}`}
      alt={`${name} — placeholder product image`}
      width={size}
      height={Math.round(size * 1.6)}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      sizes={sizes}
      className={className}
      // Kept slightly desaturated so per-flavor tones never compete with the
      // single accent colour. Matches the treatment on the editorial plates.
      style={{ filter: "saturate(0.78)" }}
    />
  );
}
