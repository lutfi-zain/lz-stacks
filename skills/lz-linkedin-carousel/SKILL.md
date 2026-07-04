---
name: lz-linkedin-carousel
description: >
  Create and design premium, high-engagement B2B LinkedIn PDF carousels based on Notion, Elastic, and Stripe aesthetics. Use this skill when asked to "design a carousel", "write a linkedin carousel", "create slide deck", "render carousel slides", "bento layout slides", "visual carousels", or "tech-style slides". Guide the user on copywriting flow (dwell time, Billboard hooks, swipe-through retention) and visual layout (bento grids, dark/light contrast, 3-color rule, 2-font rule, 1-fixed layout coordinate system).
license: MIT
---

# LinkedIn Carousel Architect

A specialized skill to write copy and structure premium B2B LinkedIn PDF carousels matching the visual style of Notion, Stripe, and Elastic. This skill optimizes copy for feed dwell-time, creates swipe-ready narrative arcs, and defines developer-centric visual specs.

---

## When to Use
- You are asked to write a LinkedIn carousel post or a slide deck.
- You need to structure a technical presentation, case study, or myth-buster into a swipable PDF document.
- You need to outline both copywriting and visual layout specifications for a mobile-first B2B audience.
- You want to design Bento-box grids, desaturated UI mockups, or comparisons for slides.

---

## Inputs
- **Primary Topic / Core Message:** The single main engineering, product, or delivery theme.
- **Copywriting Archetype:** Select from *Myth-Buster*, *Bento Breakdown*, *Comparative VS*, or *Step-by-Step Blueprint* (see details in [carousel-frameworks.md](./references/carousel-frameworks.md)).
- **Aesthetic Direction:** Dark Navy/Slate (Stripe/Elastic style) or Minimalist Outline (Notion style).
- **Brand Metadata:** User's brand handle (e.g., `@lutfidmz`) and accent color token.

---

## Output Structure

A structured Markdown output detailing both the **Caption Copy** and the **Slide-by-Slide Visual/Copy Brief** using this exact format:

```markdown
# [Carousel Title]

## Caption Copy
[Write a short post caption using the Bridge copywriting method. Do not exceed 1,500 characters. End with a line pointing to the carousel: e.g., "⚡ Slide-by-slide guide below:"]

---

## Slides Definition

### Slide 1: Cover (Hook)
- **Tag/Eyebrow:** [e.g., ⚡ METODOLOGI // ARCHITECTURE] (Small, uppercase monospace font)
- **Headline:** [Scroll-stopping Billboard title: specific, outcome-focused]
- **Body:** [Sub-headline clarifying the specific value proposition]
- **Visual Design:**
  - Layout: [e.g., Center-aligned minimalist, asymmetric split, etc.]
  - Elements: [Detailed spec: background slate, border stroke, accent color highlights]

### Slide 2: The Setup / Problem
- **Headline:** [The core pain point or status quo]
- **Body:** [The underlying friction that standard methods ignore]
- **Visual Design:** [e.g., Desaturated problem diagram, red cross highlight]

... [Slides 3 to 8: The Content Steps (Bento compartments, blueprints, or comparisons)] ...

### Slide 9: Summary Checklist
- **Headline:** [Quick actionable wrap-up checklist]
- **Visual Design:** [Bento-style summary card grid with ticked checkmarks in accent color]

### Slide 10: Call to Action (CTA)
- **Headline:** [Single, clear CTA: follow, save, or subscribe]
- **Visual Design:** [High-contrast card with brand handle and accent color button mockup]
```

---

## Process

### Step 1: Framework & Archetype Selection
1. Read the user's brief. Identify the single message.
2. Select the most relevant archetype from [carousel-frameworks.md](./references/carousel-frameworks.md):
   - *Myth-Buster* for challenging industry defaults.
   - *Bento Breakdown* for lists, tools, or checklists.
   - *Comparative VS* for before/after code or paradigm comparisons.
   - *Step-by-Step Blueprint* for structured technical tutorials.

### Step 2: Dwell-Time Copywriting
1. Write the Billboard cover hook. Avoid generic titles. Use a metric, a question, or a strong hook.
2. Keep slides between **6 and 10 pages** total to maximize completion rate.
3. Keep body copy under **35 words per slide**. Use simple sentence structures.
4. Eliminate all AI vocabulary (e.g., *delve, tapestry, showcase, seamless, leverage*).
5. Translate content to professional, conversational Indonesian blended naturally with standard tech terms (e.g., *deploy, cache, endpoint, staging*).

### Step 3: Notion / Stripe / Elastic Visual Specification
1. Define the **3-Color Rule**:
   - **Background (60%):** Slate/Deep Navy (`#0B0F19`) or warm cream/off-white (`#FAF9F6`).
   - **Primary text & lines (30%):** Contrast gray (`#E5E7EB`) or deep gray (`#1F2937`).
   - **Tech Accent (10%):** Vibrant orange, blue, purple, or teal for highlighting key items.
2. Define the **Two-Font rule**: Geometric headlines + neutral sans-serif/mono body.
3. Shape visual items into **Bento Grids** (asymmetric compartments) with rounded corners (`16px` to `24px` border-radius) and thin borders (`1px solid`).
4. Keep at least **35% whitespace** per slide.

### Step 4: Fixed Anchor Alignment
Verify that every slide output includes layout metadata details:
1. **Safety Margin:** 80px border padding around all edges (4:5 aspect ratio, 1080x1350px canvas).
2. **Monospace Tag (Top Left):** Eyebrow category label.
3. **Slide Index (Top Right):** `X of Y`.
4. **Brand Handle (Bottom Left):** e.g., `@lutfidmz`.
5. **Chevron (Bottom Right):** Right-edge arrow pointing to swipe forward on slides 1–9.

---

## Critical Rules
- **No Stock/Busy Backgrounds:** Never suggest photography or complex gradients. Keep backgrounds solid.
- **No AI Vocab:** Zero usage of generic, flowery marketing words.
- **One Goal per Carousel:** Never try to cover two different topics in one deck. Focus on one outcome.
- **Indonesian Tech Register:** Use standard professional Indonesian tech writing register (no direct word-for-word translation of idioms).
- **Checklist Audit:** Run the cheatsheet checklist in [carousel-cheatsheet.md](./assets/carousel-cheatsheet.md) on the output before finalizing.
