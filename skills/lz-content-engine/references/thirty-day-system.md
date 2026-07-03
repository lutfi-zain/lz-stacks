# Thirty-Day System

A repeatable system to plan, design, create, and package 30 days of high-converting social media content in a single structured session.

## Core Principle: Compound Context
AI-generated content often feels generic because it is created in isolation. This system builds context sequentially across five levels in a single session. By Level 5, the model knows the page focus, visual brand, series structure, and content calendar, ensuring highly specific output.

---

## Level 1: Focus
Define the target audience, their unstated emotional tension, and the path you will show them.

### Niche Framework
- **Person:** Who specifically are you talking to? (e.g., "burnt-out freelance designers" instead of "creators").
- **Tension:** What do they feel but struggle to say or search for?
- **Path:** Where does following your page lead them?
- **Focus Formula:** `I help [Person] who feels [Tension] by showing them [Path].`

### Prompt: Account Foundation
```text
You are helping me design the foundation for a content account. I want something specific, monetizable, and emotionally resonant — not generic. Below I've shared assets from my page (or accounts I admire). Use these as input:

[Paste: bio, top-performing posts, competitor screenshots, analytics, audience notes]

Step 1: Break down what's actually working in this content. Themes, emotional registers, post formats, hook patterns. Be specific.
Step 2: Give me 3-4 strategic directions I could take the page. For each one:
  - The pivot or angle (1-2 sentences)
  - Who the audience becomes (specific, not "everyone")
  - What they feel but can't say (the tension)
  - Where following the page leads them (the path)
  - The 90-day monetization angle — what could I actually sell, at what price
  - A one-line focus statement in this exact format:
    "I help [person] who feels [tension] by showing them [path]."
Don't be safe. I want directions sharp enough to make me pick one.
```

---

## Level 2: Style
Lock the visual brand identity to guarantee grid consistency.

### Six Elements of Style
1. **Palette:** 3-5 colors (hex codes) with clear roles (dominant, background, accent).
2. **Subject Style:** How subjects appear (photographic, vector, illustrated, faces hidden/shown).
3. **Typography:** Font pairings (display headline vs. clean sans body) and layout rules.
4. **Composition:** Framing rules, margins, negative space, and focal points.
5. **Anti-style:** The generic, overused AI aesthetic that must be explicitly rejected.
6. **Signature Element:** A repeating visual motif that acts as a brand identifier (e.g., hands, specific wash).

### Prompt: Visual Identity Lock
```text
I'm locking in the focus from Level 1. Now build my visual identity. Reference images attached — this is the aesthetic I'm pulling from.

[Attach 3-6 reference images]

Step 1: Define my locked style across these six elements:
  1. Colour palette — 3-5 colours with hex codes and usage rules
  2. Figure / subject style — how people or objects appear
  3. Typography — display, body, accent fonts and how text sits on the image
  4. Composition logic — framing, negative space, focal point rules
  5. Anti-style — the generic AI looks we explicitly never do
  6. Signature element — the repeating motif that makes a post recognisably mine
Step 2: Generate 3 starter visuals using Higgsfield or ChatGPT Image 2. Each one should:
  - Demonstrate the locked style
  - Include sample headline text that fits the focus from Level 1
  - Be different enough that I can compare and pick
If a recurring character or signature object would strengthen the brand, suggest it before generating.
```

---

## Level 3: Plan
Replace random topics with structured multi-part series to create a binge loop.

### Series Mix
- **Credibility Series:** Showcases deep expertise and data-backed authority.
- **Shareability Series:** Optimizes for saves, shares, and high engagement velocity.
- **Conversion Series:** Directly drives monetization actions (links, DM opt-ins).

### Prompt: 30-Day Calendar Build
```text
The focus is locked. The style is locked. Now build my 30-day content plan.

Constraints:
  - 2-3 recurring series, not random topics. Each series ties to the focus.
  - Each series has a clear job: one for credibility, one for shareability, one for conversion (adjust to my goal: [insert goal here]).
  - Cadence: daily or every other day — you choose what fits.
  - Real dates starting [today's date].
  - Each post slot includes: series name, hook angle, format (carousel / single image / reel), and the "job" it does in the system.

Then give me the season architecture:
  - What this month builds towards by Day 30. Positioning, proof, growth, monetization readiness — name the outcome.
  - The binge loop — how the series connect so someone who finds Post 17 ends up reading Posts 1-16.
  - The 2-3 anchor posts. The ones I batch and over-deliver on first.
Output the calendar as a clean table I can paste into Notion or a spreadsheet.
```

---

## Level 4: Create
Generate Cover assets, visual scripts, or media briefs with consistent visual context.

### Prompts: Assets Generation

#### 4A: The First 5 Covers
```text
Generate the first 5 cover images from the calendar. Rules:
  - Use the locked style from Level 2 (palette, figure, type, composition, signature element). Don't drift.
  - Each cover tells its own story. Different environment, different scene, different emotional register. No duplicate compositions across the 5.
  - Add text on the image where the format calls for it — pull the hook from the calendar entry.
  - Use Higgsfield (Nano Banana Pro) or ChatGPT Image 2 for heavy text.
After generating, give me a one-line audit of each cover:
  - Composition trick used
  - Emotional register
  - Environment
  - Which signature element appears
So I can spot-check the variety before we go deeper.
```

#### 4B: Full Carousel from a Selected Cover
```text
Take cover #[X] and build it into a full carousel. [4-6] slides total, including the cover. Each slide should:
  - Flow as a sequence. Slide 2 pays off slide 1. Slide 3 deepens. Slide 4 turns. Final slide earns the CTA.
  - Stay locked to the style — palette, type, composition, signature.
  - End on a slide that earns the CTA: save, share, comment, DM keyword — pick what fits this post's job from the calendar.
Generate all slides. Then draft a first-pass caption in my voice so I can see it laid out with the visuals.
```

#### 4C: Animated Cover (Optional)
```text
Take cover #[X] and animate it into a 5-7 second clip using Higgsfield Seedance 2.0. Motion brief:
  - Subtle, not chaotic. The still image is doing the work.
  - One primary movement (camera push, subject breath, environmental shift).
  - One secondary detail (light, particles, foliage, atmosphere).
  - Loop-friendly opening and closing frames.
  - No new text, no new subjects, no new style.
Output: the motion script first, then the generation.
```

---

## Level 5: Package
Draft final copywriting copy and build direct conversion paths.

### Prompt: Copywriting and Funnels
```text
Write all 30 captions for the calendar. Rules:
  - Voice consistent with the focus from Level 1. Direct, specific, no motivational filler.
  - Each caption sounds like it could only come from this page. Not a generic content account.
  - CTA distribution across the 30:
      ~50% save / share
      ~25% comment / DM keyword
      ~15% link in bio
      ~10% no CTA (pure story or hot take)
  - Vary length. Some 2-line punches. Some 6-8 line stories. No walls of text.
  - If I use ManyChat: build the keyword CTAs in. Tell me which captions use which keyword and what the DM auto-reply should say.
After the captions, give me:
  - How CTAs are distributed across the 30
  - 2-3 "voice rules" you noticed yourself following — so I can keep writing in the same voice going forward.
```
