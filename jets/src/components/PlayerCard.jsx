import { Link } from 'react-router-dom';
import PlayerAvatar from './PlayerAvatar';
import StatusChip from './StatusChip';
import { GRADE_LABELS, formatHeight, fullName } from '../data/roster';

export default function PlayerCard({ player }) {
  const height = formatHeight(player.heightInches);
  const measurables = [height, player.weightLbs ? `${player.weightLbs} lb` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      to={`/roster/${player.id}`}
      className="lift-card group flex flex-col border border-steel-light/70 bg-white hover:border-jet-red"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <PlayerAvatar player={player} />

        {/* Jersey number, cut into the corner */}
        {player.number != null && (
          <span className="absolute top-0 left-0 flex h-11 min-w-11 items-center justify-center bg-jet-red px-2 athletic text-xl text-white">
            {player.number}
          </span>
        )}

        {player.status !== 'verified' && (
          <span className="absolute top-2 right-2">
            <StatusChip status={player.status} />
          </span>
        )}

        {/* Positions band */}
        {player.positions?.length > 0 && (
          <span className="absolute right-0 bottom-0 left-0 bg-ink/85 px-3 py-1.5 athletic text-xs tracking-[0.14em] text-steel-light">
            {player.positions.join(' / ')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-lg leading-tight text-ink transition-colors group-hover:text-jet-red">
          {fullName(player)}
        </h3>
        <p className="mt-1 text-xs text-charcoal-2/70">
          {player.gradeLevel ? GRADE_LABELS[player.gradeLevel] : 'Class TBD'}
          {measurables && ` · ${measurables}`}
        </p>
      </div>
    </Link>
  );
}
