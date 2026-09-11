/**
 * Taste-profile meter (sweetness, sourness…). Segments rather than a bar, so
 * the value is readable without relying on length alone, and it still carries
 * a numeric label for assistive tech.
 */
export function Meter({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-ash">{label}</span>
      <span className="flex shrink-0 items-center gap-1.5" role="img" aria-label={`${label}: ${value} of ${max}`}>
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`h-1.5 w-5 sm:w-6 ${i < value ? "bg-ember" : "bg-line-strong"}`}
          />
        ))}
      </span>
    </div>
  );
}
