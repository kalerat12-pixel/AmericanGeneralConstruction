import SectionHeading from '../components/SectionHeading';
import StatusChip from '../components/StatusChip';
import { JetGlyph } from '../components/JetMark';
import {
  stateTitles,
  notableRuns,
  tournamentTitles,
  allTimeRecord,
  coaches,
} from '../data/history';

const HARDWARE = [
  ['semiState', 'Semi-State'],
  ['regional', 'Regional'],
  ['sectional', 'Sectional'],
  ['conference', 'ACAC'],
];

export default function History() {
  return (
    <>
      <section className="cut-bottom bg-charcoal pt-12 pb-16 text-white">
        <div className="shell">
          <SectionHeading eyebrow="The Program" title="History & Achievements" tone="light">
            Championships, tournament hardware and the coaches who built it.
          </SectionHeading>
        </div>
      </section>

      {/* ── State titles ──────────────────────────────────────────────────── */}
      <section className="shell relative z-10 pt-10 pb-16">
        <div className="grid gap-3 sm:grid-cols-2">
          {stateTitles.map((title) => (
            <article
              key={title.year}
              className="relative overflow-hidden border-l-4 border-jet-red bg-ink p-6 text-white"
            >
              <div className="absolute inset-0 speed-lines-red" aria-hidden />
              <JetGlyph className="pointer-events-none absolute -right-4 -bottom-3 h-20 w-auto text-white/8" />

              <div className="relative">
                <p className="eyebrow text-jet-red-bright">State Champions</p>
                <p className="athletic mt-1 text-6xl leading-none">{title.year}</p>
                <p className="athletic mt-1 text-lg text-steel-light">
                  Class {title.class}
                </p>

                <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div>
                    <dt className="eyebrow text-steel">Opponent</dt>
                    <dd className="text-steel-light">{title.opponent ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-steel">Final</dt>
                    <dd className="text-steel-light">{title.score ?? '—'}</dd>
                  </div>
                </dl>

                {title.note && (
                  <p className="mt-4 max-w-sm text-xs leading-relaxed text-steel">
                    {title.note}
                  </p>
                )}
                {title.status !== 'verified' && (
                  <span className="mt-3 inline-block">
                    <StatusChip status={title.status} />
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Hardware ──────────────────────────────────────────────────────── */}
      <section className="shell pb-16">
        <h2 className="text-2xl text-ink">Tournament Titles</h2>
        <span className="jet-rule mt-2 mb-2" />
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-charcoal-2/75">
          {tournamentTitles.scope}. Program-wide totals across every era are not
          recorded here yet.
        </p>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {HARDWARE.map(([key, label]) => {
            const entry = tournamentTitles[key];
            return (
              <div key={key} className="border border-steel-light bg-white p-5">
                <p className="athletic text-5xl text-jet-red tabular-nums">
                  {entry.count}
                </p>
                <p className="athletic mt-1 text-sm tracking-[0.14em] text-charcoal-2">
                  {label}
                </p>
                <p className="mt-2 text-[0.7rem] leading-snug text-charcoal-2/60">
                  {entry.years.length > 0 ? entry.years.join(', ') : 'Years to be added'}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Notable runs ──────────────────────────────────────────────────── */}
      <section className="shell pb-16">
        <h2 className="text-2xl text-ink">Recent Postseason Runs</h2>
        <span className="jet-rule mt-2 mb-5" />

        <ol className="border-l-2 border-steel-light">
          {notableRuns.map((run) => (
            <li key={`${run.year}-${run.result}`} className="relative pb-7 pl-6 last:pb-0">
              <span className="absolute top-1.5 -left-[7px] size-3 rounded-full bg-jet-red" aria-hidden />
              <p className="athletic text-2xl text-ink">{run.year}</p>
              <p className="athletic text-sm tracking-[0.12em] text-jet-red">
                {run.result}
              </p>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-charcoal-2/80">
                {run.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Coaches ───────────────────────────────────────────────────────── */}
      <section className="shell pb-20">
        <h2 className="text-2xl text-ink">Coaching History</h2>
        <span className="jet-rule mt-2 mb-5" />

        <div className="flex flex-col gap-3">
          {coaches.map((coach) => (
            <article
              key={coach.name}
              className="border border-steel-light bg-white p-5 sm:flex sm:items-start sm:justify-between sm:gap-8"
            >
              <div>
                <h3 className="text-xl text-ink">{coach.name}</h3>
                <p className="athletic mt-0.5 text-sm tracking-[0.12em] text-charcoal-2/70">
                  {coach.yearsFrom}–{coach.yearsTo ?? 'present'}
                </p>
                {coach.highlights?.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {coach.highlights.map((h) => (
                      <li
                        key={h}
                        className="border border-steel-light bg-steel-pale px-2 py-1 text-[0.7rem] text-charcoal-2"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4 shrink-0 sm:mt-0 sm:text-right">
                <p className="athletic text-4xl text-jet-red tabular-nums">
                  {coach.wins}-{coach.losses}
                </p>
                <p className="text-[0.7rem] text-charcoal-2/60">
                  {coach.recordAsOf ? `Through ${coach.recordAsOf}` : 'Career record'}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 border border-steel-light bg-steel-pale/60 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg text-ink">All-Time Program Record</h3>
            {allTimeRecord.status !== 'verified' && (
              <StatusChip status="needs-verification" />
            )}
          </div>
          <p className="athletic mt-2 text-3xl text-charcoal-2 tabular-nums">
            {allTimeRecord.wins ?? '—'}-{allTimeRecord.losses ?? '—'}
            {allTimeRecord.ties ? `-${allTimeRecord.ties}` : ''}
          </p>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-charcoal-2/70">
            Not filled in — I would not guess at it. Add the totals to{' '}
            <code className="font-mono">allTimeRecord</code> in{' '}
            <code className="font-mono">src/data/history.js</code>.
          </p>
        </div>
      </section>
    </>
  );
}
