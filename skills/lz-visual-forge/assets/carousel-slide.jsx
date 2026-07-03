/**
 * Carousel Slide Component Template
 *
 * Base JSX component for rendering carousel slides via Satori.
 * The agent adapts this template per-project using tokens from DESIGN-SYSTEM.md.
 *
 * Usage: Import this component into render.js and pass slide-specific props.
 */

// --- Design Tokens (read from DESIGN-SYSTEM.md) ---
const tokens = {
  colors: {
    background: '#1a1a2e',   // 60% — dominant canvas
    structure: '#e2e2e2',    // 30% — body text, borders
    accent: '#00d4ff',       // 10% — headlines, CTA highlights
  },
  fonts: {
    display: 'Space Grotesk',
    body: 'Inter',
  },
  dimensions: {
    width: 1080,
    height: 1350,  // 4:5 ratio for Instagram/LinkedIn
    margin: 80,
  },
};

/**
 * CarouselSlide — renders a single carousel slide
 *
 * @param {object} props
 * @param {string} props.headline - The slide headline text
 * @param {string} props.body - The slide body content (optional)
 * @param {number} props.slideNumber - Current slide number
 * @param {number} props.totalSlides - Total slides in the carousel
 * @param {string} props.handle - Creator's social handle (e.g., @username)
 * @param {string} props.backgroundImage - Optional URL to a background image
 * @param {boolean} props.isCover - True if this is slide 1 (the cover)
 * @param {boolean} props.isCTA - True if this is the final CTA slide
 */
export function CarouselSlide({
  headline,
  body,
  slideNumber,
  totalSlides,
  handle = '@username',
  backgroundImage,
  isCover = false,
  isCTA = false,
}) {
  const { colors, fonts, dimensions } = tokens;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: dimensions.width,
        height: dimensions.height,
        padding: dimensions.margin,
        backgroundColor: colors.background,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: fonts.body,
        color: colors.structure,
      }}
    >
      {/* ── Headline Zone (Top Third) ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h1
          style={{
            fontFamily: fonts.display,
            fontSize: isCover ? 72 : 48,
            fontWeight: 700,
            color: isCover ? colors.accent : colors.structure,
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {headline}
        </h1>
      </div>

      {/* ── Content Zone (Center) ── */}
      {body && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 24,
            lineHeight: 1.6,
            color: colors.structure,
            opacity: 0.9,
          }}
        >
          <p style={{ margin: 0 }}>{body}</p>
        </div>
      )}

      {/* ── CTA Zone (only on final slide) ── */}
      {isCTA && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.accent,
            color: colors.background,
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 28,
            padding: '20px 40px',
            borderRadius: 12,
          }}
        >
          Comment "KEYWORD" to get the PDF →
        </div>
      )}

      {/* ── Footer: Handle + Page Number ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        {/* Handle — bottom left */}
        <span
          style={{
            fontSize: 16,
            opacity: 0.5,
            fontFamily: fonts.body,
          }}
        >
          {handle}
        </span>

        {/* Swipe arrow — center right (shown on non-final slides) */}
        {!isCTA && slideNumber < totalSlides && (
          <span
            style={{
              fontSize: 28,
              opacity: 0.4,
            }}
          >
            →
          </span>
        )}

        {/* Page number — bottom right */}
        <span
          style={{
            fontSize: 16,
            opacity: 0.5,
            fontFamily: fonts.body,
          }}
        >
          {slideNumber}/{totalSlides}
        </span>
      </div>
    </div>
  );
}
