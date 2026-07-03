---
name: lz-visual-forge
description: >
  Programmatic visual content generator for social media graphics, carousels,
  covers, YouTube thumbnails, and pitch deck presentation slides from JSX code.
  Converts JSX elements to high-quality SVG and PNG images via Vercel Satori
  and Resvg. Implements professional design guidelines, typography styling,
  color contrast rules, and spatial layout grids. Use when asked to "design
  graphics", "generate carousel images", "create thumbnail", "render slides
  from code", "make visual card", "satori rendering", or "stunning visuals
  from JSX".
license: MIT
metadata:
  version: 1.0.0
  platforms: [instagram, linkedin, twitter-x, youtube]
  technologies: [satori, resvg-js, pdf-lib, react-jsx]
---

# lz-visual-forge — Programmatic Visual Generation

A specialized layout, typography, and rendering engine that produces pixel-perfect visual assets directly from code (JSX → Satori → PNG). This guarantees brand consistency, color accuracy, and crisp typography rendering, avoiding the unpredictability and text-rendering failures of diffusion models.

## When to Use

- Generating multi-slide carousels (Instagram, LinkedIn) → **Carousel workflow**
- Rendering post cover images (Twitter, Instagram, LinkedIn) → **Cover workflow**
- Creating YouTube video thumbnails → **Thumbnail workflow**
- Building pitch deck presentation slides (16:9 ratio) → **Presentation workflow**
- Translating Figma-like styling instructions or design tokens into code → **Styling workflow**
- Converting rendered PNG slides into high-fidelity PDF documents → **PDF assembly workflow**

## Architecture

```
visual-forge/                 ← copied or configured inside the user's project
├── render.js                 ← Node.js CLI script wrapper
├── components/               ← React JSX visual templates
│   ├── carousel-slide.jsx    ← Instagram & LinkedIn vertical carousels
│   ├── social-cover.jsx      ← Multi-platform cover cards (Twitter, IG, LinkedIn)
│   ├── youtube-thumbnail.jsx ← High-impact video thumbnail cards (16:9)
│   └── presentation-slide.jsx← Pitch deck / presentation slide layout (16:9)
└── assets/
    ├── fonts/                ← TTF/OTF brand files for typography rendering
    ├── backgrounds/          ← Texture backgrounds or diffusion assets
    └── rendered/             ← Output location for PNGs and PDFs
```

## Workflows

### Workflow 1: Setup & Initialization

Run this workflow once when setting up the visual pipeline in a project:

1. **Scan requirements:** Identify the brand fonts and dimensions from the project's `DESIGN-SYSTEM.md`.
2. **Install core packages:**
   ```bash
   npm install satori @resvg/resvg-js pdf-lib
   ```
3. **Copy assets:** Copy `./assets/render-to-image.js` to `content-engine/render.js`, and JSX components to `content-engine/components/`.
4. **Fetch brand fonts:** Download required TTF files from Google Fonts or local assets and save to `content-engine/assets/fonts/`.
5. **Verify setup:** Run a dry-run check rendering a test slide.

### Workflow 2: Programmatic Generation

Run this workflow to render assets based on content/copy inputs:

1. **Load design tokens:** Read colors, font pairings, margins, and styling signatures.
2. **Write JSX components:** Map content blocks (headlines, bullets, metadata) to React-style elements, using one of the base components:
   - Carousel Slide: `./assets/carousel-slide.jsx`
   - Social Cover: `./assets/social-cover.jsx`
   - YouTube Thumbnail: `./assets/youtube-thumbnail.jsx`
   - Presentation Slide: `./assets/presentation-slide.jsx`
3. **Hybrid asset check:** If the layout requires a complex photographic element (hero photo, textured background), generate it with a diffusion model, save it, and load it into Satori's background-image parameter.
4. **Compile & Run:** Call the render script (`render.js`) to generate pixel-perfect PNGs at target dimensions:
   - Instagram/LinkedIn Carousel: 1080x1350
   - LinkedIn Link Preview: 1200x627
   - Twitter/X Card: 1600x900
   - YouTube Thumbnail: 1280x720
   - Presentation Slide: 1920x1080
5. **Assembly:** For multi-page PDF generation (LinkedIn documents), combine individual PNG slides using `pdf-lib`.

---

## Reference Index

| Reference | What it contains |
|---|---|
| `./references/design-principles.md` | Spacing, alignment, haptic aesthetics, and macro-whitespace guidelines |
| `./references/satori-mastery.md` | CSS engine limitations, Flexbox layout, font loading, and SVG rendering |
| `./references/typography-system.md` | Type scales, font pairing metrics, letter-spacing, and line-heights |
| `./references/color-system.md` | Contrast checks, gradient specifications, color-mapping theory (60-30-10) |
| `./references/composition-grid.md` | Dimensions, padding grids, safe zones, and aspect ratio profiles |
| `./references/anti-patterns.md` | Critical visual slop identifiers and programmatic mitigation techniques |

## Asset Index

| Asset | What it contains |
|---|---|
| `./assets/render-setup.md` | Detailed pipeline installation, font gathering, and run guide |
| `./assets/carousel-slide.jsx` | Satori JSX template for multi-page social carousels |
| `./assets/social-cover.jsx` | Multi-platform cover image JSX component with layout overrides |
| `./assets/youtube-thumbnail.jsx` | High-readability YouTube thumbnail layout with title scales |
| `./assets/presentation-slide.jsx` | Standard 16:9 pitch deck presentation slide template |
| `./assets/render-to-image.js` | Rendering Node.js script (JSX → SVG via Satori → PNG via Resvg → PDF) |

## Hard Rules

1. **Text belongs in code.** Never render text labels, body copy, titles, or page numbers via diffusion models. Text rendering must always be handled programmatically.
2. **Strict Satori compliance.** Never write unsupported properties (like grid, filter, calc) inside JSX components. Keep inside the Yoga flexbox subset (see `./references/satori-mastery.md`).
3. **No raw uncalibrated hex colors.** Colors must align strictly with the contrast ratios and palettes defined in `DESIGN-SYSTEM.md` or `./references/color-system.md`.
4. **Double-Bezel Card nesting.** Cards and blocks containing high-density information must employ concentric inner-outer borders (`border` + `shadow`) to create physical depth.
5. **Fonts are loaded explicitly.** Never reference system fonts. TTF/OTF files must be loaded as ArrayBuffers prior to calling Satori.
6. **No aspect ratio stretching.** Images placed inside JSX must use correct height/width aspect ratios and `objectFit: "cover"` or `"contain"` to avoid distortion.
7. **Ensure mobile legibility.** Titles and focal words on social covers or carousels must utilize large type scales (minimum 48px to 72px) to remain readable on small screens.
