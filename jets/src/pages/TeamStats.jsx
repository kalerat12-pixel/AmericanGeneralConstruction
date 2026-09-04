import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import StatusChip from '../components/StatusChip';
import { seasonStats, conferenceStandings } from '../data/teamStats';
import { schedule, recordFromSchedule } from '../data/schedule';
import { getPlayer, fullName } from '../data/roster';
import { team } from '../data/team';

const LEADER_SECTIONS = [
  ['passing', 'Passing Yards'],
  ['rushing', 'Rushing Yards'],
  ['receiving', 'Receiving Yards'],
  ['tackles', 'Tackles'],
  ['sacks', 'Sacks'],
];

function BigStat({ label, value, sub, status }) {
  return (
    <div className="border border-steel-light bg-white p-4">
      <p className="eyebrow flex items-center gap-2 text-charcoal-2/60">
        {label}
        {status && <StatusChip status={status} />}
      </p>
      <p className="athletic mt-1.5 text-4xl text-ink tabular-nums">
        {value ?? '—'}
      </p>
      {sub && <p className="mt-1 text-xs text-charcoal-2/70">{sub}</p>}
    </div>
  );
}

export default function TeamStats() {
  const record = recordFromSchedule(schedule);
  const { pointsFor, pointsAgainst, gamesCounted } = seasonStats;
  const diff = pointsFor - pointsAgainst;

  return (
    <>
      <section className="cut-bottom bg-charcoal pt-12 pb-16 text-white">
        <div className="shell">
          <SectionHeading
            eyebrow={`${seasonStats.season} Season`}
            title="Team Stats"
            tone="light"
          >
            Record comes straight from the schedule, so it is never out of sync.
            Yardage and leaders come from{' '}
            <code className="font-mono text-sm">src/data/teamStats.js</code>.
          </SectionHeading>
        </div>
      </section>

      <section className="shell relative z-10 pt-10 pb-16">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <BigStat
            label="Record"
            value={`${record.wins}-${record.losses}`}
            sub={`${team.conferenceAbbr}: ${
              seasonStats.conferenceRecord.wins ?? '—'
            }-${seasonStats.conferenceRecord.losses ?? '—'}`}
          />
          <BigStat
            label="Points For"
            value={pointsFor}
            sub={gamesCounted ? `${(pointsFor / gamesCounted).toFixed(1)} per game` : null}
            status={seasonStats.status}
          />
          <BigStat
            label="Points Against"
            value={pointsAgainst}
            sub={gamesCounted ? `${(pointsAgainst / gamesCounted).toFixed(1)} per game` : null}
            status={seasonStats.status}
          />
          <BigStat
            label="Point Differential"
            value={diff > 0 ? `+${diff}` : diff}
            sub={`Through ${gamesCounted} ${gamesCounted === 1 ? 'game' : 'games'}`}
            status={seasonStats.status}
          />
        </div>
      </section>

      {/* ── Offense / Defense ─────────────────────────────────────────────── */}
      <section className="shell pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            ['Offense', seasonStats.offense, [
              ['totalYards', 'Total yards'],
              ['rushingYards', 'Rushing yards'],
              ['passingYards', 'Passing yards'],
              ['turnoversLost', 'Turnovers lost'],
            ]],
            ['Defense', seasonStats.defense, [
              ['yardsAllowed', 'Yards allowed'],
              ['rushingYardsAllowed', 'Rushing allowed'],
              ['passingYardsAllowed', 'Passing allowed'],
              ['takeaways', 'Takeaways'],
            ]],
          ].map(([title, data, fields]) => (
            <div key={title}>
              <h2 className="text-2xl text-ink">{title}</h2>
              <span className="jet-rule mt-2 mb-4" />
              <dl className="border border-steel-light">
                {fields.map(([key, label], i) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-4 py-3 ${
                      i % 2 ? 'bg-steel-pale/50' : 'bg-white'
                    }`}
                  >
                    <dt className="text-sm text-charcoal-2">{label}</dt>
                    <dd className="athletic text-lg text-ink tabular-nums">
                      {data[key] ?? '—'}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* ── Leaders ───────────────────────────────────────────────────────── */}
      <section className="shell pb-16">
        <h2 className="text-2xl text-ink">Statistical Leaders</h2>
        <span className="jet-rule mt-2 mb-5" />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LEADER_SECTIONS.map(([key, label]) => {
            const entries = seasonStats.leaders[key] ?? [];
            return (
              <div key={key} className="border border-steel-light bg-white">
                <h3 className="athletic border-b border-steel-light bg-steel-pale px-4 py-2 text-sm tracking-[0.14em] text-charcoal-2">
                  {label}
                </h3>
                {entries.length === 0 ? (
                  <p className="px-4 py-5 text-xs text-charcoal-2/60">
                    No leaders recorded yet.
                  </p>
                ) : (
                  <ol className="divide-y divide-steel-light/70">
                    {entries.map((entry, i) => {
                      const player = getPlayer(entry.playerId);
                      return (
                        <li key={`${entry.playerId}-${i}`} className="px-4 py-3">
                          <div className="flex items-baseline justify-between gap-3">
                            {player ? (
                              <Link
                                to={`/roster/${player.id}`}
                                className="athletic truncate text-base text-ink transition-colors hover:text-jet-red"
                              >
                                {player.number != null && (
                                  <span className="mr-1.5 text-jet-red">
                                    #{player.number}
                                  </span>
                                )}
                                {fullName(player)}
                              </Link>
                            ) : (
                              <span className="text-sm text-charcoal-2/60">
                                Unknown player ({entry.playerId})
                              </span>
                            )}
                            <span className="athletic shrink-0 text-xl text-ink tabular-nums">
                              {entry.value}
                            </span>
                          </div>
                          <p className="mt-0.5 flex items-center gap-2 text-xs text-charcoal-2/65">
                            {entry.detail}
                            {entry.status && <StatusChip status={entry.status} />}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Standings ─────────────────────────────────────────────────────── */}
      <section className="shell pb-20">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl text-ink">{conferenceStandings.conference}</h2>
          <StatusChip status={conferenceStandings.status} />
        </div>

        <div className="rail border border-steel-light">
          <table className="w-full min-w-max border-collapse text-left">
            <thead className="bg-steel-pale">
              <tr>
                {['Team', 'Conf. W', 'Conf. L'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="athletic px-4 py-2.5 text-[0.72rem] tracking-[0.12em] text-charcoal-2"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-light/70">
              {conferenceStandings.teams.map((row) => (
                <tr
                  key={row.team}
                  className={row.isUs ? 'bg-jet-red/8' : 'bg-white'}
                >
                  <td className="px-4 py-2.5">
                    <span
                      className={`athletic text-base ${
                        row.isUs ? 'text-jet-red' : 'text-ink'
                      }`}
                    >
                      {row.team}
                    </span>
                  </td>
                  <td className="athletic px-4 py-2.5 text-base text-ink tabular-nums">
                    {row.confWins ?? '—'}
                  </td>
                  <td className="athletic px-4 py-2.5 text-base text-ink tabular-nums">
                    {row.confLosses ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
