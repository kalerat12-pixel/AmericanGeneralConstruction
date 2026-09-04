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
          "absolute inset-0 bg-ink/35 backdrop-blur-sm transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-[26rem] flex-col border-l border-line bg-surface-sunken shadow-[var(--shadow-panel)]",
          "transition-transform duration-[600ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="size-4 text-brand" strokeWidth={2} />
            <h2 className="font-display text-sm font-bold tracking-[-0.01em] text-ink">
              Your Order
            </h2>
            <span className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">
              {count} item{count === 1 ? "" : "s"}
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="grid size-8 place-items-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <X className="size-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Free shipping meter */}
        <div className="border-b border-line px-5 py-3.5">
          <p className="mb-2 text-[0.72rem] text-muted">
            {freeShippingRemainingCents > 0 ? (
              <>
                <span className="text-ink">
                  {formatUSD(freeShippingRemainingCents)}
                </span>{" "}
                from free cold-chain shipping
              </>
            ) : (
              <span className="text-brand">
                Free cold-chain shipping unlocked
              </span>
            )}
          </p>
          <div className="h-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-teal transition-[width] duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${freeShippingProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="grid size-14 place-items-center rounded-full border border-line bg-surface-raised">
                <ShoppingBag className="size-5 text-subtle" strokeWidth={1.5} />
              </span>
              <p className="text-sm text-muted">Your cart is empty.</p>
              <button
                type="button"
                onClick={closeCart}
                className="text-[0.78rem] font-semibold text-brand underline-offset-4 hover:underline"
              >
                Browse the collection
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-3.5 py-4">
                  <div
                    className={cn(
                      "grid size-16 shrink-0 place-items-center rounded-md border bg-surface-raised",
                      line.accent === "green"
                        ? "border-brand/30"
                        : "border-teal/30",
                    )}
                  >
                    {/* Compound names run long ("CJC-1295 / Ipamorelin"), so the
                        thumbnail shows the leading token only. */}
                    <span
                      className={cn(
                        "px-1 text-center font-display text-[0.62rem] leading-tight font-bold break-all",
                        line.accent === "green" ? "text-brand" : "text-teal",
                      )}
                    >
                      {line.name.split(" / ")[0]}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[0.85rem] font-semibold text-ink">
                      {line.name}
                    </p>
                    <p className="truncate font-mono text-[10px] tracking-[0.08em] text-subtle">
                      {line.synonyms}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-0.5 rounded-full border border-line">
                        <button
                          type="button"
                          aria-label={`Decrease ${line.name}`}
                          onClick={() => setQty(line.id, line.qty - 1)}
                          className="grid size-7 place-items-center rounded-full text-muted transition-colors hover:text-brand"
                        >
                          <Minus className="size-3" strokeWidth={2} />
                        </button>
                        <span className="w-6 text-center font-mono text-[0.72rem] text-ink">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${line.name}`}
                          onClick={() => setQty(line.id, Math.min(10, line.qty + 1))}
                          className="grid size-7 place-items-center rounded-full text-muted transition-colors hover:text-brand"
                        >
                          <Plus className="size-3" strokeWidth={2} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[0.8rem] text-ink">
                          {formatUSD(line.priceCents * line.qty)}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${line.name}`}
                          onClick={() => remove(line.id)}
                          className="text-subtle transition-colors hover:text-red-400"
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
        <div className="border-t border-line bg-surface px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-[0.78rem] text-muted">Subtotal</span>
            <span className="font-display text-lg font-bold text-ink">
              {formatUSD(subtotalCents)}
            </span>
          </div>
          <p className="mb-3 text-[0.68rem] leading-relaxed text-subtle">
            Taxes and duties calculated at checkout. All products are supplied
            for laboratory research use only.
          </p>
          <button
            type="button"
            disabled={lines.length === 0}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-action py-3.5 text-[0.85rem] font-semibold text-white transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-line disabled:text-subtle disabled:shadow-none"
          >
            <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-700 group-hover:translate-x-full group-disabled:hidden" />
            <Lock className="relative size-3.5" strokeWidth={2.2} />
            <span className="relative">Secure Checkout</span>
          </button>
          <p className="mt-3 text-center font-mono text-[9px] tracking-[0.16em] text-subtle uppercase">
            256-bit TLS · Verified by Stripe
          </p>
        </div>
      </aside>
    </div>
  );
}
