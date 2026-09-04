"use client";

import { Lock, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn, formatUSD } from "@/lib/utils";

export default function CartDrawer() {
  const {
    lines,
    count,
    subtotalCents,
    freeShippingRemainingCents,
    freeShippingProgress,
    isOpen,
    closeCart,
    setQty,
    remove,
  } = useCart();

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60]",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!isOpen}
    >
      {/* Scrim */}
      <div
        onClick={closeCart}
        className={cn(
          "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-[26rem] flex-col border-l border-steel bg-obsidian-2 shadow-[-30px_0_80px_-30px_rgba(0,0,0,0.95)]",
          "transition-transform duration-[600ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-steel px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-4 text-acid" strokeWidth={2} />
            <h2 className="font-display text-sm font-bold tracking-[-0.01em] text-chalk">
              Your Order
            </h2>
            <span className="font-mono text-[10px] tracking-[0.16em] text-smoke uppercase">
              {count} item{count === 1 ? "" : "s"}
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="grid size-8 place-items-center rounded-full border border-steel text-fog transition-colors hover:border-ash hover:text-chalk"
          >
            <X className="size-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Free shipping meter */}
        <div className="border-b border-steel px-5 py-3.5">
          <p className="mb-2 text-[0.72rem] text-fog">
            {freeShippingRemainingCents > 0 ? (
              <>
                <span className="text-chalk">
                  {formatUSD(freeShippingRemainingCents)}
                </span>{" "}
                from free cold-chain shipping
              </>
            ) : (
              <span className="text-acid">
                Free cold-chain shipping unlocked
              </span>
            )}
          </p>
          <div className="h-1 overflow-hidden rounded-full bg-steel">
            <div
              className="h-full rounded-full bg-gradient-to-r from-acid to-cyber transition-[width] duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${freeShippingProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="grid size-14 place-items-center rounded-full border border-steel bg-carbon">
                <ShoppingBag className="size-5 text-smoke" strokeWidth={1.5} />
              </span>
              <p className="text-sm text-fog">Your cart is empty.</p>
              <button
                type="button"
                onClick={closeCart}
                className="text-[0.78rem] font-semibold text-acid underline-offset-4 hover:underline"
              >
                Browse the collection
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-steel">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-3.5 py-4">
                  <div
                    className={cn(
                      "grid size-16 shrink-0 place-items-center rounded-xl border bg-carbon",
                      line.accent === "acid"
                        ? "border-acid/30"
                        : "border-cyber/30",
                    )}
                  >
                    <span
                      className={cn(
                        "font-display text-[0.7rem] font-bold",
                        line.accent === "acid" ? "text-acid" : "text-cyber",
                      )}
                    >
                      {line.name.replace("Protocol ", "")}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[0.85rem] font-semibold text-chalk">
                      {line.name}
                    </p>
                    <p className="truncate font-mono text-[10px] tracking-[0.08em] text-smoke">
                      {line.synonyms}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-0.5 rounded-full border border-steel">
                        <button
                          type="button"
                          aria-label={`Decrease ${line.name}`}
                          onClick={() => setQty(line.id, line.qty - 1)}
                          className="grid size-7 place-items-center rounded-full text-fog transition-colors hover:text-acid"
                        >
                          <Minus className="size-3" strokeWidth={2} />
                        </button>
                        <span className="w-6 text-center font-mono text-[0.72rem] text-chalk">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${line.name}`}
                          onClick={() => setQty(line.id, Math.min(10, line.qty + 1))}
                          className="grid size-7 place-items-center rounded-full text-fog transition-colors hover:text-acid"
                        >
                          <Plus className="size-3" strokeWidth={2} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[0.8rem] text-chalk">
                          {formatUSD(line.priceCents * line.qty)}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${line.name}`}
                          onClick={() => remove(line.id)}
                          className="text-smoke transition-colors hover:text-red-400"
                        >
                          <Trash2 className="size-3.5" strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-steel bg-obsidian px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-[0.78rem] text-fog">Subtotal</span>
            <span className="font-display text-lg font-bold text-chalk">
              {formatUSD(subtotalCents)}
            </span>
          </div>
          <p className="mb-3 text-[0.68rem] leading-relaxed text-smoke">
            Taxes and duties calculated at checkout. All products are supplied
            for laboratory research use only.
          </p>
          <button
            type="button"
            disabled={lines.length === 0}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-acid py-3.5 text-[0.85rem] font-semibold text-[#04140a] transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(0,255,102,0.8),0_12px_44px_-10px_rgba(0,255,102,0.9)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-steel disabled:text-smoke disabled:shadow-none"
          >
            <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-700 group-hover:translate-x-full group-disabled:hidden" />
            <Lock className="relative size-3.5" strokeWidth={2.2} />
            <span className="relative">Secure Checkout</span>
          </button>
          <p className="mt-3 text-center font-mono text-[9px] tracking-[0.16em] text-smoke uppercase">
            256-bit TLS · Verified by Stripe
          </p>
        </div>
      </aside>
    </div>
  );
}
