"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";

export default function AddToCartButton({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const isAcid = product.accent === "acid";

  return (
    <button
      type="button"
      aria-label={`Add ${product.name} to cart`}
      onClick={() => {
        add(product, 1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
      className={cn(
        "group/cta relative flex items-center justify-center gap-2 overflow-hidden rounded-full py-3.5 text-[0.84rem] font-semibold transition-all duration-300 active:scale-[0.98]",
        isAcid
          ? "bg-acid text-[#04140a] hover:shadow-[0_0_0_1px_rgba(0,255,102,0.85),0_14px_44px_-12px_rgba(0,255,102,0.95)]"
          : "bg-cyber text-[#04140a] hover:shadow-[0_0_0_1px_rgba(0,229,255,0.85),0_14px_44px_-12px_rgba(0,229,255,0.95)]",
        className,
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-700 group-hover/cta:translate-x-full" />
      {added ? (
        <>
          <Check className="relative size-4" strokeWidth={3} />
          <span className="relative">Added to Order</span>
        </>
      ) : (
        <>
          <Plus className="relative size-4 transition-transform duration-300 group-hover/cta:rotate-90" strokeWidth={2.8} />
          <span className="relative">Add to Cart</span>
        </>
      )}
    </button>
  );
}
