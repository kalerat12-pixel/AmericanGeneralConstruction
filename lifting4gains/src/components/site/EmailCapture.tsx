"use client";

import { useState, type FormEvent } from "react";

type State = "idle" | "sending" | "done" | "error";

export function EmailCapture({
  source = "site",
  className = "",
  label = "Email address",
}: {
  source?: string;
  className?: string;
  label?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setState("done");
      setMessage(data.message ?? "You're on the list.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <p className={`border border-ember/40 bg-ember/[0.06] px-4 py-3.5 text-sm ${className}`} role="status">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={className} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`email-${source}`} className="sr-only">
          {label}
        </label>
        <input
          id={`email-${source}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={state === "error" ? `email-error-${source}` : undefined}
          aria-invalid={state === "error" || undefined}
          className="field sm:flex-1"
        />
        <button type="submit" className="btn btn-primary" disabled={state === "sending"}>
          {state === "sending" ? "Adding…" : "Join"}
        </button>
      </div>
      {state === "error" && (
        <p id={`email-error-${source}`} role="alert" className="mt-2 text-sm text-ember">
          {message}
        </p>
      )}
    </form>
  );
}
