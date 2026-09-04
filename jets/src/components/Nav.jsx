import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Wordmark } from './JetMark';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/roster', label: 'Roster' },
  { to: '/stats', label: 'Team Stats' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/history', label: 'History' },
  { to: '/highlights', label: 'Highlights' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const linkClass = ({ isActive }) =>
    [
      'athletic relative px-3 py-2 text-sm tracking-[0.08em] transition-colors duration-200',
      isActive ? 'text-white' : 'text-steel-light hover:text-white',
    ].join(' ');

  return (
    <header className="sticky top-0 z-50 border-b-2 border-jet-red bg-ink">
      <div className="absolute inset-0 speed-lines-red" aria-hidden />

      <nav className="shell relative flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="Adams Central Flying Jets — home">
          <Wordmark />
        </Link>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end} className={linkClass}>
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span
                      className={`absolute inset-x-2 bottom-1 h-0.5 -skew-x-12 bg-jet-red transition-transform duration-200 ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="grid size-10 place-items-center border border-slate-edge text-white transition-colors hover:border-jet-red lg:hidden"
        >
          <span className="sr-only">Menu</span>
          <span className="flex flex-col gap-[5px]" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`block h-0.5 w-5 bg-current transition-transform duration-300 ${
                  open && i === 0 ? 'translate-y-[7px] rotate-45' : ''
                } ${open && i === 1 ? 'opacity-0' : ''} ${
                  open && i === 2 ? '-translate-y-[7px] -rotate-45' : ''
                }`}
              />
            ))}
          </span>
        </button>
      </nav>

      {/* Mobile sheet */}
      <div
        className={`relative overflow-hidden border-t border-slate-edge bg-ink transition-[max-height,opacity] duration-300 lg:hidden ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="shell flex flex-col py-2">
          {LINKS.map((link) => (
            <li key={link.to} className="border-b border-charcoal-2 last:border-0">
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `athletic block py-3.5 text-base tracking-[0.08em] ${
                    isActive ? 'text-jet-red-bright' : 'text-steel-light'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
