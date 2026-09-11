"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartLine } from "@/lib/types";
import { cartTotals, type CartTotals } from "@/lib/pricing";
import { createLocalStorageStore, hydratedStore } from "@/lib/browser-store";

const STORAGE_KEY = "l4g.cart.v1";
const EMPTY: CartLine[] = [];

function parseLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return EMPTY;
  return raw.filter(
    (l): l is CartLine =>
      typeof l === "object" &&
      l !== null &&
      typeof (l as CartLine).variantId === "string" &&
      typeof (l as CartLine).productSlug === "string" &&
      Number.isFinite((l as CartLine).quantity),
  );
}

const cartStore = createLocalStorageStore<CartLine[]>(STORAGE_KEY, EMPTY, parseLines);

interface CartApi {
  lines: CartLine[];
  totals: CartTotals;
  /** False until hydration completes, so the cart never flashes "empty". */
  ready: boolean;
  /** Set by add() so a button can flash a confirmation without a toast lib. */
  lastAdded: string | null;
  add: (line: CartLine) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  setSubscribe: (variantId: string, subscribe: boolean) => void;
  remove: (variantId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const ready = useSyncExternalStore(
    hydratedStore.subscribe,
    hydratedStore.getSnapshot,
    hydratedStore.getServerSnapshot,
  );

  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const add = useCallback((line: CartLine) => {
    cartStore.update((current) => {
      const index = current.findIndex(
        (l) => l.variantId === line.variantId && l.subscribe === line.subscribe,
      );
      if (index === -1) return [...current, line];
      return current.map((l, i) =>
        i === index ? { ...l, quantity: l.quantity + line.quantity } : l,
      );
    });
    setLastAdded(line.variantId);
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    cartStore.update((current) =>
      quantity <= 0
        ? current.filter((l) => l.variantId !== variantId)
        : current.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)),
    );
  }, []);

  const setSubscribe = useCallback((variantId: string, subscribe: boolean) => {
    cartStore.update((current) =>
      current.map((l) => (l.variantId === variantId ? { ...l, subscribe } : l)),
    );
  }, []);

  const remove = useCallback((variantId: string) => {
    cartStore.update((current) => current.filter((l) => l.variantId !== variantId));
  }, []);

  const clear = useCallback(() => cartStore.set(EMPTY), []);

  const value = useMemo<CartApi>(
    () => ({
      lines,
      totals: cartTotals(lines),
      ready,
      lastAdded,
      add,
      setQuantity,
      setSubscribe,
      remove,
      clear,
    }),
    [lines, ready, lastAdded, add, setQuantity, setSubscribe, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
