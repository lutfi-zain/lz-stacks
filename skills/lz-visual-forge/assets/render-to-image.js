/**
 * render-to-image.js — Rendering Script Template
 *
 * Renders JSX components to PNG images and combines them into PDFs.
 * The agent copies this script to the user's project at content-engine/render.js
 * and adapts it based on the project's DESIGN-SYSTEM.md.
 *
 * Dependencies: npm install satori @resvg/resvg-js pdf-lib
 *
 * Usage:
 *   node content-engine/render.js
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { PDFDocument } from 'pdf-lib';
import fs from 'node:fs/promises';
import path from 'node:path';

// ─── Configuration ──────────────────────────────────────

const FONTS_DIR = './content-engine/assets/fonts';
const OUTPUT_DIR = './content-engine/assets/rendered';

// ─── Font Loader ────────────────────────────────────────

async function loadFonts(fontConfig) {
  const fonts = [];
  for (const font of fontConfig) {
    const data = await fs.readFile(path.join(FONTS_DIR, font.file));
    fonts.push({
      name: font.name,
      data: data.buffer,
      weight: font.weight,
      style: font.style || 'normal',
    });
  }
  return fonts;
}

// ─── JSX to PNG ─────────────────────────────────────────

async function renderToPNG(element, options) {
  const { width, height, fonts } = options;

  // Step 1: JSX → SVG
  const svg = await satori(element, { width, height, fonts });

  // Step 2: SVG → PNG
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}

// ─── PNG Slides to PDF ──────────────────────────────────

async function combineToPDF(pngBuffers, outputPath) {
  const pdfDoc = await PDFDocument.create();

  for (const pngBuffer of pngBuffers) {
    const pngImage = await pdfDoc.embedPng(pngBuffer);
    const { width, height } = pngImage.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(pngImage, { x: 0, y: 0, width, height });
  }

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
  console.log(`PDF saved: ${outputPath}`);
}

// ─── Example Usage ──────────────────────────────────────

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Load fonts from DESIGN-SYSTEM.md configuration
  const fonts = await loadFonts([
    { name: 'Space Grotesk', file: 'SpaceGrotesk-Bold.ttf', weight: 700 },
    { name: 'Inter', file: 'Inter-Regular.ttf', weight: 400 },
  ]);

  // Define slide content (agent generates this from the calendar/post plan)
  const slides = [
    {
      headline: 'The 3-Color Rule That Makes Every Carousel Look Premium',
      body: null,
      slideNumber: 1,
      totalSlides: 6,
      isCover: true,
    },
    {
      headline: 'Rule 1: Three Colors Only',
      body: 'Primary (brand), Background (neutral), Accent (highlight). That is it. No exceptions.',
      slideNumber: 2,
      totalSlides: 6,
    },
    // ... agent generates remaining slides
  ];

  const pngBuffers = [];

  for (const slide of slides) {
    // The agent imports the actual component — this is a simplified inline example
    const element = {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 1080,
          height: 1350,
          padding: 80,
          backgroundColor: '#1a1a2e',
          color: '#e2e2e2',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'h1',
            props: {
              style: {
                fontFamily: 'Space Grotesk',
                fontSize: slide.isCover ? 72 : 48,
                fontWeight: 700,
                color: slide.isCover ? '#00d4ff' : '#e2e2e2',
                lineHeight: 1.1,
              },
              children: slide.headline,
            },
          },
          slide.body
            ? {
                type: 'p',
                props: {
                  style: { fontSize: 24, lineHeight: 1.6, opacity: 0.9 },
                  children: slide.body,
                },
              }
            : null,
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 16,
                opacity: 0.5,
              },
              children: [
                { type: 'span', props: { children: '@username' } },
                {
                  type: 'span',
                  props: {
                    children: `${slide.slideNumber}/${slide.totalSlides}`,
                  },
                },
              ],
            },
          },
        ].filter(Boolean),
      },
    };

    const png = await renderToPNG(element, {
      width: 1080,
      height: 1350,
      fonts,
    });

    const filename = `slide-${String(slide.slideNumber).padStart(2, '0')}.png`;
    await fs.writeFile(path.join(OUTPUT_DIR, filename), png);
    console.log(`Rendered: ${filename}`);

    pngBuffers.push(png);
  }

  // Combine into PDF for LinkedIn document post
  await combineToPDF(pngBuffers, path.join(OUTPUT_DIR, 'carousel.pdf'));
}

main().catch(console.error);
