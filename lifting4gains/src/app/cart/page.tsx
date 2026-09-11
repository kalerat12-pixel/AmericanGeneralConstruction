import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="shell pb-24 pt-16 lg:pt-20">
      <header>
        <Eyebrow>Your order</Eyebrow>
        <h1 className="type-display mt-5">Cart</h1>
      </header>
      <div className="mt-12 border-t border-line pt-10">
        <CartView />
      </div>
    </div>
  );
}
