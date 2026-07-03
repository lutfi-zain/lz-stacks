/**
 * Presentation Slide Component Template
 *
 * Base JSX component for rendering premium 16:9 pitch deck slides via Satori.
 * Dimensions: 1920x1080 pixels (Full HD).
 * Optimized for clean layouts, high readability, and editorial pacing.
 */

const tokens = {
  colors: {
    background: '#ffffff', // Primary light theme canvas
    structure: '#111111',  // Body text and headings
    accent: '#0055ff',     // Focus indicator / accent
    neutralLight: '#f4f4f6', // Panel/card backgrounds
  },
  fonts: {
    display: 'Plus Jakarta Sans',
    body: 'Inter',
  },
};

/**
 * PresentationSlide — renders a 1920x1080 slide
 *
 * @param {object} props
 * @param {string} props.title - Slide main heading
 * @param {string} props.subtitle - Section/eyebrow tag (optional)
 * @param {string} props.body - Supporting paragraph text (optional)
 * @param {Array<object>} props.points - Bullet list or key value pairs (max 3 points recommended)
 * @param {string} props.handle - Slide footer reference (e.g., brand name)
 * @param {number} props.slideNumber - Current slide number
 * @param {number} props.totalSlides - Total slides in deck
 * @param {string} props.backgroundImage - Optional background image / subtle texture URL
 * @param {boolean} props.isDark - Toggle dark mode theme variant
 */
export function PresentationSlide({
  title,
  subtitle,
  body,
  points = [],
  handle = 'lz-stacks',
  slideNumber,
  totalSlides,
  backgroundImage,
  isDark = false,
}) {
  const { colors, fonts } = tokens;

  const bg = isDark ? '#09090b' : colors.background;
  const fg = isDark ? '#f4f4f5' : colors.structure;
  const cardBg = isDark ? '#18181b' : colors.neutralLight;
  const borderCol = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: 1920,
        height: 1080,
        backgroundColor: bg,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: fonts.body,
        color: fg,
        padding: 120,
        position: 'relative',
      }}
    >
      {/* ── Header Area ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 16,
        }}
      >
        {subtitle && (
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 4,
              color: colors.accent,
              fontFamily: fonts.display,
            }}
          >
            {subtitle}
          </span>
        )}

        <h1
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.15,
            margin: 0,
            fontFamily: fonts.display,
            maxWidth: '85%',
          }}
        >
          {title}
        </h1>
      </div>

      {/* ── Main Content Area ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: '100%',
          flexGrow: 1,
          marginTop: 60,
          marginBottom: 60,
        }}
      >
        {/* Left Side: Text Description */}
        {body && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: points.length > 0 ? '45%' : '90%',
              fontSize: 28,
              lineHeight: 1.6,
              opacity: 0.85,
            }}
          >
            <p style={{ margin: 0 }}>{body}</p>
          </div>
        )}

        {/* Right Side: Key Value / Multi-point Grid */}
        {points.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 40,
              width: body ? '50%' : '100%',
              height: '100%',
            }}
          >
            {points.slice(0, 3).map((pt, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  padding: 40,
                  backgroundColor: cardBg,
                  borderRadius: 16,
                  border: `1px solid ${borderCol}`,
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: 700,
                    color: colors.accent,
                    fontFamily: fonts.display,
                  }}
                >
                  {pt.metric || `0${idx + 1}`}
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 24, fontWeight: 700 }}>{pt.label}</span>
                  <span style={{ fontSize: 18, opacity: 0.7, lineHeight: 1.4 }}>{pt.desc}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer Area ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${borderCol}`,
          paddingTop: 30,
        }}
      >
        <span style={{ fontSize: 18, opacity: 0.5 }}>{handle}</span>

        {slideNumber && totalSlides && (
          <span style={{ fontSize: 18, opacity: 0.5, fontFamily: fonts.display }}>
            {String(slideNumber).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
          </span>
        )}
      </div>
    </div>
  );
}
