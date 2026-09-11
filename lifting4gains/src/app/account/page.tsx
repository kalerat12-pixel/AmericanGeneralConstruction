import type { Metadata } from "next";
import { AccountView } from "@/components/cart/AccountView";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="shell pb-24 pt-16 lg:pt-20">
      <header className="max-w-2xl">
        <Eyebrow>Account</Eyebrow>
        <h1 className="type-display mt-5">Your orders</h1>
        <p className="type-lead mt-5">
          Everything you&rsquo;ve ordered from this device, plus how to manage a
          subscription.
        </p>
      </header>

      <div className="mt-12 border-t border-line pt-10">
        <AccountView />
      </div>
    </div>
  );
}
