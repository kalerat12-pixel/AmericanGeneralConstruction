import { toEmbedUrl } from '../data/highlights';

/**
 * A highlight slot. With a URL it becomes a real iframe; without one it renders
 * an intentional empty state naming exactly where to paste the link.
 */
export default function VideoEmbed({ url, title, hint, className = '' }) {
  const embed = toEmbedUrl(url);

  if (embed) {
    return (
      <div className={`relative aspect-video w-full overflow-hidden bg-ink ${className}`}>
        <iframe
          src={embed}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex aspect-video w-full flex-col items-center justify-center gap-2 border border-dashed border-slate-edge bg-charcoal px-4 text-center ${className}`}
    >
      <div className="absolute inset-0 speed-lines" aria-hidden />
      <span className="relative grid size-11 place-items-center rounded-full bg-jet-red/15 ring-1 ring-jet-red/40">
        <svg viewBox="0 0 24 24" className="size-4 fill-jet-red-bright" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <p className="relative athletic text-sm text-steel-light">No video yet</p>
      {hint && (
        <p className="relative max-w-[22rem] text-[0.72rem] leading-snug text-steel">
          {hint}
        </p>
      )}
    </div>
  );
}
