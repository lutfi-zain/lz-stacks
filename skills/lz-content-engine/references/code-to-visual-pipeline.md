# Code-to-Visual Pipeline

A hybrid rendering system that uses **code (JSX → Satori → PNG)** for layout, typography, and branded elements, and **diffusion models** only for photographic backgrounds and textures. This replaces the previous diffusion-only approach that could not reliably render text, enforce exact colors, or maintain slide-to-slide consistency.

## Why Code-Based Rendering

| Requirement | Diffusion Models | Code (Satori) |
|---|---|---|
| Exact hex color palette | ❌ Approximates | ✅ Pixel-perfect |
| Specific font families + sizes | ❌ Unpredictable | ✅ Loads exact TTF/OTF |
| Text positioning + hierarchy | ❌ Text garbles | ✅ Flexbox layout engine |
| Slide-to-slide consistency | ❌ Varies per generation | ✅ Same component, different props |
| Reproducibility | ❌ Different each run | ✅ Deterministic output |
| Brand grid compliance | ❌ Cannot enforce coordinates | ✅ Exact pixel placement |
| Photographic elements | ✅ Generates novel images | ❌ Requires stock or AI-gen inputs |

**Conclusion:** Use code for everything structural (text, layout, colors, typography). Use diffusion only for photographic background images, textures, or hero subjects that get placed *into* the coded template.

---

## The Rendering Stack

### Satori + Resvg (Primary)
- **Satori** (by Vercel): Converts JSX/TSX to SVG using Yoga layout engine (flexbox)
- **@resvg/resvg-js**: Converts SVG to high-quality PNG at exact pixel dimensions
- **Result**: JSX → SVG → PNG at any resolution

### @vercel/og (Convenience Wrapper)
- Wraps Satori + Resvg into a single `ImageResponse` API
- Originally designed for OpenGraph images, but works for any static image
- Simpler API but less control over font loading

### For LinkedIn PDFs
- Render each slide as PNG using Satori
- Combine into a multi-page PDF using `pdf-lib` or `jsPDF`
- LinkedIn document posts accept PDF uploads

---

## Satori CSS Support & Limitations

Satori uses the Yoga layout engine. Only a subset of CSS is supported:

### ✅ Supported
- `display: flex` (flexbox is the only layout model)
- `flexDirection`, `justifyContent`, `alignItems`, `flexWrap`, `gap`
- `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`
- `padding`, `margin` (all sides)
- `border`, `borderRadius`, `borderColor`, `borderWidth`
- `backgroundColor`, `color`, `opacity`
- `fontSize`, `fontWeight`, `fontStyle`, `fontFamily`, `letterSpacing`, `lineHeight`
- `textAlign`, `textTransform`, `textDecoration`, `textOverflow`
- `overflow: hidden`
- `position: absolute` (within a `position: relative` parent)
- `top`, `left`, `right`, `bottom`
- `backgroundImage` (linear gradients and `url()` for images)
- `boxShadow`, `textShadow`
- `transform` (limited: `rotate`, `scale`, `translateX`, `translateY`)

### ❌ Not Supported
- `display: grid` — use nested flexbox instead
- `float`, `clear`
- CSS animations or transitions (static output only)
- `z-index` (use DOM order instead)
- Pseudo-elements (`::before`, `::after`)
- `calc()`, CSS variables
- `backdrop-filter`, `filter` (blur, etc.)
- Web fonts by name — must load TTF/OTF as ArrayBuffer

---

## The Hybrid Workflow

```
┌─────────────────────────────────────────────────┐
│ DESIGN-SYSTEM.md (tokens)                       │
│  ├── Colors: #1a1a2e, #e2e2e2, #00d4ff          │
│  ├── Fonts: Space Grotesk Bold, Inter Regular    │
│  └── Layout: 1080x1350, margins 80px             │
└───────────────┬─────────────────────────────────┘
                │
    ┌───────────▼───────────┐
    │ Need photographic     │
    │ background/texture?   │
    ├── YES ────────────────┼──► Generate with diffusion model
    │                       │    (texture, hero image, B-roll)
    │                       │    Save to content-engine/assets/bg-*.png
    └── NO ─────────────────┘
                │
    ┌───────────▼───────────┐
    │ Agent writes JSX      │
    │ component with:       │
    │  - Design tokens      │
    │  - Text content       │
    │  - Optional bg image  │
    └───────────┬───────────┘
                │
    ┌───────────▼───────────┐
    │ Satori renders to SVG │
    │ Resvg converts to PNG │
    │ (exact dimensions)    │
    └───────────┬───────────┘
                │
    ┌───────────▼───────────┐
    │ Output:               │
    │  - PNG slides          │
    │  - Combined PDF        │
    │    (for LinkedIn docs) │
    └───────────────────────┘
```

---

## Font Loading

Satori requires fonts as `ArrayBuffer`. The agent must:

1. Download Google Fonts as TTF files into `content-engine/assets/fonts/`
2. Load them at render time:

```javascript
const fontData = await fs.readFile('./content-engine/assets/fonts/SpaceGrotesk-Bold.ttf');

const svg = await satori(element, {
  width: 1080,
  height: 1350,
  fonts: [
    { name: 'Space Grotesk', data: fontData, weight: 700, style: 'normal' },
    { name: 'Inter', data: interData, weight: 400, style: 'normal' },
  ],
});
```

---

## When to Use Diffusion vs. Code

| Content Type | Primary | Diffusion Role |
|---|---|---|
| Carousel slides (text-heavy) | **Code** | None — solid/gradient backgrounds |
| Post covers with hero image | **Code** for text overlay | Background/hero image generation |
| Instagram Story graphics | **Code** | Optional texture layer |
| LinkedIn PDF document | **Code** → PNG → PDF | None |
| Artistic brand photos | None | **Diffusion** (full generation) |
| Background textures | None | **Diffusion** (then placed into code template) |

---

## Component Design Principles

1. **Props from DESIGN-SYSTEM.md**: Every component reads colors, fonts, and layout rules as props. Never hardcode brand tokens.
2. **Consistent slide grid**: Use the fixed layout from `carousel-design-system.md` — headline zone top, content center, handle bottom-left, arrow center-right, page number bottom-right.
3. **Platform variants**: Accept a `platform` prop to switch dimensions (1080x1350 for IG, 1200x627 for LinkedIn link preview, 1600x900 for Twitter).
4. **Background layering**: If a diffusion-generated background is provided, render it as a `backgroundImage: url()` layer behind the text content.
