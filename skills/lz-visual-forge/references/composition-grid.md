# Composition, Dimensions, & Grid Systems Reference

Layout structures dictate how information is processed by a viewer. In dynamic image generation, establishing concrete canvas dimensions, margins, safe zones, and composition grids ensures that generated graphics look perfectly balanced and prevent critical details from being cropped by social media platform UI overlays.

---

## 1. Platform-Specific Dimensions & Safe Zones

Different distribution channels demand specific dimensions. The table below lists the core standards built into the `lz-visual-forge` template system.

| Platform / Format | Aspect Ratio | Dimensions (px) | Global Margin | Safe Zone Restrictions |
| :--- | :--- | :--- | :--- | :--- |
| **Instagram Square** | `1:1` | **1080 x 1080** | `64px` | Centralized focus. Avoid details in the bottom 40px (likes/comments overlay). |
| **Instagram Portrait** | `4:5` | **1080 x 1350** | `80px` | Avoid crucial elements in the top 120px and bottom 100px (platform UI headers and action bars). |
| **Twitter/X Shared Image**| `16:9` | **1600 x 900** | `96px` | Ensure text is strictly within a central `1400x740` bounding box to avoid feeds clipping outer edges. |
| **LinkedIn Image Link** | `1.91:1` | **1200 x 627** | `80px` | Landscape card format. Keep titles left-aligned with a clean right-hand graphic. |
| **LinkedIn Vertical** | `4:5` | **1080 x 1350** | `80px` | Best performing format for mobile feeds. Mirror Instagram Portrait rules. |
| **YouTube Thumbnail** | `16:9` | **1280 x 720** | `64px` | **Critical**: Keep the bottom-right `240x100px` region empty (this is where the video length badge overlays). |

```
YouTube Thumbnail Safe Zone Map (1280 x 720)
┌──────────────────────────────────────────────┐
│  [ Safe Zone for Text / Visual Focus ]       │
│                                              │
│                                  ┌──────────┐│
│                                  │ TIME     ││
│                                  │ BADGE    ││
│  (Keep clean left margin: 64px)  │ (AVOID)  ││
└──────────────────────────────────┴──────────┴┘
```

---

## 2. Layout Grid Structures

Visual Forge templates utilize three core layout configurations to organize structural elements.

### Template A: The Column Split (50/50 or 60/40)
Best for highlighting a main metric, data chart, or mock-up alongside explanatory copy.
* **Structure**: A horizontal flex row containing two distinct vertical containers.
* **Satori CSS implementation**:
  ```html
  <div style="display: flex; flex-direction: row; width: 1200px; height: 630px; padding: 80px;">
    <!-- Left Column: Copy & Hierarchy (60% Width) -->
    <div style="display: flex; flex-direction: column; width: 60%; justify-content: space-between;">
      <!-- Title & Description -->
    </div>
    <!-- Right Column: Visual Showcase (40% Width) -->
    <div style="display: flex; flex-direction: column; width: 40%; align-items: center; justify-content: center;">
      <!-- Charts, Mockups, or Big Metrics -->
    </div>
  </div>
  ```

### Template B: The Centered Showcase (Quote / Hero Announcement)
Best for short testimonials, event updates, or milestone celebrations.
* **Structure**: A centered flex column with generous top and bottom margins, anchored by high-end border elements.
* **Satori CSS implementation**:
  ```html
  <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; width: 1080px; height: 1080px; padding: 120px;">
    <!-- Top Anchor: Brand Tag -->
    <div style="display: flex; border: 1px solid rgba(255,255,255,0.15); padding: 8px 16px; border-radius: 30px;">TAG</div>
    
    <!-- Central Focus: Big Message -->
    <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
      <!-- Main Text -->
    </div>
    
    <!-- Bottom Anchor: Footer/URL -->
    <div style="display: flex; color: #6b7280; font-size: 16px;">domain.com</div>
  </div>
  ```

### Template C: The Tri-Card Deck (Comparison / Features)
Best for 3-part lists, comparison tables, or feature highlights.
* **Structure**: A horizontal row wrapping three vertical cards with equal gutter spacing.
* **Satori CSS implementation**:
  ```html
  <div style="display: flex; flex-direction: row; justify-content: space-between; width: 1600px; height: 900px; padding: 96px;">
    <!-- Column 1 -->
    <div style="display: flex; flex-direction: column; width: 420px; padding: 40px; background-color: #11131a; border-radius: 16px;"></div>
    <!-- Column 2 -->
    <div style="display: flex; flex-direction: column; width: 420px; padding: 40px; background-color: #11131a; border-radius: 16px;"></div>
    <!-- Column 3 -->
    <div style="display: flex; flex-direction: column; width: 420px; padding: 40px; background-color: #11131a; border-radius: 16px;"></div>
  </div>
  ```

---

## 3. Margin Offsets & Border Alignments

To achieve visual harmony, follow these strict margin offset guidelines:
- **Never place text directly on the edge**. The minimum margin must match the platform guideline (never lower than `64px` for any layout).
- **Match Inner and Outer Curves**: When nesting rounded cards inside a rounded border, use the geometric nested radius formula to keep spacing even:
  $$\text{Outer Radius} = \text{Inner Radius} + \text{Padding}$$
  If a card has `padding: 24px` and the inner content has `border-radius: 8px`, the parent card's outer border radius must be exactly `32px`.

---

## 4. Responsive Design Strategies in Satori

Because Satori compiles to static images, there are no live browser resize events. However, writing responsive and resilient layouts is crucial to prevent text truncation if text is injected dynamically (e.g. from an API).

> [!TIP]
> 1. **Avoid Hardcoded Margins for Content Boxes**: Let the layout flow. Instead of setting `margin-top: 250px` to push a description down, use flexbox configuration like `justify-content: space-between` or `flex-grow: 1` on spacer divs.
> 2. **Percent-Based Column Widths**: Declare columns using percentage-based widths (e.g., `width: 50%`) to let content shift gracefully if characters increase.
> 3. **Flex Wrap Safeguards**: When building horizontal lists of tags (like skills or categories), set `flex-wrap: wrap` and define a vertical gap (`gap: 12px` or vertical margins) to prevent tags from running off the right-hand canvas edge.
