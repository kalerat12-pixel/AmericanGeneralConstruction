import { Link } from 'react-router-dom';
import { team, siteDisclaimer } from '../data/team';
import { Wordmark } from './JetMark';

export default function Footer() {
  return (
    <footer className="relative mt-auto bg-ink pt-14 pb-8 text-steel-light">
      <div className="absolute inset-0 speed-lines" aria-hidden />

      <div className="shell relative">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark className="mb-4" />
            <p className="text-sm leading-relaxed text-steel">
              {team.venue.name} — &ldquo;{team.venue.nickname}&rdquo;
              <br />
              {team.conferenceAbbr} · Monroe, Indiana
            </p>
          </div>

          <div>
            <h3 className="eyebrow mb-3 text-jet-red-bright">The School</h3>
            <address className="text-sm leading-relaxed text-steel not-italic">
              {team.school}
              <br />
              222 W Washington St
              <br />
              Monroe, IN 46772
            </address>
          </div>

          <div>
            <h3 className="eyebrow mb-3 text-jet-red-bright">Sections</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                ['/roster', 'Roster'],
                ['/stats', 'Team Stats'],
                ['/schedule', 'Schedule & Results'],
                ['/history', 'History'],
                ['/highlights', 'Highlights'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-steel transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow mb-3 text-jet-red-bright">Elsewhere</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {team.links.athletics && (
                <li>
                  <a
                    href={team.links.athletics}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-steel transition-colors hover:text-white"
                  >
                    Adams Central Athletics
                  </a>
                </li>
              )}
              {team.links.maxpreps && (
                <li>
                  <a
                    href={team.links.maxpreps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-steel transition-colors hover:text-white"
                  >
                    MaxPreps
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-charcoal-2 pt-6">
          <p className="max-w-3xl text-xs leading-relaxed text-steel">
            {siteDisclaimer}
          </p>
          <p className="mt-3 athletic text-[0.7rem] tracking-[0.16em] text-steel/70">
            © {new Date().getFullYear()} — Fan-run Jets site
          </p>
        </div>
      </div>
    </footer>
  );
}
