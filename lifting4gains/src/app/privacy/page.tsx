import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Lifting4Gains collects, why, and how to get rid of it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy policy"
      updated="2026-09-01"
      intro="Written to be read. If anything here is unclear, email us and we'll answer in plain language — and then fix the wording on this page."
      sections={[
        {
          heading: "What we collect",
          body: [
            "When you order: your name, email, delivery address and what you bought. When you join the mailing list: your email address and which page you signed up from. When you ask for wholesale pricing: your gym's name, your name, email, phone if you give it, city, and the volume information you enter on the form.",
            "We also collect basic, aggregated analytics about how pages are used — which pages get visited and roughly where from. That data is not tied to your name.",
            "We do not collect or store your card details. Payments are handled by Stripe, who receive them directly.",
          ],
        },
        {
          heading: "Why we collect it",
          body: [
            "To take, pack and deliver your order, and to tell you where it is. To answer you when you get in touch. To send you the weekly email, if you asked for it. To quote you wholesale pricing, if you asked for that.",
            "We do not sell your data, rent it, or hand it to anyone for their own marketing. There is no exception to this buried further down the page.",
          ],
        },
        {
          heading: "Who else sees it",
          body: [
            "Stripe processes payments. Supabase hosts our database. Our email provider sends receipts and the newsletter. Our delivery carrier gets the name and address needed to deliver the box. Each of them sees only what they need to do that job.",
            "We may disclose information if a law genuinely requires it. If that ever happens and we're allowed to tell you, we will.",
          ],
        },
        {
          heading: "How long we keep it",
          body: [
            "Order records for seven years, because tax rules require it. Mailing list entries until you unsubscribe. Wholesale enquiries for two years, or until you ask us to delete them.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            "Unsubscribe from any email using the link at the bottom of it — one click, no confirmation page.",
            `Ask us for a copy of what we hold on you, or ask us to delete it, by emailing ${site.email}. We'll action it within 30 days. We can't delete order records still inside the legal retention window, and we'll tell you plainly if that applies.`,
          ],
        },
        {
          heading: "Cookies",
          body: [
            "Your cart is stored in your own browser's local storage, not on our servers, and it never leaves your device until you check out. We use a small number of analytics cookies. We do not run third-party advertising trackers on this site.",
          ],
        },
        {
          heading: "Changes",
          body: [
            "If we change this policy in a way that affects you, we'll say so in the weekly email rather than quietly updating the date at the top.",
          ],
        },
      ]}
    />
  );
}
