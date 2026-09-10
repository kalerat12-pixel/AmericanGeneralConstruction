'use client';

import * as React from 'react';
import { Photo } from '@/components/photo';
import { cn } from '@/lib/utils';

export function Gallery({ images }: { images: { src: string; alt: string }[] }) {
  const [active, setActive] = React.useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-bone">
        {images.map((img, i) => (
          <Photo
            key={img.src}
            src={img.src}
            alt={i === active ? img.alt : ''}
            aria-hidden={i !== active}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 48vw"
            className={cn(
              'object-cover transition-opacity duration-700 ease-calm',
              i === active ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}
      </div>

      {images.length > 1 && (
        <ul className="mt-4 flex gap-4">
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={i === active}
                className={cn(
                  'relative block aspect-square w-20 overflow-hidden bg-bone transition-[border-color] duration-500 ease-calm md:w-24',
                  i === active
                    ? 'ring-1 ring-champagne ring-offset-4 ring-offset-alabaster'
                    : 'opacity-70 hover:opacity-100',
                )}
              >
                <Photo
                  src={img.src}
                  alt=""
                  aria-hidden
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                <span className="sr-only">View image {i + 1}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
