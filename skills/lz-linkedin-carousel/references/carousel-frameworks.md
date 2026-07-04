# LinkedIn Carousel Frameworks & Aesthetics Reference

A research-backed guide on optimizing B2B LinkedIn carousels (document posts) for dwell time, engagement, and premium design aesthetics inspired by Notion, Stripe, and Elastic.

---

## 1. The Science of Dwell Time & Engagement

LinkedIn's algorithm prioritizes **Dwell Time** over simple clicks. Document posts (PDFs) are uniquely optimized for this:
- **Algorithm Signals:** Every page swipe inside a document is registered as an active interaction, resetting the interest timer and pushing the post to more feeds.
- **Engagement Benchmark:** Document posts achieve a median engagement rate of **6.6% to 7.0%**, outperforming standard images and videos by 2x.
- **Swipe-Through Retention:** Retention drops off sharply after slide 7. The optimal length is **6 to 10 slides**. Under 6 slides fails to trigger "Saves" (a high-weight algorithmic signal), while over 10 slides degrades completion rates.

---

## 2. Copywriting Archetypes

Choose one of these proven frameworks to structure your carousel's narrative:

### A. The Billboard Hook & Bridge
- **Billboard Cover:** Do not write a generic title (e.g., "How to Deploy Microservices"). Write a specific, outcome-driven statement or problem (e.g., "Why 84% of Kubernetes Deployments Waste 30% of CPU").
- **The Bridge Caption:** Start the caption text with a hook that connects the feed reader directly to the PDF's primary theme, transitioning into the swiping flow.

### B. The Bento Breakdown
- Great for: Tools, stacks, audit checklists, or structured taxonomies.
- Structure: Group related components into modular blocks (like cards in a Bento grid) on slides 3 to 7, using concise visual summaries.

### C. The Comparative VS (A vs B)
- Great for: Frameworks, paradigms, before/after code modifications, or trade-offs.
- Structure: Split slides vertically or horizontally to compare a "Before" (desaturated, red cross accent) vs "After" (vibrant highlight, green checkmark accent).

### D. The Step-by-Step Blueprint
- Great for: Technical tutorials, pipelines, or algorithm processes.
- Structure: One distinct step per slide. Keep text under 35 words per slide. Show code blocks or pipeline diagrams on the right, explanation on the left.

---

## 3. Notion / Stripe / Elastic Visual DNA

To make a carousel feel premium and state-of-the-art, enforce these visual rules:

### A. The 3-Color Rule
- **Background (60%):** Slate/Deep Navy (`#0B0F19`) or warm cream/off-white (`#FAF9F6`). Solid or very subtle gradient. Never use stock photos or busy backgrounds.
- **Primary Text & Borders (30%):** High-contrast gray/slate (`#E5E7EB` or `#1F2937`) and thin lines (`#334155` or `#E2E8F0`).
- **Tech Accent (10%):** A single high-vibrancy color (Elastic Orange `#FF7D00`, Stripe Purple `#635BFF`, or Tailwind Teal `#06B6D4`). Use *only* to highlight active states, key data, checkmarks, or call-to-actions.

### B. Two-Font Typography
- **Display Headlines:** Geometric, modern sans-serif (e.g., Outfit, Plus Jakarta Sans, Satoshi) set to bold, sentence-case.
- **Body & Code:** Neutral sans-serif (e.g., Inter, Roboto) for body copy. High-legibility mono (e.g., Fira Code, JetBrains Mono) for code elements and technical labels.
- **No small fonts:** Minimum 32px size on a 1080px canvas (equivalent to `1.5rem` or `24pt` in standard layout software).

### C. Bento Compartments & Rounded Cards
- Visual assets (mockups, charts, code snippets) should be encapsulated in rounded cards (`border-radius: 16px` to `24px`) with a thin border (`1px solid`).
- Use desaturated, monochromatic UI graphics. Keep only the active interactive elements colored in your tech accent.

---

## 4. The Fixed Frame & Safe Zones

Ensure every slide maintains identical coordinate anchors to create a cohesive presentation system:

```
+--------------------------------------------------------+
|  [Small Mono Category Tag]                [Page X/Y]   |
|                                                        |
|   +------------------------------------------------+   |
|   |                                                |   |
|   |                  SAFE ZONE                     |   |
|   |              (80px Margin Padding)             |   |
|   |                                                |   |
|   +------------------------------------------------+   |
|                                                        |
|  [Brand Handle / Logo]                      [Swipe ->] |
+--------------------------------------------------------+
```

1. **Safety Margin:** 80px border padding around all edges. Never place text outside this boundary.
2. **Top Header:** Left-aligned category eyebrow in small mono font (e.g., `SERIES // SYSTEM ARCHITECTURE`). Right-aligned slide index (`X/Y`).
3. **Bottom Footer:** Left-aligned personal/brand handle (e.g., `@lutfidmz`). Right-aligned swipe indicator (small arrow or chevron) on slides 1–9.
