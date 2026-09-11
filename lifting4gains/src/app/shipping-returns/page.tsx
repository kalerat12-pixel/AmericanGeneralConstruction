import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { formatPrice } from "@/lib/pricing";
import { commerce, site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: "How fast orders ship, what shipping costs, and what happens when something arrives damaged.",
  alternates: { canonical: "/shipping-returns" },
};

export default function ShippingPage() {
  return (
    <LegalPage
      eyebrow="Help"
      title="Shipping & returns"
      updated="2026-09-01"
      intro="What actually happens between you paying and a box turning up."
      sections={[
        {
          heading: "How fast we ship",
          body: [
            "Orders placed before 2pm on a working day leave us the same day. Anything after that goes the next working day. We don't dispatch on weekends or public holidays.",
            "Most orders arrive in 2–4 working days once dispatched. Tracking is emailed as soon as the label is printed.",
          ],
        },
        {
          heading: "What shipping costs",
          body: [
            `Free over ${formatPrice(commerce.freeShippingThresholdCents)}. Below that it's a flat ${formatPrice(commerce.flatShippingCents)}. A 12-pack or larger clears the free threshold on its own.`,
            "Wholesale delivery is free over ten cases. Below that it's quoted on your postcode, at cost — we don't make margin on delivery.",
          ],
        },
        {
          heading: "Damaged or missing",
          body: [
            `Send a photo to ${site.email} and tell us whether you'd rather have a replacement or a refund. We'll action it that day. We will not ask you to post a dented can back to us.`,
            "If tracking says delivered and it isn't with you, give it 24 hours — carriers frequently scan early — then tell us and we'll chase it or resend.",
          ],
        },
        {
          heading: "Changed your mind",
          body: [
            "Unopened orders can go back within 14 days of delivery for a full refund. Email us first and we'll send instructions. You cover return shipping when it's a change of mind; we cover it when we got the order wrong.",
            "Refunds land back on the original payment method within 5 working days of us receiving the return.",
          ],
        },
        {
          heading: "Where we ship",
          body: [
            "The continental United States, currently. We're not shipping internationally yet — the cost per can makes it a bad deal for you and we'd rather say so than take the order.",
          ],
        },
        {
          heading: "Subscriptions",
          body: [
            "Subscription orders dispatch on the same four-week cycle as your first order. You'll get an email three days before each one so there's time to skip, change flavors or cancel.",
          ],
        },
      ]}
    />
  );
}
