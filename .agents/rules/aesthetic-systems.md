---
trigger: model_decision
description: When working on a redesign
---

# Aesthetic Systems — Archetypes + the Design-System Library

Taste is not one look — it is the ability to choose the *right* look for the brief and execute it with conviction. This file gives you two layers:

1. **Archetypes** — a small set of reusable aesthetic directions, each mapped to our token system. Use these to reason about *what kind* of design fits.
2. **The Library** — 138 concrete, named design-system specs in `design-systems/library/`. Use these when the brief points at a specific vibe (or a specific brand reference).

> Taste serves the **Aesthetics** tier of the Decision Framework. An archetype or library system may set the *visual direction* but must still pass every Accessibility, Consistency, and token rule. See [`taste/design-taste.md`](./design-taste.md) for the anti-slop doctrine and [`taste/motion-choreography.md`](./motion-choreography.md) for motion.

---
## How to Use This File

1. **Read the brief.** Infer audience, domain, and emotional tone. Don't apply a direction the brief didn't ask for.
2. **Pick a direction** — either an Archetype (below) or a named system from the Library catalog.
3. **Resolve to tokens.** Translate the chosen direction's color/type/space/radius/shadow/motion into our token files (`tokens/*.json`), overriding semantic tokens where needed (see the contract below).
4. **Render** through the target framework via the [Framework Adapter Protocol](../frameworks/adapter-protocol.md).
5. **Run the pre-flight aesthetic check** in `taste/design-taste.md` before shipping.

---

## The Archetypes

Each archetype is a *recipe*, not a brand. Settings reference our existing tokens.

### 1. High-End Agency (Linear / Apple-tier)
- **When:** premium products, launches, anything that must feel expensive.
- **Type:** large display scale (`6xl`–`7xl`), tight leading, wide measure; one UI sans.
- **Color:** off-black on warm/cool near-white; single restrained accent; calibrated low-chroma.
- **Space:** generous macro-whitespace; asymmetric grids; edge tension.
- **Depth:** hairline borders + subtle layered elevation; shadows rare.
- **Motion:** precise, fast, `ease-out`; scroll-reveals with restraint.
- **Library kin:** `linear-app`, `apple`, `vercel`, `stripe`, `superhuman`, `premium`.

### 2. Editorial Minimalism
- **When:** content, docs, marketing with a literary tone.
- **Type:** serif or refined sans for headings; strict 60–75ch measure; strong scale contrast.
- **Color:** paper/ink neutrals; one ink accent.
- **Space:** column grids, lots of air, baseline rhythm.
- **Depth:** flat; rules and whitespace separate, not boxes.
- **Library kin:** `editorial`, `warm-editorial`, `kami`, `notion`, `modern`, `wired`, `publication`.

### 3. Industrial Brutalism / Tactical
- **When:** data-heavy dashboards, dev tools, declassified-blueprint vibe.
- **Type:** monospace or grotesque; extreme scale contrast; mono kickers/labels.
- **Color:** utilitarian (black/white + one signal color); analog textures optional.
- **Space:** rigid modular grids, high density, visible structure.
- **Depth:** hard edges, thick borders, no soft shadows.
- **Library kin:** `brutalism`, `neobrutalism`, `mono`, `warp`, `voltagent`, `theverge`.

### 4. Warm Soft-SaaS
- **When:** friendly consumer/productivity apps, onboarding-heavy products.
- **Type:** rounded humanist sans; medium scale contrast.
- **Color:** warm neutrals + a friendly accent; soft pastels as support.
- **Space:** comfortable padding, soft radii (`radius.lg`+), bento grids.
- **Depth:** soft shadows allowed, chunky tactile elements optional.
- **Library kin:** `duolingo`, `lingo`, `friendly`, `intercom`, `zapier`, `xiaohongshu`.

### 5. Dark-Tech / Cinematic
- **When:** AI, crypto, gaming, infra — high-drama dark surfaces.
- **Type:** tight sans or mono; bright type on dark.
- **Color:** void-black surfaces, neon/gradient accents, desaturated supporting hues.
- **Space:** full-bleed media, dramatic hero scale.
- **Depth:** glow, gradient, glass — used once each, never stacked.
- **Library kin:** `elevenlabs`, `runwayml`, `cursor`, `revolut`, `spacex`, `cosmic`, `shopify`.

