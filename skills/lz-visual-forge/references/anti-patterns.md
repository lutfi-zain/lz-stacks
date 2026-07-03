# Design Anti-Patterns & Visual "Slop" Avoidance

Programmatic design engines often produce low-quality, cluttered, or cheap-looking results—a phenomenon known as **design slop**. Visual Forge enforces strict guardrails to prevent these visual pitfalls.

This document details the most common design anti-patterns and explains how to resolve them, both conceptually and within Satori's engine.

---

## 1. Over-the-Top Mesh Gradients ("Rainbow Slop")

### The Anti-Pattern
Placing high-saturation, multi-hued gradients (e.g. neon yellow, pink, blue, and green all at once) as a background. This creates visual noise, ruins text contrast, and looks cheap.

### The Remedy
Limit backgrounds to muted, monochromatic bases, or restrict active gradients to a maximum of two harmonized colors (e.g., Indigo and Purple, or Navy and Teal). Keep the opacity of decorative background gradients below **25%**.

```diff
- /* POOR: Too many bright, clashing colors */
- background-image: linear-gradient(to right, #ff007f, #7f00ff, #00ffff, #00ff00);
- opacity: 1.0;

+ /* PREMIUM: Harmonized, subtle background glow */
+ background-image: linear-gradient(to bottom right, #1e1b4b, #311042);
+ opacity: 0.8;
```

---

## 2. Generic Outline Icons & Mixed Weights

### The Anti-Pattern
Using random outline icons with varying stroke weights (e.g. combining a 1px stroke icon with a 2.5px stroke icon), or pasting unformatted SVGs directly onto the canvas with no bounding box or visual anchor.

### The Remedy
* Standardize stroke weights across the entire layout (e.g., all icons must be set to `stroke-width: 1.5px` or `2.0px`).
* Frame icons inside a geometric card or badge container with a consistent background to give them a physical anchor.

```html
<!-- PREMIUM: Structured Icon Frame -->
<div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
</div>
```

---

## 3. Center-Aligned Block Syndrome

### The Anti-Pattern
Center-aligning every single element on the canvas, including long paragraphs of copy. Centered text alignment forces the eye to locate a new starting point for every single line, increasing cognitive strain and looking amateurish.

```
      [ POOR: Centered Long Copy ]
   Lorem ipsum dolor sit amet, elit.
       Curabitur ut justo rhoncus.
  Donec sodales, magna id elementum,
             lacus purus.
```

### The Remedy
Center-align only short, single-line highlights or titles. If your text contains more than two lines, **left-align** the block. Anchor the block using a structured grid with a clear, straight vertical axis.

```
[ PREMIUM: Left-Aligned Grid Axis ]
│ Lorem ipsum dolor sit amet, elit.
│ Curabitur ut justo rhoncus.
│ Donec sodales, magna id elementum,
│ lacus purus.
```

---

## 4. Poor Line Wraps & Orphan Words

### The Anti-Pattern
Allowing text strings to wrap uncontrolled, leaving a single word (an "orphan") on the last line (e.g. "...to build a better\nsystem"). This ruins the geometric boundaries of the text box.

### The Remedy
1. Wrap trailing keywords with non-breaking spaces (`&nbsp;` or JavaScript Unicode `\u00A0`) to force them to stick to the preceding word.
2. Control width properties: Set explicit `max-width` percentages on text containers (e.g., `max-width: 85%`) to force clean wrapping.
3. Inject manual line breaks (`<br />`) programmatically at punctuation marks or logical phrase breaks.

---

## 5. Crowded Margins ("Border Hugging")

### The Anti-Pattern
Placing logos, titles, or page counts directly against the physical edge of the canvas. This creates visual tension and increases the risk of truncation when platforms crop images.

### The Remedy
Enforce a mandatory global padding on the root element. Under no circumstances should any visual element sit closer than **64px** to the edge on a `1200x630` canvas, or **80px** on a `1080x1350` canvas.

---

## 6. Text Overlay on Busy Backgrounds

### The Anti-Pattern
Overlaying text directly on top of detailed background images, screenshots, or high-contrast gradient blobs, making the text unreadable.

### The Remedy
* **Gradient Fades**: Slide a solid dark gradient overlay under the text container.
* **Solid Backplates**: Place the text inside a structured card container with a solid, high-opacity background.

```html
<!-- PREMIUM: Text Card over Background Graphic -->
<div style="display: flex; flex-direction: column; width: 500px; padding: 32px; background-color: rgba(9, 10, 15, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px;">
  <span style="font-size: 14px; color: #a855f7;">METRIC UPDATE</span>
  <h3 style="font-size: 28px; color: #fff; margin-top: 12px;">Data Synthesis Completed</h3>
</div>
```

---

## 7. Satori-Specific Anti-Patterns

### 1. Expecting Nested Inline Elements to Wrap Like HTML
* **The Slop**: Nesting `<span />` directly inside standard text elements and expecting standard browser wrapping behavior. Satori converts children into flex items, often breaking text blocks into vertical columns.
* **The Remedy**: Always wrap text structures in parent divs with `display: flex; flex-direction: row; flex-wrap: wrap;` or keep raw text elements flat.

### 2. Missing Explicit Image Dimensions
* **The Slop**: `<img src="..." />` with no width or height. It renders at `0x0px`, completely invisible.
* **The Remedy**: Always provide explicit `width` and `height` styles to all image tags.

### 3. Declaring `font-weight` without registering the font file
* **The Slop**: Applying `font-weight: 700` or `font-weight: bold` in CSS, but only loading a single Regular (400) weight TTF buffer. Satori does not synthesize bold lines; the text will render as thin regular weight.
* **The Remedy**: Register every weight explicitly under the same family name during Satori initialization.
```typescript
{
  name: 'Inter',
  data: interBoldBuffer,
  weight: 700,
  style: 'normal'
}
```
