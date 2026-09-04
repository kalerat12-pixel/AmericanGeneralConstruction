import SectionHeading from '../components/SectionHeading';
import StatusChip from '../components/StatusChip';
import { team } from '../data/team';
import {
  schedule,
  sortedSchedule,
  gameOutcome,
  recordFromSchedule,
} from '../data/schedule';

function formatDate(date) {
  if (!date) return 'TBD';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const LOCATION_LABEL = { home: 'vs', away: 'at', neutral: 'vs' };

/** '19:00' → '7:00 PM' */
function formatKickoff(time) {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export default function Schedule() {
  const games = sortedSchedule();
  const record = recordFromSchedule(schedule);

  return (
    <>
      <section className="cut-bottom bg-charcoal pt-12 pb-16 text-white">
        <div className="shell">
          <SectionHeading
            eyebrow={`${team.currentSeason} Season`}
            title="Schedule & Results"
            tone="light"
          >
            Home games are played at {team.venue.name} — &ldquo;
            {team.venue.nickname}&rdquo;.
          </SectionHeading>

          <p className="athletic text-4xl text-white">
            {record.wins}-{record.losses}
            {record.ties > 0 && `-${record.ties}`}
            <span className="ml-3 text-sm tracking-[0.16em] text-steel-light">
              Overall
            </span>
          </p>
        </div>
      </section>

      <section className="shell relative z-10 pt-10 pb-20">
        <ul className="flex flex-col gap-2.5">
          {games.map((game) => {
            const outcome = gameOutcome(game);
            const accent =
              outcome === 'W'
                ? 'border-l-jet-red'
                : outcome === 'L'
                  ? 'border-l-charcoal-2'
                  : 'border-l-steel-light';

            return (
              <li
                key={game.id}
                className={`lift-card border border-steel-light border-l-4 bg-white ${accent}`}
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="w-16 shrink-0">
                      <p className="eyebrow text-charcoal-2/60">
                        {game.week ? `Week ${game.week}` : '—'}
                      </p>
                      <p className="athletic text-sm text-ink">
                        {formatDate(game.date)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="athletic truncate text-xl text-ink">
                        <span className="text-charcoal-2/60">
                          {LOCATION_LABEL[game.location] ?? 'vs'}{' '}
                        </span>
                        {game.opponent}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-charcoal-2/70">
                        <span>
                          {game.location === 'home'
                            ? game.venue || team.venue.name
                            : game.location === 'away'
                              ? 'Away'
                              : 'Neutral site'}
                        </span>
                        {game.isConference && (
                          <span className="athletic bg-steel-pale px-1.5 py-0.5 text-[0.62rem] tracking-[0.1em] text-charcoal-2">
                            {team.conferenceAbbr}
                          </span>
                        )}
                        {game.isRivalry && (
                          <span className="athletic bg-jet-red px-1.5 py-0.5 text-[0.62rem] tracking-[0.1em] text-white">
                            Rivalry
                          </span>
                        )}
                        {game.status !== 'verified' && (
                          <StatusChip status={game.status} />
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:justify-end">
                    {outcome ? (
                      <p className="athletic text-2xl text-ink">
                        <span
                          className={
                            outcome === 'W' ? 'text-jet-red' : 'text-charcoal-2/60'
                          }
                        >
                          {outcome}
                        </span>{' '}
                        {game.result.teamScore}–{game.result.opponentScore}
                      </p>
                    ) : (
                      <p className="athletic text-sm tracking-[0.14em] text-charcoal-2/60">
                        {game.kickoff ? `${formatKickoff(game.kickoff)} kickoff` : 'Upcoming'}
                      </p>
                    )}

                    {game.highlightVideo ? (
                      <a
                        href={game.highlightVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="athletic shrink-0 border border-jet-red px-3 py-1.5 text-xs tracking-[0.1em] text-jet-red transition-colors hover:bg-jet-red hover:text-white"
                      >
                        Film
                      </a>
                    ) : (
                      <span className="athletic shrink-0 border border-dashed border-steel-light px-3 py-1.5 text-xs tracking-[0.1em] text-charcoal-2/40">
                        No film
                      </span>
                    )}
                  </div>
                </div>

                {game.notes && (
                  <p className="border-t border-steel-light/70 px-4 py-2.5 text-xs leading-relaxed text-charcoal-2/75">
                    {game.notes}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-xs leading-relaxed text-charcoal-2/60">
          Add remaining games in{' '}
          <code className="font-mono">src/data/schedule.js</code> — one object per
          game. Set <code className="font-mono">result</code> to record a final
          score, and paste a reel URL into{' '}
          <code className="font-mono">highlightVideo</code>.
        </p>
      </section>
    </>
  );
}
