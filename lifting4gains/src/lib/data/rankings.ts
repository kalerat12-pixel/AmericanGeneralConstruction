import type { RankingEntry } from "@/lib/types";

/**
 * The rankings page. This is the shareable, opinionated, SEO-bearing page —
 * every entry gets a verdict AND a knock, because a ranking where everything
 * is great is an ad, not a ranking.
 */

export const rankingsMeta = {
  title: "Every Ghost Energy flavor, ranked",
  updated: "2026-09-01",
  author: "Marcus, Lifting4Gains",
  standfirst:
    "Sixteen flavors, ranked by people who drink them in a gym rather than at a desk. We buy every can we rank. Nobody pays for placement here and nobody can.",
  method: [
    "Every flavor was drunk cold, in a gym, during actual training — not sipped at a tasting table.",
    "Each one got at least three separate sessions before it was placed. First-sip opinions are worthless.",
    "We weight 'can you finish a whole can at rep ten' higher than 'does it taste interesting at sip one'.",
    "Caffeine is 200 mg across the entire energy line, so it plays no part in the ranking. This is flavor only.",
  ],
};

export const rankings: RankingEntry[] = [
  {
    rank: 1,
    flavorSlug: "citrus",
    tier: "S",
    verdict:
      "Wins on the only metric that matters long term: you can drink it every single day for a month and not get sick of it. Dry, grapefruit-forward, almost bitter at the back — it's the only can here that behaves like a grown-up drink rather than a flavor demo.",
    knock: "Boring on first sip. Nobody's ever shouted about it in a comment section.",
  },
  {
    rank: 2,
    flavorSlug: "warheads-sour-watermelon",
    tier: "S",
    verdict:
      "The flavor that made Ghost a gym staple. The sour lands hard and then clears, so you get the hit without the chalky aftertaste that ruins most sour cans by the halfway point. It's the safest recommendation in the entire lineup.",
    knock: "It's everywhere, which means it's also the one you burn out on fastest.",
  },
  {
    rank: 3,
    flavorSlug: "sonic-cherry-limeade",
    tier: "S",
    verdict:
      "The lime is what saves it. Cherry energy drinks almost always slide into cough syrup and this one never gets close. Hand this to someone who says they hate energy drinks and watch them change their mind.",
    knock: "Lighter body means it disappears fast if you're actually thirsty.",
  },
  {
    rank: 4,
    flavorSlug: "sour-patch-kids-redberry",
    tier: "A",
    verdict:
      "The most accurate candy translation anyone has managed in a can. Mixed red berry, gentle sour, no chemical aftertaste to speak of. It's the best gateway flavor we sell and it earns its shelf space.",
    knock: "Sweet enough that a second can in one day is pushing it.",
  },
  {
    rank: 5,
    flavorSlug: "sonic-ocean-water",
    tier: "A",
    verdict:
      "Coconut and blue citrus, light on its feet, and the easiest can here to drink across a long session. The internet sleeps on it. Our reorder data does not — it sits top five every single month.",
    knock: "Too mild if you're using the can as a wake-up rather than a drink.",
  },
  {
    rank: 6,
    flavorSlug: "warheads-sour-green-apple",
    tier: "A",
    verdict:
      "The sharpest, driest can in the range. Green apple skin rather than green apple candy, and the most genuinely refreshing thing here on a hot day.",
    knock: "Punishing if it warms up. Lukewarm, it's the worst can in the lineup.",
  },
  {
    rank: 7,
    flavorSlug: "lemon-lime",
    tier: "A",
    verdict:
      "The utility player. It's not going to be anyone's favorite, but it's the only can that layers cleanly over a flavored pre-workout without the two of them fighting. Stackers should keep a few around.",
    knock: "Genuinely plain. You are buying a function, not a flavor.",
  },
  {
    rank: 8,
    flavorSlug: "tropical-mango",
    tier: "A",
    verdict:
      "Ripe mango with enough acid to stay upright. It's the best of the non-sour fruit cans and the right pick if the Warheads line feels like too much first thing in the morning.",
    knock: "Rounds off a bit flat by the bottom of the can.",
  },
  {
    rank: 9,
    flavorSlug: "warheads-sour-black-cherry",
    tier: "B",
    verdict:
      "Sour sits underneath the fruit instead of on top, which makes it read like a cherry soda with an edge. Comment sections hate it, repeat customers quietly keep buying it.",
    knock: "Doesn't commit. Not sour enough for the sour crowd, not sweet enough for the candy crowd.",
  },
  {
    rank: 10,
    flavorSlug: "swedish-fish",
    tier: "B",
    verdict:
      "The most impressive piece of flavor engineering in the range. That specific lingonberry-raspberry thing survives carbonation intact. It has no business working and it works.",
    knock: "Novelty wears off around can four. Nobody's daily driver.",
  },
  {
    rank: 11,
    flavorSlug: "orange-cream",
    tier: "B",
    verdict:
      "A creamsicle that doesn't curdle the illusion when carbonated, with the vanilla dialled back far enough to stay drinkable. Excellent cold.",
    knock: "The heaviest body here. Sits badly if you're doing anything with your lungs.",
  },
  {
    rank: 12,
    flavorSlug: "sour-patch-kids-blue-raspberry",
    tier: "B",
    verdict:
      "Blue raspberry, done competently, with no ambitions beyond that. Easy to drink and easy to forget.",
    knock: "The Redberry does the same job with more going on. Little reason to pick this over it.",
  },
  {
    rank: 13,
    flavorSlug: "welchs-grape",
    tier: "B",
    verdict:
      "Real grape juice energy that dodges the medicinal grape trap almost completely. A genuine house-divided flavor — and it's always the first one gone from a variety pack.",
    knock: "One sip decides it for you forever. There's no growing into this one.",
  },
  {
    rank: 14,
    flavorSlug: "faze-pop",
    tier: "C",
    verdict:
      "A blue freezer-pop built for a gaming audience, and you can taste the brief. It's fine. It works on a rack, it just wasn't designed for one.",
    knock: "Sweet and slow-drinking, which is the opposite of what you want mid-session.",
  },
  {
    rank: 15,
    flavorSlug: "bubblicious-cotton-candy",
    tier: "C",
    verdict:
      "Total commitment to the concept, and we respect it. A quarter of our customers rate it their number one. There's no middle ground in our review data at all.",
    knock: "The sweetest can Ghost makes. Most people cannot finish one.",
  },
  {
    rank: 16,
    flavorSlug: "bubblicious-original",
    tier: "C",
    verdict:
      "It nails pink bubble gum exactly. Whether that is an achievement or a warning depends entirely on how you feel about drinking gum.",
    knock: "Great for half a can. The second half is a chore for almost everyone.",
  },
];

export const tierCopy: Record<string, { label: string; blurb: string }> = {
  S: { label: "S — buy the case", blurb: "Repeatable. You will not get bored of these." },
  A: { label: "A — always in the fridge", blurb: "Excellent, with a specific job to do." },
  B: { label: "B — worth a four-pack", blurb: "Good cans with a real caveat attached." },
  C: { label: "C — variety pack only", blurb: "Try one. Don't commit to twelve." },
};

export const rankingByFlavor = new Map(rankings.map((r) => [r.flavorSlug, r]));
