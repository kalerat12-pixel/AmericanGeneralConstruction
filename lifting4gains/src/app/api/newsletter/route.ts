import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseService } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().trim().email("That doesn't look like a valid email."),
  source: z.string().trim().max(64).default("site"),
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
      { error: parsed.error.issues[0]?.message ?? "Check that email and try again." },
      { status: 400 },
    );
  }

  const { email, source } = parsed.data;
  const db = getSupabaseService();

  if (!db) {
    // No database configured — log it and succeed, so the UX is identical in
    // local development. Nothing is silently dropped in production, because
    // supabaseConfigured is surfaced in the README setup checklist.
    console.info(`[newsletter] ${email} (source: ${source}) — no database configured`);
    return NextResponse.json({
      message: "You're on the list. Your 10% code is on its way.",
      persisted: false,
    });
  }

  const { error } = await db
    .from("newsletter_signups")
    .upsert({ email: email.toLowerCase(), source }, { onConflict: "email" });

  if (error) {
    console.error("[newsletter] insert failed", error);
    return NextResponse.json(
      { error: "We couldn't save that just now. Try again in a moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "You're on the list. Your 10% code is on its way.",
    persisted: true,
  });
}
