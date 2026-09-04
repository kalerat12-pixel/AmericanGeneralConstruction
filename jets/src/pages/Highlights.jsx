import { Link } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import VideoEmbed from '../components/VideoEmbed';
import { highlights } from '../data/highlights';
import { getPlayer, fullName } from '../data/roster';

const KIND_LABEL = { game: 'Game', player: 'Player', season: 'Season' };

function formatDate(date) {
  if (!date) return null;
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Highlights() {
  const withVideo = highlights.filter((h) => h.url).length;

  return (
    <>
      <section className="cut-bottom bg-charcoal pt-12 pb-16 text-white">
        <div className="shell">
          <SectionHeading eyebrow="Film Room" title="Highlights" tone="light">
            Team and individual reels. Empty slots are waiting on a link — paste a
            YouTube or Hudl URL into{' '}
            <code className="font-mono text-sm">src/data/highlights.js</code> and
            the tile becomes a player.
          </SectionHeading>
        </div>
      </section>

      <section className="shell relative z-10 pt-10 pb-20">
        <p className="mb-6 athletic text-sm tracking-[0.14em] text-charcoal-2/70">
          {withVideo} of {highlights.length} slots filled
        </p>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {highlights.map((item) => {
            const player = item.playerId ? getPlayer(item.playerId) : null;
            return (
              <article key={item.id} className="border border-steel-light bg-white">
                <VideoEmbed
                  url={item.url}
                  title={item.title}
                  hint={`Set url on "${item.id}" in src/data/highlights.js.`}
                />

                <div className="p-4">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="athletic bg-jet-red px-1.5 py-0.5 text-[0.62rem] tracking-[0.12em] text-white">
                      {KIND_LABEL[item.kind] ?? 'Clip'}
                    </span>
                    {formatDate(item.date) && (
                      <span className="text-[0.7rem] text-charcoal-2/60">
                        {formatDate(item.date)}
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg leading-tight text-ink">{item.title}</h2>

                  {item.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-charcoal-2/80">
                      {item.description}
                    </p>
                  )}

                  {player && (
                    <Link
                      to={`/roster/${player.id}`}
                      className="athletic mt-3 inline-block text-xs tracking-[0.12em] text-jet-red hover:underline"
                    >
                      {fullName(player)} →
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
