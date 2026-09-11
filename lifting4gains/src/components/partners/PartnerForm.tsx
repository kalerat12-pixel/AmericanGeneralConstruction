"use client";

import { useState, type FormEvent } from "react";
import { commerce } from "@/lib/config";

type State = "idle" | "sending" | "done" | "error";

const MEMBER_BANDS = ["Under 100", "100–300", "300–600", "600–1,200", "1,200+"];
const CASE_BANDS = ["5–9 cases", "10–24 cases", "25–49 cases", "50+ cases", "Not sure yet"];

function Field({
  id,
  label,
  children,
  hint,
  required = false,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
        {required && (
          <span className="ml-1 text-ember" aria-hidden="true">
            *
          </span>
        )}
        {!required && <span className="ml-2 text-xs text-ash-dim">Optional</span>}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ash-dim">
          {hint}
        </p>
      )}
    </div>
  );
}

export function PartnerForm() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "We couldn't send that.");

      setState("done");
      setMessage(data.message);
      setCode(data.referralCode ?? null);
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "We couldn't send that.");
    }
  }

  if (state === "done") {
    return (
      <div className="panel p-8 lg:p-10" role="status">
        <h3 className="font-display text-2xl font-extrabold uppercase tracking-[-0.03em]">
          Got it.
        </h3>
        <p className="mt-4 text-[15px] leading-relaxed text-ash">{message}</p>

        {code && (
          <div className="mt-7 border border-ember/40 bg-ember/[0.06] p-6">
            <p className="type-eyebrow text-ember">Your referral code</p>
            <p className="type-mono mt-3 font-display text-3xl font-extrabold tracking-[0.02em]">
              {code}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ash">
              Share it with your members: they take 10% off every order, and you
              earn 5% back as credit against your next case order. It&rsquo;s live
              from right now — no waiting on us.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="panel p-7 lg:p-10" noValidate>
      <h2 className="font-display text-2xl font-extrabold uppercase tracking-[-0.03em]">
        Get case pricing
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-ash">
        Tell us about your gym and we&rsquo;ll come back within one working day with
        a real quote and a referral code for your members. No sales call unless you
        ask for one.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field id="gymName" label="Gym name" required>
          <input id="gymName" name="gymName" required className="field" autoComplete="organization" />
        </Field>

        <Field id="contactName" label="Your name" required>
          <input id="contactName" name="contactName" required className="field" autoComplete="name" />
        </Field>

        <Field id="email" label="Email" required>
          <input id="email" name="email" type="email" required className="field" autoComplete="email" inputMode="email" />
        </Field>

        <Field id="phone" label="Phone">
          <input id="phone" name="phone" type="tel" className="field" autoComplete="tel" inputMode="tel" />
        </Field>

        <Field id="city" label="City" required>
          <input id="city" name="city" required className="field" autoComplete="address-level2" />
        </Field>

        <Field id="memberCount" label="Members" required>
          <select id="memberCount" name="memberCount" required className="field" defaultValue="">
            <option value="" disabled className="bg-ink">
              Select…
            </option>
            {MEMBER_BANDS.map((b) => (
              <option key={b} value={b} className="bg-ink">
                {b}
              </option>
            ))}
          </select>
        </Field>

        <Field
          id="monthlyCases"
          label="Cases per month"
          required
          hint={`Minimum order is ${commerce.wholesaleMinimumCases} cases.`}
        >
          <select
            id="monthlyCases"
            name="monthlyCases"
            required
            className="field"
            defaultValue=""
            aria-describedby="monthlyCases-hint"
          >
            <option value="" disabled className="bg-ink">
              Select…
            </option>
            {CASE_BANDS.map((b) => (
              <option key={b} value={b} className="bg-ink">
                {b}
              </option>
            ))}
          </select>
        </Field>

        <Field id="currentSupplier" label="Current supplier">
          <input id="currentSupplier" name="currentSupplier" className="field" />
        </Field>

        <div className="sm:col-span-2">
          <Field id="message" label="Anything else" hint="Fridge space, delivery windows, flavors your members keep asking for.">
            <textarea
              id="message"
              name="message"
              rows={4}
              className="field resize-y"
              aria-describedby="message-hint"
            />
          </Field>
        </div>
      </div>

      {state === "error" && (
        <p role="alert" className="mt-6 border border-ember/40 bg-ember/[0.06] px-4 py-3 text-sm">
          {message}
        </p>
      )}

      <button type="submit" className="btn btn-primary mt-8 w-full sm:w-auto" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Request pricing"}
      </button>

      <p className="mt-4 text-xs leading-relaxed text-ash-dim">
        We use this to quote you and nothing else. No list, no resale, no drip
        campaign. See our{" "}
        <a href="/privacy" className="link-slide text-ash">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
