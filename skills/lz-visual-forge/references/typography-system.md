# Typography System & Font Reference

A cohesive typographic structure is critical for maintaining visual rhythm and readability in dynamically generated images. Because Satori converts CSS typography instructions directly into vector outlines in the output SVG, typographical rules must be followed strictly to prevent overlaps, truncated characters, or poor scaling.

---

## 1. The Typographic Scale

To maintain a consistent size contrast, Visual Forge projects must adhere to a standardized **type scale**. We recommend a **Major Third (1.250)** scale for technical layouts and an **Augmented Fourth (1.414)** scale for display layouts.

Below is the standard typography scale for canvas resolutions of `1200px` to `1600px` in width:

| Level | Size (px) | Line Height | Letter Spacing | Weight / Font Role | Primary Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-xl` | **80px** | `1.1` | `-0.03em` | Bold / Display Serif | Hero titles (e.g. key figures) |
| `display-lg` | **64px** | `1.1` | `-0.02em` | Bold / Display Serif | Primary header on 1080x1350/1600x900 |
| `h1` | **48px** | `1.15` | `-0.02em` | Bold / Sans-Serif | Standard card headline |
| `h2` | **36px** | `1.2` | `-0.015em` | SemiBold / Sans-Serif | Sub-headers, main metric readouts |
| `h3` | **28px** | `1.25` | `-0.01em` | SemiBold / Sans-Serif | Mid-tier section headings |
| `body-lg` | **20px** | `1.4` | `0` | Regular / Sans-Serif | Primary paragraph, descriptions |
| `body-md` | **16px** | `1.45` | `0` | Regular / Sans-Serif | Secondary body copy, list text |
| `caption` | **14px** | `1.3` | `0.05em` | Medium / Sans-Serif | Secondary metadata, timestamps |
| `micro` | **12px** | `1.2` | `0.1em` | Bold / Monospace / Uppercased | Micro-tags, category indicators |

> [!CAUTION]
> Avoid font sizes smaller than **12px** for horizontal link graphics or **14px** for mobile-first Instagram content. Rendered text scales down on screens, and sub-12px elements will quickly blur or fail readability tests.

---

## 2. Line-Height & Letter-Spacing Rules

Satori parses `line-height` and `letter-spacing` styles, but they must be declared correctly to avoid Yoga measuring errors.

### The Line-Height Constraint
* **Use Unitless Multipliers**: Always declare `line-height` as a unitless multiplier (e.g., `line-height: 1.2`) or as absolute pixel values (`line-height: 24px`).
* **Avoid Percentages**: Do not use percentages for line-height (e.g., `120%`) as the parsing behavior in Satori can be inconsistent.
* **Tighten Large Headers**: For display sizes (`display-lg` and above), reduce the line height to `1.0` or `1.1`. Standard browser default line heights (typically `1.5`) create massive gaps in large text blocks that push secondary elements out of the canvas boundaries.

### Letter-Spacing (Tracking) Rules
Satori supports standard letter-spacing values (both `px` and `em`). Use tracking strategically:
- **Tighten Large Headers**: Apply negative letter-spacing (`-0.02em` to `-0.03em`) on display sizes to make headings look cohesive and premium.
- **Track-Out Micro-Copy**: Apply positive letter-spacing (`0.05em` to `0.15em`) and set `text-transform: uppercase` on tags, categories, or metrics to ensure readability at small sizes.

---

## 3. Font Pairing Principles

Premium designs rely on contrasting font pairings. Visual Forge outlines three distinct stylistic directions:

### Style A: The Modern Tech Deck (Neo-Brutalist / Clean Tech)
* **Primary Header**: *Plus Jakarta Sans* or *Inter* (Bold/SemiBold)
* **Body Text**: *Inter* or *Geist* (Regular)
* **Metadata/Metrics**: *JetBrains Mono* or *Fira Code* (Medium)
* **Vibe**: Clean, analytical, and highly structured. Ideal for developer tools, reports, and data visualizers.

### Style B: The Editorial Luxe (Classic / Elegant)
* **Primary Header**: *Playfair Display* or *Lora* (Bold/Italic)
* **Body Text**: *Instrument Sans* or *Inter* (Regular)
* **Metadata/Metrics**: *Instrument Sans* (Medium/Uppercase)
* **Vibe**: High-end lifestyle, finance, writing, and editorial designs.

### Style C: The High-Fidelity Minimalist (Geometric)
* **Primary Header**: *Clash Display* or *Cabinet Grotesk* (Bold)
* **Body Text**: *Satoshi* or *General Sans* (Regular)
* **Vibe**: Sleek, modern SaaS branding, product announcements, and design-led agencies.

---

## 4. Font Formats & Satori Loading

Satori compiles HTML into inline vectors using raw font file outlines. Because of this, font delivery differs from standard web development.

### Format Compatibility
Satori requires raw font buffers in **TTF** (TrueType) or **OTF** (OpenType) formats.
- **Do not use WOFF or WOFF2** directly in the backend code since Satori cannot unpack compressed web font wrappers natively. If you only have WOFF2, use an offline converter (e.g., `font-converter`) to transcode the assets to TTF before loading them into your runtime.

### Configuration Code Example

Ensure fonts are loaded from paths resolved absolute to the runtime root:

```typescript
import satori from 'satori';
import { readFileSync } from 'fs';
import { join } from 'path';

// Resolve and read fonts synchronously at initialization
const fontDir = join(process.cwd(), 'assets', 'fonts');

const playfairBold = readFileSync(join(fontDir, 'PlayfairDisplay-Bold.ttf'));
const interRegular = readFileSync(join(fontDir, 'Inter-Regular.ttf'));
const jetbrainsMono = readFileSync(join(fontDir, 'JetBrainsMono-Medium.ttf'));

export async function generateGraphic(htmlPayload: any) {
  return await satori(htmlPayload, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Playfair Display',
        data: playfairBold,
        weight: 700,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: interRegular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'JetBrains Mono',
        data: jetbrainsMono,
        weight: 500,
        style: 'normal',
      },
    ],
  });
}
```

---

## 5. Non-ASCII Character Handling & Fallback Chains

Satori requires Unicode coverage in the registered font files. If you attempt to render a character (e.g. Japanese Kanji: `本`) using a font that only contains Latin-1 character subsets (like basic *Inter*), Satori will render a fallback placeholder block (often called "tofu": `□`).

### Designing the Fallback Array
To avoid character drops, register fallback fonts in your configuration. Satori will loop through the font array in order, matching characters to the first font that declares support for that Unicode glyph.

```typescript
const fontsConfig = [
  // Primary Latin Font
  {
    name: 'Inter',
    data: readFileSync(join(fontDir, 'Inter-Regular.ttf')),
    weight: 400,
    style: 'normal',
  },
  // Fallback East Asian CJK Font
  {
    name: 'Noto Sans CJK JP',
    data: readFileSync(join(fontDir, 'NotoSansCJKjp-Regular.otf')),
    weight: 400,
    style: 'normal',
  },
  // Fallback Arabic Font
  {
    name: 'Noto Sans Arabic',
    data: readFileSync(join(fontDir, 'NotoSansArabic-Regular.ttf')),
    weight: 400,
    style: 'normal',
  }
];
```

> [!TIP]
> Group fallback fonts by name or declare separate names, but ensure they are included together in the top-level configuration `fonts` array. Satori checks character sets sequentially across all registered fonts.
