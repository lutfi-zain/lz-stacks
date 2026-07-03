# Render Pipeline Setup

Instructions to initialize the code-to-visual rendering pipeline in the user's project. The agent copies this setup into the project's `content-engine/` directory.

## 1. Install Dependencies

```bash
npm init -y  # if no package.json exists
npm install satori @resvg/resvg-js pdf-lib
```

Optional (for convenience wrapper):
```bash
npm install @vercel/og
```

## 2. Download Brand Fonts

Download the TTF files specified in `DESIGN-SYSTEM.md` from Google Fonts:

```bash
mkdir -p content-engine/assets/fonts

# Example: download Space Grotesk and Inter
curl -L "https://fonts.google.com/download?family=Space+Grotesk" -o /tmp/space-grotesk.zip
curl -L "https://fonts.google.com/download?family=Inter" -o /tmp/inter.zip

unzip /tmp/space-grotesk.zip -d content-engine/assets/fonts/
unzip /tmp/inter.zip -d content-engine/assets/fonts/
```

The agent should adapt the font URLs based on the actual fonts specified in the project's `DESIGN-SYSTEM.md`.

## 3. Project Directory Structure

After setup, the rendering pipeline adds these paths:

```
content-engine/
├── assets/
│   ├── fonts/                 ← TTF/OTF font files
│   │   ├── SpaceGrotesk-Bold.ttf
│   │   └── Inter-Regular.ttf
│   ├── backgrounds/           ← diffusion-generated textures/photos
│   └── rendered/              ← output PNGs and PDFs
├── components/                ← JSX component templates
│   ├── carousel-slide.jsx
│   └── social-cover.jsx
└── render.js                  ← rendering script
```

## 4. Rendering Workflow

```bash
# Render a single component to PNG
node content-engine/render.js --component carousel-slide --slide 1

# Render all slides for a carousel and combine into PDF
node content-engine/render.js --component carousel-slide --all --pdf output.pdf
```

## 5. Integration with SKILL.md Workflow

During the **Ongoing workflow**, when the user asks to "design a carousel" or "generate post visuals":

1. Read `DESIGN-SYSTEM.md` → extract color hex codes, font names, layout rules
2. Write the JSX component using `./assets/carousel-slide.jsx` as the base template
3. If a photographic background is needed, generate it with a diffusion model and save to `content-engine/assets/backgrounds/`
4. Run `render.js` to produce PNGs at the exact platform dimensions
5. For LinkedIn documents, combine PNGs into a PDF
6. Save outputs to `content-engine/assets/rendered/`
