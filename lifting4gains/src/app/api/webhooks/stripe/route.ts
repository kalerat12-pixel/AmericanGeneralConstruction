import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseService } from "@/lib/supabase/client";

/**
 * Stripe webhook. Marks orders paid once Stripe confirms — never on the client
 * redirect, which a user can reach without paying.
 *
 * Local testing:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!secret || !apiKey) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = new Stripe(apiKey);
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const db = getSupabaseService();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const reference = session.client_reference_id ?? session.metadata?.reference;
      if (!reference) break;

      if (db) {
        const { error } = await db
          .from("orders")
          .update({ status: "paid", stripe_session_id: session.id })
          .eq("reference", reference);
        if (error) console.error("[stripe-webhook] order update failed", error);
      }

      // Count the referral use once payment is real, not at checkout start.
      const code = session.metadata?.referralCode;
      if (db && code) {
        const { data } = await db
          .from("referral_codes")
          .select("uses")
          .eq("code", code)
          .single();
        if (data) {
          await db
            .from("referral_codes")
            .update({ uses: Number(data.uses) + 1 })
            .eq("code", code);
        }
      }
      break;
    }

    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      const reference = session.client_reference_id ?? session.metadata?.reference;
      if (db && reference) {
        await db.from("orders").update({ status: "cancelled" }).eq("reference", reference);
      }
      break;
    }

    default:
      // Everything else is acknowledged and ignored on purpose.
      break;
  }

  return NextResponse.json({ received: true });
}
