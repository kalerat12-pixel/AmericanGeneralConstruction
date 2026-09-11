/**
 * Required on every caffeinated product page. Deliberately plain text rather
 * than a dismissible banner — it should still be there on the tenth visit.
 */
export function CaffeineAdvisory({ caffeineMg }: { caffeineMg: number }) {
  if (caffeineMg <= 0) {
    return (
      <aside className="border border-line p-5" aria-label="Caffeine information">
        <h2 className="type-eyebrow">Caffeine</h2>
        <p className="mt-3 text-sm leading-relaxed text-ash">
          This product contains no caffeine. It&rsquo;s the one to reach for on a
          second session, in the evening, or when you&rsquo;ve already had your
          limit for the day.
        </p>
      </aside>
    );
  }

  return (
    <aside className="border border-ember/35 bg-ember/[0.05] p-5" aria-label="Caffeine advisory">
      <h2 className="type-eyebrow text-ember">Caffeine advisory</h2>
      <p className="mt-3 text-sm leading-relaxed text-bone">
        Contains {caffeineMg}mg of caffeine per can — roughly two cups of coffee.
      </p>
      <p className="mt-2.5 text-sm leading-relaxed text-ash">
        Health authorities generally advise healthy adults stay under 400mg of
        caffeine a day, so treat two cans as your ceiling and count anything else
        you&rsquo;ve had. Not recommended for children, or for people who are
        pregnant, breastfeeding, or sensitive to caffeine. If you&rsquo;re
        stacking this with a pre-workout, check that label&rsquo;s caffeine
        content first — it adds up faster than people expect.
      </p>
    </aside>
  );
}
