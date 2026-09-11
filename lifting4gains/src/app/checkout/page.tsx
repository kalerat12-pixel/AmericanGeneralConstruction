import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/cart/CheckoutFlow";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { commerce } from "@/lib/config";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="shell pb-24 pt-16 lg:pt-20">
      <header className="max-w-2xl">
        <Eyebrow>Last step</Eyebrow>
        <h1 className="type-display mt-5">Checkout</h1>
        <p className="type-lead mt-5">
          {commerce.isAffiliate
            ? "We'll save your order and hand you direct links to complete it at a stocking retailer."
            : "Payment is handled by Stripe. We never see or store your card details."}
        </p>
      </header>

      <div className="mt-12 border-t border-line pt-10">
        <CheckoutFlow />
      </div>
    </div>
  );
}
