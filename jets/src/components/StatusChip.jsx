/**
 * Marks data that is not real yet. The whole site is honest about its own
 * gaps — better a visible chip than a number nobody can trust.
 */
const STYLES = {
  placeholder: {
    label: 'Placeholder',
    className: 'bg-charcoal-2 text-steel-light ring-slate-edge',
  },
  'needs-data': {
    label: 'Needs data',
    className: 'bg-amber-50 text-amber-800 ring-amber-300',
  },
  'needs-verification': {
    label: 'Unverified',
    className: 'bg-amber-50 text-amber-800 ring-amber-300',
  },
  partial: {
    label: 'Partial',
    className: 'bg-amber-50 text-amber-800 ring-amber-300',
  },
};

export default function StatusChip({ status, className = '' }) {
  const style = STYLES[status];
  if (!style) return null;

  return (
    <span
      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[0.6rem] font-bold tracking-[0.1em] uppercase ring-1 ring-inset ${style.className} ${className}`}
    >
      {style.label}
    </span>
  );
}
