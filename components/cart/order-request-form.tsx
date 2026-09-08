'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart, type CartLine } from '@/lib/cart';
import { formatPrice, SITE } from '@/lib/utils';

const USE_CASES = [
  'Academic research',
  'Contract research organisation',
  'Industrial / commercial laboratory',
  'Analytical reference standard',
  'Other',
] as const;

/**
 * Stubbed checkout. There is no backend yet, so the request is assembled,
 * shown back to the researcher, and the cart is cleared — swap `submit` for a
 * fetch when an endpoint exists. The shape of `payload` is the contract.
 */
export function OrderRequestForm({
  lines,
  subtotal,
}: {
  lines: CartLine[];
  subtotal: number;
}) {
  const clear = useCart((s) => s.clear);
  const [sent, setSent] = React.useState<string | null>(null);
  const [attested, setAttested] = React.useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      contact: Object.fromEntries(form.entries()),
      lines: lines.map((l) => ({
        sku: l.sku,
        name: l.name,
        amount: l.amount,
        quantity: l.quantity,
        price: l.price,
      })),
      subtotal,
      submittedAt: new Date().toISOString(),
    };
    // Stub: no endpoint yet. The reference is deterministic enough to quote.
    console.info('[order-request]', payload);
    const ref = `L4G-${new Date().getFullYear()}${String(Date.now()).slice(-5)}`;
    setSent(ref);
    clear();
  };

  if (sent) {
    return (
      <aside className="h-fit border border-champagne/40 bg-alabaster p-8 md:p-10 lg:sticky lg:top-32">
        <Check className="h-7 w-7 text-champagne" strokeWidth={1} aria-hidden />
        <h2 className="mt-7 font-display text-[1.875rem] font-light leading-snug text-charcoal">
          Request received
        </h2>
        <span aria-hidden className="mt-6 block h-px w-10 bg-champagne/55" />
        <p className="mt-6 text-[0.9375rem] leading-[1.85] text-charcoal/65">
          Your reference is{' '}
          <span className="font-sans tabular-nums text-charcoal">{sent}</span>. We will reply from{' '}
          <a href={`mailto:${SITE.email}`} className="underline underline-offset-4 hover-gold">
            {SITE.email}
          </a>{' '}
          within one business day with availability, shipping and a payment link. Nothing has been
          charged.
        </p>
      </aside>
    );
  }

  return (
    <aside className="h-fit border border-champagne/35 bg-alabaster p-8 md:p-10 lg:sticky lg:top-32">
      <h2 className="eyebrow">Request Order</h2>
      <span aria-hidden className="mt-4 block h-px w-10 bg-champagne/55" />
      <p className="mt-6 text-[0.9375rem] leading-[1.85] text-charcoal/65">
        We confirm every order by hand before taking payment — availability, lot, shipping method
        and destination. Send the request and we will come back to you.
      </p>

      <form onSubmit={submit} className="mt-10 space-y-7">
        <div className="grid gap-7 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" name="firstName" required autoComplete="given-name" />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" required autoComplete="family-name" />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>

        <div>
          <Label htmlFor="organisation">Institution or organisation</Label>
          <Input id="organisation" name="organisation" required autoComplete="organization" />
        </div>

        <div>
          <Label htmlFor="useCase">Intended research use</Label>
          <Select id="useCase" name="useCase" required defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            {USE_CASES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="shipping">Shipping address</Label>
          <Textarea
            id="shipping"
            name="shipping"
            required
            autoComplete="street-address"
            placeholder="Street, city, state, postal code, country"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            className="min-h-[80px]"
            placeholder="Lot preferences, delivery timing, purchase order number"
          />
        </div>

        <div className="flex items-start gap-3.5 pt-2">
          <input
            id="attest"
            name="attest"
            type="checkbox"
            required
            checked={attested}
            onChange={(e) => setAttested(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#C9A961]"
          />
          <label htmlFor="attest" className="text-[0.8125rem] leading-[1.75] text-charcoal/70">
            I am 21 or older, I am ordering on behalf of a qualified research entity, and I
            understand these materials are supplied for laboratory research use only and are not
            for human or veterinary consumption.
          </label>
        </div>

        <div className="flex items-baseline justify-between gap-6 border-t border-champagne/30 pt-7">
          <span className="eyebrow-muted">Subtotal</span>
          <span className="font-sans text-[1.125rem] tabular-nums text-charcoal">
            {formatPrice(subtotal)}
          </span>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Send order request
        </Button>

        <p className="text-[0.75rem] leading-relaxed text-charcoal/65">
          No payment is taken on this page. We reply with a quote and a secure payment link.
        </p>
      </form>
    </aside>
  );
}
