import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="shell py-24 text-center">
      <p className="eyebrow text-jet-red">404</p>
      <h1 className="mt-2 text-5xl text-ink">Off the field</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-charcoal-2/70">
        That page does not exist. Head back to the sideline.
      </p>
      <Link
        to="/"
        className="athletic mt-7 inline-block bg-jet-red px-7 py-3 text-sm tracking-[0.12em] text-white transition-colors hover:bg-jet-red-dark"
      >
        Back to home
      </Link>
    </section>
  );
}
