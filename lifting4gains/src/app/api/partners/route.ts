import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseService } from "@/lib/supabase/client";

const schema = z.object({
  gymName: z.string().trim().min(2, "Tell us the gym's name.").max(120),
  contactName: z.string().trim().min(2, "Tell us your name.").max(120),
  email: z.string().trim().email("That doesn't look like a valid email."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Which city?").max(120),
  memberCount: z.string().trim().min(1, "Pick a member count.").max(40),
  monthlyCases: z.string().trim().min(1, "Pick a rough case volume.").max(40),
  currentSupplier: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

/**
 * Referral codes are derived from the gym name so they're memorable on a
 * whiteboard at the front desk — "IRONHOUSE42" rather than a random string.
 */
function buildReferralCode(gymName: string, attempt = 0): string {
  const stem =
    gymName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10) || "GYM";
  // First attempt gets a clean 2-digit suffix; retries widen the range.
  const suffix = 10 + Math.floor(Math.random() * (attempt === 0 ? 90 : 900));
  return `${stem}${suffix}`;
}

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
      { error: parsed.error.issues[0]?.message ?? "Check the form and try again." },
      { status: 400 },
    );
  }

  const lead = parsed.data;
  let referralCode = buildReferralCode(lead.gymName);
  const message =
    "We'll come back within one working day with case pricing for your flavors and volume. Nothing else — we won't put you on a mailing list.";

  const db = getSupabaseService();

  if (!db) {
    console.info(`[partner-lead] ${lead.gymName} <${lead.email}> — no database configured`);
    return NextResponse.json({ message, referralCode, persisted: false });
  }

  const { data, error } = await db
    .from("partner_leads")
    .insert({
      gym_name: lead.gymName,
      contact_name: lead.contactName,
      email: lead.email.toLowerCase(),
      phone: lead.phone || null,
      city: lead.city,
      member_count: lead.memberCount,
      current_supplier: lead.currentSupplier || null,
      monthly_cases: lead.monthlyCases,
      message: lead.message || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[partner-lead] insert failed", error);
    return NextResponse.json(
      { error: "We couldn't send that just now. Email us directly and we'll pick it up." },
      { status: 500 },
    );
  }

  // Issue the code immediately so the gym can start using it today. `code` is
  // the primary key, so a collision fails the insert rather than silently
  // handing two gyms the same code — retry with a fresh suffix if that happens.
  let codeIssued = false;
  for (let attempt = 0; attempt < 5 && !codeIssued; attempt += 1) {
    if (attempt > 0) referralCode = buildReferralCode(lead.gymName, attempt);

    const { error: codeError } = await db.from("referral_codes").insert({
      code: referralCode,
      gym_name: lead.gymName,
      partner_lead_id: data.id,
    });

    if (!codeError) {
      codeIssued = true;
    } else if (codeError.code !== "23505") {
      // Not a uniqueness violation — retrying won't help.
      console.error("[partner-lead] code creation failed", codeError);
      break;
    }
  }

  if (codeIssued) {
    await db.from("partner_leads").update({ referral_code: referralCode }).eq("id", data.id);
  }

  return NextResponse.json({
    message,
    // Only promise a code we actually reserved.
    referralCode: codeIssued ? referralCode : null,
    persisted: true,
  });
}
