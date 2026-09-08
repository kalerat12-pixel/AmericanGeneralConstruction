'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TOPICS = [
  'A certificate of analysis',
  'An existing order',
  'Bulk or repeat supply',
  'A material not in the catalogue',
  'Something else',
] as const;

/** Stubbed like the order request — no endpoint yet, wire `submit` when there is one. */
export function ContactForm() {
  const [sent, setSent] = React.useState(false);

  if (sent) {
    return (
      <div className="border border-champagne/40 p-8 md:p-10" role="status">
        <Check className="h-7 w-7 text-champagne" strokeWidth={1} aria-hidden />
        <h2 className="mt-7 font-display text-[1.875rem] font-light text-charcoal">
          Message sent
        </h2>
        <span aria-hidden className="mt-6 block h-px w-10 bg-champagne/55" />
        <p className="mt-6 max-w-prose text-[0.9375rem] leading-[1.85] text-charcoal/65">
          Thank you — we reply within one business day. If your question is about a specific lot,
          having the lot number to hand will make the answer faster.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.info('[contact]', Object.fromEntries(new FormData(e.currentTarget).entries()));
        setSent(true);
      }}
      className="space-y-7"
    >
      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-name">Name</Label>
          <Input id="c-name" name="name" required autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>

      <div>
        <Label htmlFor="c-topic">What is this about?</Label>
        <Select id="c-topic" name="topic" required defaultValue="">
          <option value="" disabled>
            Select one
          </option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="c-lot">Lot number (optional)</Label>
        <Input id="c-lot" name="lot" placeholder="L4G-2409-0117" />
      </div>

      <div>
        <Label htmlFor="c-message">Message</Label>
        <Textarea id="c-message" name="message" required className="min-h-[160px]" />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-[220px]">
        Send message
      </Button>

      <p className="text-[0.75rem] leading-relaxed text-charcoal/65">
        We cannot advise on the use of any material, in any context. Questions of that kind will be
        declined.
      </p>
    </form>
  );
}
