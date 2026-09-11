import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";

import { commerce, site, stripeConfigured } from "@/lib/config";
import { resolveLines, buildReference, recordOrder } from "@/lib/orders";
import { cartTotals } from "@/lib/pricing";
import type { CartLine } from "@/lib/types";

const schema = z.object({
  email: z.string().trim().email("We need a valid email for your receipt."),
  referralCode: z.string().trim().max(32).optional().or(z.literal("")),
  lines: z
    .array(
      z.object({
        productSlug: z.string().min(1),
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
        subscribe: z.boolean(),
      }),
    )
    .min(1, "Your cart is empty."),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check your cart and try again." },
      { status: 400 },
    );
  }

  const { email, referralCode } = parsed.data;
  const lines = parsed.data.lines as CartLine[];

  // Re-price server side. Never trust a total that came from the browser.
  const resolved = resolveLines(lines);
  if (!resolved.length) {
    return NextResponse.json({ error: "Nothing in your cart is still available." }, { status: 400 });
  }

  const totals = cartTotals(lines);
  const reference = buildReference();

  /* ---- Affiliate mode ---------------------------------------------------
   * We don't hold stock, so there is no payment to take. We record the intent
   * and hand back tagged outbound links for the shopper to complete.
   * ------------------------------------------------------------------- */
  if (commerce.isAffiliate) {
    await recordOrder({ email, lines, reference, status: "pending", referralCode });

    return NextResponse.json({
      mode: "affiliate" as const,
      reference,
      outbound: resolved.map((line) => ({
        title: line.title,
        flavorName: line.flavorName,
        variantLabel: line.variantLabel,
        quantity: line.quantity,
        url: line.affiliateUrl,
      })),
    });
  }

  /* ---- Inventory mode: Stripe Checkout ---------------------------------- */
  if (!stripeConfigured) {
    // Keys absent — simulate so the flow is demonstrable end to end locally.
    await recordOrder({ email, lines, reference, status: "pending", referralCode });
    return NextResponse.json({
      mode: "simulated" as const,
      reference,
      url: `/checkout/success?ref=${reference}&simulated=1`,
      note: "STRIPE_SECRET_KEY is not set, so this checkout was simulated. See README.",
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const hasSubscription = resolved.some((l) => l.subscribe);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: hasSubscription ? "subscription" : "payment",
      customer_email: email,
      client_reference_id: reference,
      line_items: resolved.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "usd",
          unit_amount: line.unitPriceCents,
          ...(line.subscribe && { recurring: { interval: "month" as const } }),
          product_data: {
            name: `${line.title} — ${line.variantLabel}`,
            description: line.subscribe
              ? `Delivered every 4 weeks · ${Math.round(commerce.subscriptionDiscount * 100)}% subscriber discount applied`
              : undefined,
          },
        },
      })),
      ...(!hasSubscription &&
        totals.shippingCents > 0 && {
          shipping_options: [
            {
              shipping_rate_data: {
                type: "fixed_amount" as const,
                fixed_amount: { amount: totals.shippingCents, currency: "usd" },
                display_name: "Standard shipping (2–4 days)",
              },
            },
          ],
        }),
      metadata: { reference, referralCode: referralCode || "", commerceMode: commerce.mode },
      success_url: `${site.url}/checkout/success?ref=${reference}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site.url}/cart`,
    });

    await recordOrder({
      email,
      lines,
      reference,
      status: "pending",
      stripeSessionId: session.id,
      referralCode,
    });

    return NextResponse.json({ mode: "stripe" as const, reference, url: session.url });
  } catch (err) {
    console.error("[checkout] stripe session failed", err);
    return NextResponse.json(
      { error: "We couldn't start checkout. Nothing has been charged — try again." },
      { status: 502 },
    );
  }
}
