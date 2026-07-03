---
name: lz-content-engine
description: >
  Unified content creation and design engine for social media — LinkedIn,
  Twitter/X, and Instagram. Two modes: Init builds the brand foundation
  (BRAND.md, STRATEGY.md, CALENDAR.md, DESIGN-SYSTEM.md) through guided
  interview; Ongoing reads existing docs and generates on-brand content with
  calendar tracking. Includes The Bridge method (climax-led openings),
  series planning, signal mining, story mining, audience gap analysis,
  carousel design system, caption/CTA routing, lead magnet ideation, and
  30-day content system. Use when asked to "create content", "plan content",
  "write a post", "design a carousel", "build a content calendar",
  "set up brand", "content strategy", "social media", "LinkedIn post",
  "Twitter thread", "Instagram caption", "content engine", or "init
  content-engine". Integrates with lz-humanizer-pro and lz-session-learn.
license: MIT
metadata:
  version: 1.0.0
  platforms: [linkedin, twitter-x, instagram]
  integrations: [lz-humanizer-pro, lz-session-learn]
  absorbed-skills:
    - the-bridge
    - goal-lock
    - series-planner
    - signal-mine
    - follow-up-engine
    - audience-gaps
    - caption-and-cta
    - reel-scripter
    - story-mine
    - newsletter-drafter
    - freebie-suggester
---

# lz-content-engine — Social Media Content Engine

Two sub-domains in one skill: **Content Creation** (copywriting, captions, hooks, threads, scripts) and **Content Design** (visual identity, carousel system, design tokens, asset guidelines).

## When to Use

- Setting up a brand's content system from scratch → **Init workflow**
- Creating posts, threads, carousels, captions → **Ongoing workflow**
- Planning a content calendar or series → **Ongoing workflow**
- Mining stories, signals, or trends for content ideas → **Ongoing workflow**
- Checking if content aligns with the current goal → **Goal check**
- Analyzing audience gaps before publishing → **Quality check**
- Generating lead magnets or freebies → **Package workflow**

## Architecture

```
content-engine/              ← lives in the user's project
├── BRAND.md                 ← identity, voice, values, audience
├── STRATEGY.md              ← goal, pillars, series, KPIs
├── CALENDAR.md              ← pipeline with status tracking
├── DESIGN-SYSTEM.md         ← colors, type, composition, signature
├── posts/                   ← generated content (versioned)
│   └── YYYY-MM-DD-platform.md
└── assets/                  ← visual briefs, generated images
```

Any agent entering the project reads these docs and is immediately productive. No re-explaining the brand.

## Workflow 1: Init (First Time)

Run this when `content-engine/` does not exist in the project.

### Phase 1 — Focus (Goal Lock)

