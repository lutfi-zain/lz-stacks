# Vercel Satori Mastery & CSS Engine (Yoga) Reference

Vercel Satori is a library that converts HTML and CSS into SVG. It is powered by the **Yoga layout engine**, a C++ implementation of the flexbox specification. Because Satori does not run in a full browser environment, it enforces rigid layout and CSS limitations. 

This document details the mechanics, limitations, and workarounds required to write robust CSS for Satori.

---

## 1. The Yoga Layout Paradigm

Unlike standard web browsers that support block flow, inline flow, grid, and tables, Satori supports **only two layout models**:
1. **Flexbox (via Yoga)**: The default layout model for all block elements.
2. **Absolute Positioning**: Used to remove elements from the normal document flow and layer them.

> [!WARNING]
> - By default, Satori treats all containers as `display: flex` with `flex-direction: column`.
> - There is no CSS Grid (`display: grid`), inline-blocks, floats, or table layouts.
> - Elements like `span` inside a block element will behave as flex-items unless carefully structured.

---

## 2. CSS Compatibility Matrix

The following table details CSS properties supported, partially supported, or completely unsupported by Satori.

| CSS Category | Supported Properties | Unsupported / Broken |
| :--- | :--- | :--- |
| **Display** | `display: flex`, `none` | `display: grid`, `block`, `inline`, `inline-block` |
| **Flexbox** | `flex-direction`, `justify-content`, `align-items`, `flex-grow`, `flex-shrink`, `flex-basis`, `flex-wrap` | Multiple rows in wrapped containers sometimes yield layout bugs. |
| **Positioning** | `position: absolute`, `top`, `right`, `bottom`, `left` | `position: relative` (Note: works as a positioning context for absolute children, but doesn't support relative offsets reliably). `z-index` (layers are determined strictly by DOM order). |
| **Sizing / Box**| `width`, `height`, `min-width`, `min-height`, `max-width`, `max-height`, `margin`, `padding`, `box-sizing` | `aspect-ratio` (not supported by older versions of Yoga; specify absolute dimensions). |
| **Typography** | `font-family`, `font-size`, `font-weight`, `font-style`, `line-height`, `text-align`, `text-overflow`, `white-space`, `letter-spacing` | `word-break: break-all`, custom hyphenation, text shadows, `text-stroke`. |
| **Borders** | `border`, `border-width`, `border-style`, `border-color`, `border-radius` | Multiple border weights (e.g., `border-left-width` mixed with different styles or colors can render incorrectly). |
| **Backgrounds** | `background-color`, `background-image` (linear-gradient, radial-gradient, URL) | `background-repeat`, `background-attachment`, complex multiple background layers. |
| **Visuals** | `opacity`, `transform` (limited to translation, scaling, and 2D rotation) | `box-shadow`, `filter`, `backdrop-filter`, `clip-path` (except simple rectangles via `overflow: hidden`). |

---

## 3. Flexbox Mastery in Satori

Because Satori is powered by Yoga, you must design with a flexbox mindset. 

### Crucial Flexbox Rules for Satori
1. **Explicit Flex-Direction**: Never assume elements will flow horizontally. If you need a horizontal layout, explicitly define `flex-direction: row` on the wrapper.
2. **Alignment & Centering**: Use `justify-content` and `align-items` to align children. Centering must be done at the parent level:
   ```css
   display: flex;
   justify-content: center;
   align-items: center;
   ```
3. **No Percentage Margins**: Yoga does not calculate percentage-based margins (`margin: 10%`) reliably. Always use absolute pixel units (`px`) for spacing.

---

## 4. Absolute Positioning & Layering

To create visually rich layouts with decorative background patterns, floating badges, or watermarks, you must use absolute positioning.

### How Layering Works
* **DOM Order Rules**: Satori does not support `z-index`. Elements are layered in the order they appear in the HTML source code. Elements rendered later in the DOM will sit on top of elements rendered earlier.
* **The Root Container**: The root element of your HTML payload must cover the entire canvas width and height and act as the absolute positioning context.

```html
<div style="display: flex; width: 1200px; height: 630px; position: relative; background-color: #0c0d12;">
  <!-- Layer 1: Background Decorative Gradient (Absolute) -->
  <div style="position: absolute; top: 0; left: 0; width: 1200px; height: 630px; background-image: radial-gradient(circle at 10% 10%, #2b1c40 0%, transparent 50%); opacity: 0.6;"></div>

  <!-- Layer 2: Main Layout Content (Flex Flow) -->
  <div style="display: flex; flex-direction: column; width: 1200px; height: 630px; padding: 60px; justify-content: space-between;">
    <h1>Title text goes here</h1>
    <p>Subtitle text goes here</p>
  </div>

  <!-- Layer 3: Floating Foreground Badge (Absolute, Rendered Last) -->
  <div style="position: absolute; top: 60px; right: 60px; display: flex; padding: 8px 16px; background-color: #f59e0b; border-radius: 20px;">
    <span style="font-size: 14px; font-weight: bold; color: #000;">NEW RELEASE</span>
  </div>
</div>
```

---

## 5. Asset Loading: Images & SVGs

Handling assets correctly is the key to preventing blank canvases or rendering errors.

### Image Rendering Requirements
* **Explicit Dimensions**: Satori **requires** explicit `width` and `height` properties on `<img />` tags. Without them, the image dimensions fall back to `0x0`, making it invisible.
* **Base64 vs. Remote URLs**:
  - Remote URLs: Satori will attempt to fetch remote images asynchronously (e.g., `<img src="https://example.com/logo.png" />`). However, if the network request fails, timeout occurs, or CORS headers block the request, rendering fails.
  - **Best Practice (Base64)**: Pre-fetch and encode images into Base64 format to bypass network requests entirely:
    ```html
    <img src="data:image/png;base64,iVBORw0KGgoAAAANS..." width="120" height="40" />
    ```

### SVG Embedding Rules
Satori can render inline SVGs, but they must follow strict syntax:
1. Ensure the SVG element contains the `viewBox` attribute.
2. Satori translates SVG components into SVG code directly. Do not nest complex SVG wrappers inside HTML elements with flex-grow properties unless the SVG itself has hardcoded dimensions.
3. Keep SVGs clean. Strip metadata, editor tags (like Inkscape or Illustrator nodes), and use clean inline presentation attributes (like `fill` and `stroke`).

---

## 6. Typography & Font Embedding

Satori does not have access to system fonts or web font directories like Google Fonts during execution. You must provide fonts explicitly.

### Initializing Custom Fonts
Fonts must be registered as an ArrayBuffer in the Satori configuration options:

```typescript
import satori from 'satori';
import fs from 'fs';
import path from 'path';

// Read local font files into buffers
const interRegular = fs.readFileSync(path.resolve('./fonts/Inter-Regular.ttf'));
const interBold = fs.readFileSync(path.resolve('./fonts/Inter-Bold.ttf'));

const svg = await satori(
  <div style={{ fontFamily: 'Inter', fontWeight: 400 }}>Hello World</div>,
  {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: interRegular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: interBold,
        weight: 700,
        style: 'normal',
      },
    ],
  }
);
```

> [!IMPORTANT]
> Satori **does not synthesize weights**. If you use `font-weight: bold` or `font-weight: 700` in your CSS, but did not load a font buffer registered under `weight: 700`, Satori will render the text using the closest weight (typically 400), which results in thin, un-emphasized headers.

### Unicode Ranges and Fallbacks
If your text contains multiple scripts (e.g., Latin mixed with Kanji or Arabic), you must supply a fallback chain in the `fonts` option array. Satori will match the characters to their corresponding unicode range dynamically.

---

## 7. Emoji Rendering

Satori handles emoji parsing by replacing raw emoji characters with SVG image nodes.
- By default, Satori doesn't embed color emojis natively from standard font files because system color tables are rarely compiled.
- Pass an emoji parsing function in the options:
  ```typescript
  const svg = await satori(<div style={{ display: 'flex' }}>Hello 🚀</div>, {
    width: 1200,
    height: 630,
    fonts: [...],
    graphemeImages: (grapheme) => {
      // Return a URL pointing to the SVG emoji asset (e.g., Twemoji CDN)
      const codePoint = [...grapheme].map(char => char.codePointAt(0).toString(16)).join('-');
      return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codePoint}.svg`;
    }
  });
  ```

---

## 8. Common Errors & Workarounds

### Bug 1: Text wrapping incorrectly or clipping mid-sentence
* **Cause**: Yoga's text measuring engine uses font-specific metrics which may calculate line-breaks slightly differently from standard browser engines.
* **Workaround**: 
  1. Add a explicit `width` or `max-width` on the parent text container.
  2. Increase the box width by 5–10% to prevent unexpected line wraps.
  3. Set `white-space: nowrap` for headers that should never wrap under any circumstances.

### Bug 2: Border radius does not clip images (`overflow: hidden` fails)
* **Cause**: In Satori, an image component (`<img />`) nested inside a container with `border-radius` and `overflow: hidden` might bleed through the rounded corners.
* **Workaround**: Apply the `border-radius` directly to the `<img />` element styles, in addition to the parent wrapper:
  ```html
  <div style="display: flex; overflow: hidden; border-radius: 12px;">
    <img src="..." style="border-radius: 12px; width: 100px; height: 100px;" />
  </div>
  ```

### Bug 3: `box-shadow` generates console warnings or invalid SVG code
* **Cause**: Yoga doesn't compile CSS properties like `box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)`.
* **Workaround**: Use an absolute positioned background element or render SVG drop-shadow filter pipelines. Alternatively, overlay multiple absolute divs with low opacity and slightly larger sizing to mimic layered borders:
  ```html
  <!-- Simulated Shadow Layer -->
  <div style="position: absolute; top: 12px; left: 12px; width: 400px; height: 200px; background-color: #000; opacity: 0.1; border-radius: 16px;"></div>
  <!-- Primary Card Element -->
  <div style="position: absolute; top: 10px; left: 10px; width: 400px; height: 200px; background-color: #fff; border-radius: 16px; border: 1px solid #e5e7eb;"></div>
  ```
