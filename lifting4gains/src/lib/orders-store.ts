import { createLocalStorageStore } from "@/lib/browser-store";

/**
 * Order history kept in the browser, so /account works without forcing anyone
 * to create an account before they can buy. Supabase-backed history takes over
 * once a customer signs in — see `orders.user_id` and its RLS policy.
 */
export interface LocalOrder {
  reference: string;
  email: string;
  totalCents: number;
  createdAt: string;
}

const EMPTY: LocalOrder[] = [];

function parseOrders(raw: unknown): LocalOrder[] {
  if (!Array.isArray(raw)) return EMPTY;
  return raw.filter(
    (o): o is LocalOrder =>
      typeof o === "object" &&
      o !== null &&
      typeof (o as LocalOrder).reference === "string" &&
      Number.isFinite((o as LocalOrder).totalCents),
  );
}

export const ordersStore = createLocalStorageStore<LocalOrder[]>(
  "l4g.orders.v1",
  EMPTY,
  parseOrders,
);

/** Keeps the 25 most recent orders placed from this browser. */
export function rememberOrder(order: LocalOrder): void {
  ordersStore.update((current) => [order, ...current].slice(0, 25));
}