### 6. Morphism & Effects
- **When:** a specific tactile gimmick is the point.
- **Use the matching library spec directly** rather than improvising: `glassmorphism`, `claymorphism`, `neumorphism`, `skeumorphism`, `gradient`, `neon`. These are effect-forward and carry strict execution rules in their `DESIGN.md`.

---

## Library Contract — mapping a `DESIGN.md` to our tokens

Every library spec follows the same shape: **Visual Theme → Color Palette & Roles → Typography → Spacing → Components → Motion**. To apply one:

| `DESIGN.md` section | Maps to |
|---------------------|---------|
| Color Palette & Roles (hex + role) | Override `semantic.*` in `tokens/colors.json` (primitives stay; re-point semantic aliases). Verify every pair against `accessibility/wcag-checklist.md` contrast — **a brand hex that fails contrast must be adjusted**. |
| Typography Rules (family, scale, weight) | Set families/scale in `tokens/typography.json`; keep our composite `textStyle` structure. |
| Spacing / layout | Map to `tokens/spacing.json` scale + `tokens/breakpoints.json` grid. |
| Radius / geometry | `tokens/borders.json`. |
| Elevation / shadow / effects | `tokens/shadows.json`, plus `tokens/blur.json` / `tokens/gradients.json` for morphism systems. |
| Motion | `tokens/motion.json` + `taste/motion-choreography.md`. |
| Components | Render via component specs in `components/` through the framework adapter. |

> **Non-negotiable:** library specs describe brand aesthetics, not accessibility. After applying one, re-run contrast, focus-visible, target-size, and reduced-motion checks. Taste never overrides POUR.

---

## The Library Catalog

There are **138 named design systems** in `design-systems/library/`. Each is a complete `DESIGN.md` spec (visual theme, color roles + hex, typography, spacing, components, motion). Load the one that matches the brief, then translate its values through the [Framework Adapter Protocol](../frameworks/adapter-protocol.md).


### AI & LLM (14)

- [`claude`](../design-systems/library/claude/DESIGN.md) — Anthropic's AI assistant. Warm terracotta accent, clean editorial layout.
- [`cohere`](../design-systems/library/cohere/DESIGN.md) — Enterprise AI platform. Vibrant gradients, data-rich dashboard aesthetic.
- [`elevenlabs`](../design-systems/library/elevenlabs/DESIGN.md) — AI voice platform. Dark cinematic UI, audio-waveform aesthetics.
- [`huggingface`](../design-systems/library/huggingface/DESIGN.md) — ML community hub. Sunny yellow accent, monospace identity, cheerful and dense.
- [`minimax`](../design-systems/library/minimax/DESIGN.md) — AI model provider. Bold dark interface with neon accents.
- [`mistral-ai`](../design-systems/library/mistral-ai/DESIGN.md) — Open-weight LLM provider. French-engineered minimalism, purple-toned.
- [`ollama`](../design-systems/library/ollama/DESIGN.md) — Run LLMs locally. Terminal-first, monochrome simplicity.
- [`openai`](../design-systems/library/openai/DESIGN.md) — Calm, near-monochrome system anchored in deep teal-black with generous white space and editorial typography.
- [`opencode-ai`](../design-systems/library/opencode-ai/DESIGN.md) — AI coding platform. Developer-centric dark theme.
- [`replicate`](../design-systems/library/replicate/DESIGN.md) — Run ML models via API. Clean white canvas, code-forward.
- [`runwayml`](../design-systems/library/runwayml/DESIGN.md) — AI video generation. Cinematic dark UI, media-rich layout.
- [`together-ai`](../design-systems/library/together-ai/DESIGN.md) — Open-source AI infrastructure. Technical, blueprint-style design.
- [`voltagent`](../design-systems/library/voltagent/DESIGN.md) — AI agent framework. Void-black canvas, emerald accent, terminal-native.
- [`x-ai`](../design-systems/library/x-ai/DESIGN.md) — Elon Musk's AI lab. Stark monochrome, futuristic minimalism.

### Automotive (6)

