# Editorial artwork

The five `.svg` files here are **generated placeholders**, not photography.
They're authored by `scripts/generate-art.ts` as duotone gym silhouettes with
film grain, desaturated to sit inside the site palette.

They exist because this build had no licensed photo source available, and we
will not hotlink or fabricate anyone else's photography.

## Replacing them with real photography

`EditorialImage` takes an `ext` prop. Drop a real file in next to the SVG and
pass `ext="jpg"` at the call site — nothing else changes.

| Slot | Used on | Shot to brief |
|---|---|---|
| `bar-loaded` | Home hero, About hero | Loaded barbell on a platform, shot low and close. Chalk on the knurl. Single hard key light from one side, deep shadow everywhere else. |
| `plates-stacked` | Home "why this exists", PDP context | Bumper plates stacked or leaning, shot face-on. Strong circles, tight crop. |
| `rack-uprights` | Home bundle CTA, Gym partners hero | Power rack uprights receding into low light. Vertical rhythm, bar racked in the j-hooks. |
| `chalk-dust` | Rankings masthead | Chalk bowl or airborne chalk catching a light beam. Almost abstract. |
| `strip-dark` | Home community band | Wide, low-contrast texture that works as a 4:1 letterbox strip behind type. |

**Direction for all of them:** high contrast, real gym environments, low light,
slightly desaturated. No lens flare, no colour grading toward teal/orange, no
smiling stock models. `EditorialImage` applies `saturate(0.72) contrast(1.06)`
so real photos won't fight the palette.

Export at 1920px wide or better, as `.jpg` (or `.webp`), under ~300KB each.

## Product imagery

Can images in `/public/cans` are the same deal — generated, clearly labelled
`PLACEHOLDER`, no Ghost trade dress. Replace per flavor with
`public/cans/<slug>.jpg` and pass `ext="jpg"` to `CanImage`.