1. Ask the user for their current content assets: bio, top posts, analytics, competitors
2. Analyze what's working: themes, emotional registers, formats, hooks
3. Propose 3-4 strategic directions, each with:
   - Audience (specific, not "everyone")
   - Tension (what they feel but can't say)
   - Path (where following leads them)
   - 90-day monetization angle
   - Focus statement: "I help [person] who feels [tension] by showing them [path]."
4. Lock ONE direction. Ask user to confirm.
5. Lock ONE primary goal (revenue / growth / audience quality / leads / authority) with metric + timeframe
6. Generate `content-engine/BRAND.md` using `./assets/brand-template.md`
7. Generate `content-engine/STRATEGY.md` using `./assets/strategy-template.md`

### Phase 2 — Style (Design Lock)

1. Ask user for 3-6 visual reference images and a mood descriptor
2. Define the locked style across 6 elements:
   - Color palette (3-5 colors, hex codes, usage rules)
   - Figure/subject style
   - Typography (display, body, accent)
   - Composition logic
   - Anti-style (what we explicitly never do)
   - Signature element (the repeating motif)
3. Generate `content-engine/DESIGN-SYSTEM.md` using `./assets/design-system-template.md`
4. For deep carousel design rules, load `./references/carousel-design-system.md`

### Phase 3 — Plan (30-Day Calendar)

1. Build 2-3 recurring series (credibility / shareability / conversion)
2. Map 30 days with real dates, series tags, hook angles, formats, jobs
3. Define season architecture: what the month builds toward
4. Identify 2-3 anchor posts to batch first
5. Generate `content-engine/CALENDAR.md` using `./assets/calendar-template.md`
6. For deep series planning, load `./references/series-planning.md`

### Phase 4 — Integration Check

1. If `lz-humanizer-pro` is available, note: all generated content will be passed through humanizer before finalizing
2. If `lz-session-learn` is available, note: brand voice learnings will be persisted after session

## Workflow 2: Ongoing (Content-Engine Exists)

Run this when `content-engine/` already exists.

### Step 1 — Context Load

1. Read `content-engine/BRAND.md` → know the brand
2. Read `content-engine/STRATEGY.md` → know the goal, pillars, series
3. Read `content-engine/CALENDAR.md` → know what's planned, drafted, published
4. Read `content-engine/DESIGN-SYSTEM.md` → know the visual rules

### Step 2 — Determine Task

| User wants | Action | Load reference |
|---|---|---|
| Create a post | Write platform-specific content | `./references/[platform]-playbook.md` |
| Write captions + CTAs | Draft with platform routing | `./assets/caption-cta-guide.md` |
| Script a Reel/Short | Use climax-led opener template | `./assets/reel-script-template.md` + `./references/the-bridge-method.md` |
| Plan next content | Check calendar gaps, suggest series entries | `./references/series-planning.md` |
| Mine ideas from trends | Surface signals from raw input | `./references/signal-mining.md` |
| Mine stories | Extract content angles from experience | `./references/story-mining.md` |
| Follow up a winning post | Generate compound angles | `./references/follow-up-strategy.md` |
| Check audience gaps | Surface silent questions pre-publish | `./references/audience-gap-analysis.md` |
| Build a lead magnet | Generate graded freebie ideas | `./references/lead-magnet-guide.md` |
| Repurpose to other platforms | Use the matrix | `./assets/repurposing-matrix.md` |
| Draft a newsletter | Use newsletter template | `./assets/newsletter-template.md` |
| Design a carousel | Follow the 3-rule system | `./references/carousel-design-system.md` |
| Goal check | Filter idea through locked goal | Inline (see below) |

### Step 3 — Create

1. Load the appropriate reference/asset from the table above
2. Follow the method in the reference
3. Apply The Bridge method for all openings (load `./references/the-bridge-method.md`)
4. Match the voice from `BRAND.md`
5. Stay locked to the design system from `DESIGN-SYSTEM.md`

### Step 4 — Save & Track

1. Save content to `content-engine/posts/YYYY-MM-DD-platform.md`
2. Update `content-engine/CALENDAR.md` status (🔴 → 🟡 → 🔵 → ✅)
3. If `lz-humanizer-pro` is available, pass through humanizer
4. If `lz-session-learn` is available, log voice learnings

## Goal Check (Inline)

Before committing time to any content piece, run the goal filter:

1. Restate the locked goal (from `STRATEGY.md`)
2. Summarize the idea in one line
3. Assess: **YES** / **PARTIALLY** / **NO**
4. If not fully on-goal, give the specific fix
5. Always offer the sharper version — same idea pulling harder toward the goal
6. ONE goal at a time. Be honest. Never rubber-stamp.

## Platform Quick Reference

| Platform | Hook fold | Max chars | Image size | CTA routing |
|---|---|---|---|---|
| LinkedIn | ~210 chars | 3000 | 1200×627 / 1080×1080 | Comment, link-in-comments |
| Twitter/X | Full tweet | 280/tweet | 1600×900 | Reply, RT, link |
| Instagram | ~125 chars | 2200 | 1080×1080 / 1080×1350 | ManyChat DM keyword |

For deep platform specs, load: `./references/linkedin-playbook.md`, `./references/twitter-playbook.md`, `./references/instagram-playbook.md`

## Reference Index

| Reference | What it contains |
|---|---|
| `./references/thirty-day-system.md` | The complete 5-level content creation system |
| `./references/the-bridge-method.md` | Climax-led openings (foundational technique) |
| `./references/carousel-design-system.md` | 3-rule visual system for carousels |
| `./references/series-planning.md` | Topic → multi-part series architecture |
| `./references/signal-mining.md` | Trends → niche-relevant content ideas |
| `./references/follow-up-strategy.md` | Winning post → compound follow-up angles |
| `./references/audience-gap-analysis.md` | Surface silent audience questions |
| `./references/story-mining.md` | Experience → content angle extraction |
| `./references/lead-magnet-guide.md` | Graded lead magnet ideation |
| `./references/linkedin-playbook.md` | LinkedIn algorithm, specs, best practices |
| `./references/twitter-playbook.md` | Twitter/X algorithm, threads, engagement |
| `./references/instagram-playbook.md` | Instagram algorithm, carousels, Reels |
| `./references/copywriting-psychology.md` | AIDA, PAS, BAB, hooks, cognitive biases |
| `./references/design-specs.md` | Platform dimensions, color psychology, typography |

## Asset Index

| Asset | What it contains |
|---|---|
| `./assets/brand-template.md` | BRAND.md template (init workflow) |
| `./assets/strategy-template.md` | STRATEGY.md template (init workflow) |
| `./assets/calendar-template.md` | CALENDAR.md template with status tracking |
| `./assets/design-system-template.md` | DESIGN-SYSTEM.md template |
| `./assets/caption-cta-guide.md` | Platform-specific caption + CTA routing |
| `./assets/reel-script-template.md` | Short-form script template |
| `./assets/newsletter-template.md` | Newsletter draft template |
| `./assets/post-linkedin.md` | LinkedIn post template |
| `./assets/post-twitter-thread.md` | Twitter/X thread template |
| `./assets/post-instagram.md` | Instagram post template |
| `./assets/visual-brief-template.md` | Visual brief for design execution |
| `./assets/repurposing-matrix.md` | 1 idea → multi-platform matrix |
| `./assets/hashtag-strategy.md` | Hashtag research per platform |

## Hard Rules

1. Never generate content without reading `BRAND.md` first. Brand context prevents generic output.
2. Every opening uses The Bridge method. No "STOP scrolling", no "99% don't know", no manufactured tension hooks.
3. CTA routing is platform-specific. Never put a clickable link in an Instagram caption body.
4. One locked goal at a time. If content doesn't serve the goal, say so and offer the fix.
5. Update `CALENDAR.md` after every content creation. The calendar is the single source of truth.
6. Design stays locked. Post 1 and Post 30 must look like the same brand.
7. Series beat random topics. Every post belongs to a series.
8. If `lz-humanizer-pro` is installed, run content through it before marking as Published.
