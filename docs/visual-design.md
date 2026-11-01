# Version 3 visual design

## Direction

A warm editorial learning journal for an adult learner. Keep the established calm feel and introduce meaningful pictures, a clearer dashboard hierarchy and a consistent outline icon set. English learning remains the primary action.

The illustration atlas contains three scenes: café conversation, colleagues discussing a project, and a traveller in a coastal town. CSS crops the relevant panel for each learning goal. One compressed asset serves the dashboard, topic cards, plan, vocabulary, journal and lesson companion. Text is HTML rather than baked into pictures.

## Artwork provenance

Generated with the built-in image-generation tool, then encoded as WebP for the application. Shipped asset: `public/assets/learning-worlds.webp` (291,152 bytes). The uncompressed PNG remains in the working source assets but is not needed or shipped in production.

Generation prompt:

> Create a wide editorial illustration asset for a sophisticated personal English learning app. One image with THREE equally sized side-by-side square panels, a clean triptych, hard vertical boundaries at one third and two thirds. Each scene has its own warm cream backdrop and the same hand-painted paper-cut editorial style, subtle grain, flat shapes with tasteful dimensional shadows, confident curved forms. Panel 1 LEFT: two diverse adults, including an East Asian woman, enjoying a relaxed conversation at an outdoor cafe with a terracotta cup and sage foliage. Panel 2 CENTER: two adults discussing a project across a warm wooden desk, a laptop and coral desk lamp, muted lavender and navy shapes. Panel 3 RIGHT: a person with a small suitcase exploring a sunlit coastal city with pastel buildings and a small plane in the distant sky, soft ocean blue and ochre. Each scene should fill its square panel and remain legible at thumbnail size. Professional calm illustration for adult learners, warm, optimistic, not childish, no lettering, no text, no labels, no numbers, no typography, no logos, no border, no watermark. Overall aspect ratio 3:1. Colors: deep forest green, muted coral, butter yellow, dusty blue, warm ivory.

## Themes

| Setting | Behaviour |
| --- | --- |
| Light | Light surfaces and dark foregrounds |
| Dark | Dark surfaces and lighter accent/foregrounds |
| System | Follows the device’s light/dark setting |
| Forest | Green accents, warm neutral surfaces |
| Ocean | Blue accents, cool neutral surfaces |
| Dusk | Lavender accents, violet neutral surfaces |

Colors come from semantic CSS variables. The early appearance script and appearance module validate preference values before applying them. User-generated writing, progress and vocabulary are not changed by theme switches.
