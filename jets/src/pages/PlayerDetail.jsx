import { Link, useParams } from 'react-router-dom';
import PlayerAvatar from '../components/PlayerAvatar';
import StatusChip from '../components/StatusChip';
import VideoEmbed from '../components/VideoEmbed';
import { GRADE_LABELS, formatHeight, fullName, getPlayer, hasStats } from '../data/roster';

/** Field labels and display order for each stat group. */
const STAT_GROUPS = {
  passing: {
    label: 'Passing',
    fields: [
      ['completions', 'Comp'],
      ['attempts', 'Att'],
      ['yards', 'Yards'],
      ['touchdowns', 'TD'],
      ['interceptions', 'INT'],
      ['long', 'Long'],
    ],
  },
  rushing: {
    label: 'Rushing',
    fields: [
      ['attempts', 'Att'],
      ['yards', 'Yards'],
      ['touchdowns', 'TD'],
      ['long', 'Long'],
    ],
  },
  receiving: {
    label: 'Receiving',
    fields: [
      ['receptions', 'Rec'],
      ['yards', 'Yards'],
      ['touchdowns', 'TD'],
      ['long', 'Long'],
    ],
  },
  defense: {
    label: 'Defense',
    fields: [
      ['tacklesSolo', 'Solo'],
      ['tacklesAssisted', 'Ast'],
      ['tacklesForLoss', 'TFL'],
      ['sacks', 'Sacks'],
      ['interceptions', 'INT'],
      ['forcedFumbles', 'FF'],
      ['fumbleRecoveries', 'FR'],
      ['passBreakups', 'PBU'],
    ],
  },
  kicking: {
    label: 'Kicking',
    fields: [
      ['fieldGoalsMade', 'FGM'],
      ['fieldGoalsAttempted', 'FGA'],
      ['extraPointsMade', 'XPM'],
      ['extraPointsAttempted', 'XPA'],
      ['touchbacks', 'TB'],
    ],
  },
  returns: {
    label: 'Returns',
    fields: [
      ['kickReturns', 'KR'],
      ['kickReturnYards', 'KR Yds'],
      ['kickReturnTds', 'KR TD'],
      ['puntReturns', 'PR'],
      ['puntReturnYards', 'PR Yds'],
      ['puntReturnTds', 'PR TD'],
    ],
  },
};

export default function PlayerDetail() {
  const { playerId } = useParams();
  const player = getPlayer(playerId);

  if (!player) {
    return (
      <section className="shell py-24 text-center">
        <h1 className="text-4xl text-ink">Player not found</h1>
        <p className="mt-3 text-sm text-charcoal-2/70">
          Nobody on the roster has the id &ldquo;{playerId}&rdquo;.
        </p>
        <Link
          to="/roster"
          className="athletic mt-6 inline-block bg-jet-red px-6 py-3 text-sm tracking-[0.1em] text-white"
        >
          Back to roster
        </Link>
      </section>
    );
  }

  const height = formatHeight(player.heightInches);
  const vitals = [
    ['Class', player.gradeLevel ? GRADE_LABELS[player.gradeLevel] : null],
    ['Position', player.positions?.length ? player.positions.join(' / ') : null],
    ['Height', height],
    ['Weight', player.weightLbs ? `${player.weightLbs} lb` : null],
  ];

  return (
    <>
      {/* ── Identity ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 speed-lines-red" aria-hidden />

        <div className="shell relative py-10 md:py-14">
          <Link
            to="/roster"
            className="athletic mb-6 inline-flex items-center gap-2 text-xs tracking-[0.16em] text-steel-light transition-colors hover:text-white"
          >
            ← Roster
          </Link>

          <div className="grid gap-7 md:grid-cols-[220px_1fr] md:gap-10">
            <div className="relative aspect-[3/4] w-40 border-2 border-jet-red md:w-full">
              <PlayerAvatar player={player} />
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                {player.number != null && (
                  <span className="flex h-10 min-w-10 items-center justify-center bg-jet-red px-2 athletic text-xl text-white">
                    {player.number}
                  </span>
                )}
                {player.status !== 'verified' && <StatusChip status={player.status} />}
              </div>

              <h1 className="text-5xl leading-[0.9] sm:text-6xl">
                <span className="block text-white/80">{player.firstName}</span>
                <span className="block italic">{player.lastName}</span>
              </h1>
              <span className="jet-rule mt-4" />

              <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-white/15 bg-white/15 sm:grid-cols-4">
                {vitals.map(([label, value]) => (
                  <div key={label} className="bg-ink p-3">
                    <dt className="eyebrow text-steel">{label}</dt>
                    <dd className="athletic mt-1 text-lg text-white">
                      {value ?? '—'}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <div className="shell grid gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-2xl text-ink">Season Stats</h2>
          <span className="jet-rule mt-2 mb-5" />

          {hasStats(player) ? (
            <div className="flex flex-col gap-5">
              {Object.entries(STAT_GROUPS).map(([key, group]) => {
                const values = player.stats?.[key];
                if (!values) return null;
                return (
                  <section key={key}>
                    <h3 className="athletic mb-2 text-sm tracking-[0.16em] text-jet-red">
                      {group.label}
                    </h3>
                    <div className="rail border border-steel-light">
                      <table className="w-full min-w-max border-collapse text-left">
                        <thead className="bg-steel-pale">
                          <tr>
                            {group.fields.map(([, label]) => (
                              <th
                                key={label}
                                scope="col"
                                className="athletic px-3 py-2 text-[0.7rem] tracking-[0.1em] text-charcoal-2"
                              >
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {group.fields.map(([field]) => (
                              <td
                                key={field}
                                className="athletic px-3 py-2.5 text-lg text-ink tabular-nums"
                              >
                                {values[field] ?? '—'}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <p className="border border-dashed border-steel-light p-6 text-sm leading-relaxed text-charcoal-2/70">
              No stats recorded yet. Add them under{' '}
              <code className="font-mono text-xs">stats</code> for{' '}
              <code className="font-mono text-xs">{player.id}</code> in{' '}
              <code className="font-mono text-xs">src/data/roster.js</code> — only
              the groups that apply to their position.
            </p>
          )}

          {/* ── Bio ──────────────────────────────────────────────────────── */}
          <h2 className="mt-10 text-2xl text-ink">Bio</h2>
          <span className="jet-rule mt-2 mb-4" />
          {player.bio ? (
            <p className="max-w-prose text-[0.95rem] leading-relaxed text-charcoal-2">
              {player.bio}
            </p>
          ) : (
            <p className="border border-dashed border-steel-light p-6 text-sm text-charcoal-2/70">
              No bio yet — add one to <code className="font-mono text-xs">bio</code> in{' '}
              <code className="font-mono text-xs">src/data/roster.js</code>.
            </p>
          )}
        </div>

        {/* ── Film ───────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-2xl text-ink">Highlight Film</h2>
          <span className="jet-rule mt-2 mb-5" />
          <VideoEmbed
            url={player.highlightVideo}
            title={`${fullName(player)} highlights`}
            hint={`Paste a YouTube or Hudl URL into highlightVideo for "${player.id}" in src/data/roster.js.`}
          />
        </div>
      </div>
    </>
  );
}
