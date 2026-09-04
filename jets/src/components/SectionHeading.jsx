export default function SectionHeading({ eyebrow, title, children, tone = 'dark' }) {
  const eyebrowColor = tone === 'light' ? 'text-jet-red-bright' : 'text-jet-red';
  const titleColor = tone === 'light' ? 'text-white' : 'text-ink';
  const bodyColor = tone === 'light' ? 'text-steel-light' : 'text-charcoal-2/80';

  return (
    <header className="mb-7 md:mb-10">
      {eyebrow && <p className={`eyebrow mb-2 ${eyebrowColor}`}>{eyebrow}</p>}
      <h2 className={`text-3xl sm:text-4xl md:text-5xl ${titleColor}`}>{title}</h2>
      <span className="jet-rule mt-3" />
      {children && (
        <p className={`mt-4 max-w-2xl text-[0.95rem] leading-relaxed ${bodyColor}`}>
          {children}
        </p>
      )}
    </header>
  );
}