- [`bmw`](../design-systems/library/bmw/DESIGN.md) — Luxury automotive. Dark premium surfaces, precise German engineering aesthetic.
- [`bugatti`](../design-systems/library/bugatti/DESIGN.md) — Hypercar brand. Cinema-black canvas, monochrome austerity, monumental display type.
- [`ferrari`](../design-systems/library/ferrari/DESIGN.md) — Luxury automotive. Chiaroscuro editorial, Ferrari Red accents, cinematic black.
- [`lamborghini`](../design-systems/library/lamborghini/DESIGN.md) — Supercar brand. True black surfaces, gold accents, dramatic uppercase typography.
- [`renault`](../design-systems/library/renault/DESIGN.md) — French automotive. Vibrant aurora gradients, NouvelR typography, bold energy.
- [`tesla`](../design-systems/library/tesla/DESIGN.md) — Electric automotive. Radical subtraction, full-viewport photography, near-zero UI.

### Backend & Data (8)

- [`clickhouse`](../design-systems/library/clickhouse/DESIGN.md) — Fast analytics database. Yellow-accented, technical documentation style.
- [`composio`](../design-systems/library/composio/DESIGN.md) — Tool integration platform. Modern dark with colorful integration icons.
- [`hashicorp`](../design-systems/library/hashicorp/DESIGN.md) — Infrastructure automation. Enterprise-clean, black and white.
- [`mongodb`](../design-systems/library/mongodb/DESIGN.md) — Document database. Green leaf branding, developer documentation focus.
- [`posthog`](../design-systems/library/posthog/DESIGN.md) — Product analytics. Playful hedgehog branding, developer-friendly dark UI.
- [`sanity`](../design-systems/library/sanity/DESIGN.md) — Headless CMS. Red accent, content-first editorial layout.
- [`sentry`](../design-systems/library/sentry/DESIGN.md) — Error monitoring. Dark dashboard, data-dense, pink-purple accent.
- [`supabase`](../design-systems/library/supabase/DESIGN.md) — Open-source Firebase alternative. Dark emerald theme, code-first.

### Bold & Expressive (8)

- [`bold`](../design-systems/library/bold/DESIGN.md) — Strong visual presence with heavyweight typography, high-contrast colors, and commanding layouts.
- [`brutalism`](../design-systems/library/brutalism/DESIGN.md) — Raw, anti-design aesthetic inspired by concrete architecture with unadorned elements, jarring layouts, and functional minimalism.
- [`colorful`](../design-systems/library/colorful/DESIGN.md) — Vibrant, high-contrast palettes and gradients for engaging, memorable, and modern user experiences.
- [`dramatic`](../design-systems/library/dramatic/DESIGN.md) — High-contrast, theatrical design with bold layouts, immersive visuals, and unconventional compositions that command attention.
- [`energetic`](../design-systems/library/energetic/DESIGN.md) — Dynamic, vibrant style with thick borders, geometric shapes, high-contrast colors, and expressive typography conveying motion and vitality.
- [`expressive`](../design-systems/library/expressive/DESIGN.md) — Vibrant, personality-driven design with bold colors, playful graphics, and dynamic layouts that balance creativity with structure.
- [`neobrutalism`](../design-systems/library/neobrutalism/DESIGN.md) — Modern take on brutalism with bold borders, vivid accent colors, and raw, high-contrast layouts on warm surfaces.
- [`vibrant`](../design-systems/library/vibrant/DESIGN.md) — Lively, colorful design with bold playful typography, warm accents, and dynamic visual energy.

### Creative & Artistic (11)

- [`artistic`](../design-systems/library/artistic/DESIGN.md) — High-contrast, expressive style with creative typography and bold color choices for visually striking interfaces.
- [`cafe`](../design-systems/library/cafe/DESIGN.md) — Cozy cafe-inspired interface with warm tones, soft typography, and clean layouts for a relaxed browsing experience.
- [`cosmic`](../design-systems/library/cosmic/DESIGN.md) — Futuristic sci-fi aesthetic with dark themes, vibrant neon accents, and immersive spatial elements.
- [`creative`](../design-systems/library/creative/DESIGN.md) — Playful, character-driven design with expressi