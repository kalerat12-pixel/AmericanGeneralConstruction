import Image from "next/image";

/**
 * Full-bleed background art.
 *
 * Ships with generated duotone plates (see scripts/generate-art.ts). To use real
 * photography instead, drop a file at public/editorial/<name>.jpg and pass
 * `ext="jpg"` — nothing else changes.
 */
export function EditorialImage({
  name,
  alt,
  ext = "svg",
  priority = false,
  className = "",
  sizes = "100vw",
}: {
  name: string;
  /** Empty string marks it decorative; the element is then hidden from AT. */
  alt: string;
  ext?: "svg" | "jpg" | "webp" | "avif";
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <Image
      src={`/editorial/${name}.${ext}`}
      alt={alt}
      fill
      priority={priority}
      loading={priority ? undefined : "lazy"}
      sizes={sizes}
      aria-hidden={alt === "" ? true : undefined}
      className={`object-cover ${className}`}
      // Generated plates are already desaturated; the filter keeps real
      // photography from fighting the palette when it is swapped in.
      style={{ filter: "saturate(0.72) contrast(1.06)" }}
    />
  );
}
