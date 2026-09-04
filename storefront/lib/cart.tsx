"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { Product } from "./products";

export interface CartLine {
  id: string;
  slug: string;
  name: string;
  compound: string;
  priceCents: number;
  format: string;
  accent: Product["accent"];
  qty: number;
}

type CartAction =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; product: Product; qty: number }
  | { type: "setQty"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "clear" };

const STORAGE_KEY = "l4g.cart.v1";
const FREE_SHIPPING_THRESHOLD_CENTS = 25000;

function reducer(state: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.lines;
    case "add": {
      const existing = state.find((l) => l.id === action.product.id);
      if (existing) {
        return state.map((l) =>
          l.id === action.product.id
            ? { ...l, qty: Math.min(l.qty + action.qty, 10) }
            : l,
        );
      }
      const { id, slug, name, compound, priceCents, format, accent } =
        action.product;
      return [
        ...state,
        { id, slug, name, compound, priceCents, format, accent, qty: action.qty },
      ];
    }
    case "setQty":
      return state
        .map((l) => (l.id === action.id ? { ...l, qty: action.qty } : l))
        .filter((l) => l.qty > 0);
    case "remove":
      return state.filter((l) => l.id !== action.id);
    case "clear":
      return [];
    default:
      return state;
  }
}

interface CartValue {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  freeShippingRemainingCents: number;
  freeShippingProgress: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (product: Product, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);
  const [isOpen, setIsOpen] = useState(false);

  // Restore any in-progress cart. Guarded so a corrupt payload can never
  // white-screen the storefront.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) dispatch({ type: "hydrate", lines: parsed });
      }
    } catch {
      /* ignore unreadable storage */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage full or blocked — cart still works for this session */
    }
  }, [lines]);

  // Lock body scroll while the drawer is open (critical on iOS Safari).
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const add = useCallback((product: Product, qty = 1) => {
    dispatch({ type: "add", product, qty });
    setIsOpen(true);
  }, []);

  const setQty = useCallback(
    (id: string, qty: number) => dispatch({ type: "setQty", id, qty }),
    [],
  );
  const remove = useCallback(
    (id: string) => dispatch({ type: "remove", id }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartValue>(() => {
    const subtotalCents = lines.reduce(
      (sum, l) => sum + l.priceCents * l.qty,
      0,
    );
    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.qty, 0),
      subtotalCents,
      freeShippingRemainingCents: Math.max(
        0,
        FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents,
      ),
      freeShippingProgress: Math.min(
        1,
        subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS,
      ),
      isOpen,
      openCart,
      closeCart,
      add,
      setQty,
      remove,
      clear,
    };
  }, [lines, isOpen, openCart, closeCart, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export { FREE_SHIPPING_THRESHOLD_CENTS };
