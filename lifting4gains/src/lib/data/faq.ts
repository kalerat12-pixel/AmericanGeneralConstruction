export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    title: "The drinks",
    items: [
      {
        q: "How much caffeine is in a Ghost Energy?",
        a: "200mg per 16 fl oz can, across every flavor in the energy line — roughly two cups of coffee. The Hydration line has none at all. Health authorities generally suggest healthy adults stay under 400mg a day, so two cans is a sensible ceiling and you should count anything else you've had.",
      },
      {
        q: "Can I stack one with pre-workout?",
        a: "Plenty of people do, but read your pre-workout label first. A full scoop of a strong pre can be 300mg on its own, and a can on top of that puts you over 500mg before you've touched coffee. If you're stacking, most of our crew take a half scoop and a can. Lemon Lime is the flavor that clashes least with a flavored pre.",
      },
      {
        q: "Is there really no sugar?",
        a: "Zero grams across the range, at 10 calories a can. They're sweetened with sucralose. That's why the candy flavors can taste as sweet as they do without the sugar hit.",
      },
      {
        q: "Which flavor should I start with?",
        a: "Sour Patch Kids Redberry if you're not sure you like energy drinks at all, Warheads Sour Watermelon if you know you like sour, and Citrus if you want the one you'll still be drinking in six months. Our rankings page argues all three cases at length.",
      },
      {
        q: "How long do they keep?",
        a: "Check the date on the can — typically well over a year unopened. Store them somewhere cool. The Warheads Sour Green Apple in particular is noticeably worse warm, so if you only have fridge space for a few, make it that one.",
      },
    ],
  },
  {
    title: "Orders and delivery",
    items: [
      {
        q: "How fast do orders ship?",
        a: "Orders placed before 2pm on a working day go out the same day. Most arrive in 2–4 working days. You'll get tracking by email as soon as it leaves us.",
      },
      {
        q: "Is shipping free?",
        a: "Free over $50. Below that it's a flat $6.99. A 12-pack or anything bigger clears the threshold on its own.",
      },
      {
        q: "Can I mix flavors in one pack?",
        a: "That's the whole point of the bundle builder. Pick any flavors in any quantities and the per-can price drops as the pack grows — from $3.49 down to $2.71 at 24 cans.",
      },
      {
        q: "Something arrived damaged.",
        a: "Send us a photo and we'll replace it or refund it, your choice. No forms, no returns label for a dented can — we're not going to make you post it back.",
      },
    ],
  },
  {
    title: "Subscriptions",
    items: [
      {
        q: "How does subscribe and save work?",
        a: "Tick the box on any product or at checkout and you take 15% off that item, delivered every four weeks. The discount applies for as long as the subscription runs.",
      },
      {
        q: "How do I cancel?",
        a: "There's a link at the bottom of every subscription receipt. One click to skip, pause, change flavors or cancel outright. No phone call and no retention flow.",
      },
      {
        q: "Can I change flavors between deliveries?",
        a: "Yes, up to 48 hours before your next dispatch. Most subscribers rotate every couple of months, which is exactly what we'd recommend.",
      },
    ],
  },
  {
    title: "This shop",
    items: [
      {
        q: "Are you affiliated with Ghost?",
        a: "No. We're an independent retailer with no partnership, sponsorship or endorsement from Ghost Lifestyle or any of their collaborators. GHOST® is a registered trademark of its owner. We stock their drinks because we think they're the best zero-sugar cans for training.",
      },
      {
        q: "Do brands pay for their ranking?",
        a: "No, and nobody can. Two of the flavors we sell sit in our bottom tier with the reasons written out. If we ever take money for placement anywhere on this site, it'll be labelled on that page in the same size text as everything else.",
      },
      {
        q: "Why is the product photography a placeholder?",
        a: "Because it's ours to make and not ours to take. We don't reproduce or hotlink Ghost's product photography, so every can image here is a clearly-labelled placeholder until we've shot the real thing ourselves.",
      },
      {
        q: "Do you sell to gyms?",
        a: "Yes — case pricing from five cases, down to $1.89 a can at fifty. Every partner gym also gets a referral code that gives their members 10% off and credits the gym 5%. It's all on the gym partners page, prices included.",
      },
    ],
  },
];
