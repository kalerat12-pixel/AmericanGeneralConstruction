import Image, { type ImageProps } from 'next/image';
import { blurData, FALLBACK_BLUR } from '@/lib/blur-data';

/**
 * next/image with the generated blur placeholder wired up by src, so callers
 * never have to remember to pass one.
 */
export function Photo({ src, alt, ...rest }: ImageProps & { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      placeholder="blur"
      blurDataURL={blurData[src] ?? FALLBACK_BLUR}
      {...rest}
    />
  );
}
