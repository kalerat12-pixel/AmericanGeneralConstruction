'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, ProductSize } from '@/data/products';

export interface CartLine {
  /** `${productId}:${sku}` — one line per size. */
  key: string;
  productId: string;
  slug: string;
  name: string;
  category: string;
  image: string;
  imageAlt: string;
  amount: string;
  sku: string;
  price: number;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  /** Guards against rendering persisted state before hydration completes. */
  hydrated: boolean;
  add: (product: Product, size: ProductSize, quantity?: number) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

const MAX_PER_LINE = 20;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,

      add: (product, size, quantity = 1) =>
        set((state) => {
          const key = `${product.id}:${size.sku}`;
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === key
                  ? { ...l, quantity: Math.min(MAX_PER_LINE, l.quantity + quantity) }
                  : l,
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              {
                key,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                category: product.category,
                image: product.images[0].src,
                imageAlt: product.images[0].alt,
                amount: size.amount,
                sku: size.sku,
                price: size.price,
                quantity: Math.min(MAX_PER_LINE, quantity),
              },
            ],
          };
        }),

      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.key !== key)
              : state.lines.map((l) =>
                  l.key === key ? { ...l, quantity: Math.min(MAX_PER_LINE, quantity) } : l,
                ),
        })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: 'l4g-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }) as CartState,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((n, l) => n + l.price * l.quantity, 0);
