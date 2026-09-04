import { useMemo, useState } from 'react';
import PlayerCard from '../components/PlayerCard';
import SectionHeading from '../components/SectionHeading';
import { roster, sortedRoster } from '../data/roster';

/** Position groups, so the filter stays useful as the roster grows. */
const GROUPS = {
  All: () => true,
  Offense: (p) => p.positions?.some((pos) => ['QB', 'RB', 'FB', 'WR', 'TE', 'OL', 'OT', 'OG', 'C'].includes(pos)),
  Defense: (p) => p.positions?.some((pos) => ['DL', 'DE', 'DT', 'LB', 'CB', 'S', 'FS', 'SS', 'DB'].includes(pos)),
  'Special Teams': (p) => p.positions?.some((pos) => ['K', 'P', 'LS', 'KR', 'PR'].includes(pos)),
};

export default function Roster() {
  const [group, setGroup] = useState('All');

  const players = useMemo(
    () => sortedRoster(roster).filter(GROUPS[group]),
    [group],
  );

  return (
    <>
      <section className="cut-bottom bg-charcoal pt-12 pb-16 text-white">
        <div className="shell">
          <SectionHeading eyebrow="The Squad" title="Roster" tone="light">
            Tap any player for their season stats, bio and highlight film.
          </SectionHeading>
        </div>
      </section>

      <section className="shell relative z-10 pt-10 pb-20">
        <div className="rail mb-6 flex gap-2 pb-1">
          {Object.keys(GROUPS).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setGroup(name)}
              aria-pressed={group === name}
              className={`athletic shrink-0 border px-4 py-2 text-sm tracking-[0.08em] transition-colors duration-200 ${
                group === name
                  ? 'border-jet-red bg-jet-red text-white'
                  : 'border-steel-light bg-white text-charcoal-2 hover:border-jet-red hover:text-jet-red'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {players.length === 0 ? (
          <p className="border border-dashed border-steel-light p-8 text-center text-sm text-charcoal-2/70">
            No players match this group yet. Positions come from{' '}
            <code className="font-mono text-xs">positions</code> in{' '}
            <code className="font-mono text-xs">src/data/roster.js</code>.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
