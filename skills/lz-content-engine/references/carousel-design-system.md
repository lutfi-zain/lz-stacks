# Carousel Design System

A 3-part visual design system to stop the scroll on visual carousels. Built on three decisions made once and repeated for brand consistency.

## Rule 1: Three Colors Only
Color is the first element the user registers. Visual noise happens when too many colors fight for attention.

### Color Roles
- **Primary:** Your brand identity color, used for the main graphic elements.
- **Background:** A consistent, neutral backdrop (dark or light) that provides high contrast.
- **Accent:** A single bright or contrasting color used sparingly (less than 10% of the screen) to highlight the critical takeaway, callout, or call to action.

### The Background Trap
Do not let background images or screenshots smuggle in extra colors. If a screenshot has blue and orange, and your branding uses purple and yellow, you now have four colors fighting. Desaturate, wash, or crop images to fit the 3-color constraint.

---

## Rule 2: Two Fonts Only
Limit typography to two distinct font families with clear size hierarchy.

- **Display Font:** Bold, heavy, and full of character. Used strictly for main slide headlines to stop the scroll.
- **Body Font:** Clean, plain sans-serif with zero personality. Used for explanatory paragraphs and small UI elements. It must be highly legible and must not fight the headline.

---

## Rule 3: One Fixed Layout
Establish a fixed coordinate system for recurring slide elements. Rebuilding the layout for each post destroys feed consistency.

### Fixed Layout Mapping
- **Headline Zone:** Top-third of the canvas.
- **Content/Focal Zone:** Center-third.
- **Brand Element:** Username or handle (@username) locked in the bottom-left corner.
- **Navigation Cue:** A small forward arrow locked on the center-right edge.
- **Progress Indicator:** Page numbers locked in the bottom-right corner.

---

## Pre-Flight Checklist
Run this checklist before exporting or publishing any carousel:
- [ ] **Color:** Only 3 colors present (Primary, Background, Accent).
- [ ] **Image:** Background images do not introduce unapproved colors.
- [ ] **Fonts:** Exactly two fonts used (display headline, legibility body).
- [ ] **Body:** The body font has no distinctive personality (plain and readable).
- [ ] **Layout:** Handle, arrow, and page numbers sit in their exact locked coordinate positions.
- [ ] **Cover:** The cover slide stops the scroll and communicates the value with no caption context needed.
- [ ] **Grid:** The cover looks cohesive next to the last 9 grid posts.
