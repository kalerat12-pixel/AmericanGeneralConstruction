import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { site, commerce } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of sale",
  description: "The terms you're agreeing to when you order from Lifting4Gains.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of sale"
      updated="2026-09-01"
      intro={`The agreement between you and ${site.legalName} when you order. Short, because it doesn't need to be long.`}
      sections={[
        {
          heading: "Who we are",
          body: [
            `${site.legalName}, an independent retailer of energy and hydration drinks. Contact us at ${site.email}.`,
            "We are not affiliated with, endorsed by, or sponsored by Ghost Lifestyle or any of their collaborators. GHOST® is a registered trademark of its owner, used here only to identify the products we sell.",
          ],
        },
        {
          heading: "Orders",
          body: [
            "Your order is an offer to buy. It's accepted when we email you a confirmation. If we can't fulfil something — it's out of stock, or a price was wrong on the site — we'll tell you and refund you in full rather than substituting something you didn't choose.",
            "Prices include applicable taxes where shown. Shipping is charged as displayed at checkout.",
          ],
        },
        {
          heading: "Age and suitability",
          body: [
            "Energy drinks are not suitable for children, or for people who are pregnant, breastfeeding, or sensitive to caffeine. By ordering caffeinated products you confirm they are for someone the product is suitable for.",
            "Nutrition and caffeine information on this site is taken from the manufacturer's packaging. Formulations change — always read the can in your hand. Nothing on this site is medical advice.",
          ],
        },
        {
          heading: "Subscriptions",
          body: [
            `Subscriptions renew every four weeks at the discounted rate (${Math.round(commerce.subscriptionDiscount * 100)}% off) until you cancel. Every subscription receipt carries a link to skip, pause, change or cancel, effective immediately.`,
            "Changes made less than 48 hours before a dispatch may apply from the following delivery instead. We'll tell you if that happens.",
          ],
        },
        {
          heading: "Cancellations and returns",
          body: [
            "Unopened orders can be returned within 14 days of delivery for a full refund. We pay return shipping if we got the order wrong; you pay it if you simply changed your mind.",
            "Damaged or faulty goods: send a photo and we'll replace or refund, your choice. We won't ask you to post back a dented can.",
            "For food safety reasons we can't accept returns of opened drinks.",
          ],
        },
        {
          heading: "Wholesale orders",
          body: [
            `Wholesale terms apply to orders of ${commerce.wholesaleMinimumCases} cases or more and are confirmed in the quote we send you. There's no contract, no minimum term and no exclusivity.`,
            "Referral credit is reconciled monthly and applied against your next case order. We'll show you the orders it came from.",
          ],
        },
        {
          heading: "Affiliate links",
          body: [
            "Some links on this site take you to a third-party retailer, and we may earn a commission if you buy there. It never costs you more, and it never affects a flavor's position in our rankings.",
            "When you buy on a third-party site, that retailer's terms govern the purchase, not ours.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or anything else that can't lawfully be limited. Beyond that, our liability for any order is limited to what you paid for it.",
          ],
        },
      ]}
    />
  );
}
