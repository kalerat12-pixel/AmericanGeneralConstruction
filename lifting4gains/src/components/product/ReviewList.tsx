import type { Review } from "@/lib/types";
import { Stars } from "@/components/ui/Stars";

export function ReviewList({
  reviews,
  summary,
}: {
  reviews: Review[];
  summary: { average: number; count: number; distribution: Record<number, number> };
}) {
  if (!reviews.length) {
    return (
      <p className="text-sm text-ash">
        No reviews yet. If you&rsquo;ve tried this one,{" "}
        <a href="/contact" className="link-slide text-bone">
          tell us what you thought
        </a>
        .
      </p>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="font-display text-6xl font-extrabold tracking-[-0.045em]">
          {summary.average.toFixed(1)}
        </p>
        <Stars rating={summary.average} size={16} className="mt-3" />
        <p className="mt-3 text-sm text-ash">
          {summary.count} verified {summary.count === 1 ? "review" : "reviews"}
        </p>

        <ul className="mt-7 space-y-2.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const n = summary.distribution[star] ?? 0;
            const pct = summary.count ? (n / summary.count) * 100 : 0;
            return (
              <li key={star} className="flex items-center gap-3 text-xs text-ash">
                <span className="type-mono w-4 shrink-0">{star}</span>
                <span className="h-1.5 flex-1 bg-line" aria-hidden="true">
                  <span className="block h-full bg-ember" style={{ width: `${pct}%` }} />
                </span>
                <span className="type-mono w-5 shrink-0 text-right">{n}</span>
                <span className="sr-only">
                  {n} {n === 1 ? "review" : "reviews"} at {star} stars
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <ul className="space-y-px">
        {reviews.map((review) => (
          <li key={review.id} className="border-t border-line py-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Stars rating={review.rating} />
              <span className="type-mono text-xs text-ash-dim">
                <time dateTime={review.createdAt}>
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </span>
            </div>

            <h3 className="mt-3.5 font-display text-lg font-bold uppercase tracking-[-0.02em]">
              {review.title}
            </h3>
            <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-ash">{review.body}</p>

            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ash-dim">
              <span className="text-bone">{review.author}</span>
              <span aria-hidden="true">&middot;</span>
              <span>{review.context}</span>
              {review.verifiedPurchase && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span className="text-ember">Verified purchase</span>
                </>
              )}
              <span aria-hidden="true">&middot;</span>
              <span>{review.helpfulCount} found this helpful</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
