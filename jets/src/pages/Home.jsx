import { Link } from 'react-router-dom';
import { JetGlyph } from '../components/JetMark';
import StatusChip from '../components/StatusChip';
import { team } from '../data/team';
import { stateTitles, coaches } from '../data/history';
import { schedule, sortedSchedule, gameOutcome, recordFromSchedule } from '../data/schedule';
import { roster } from '../data/roster';

const QUICK_NAV = [
  { to: '/roster', label: 'Roster', blurb: 'Every Jet, by the numbers' },
  { to: '/stats', label: 'Team Stats', blurb: 'Season totals and leaders' },
  { to: '/schedule', label: 'Schedule', blurb: 'Results week by week' },
  { to: '/highlights', label: 'Highlights', blurb: 'Film from the Landing Strip' },
];

function formatGameDate(date) {
  if (!date) return 'Date TBD';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function Home() {
  const record = recordFromSchedule(schedule);
  const played = sortedSchedule().filter((g) => gameOutcome(g));
  const lastGame = played[played.length - 1];
  const nextGame = sortedSchedule().find((g) => !g.result && g.date);
  const mosser = coaches[0];

  const outstanding =
    roster.filter((p) => p.status !== 'verified').length +
    schedule.filter((g) => g.status !== 'verified').length;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="cut-bottom relative overflow-hidden bg-ink pb-20 text-white">
        <div className="absolute inset-0 speed-lines-red" aria-hidden />
        {/* Red wedge sweeping in from the right */}
        <div
          className="absolute inset-y-0 -right-24 w-2/3 bg-jet-red/90"
          style={{ clipPath: 'polygon(38% 0, 100% 0, 100% 100%, 0 100%)' }}
          aria-hidden
        />
        <JetGlyph className="pointer-events-none absolute -top-6 -right-10 h-64 w-auto text-white/10 sm:h-80" />
        {/* Scrim so the headline always sits on dark, whatever the breakpoint
            does to the wedge behind it. */}
        <div
          className="absolute inset-0 bg-linear-to-r from-ink from-35% via-ink/80 via-60% to-transparent"
          aria-hidden
        />

        <div className="shell relative pt-14 md:pt-20">
          <p className="eyebrow animate-streak mb-3 text-white/90">
            {team.conferenceAbbr} · {team.city}, Indiana
          </p>

          <h1 className="animate-streak text-6xl leading-[0.85] sm:text-7xl md:text-8xl">
            <span className="block text-steel-light">Adams Central</span>
            <span className="block text-white italic">Flying Jets</span>
          </h1>

          <p className="animate-lift mt-5 max-w-xl text-base leading-relaxed text-steel-light">
            Football at {team.venue.name} — {' '}
            <span className="font-semibold text-white">
              &ldquo;{team.venue.nickname}&rdquo;
            </span>
            . Roster, results, program history and film, kept in one place by fans.
          </p>

          {/* State champs banner */}
          <div className="animate-lift mt-8 inline-flex flex-wrap items-center gap-x-4 gap-y-2 border-l-4 border-white bg-ink/70 py-3 pr-5 pl-4 backdrop-blur-sm">
            <span className="athletic text-sm tracking-[0.2em] text-jet-red-bright">
              State Champions
            </span>
            <span className="flex items-center gap-3">
              {stateTitles.map((title) => (
                <span key={title.year} className="athletic text-2xl text-white">
                  {title.year}
                  <span className="ml-1 text-sm text-steel-light">
                    {title.class}
                  </span>
                </span>
              ))}
            </span>
          </div>

          {/* Record strip */}
          <dl className="animate-lift mt-9 grid max-w-2xl grid-cols-2 gap-px overflow-hidden border border-white/15 bg-white/15 sm:grid-cols-4">
            <div className="bg-ink p-3.5">
              <dt className="eyebrow text-steel">{team.currentSeason} Record</dt>
              <dd className="athletic mt-1 text-3xl text-white">
                {record.wins}-{record.losses}
              </dd>
            </div>
            <div className="bg-ink p-3.5">
              <dt className="eyebrow text-steel">Last Game</dt>
              <dd className="athletic mt-1 text-xl text-white">
                {lastGame ? (
                  <>
                    <span
                      className={
                        gameOutcome(lastGame) === 'W'
                          ? 'text-jet-red-bright'
                          : 'text-steel-light'
                      }
                    >
                      {gameOutcome(lastGame)}
                    </span>{' '}
                    {lastGame.result.teamScore}-{lastGame.result.opponentScore}
                  </>
                ) : (
                  '—'
                )}
              </dd>
              <p className="mt-0.5 text-[0.7rem] text-steel">
                {lastGame ? lastGame.opponent : 'No results yet'}
              </p>
            </div>
            <div className="bg-ink p-3.5">
              <dt className="eyebrow text-steel">Next Up</dt>
              <dd className="athletic mt-1 text-xl text-white">
                {nextGame ? formatGameDate(nextGame.date) : 'TBD'}
              </dd>
              <p className="mt-0.5 truncate text-[0.7rem] text-steel">
                {nextGame ? nextGame.opponent : 'Schedule to come'}
              </p>
            </div>
            <div className="bg-ink p-3.5">
              <dt className="eyebrow text-steel">Head Coach</dt>
              <dd className="athletic mt-1 text-xl text-white">Mosser</dd>
              <p className="mt-0.5 text-[0.7rem] text-steel">
                {mosser.wins}-{mosser.losses} since {mosser.yearsFrom}
              </p>
            </div>
          </dl>
        </div>
      </section>

      {/* ── Quick nav ────────────────────────────────────────────────────── */}
      <section className="shell relative z-10 pt-10 pb-16">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="lift-card group flex items-center justify-between border border-steel-light bg-white p-4 hover:border-jet-red"
            >
              <span>
                <span className="athletic block text-lg text-ink group-hover:text-jet-red">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs text-charcoal-2/70">
                  {item.blurb}
                </span>
              </span>
              <svg
                viewBox="0 0 24 24"
                className="size-5 shrink-0 -skew-x-12 text-steel transition-colors group-hover:text-jet-red"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="square"
                aria-hidden
              >
                <path d="m8 5 7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Data status — delete this block once everything is filled in ─── */}
      {outstanding > 0 && (
        <section className="shell pb-16">
          <div className="border-l-4 border-amber-400 bg-amber-50 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base text-amber-900">Site data status</h2>
              <StatusChip status="needs-data" />
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-amber-900/85">
              {outstanding} {outstanding === 1 ? 'entry needs' : 'entries need'}{' '}
              real data — rosters, stats and highlight links are marked in place
              rather than guessed. Everything lives in{' '}
              <code className="rounded-xs bg-amber-100 px-1 py-0.5 font-mono text-[0.78rem]">
                src/data/
              </code>
              . Delete this panel once you have filled things in.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
