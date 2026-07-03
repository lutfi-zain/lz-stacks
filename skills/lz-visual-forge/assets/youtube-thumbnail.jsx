/**
 * YouTube Thumbnail Component Template
 *
 * Base JSX component for rendering high-impact YouTube thumbnails via Satori.
 * Aspect ratio: 1280x720 (16:9 ratio).
 * Optimized for high click-through rates (CTR) with readability and branding.
 */

const tokens = {
  colors: {
    background: '#0a0a0c', // OLED-adjacent dark background
    structure: '#ffffff',  // Primary text
    accent: '#ff0055',     // High-energy accent color
    neutralBg: '#1e1e24',  // Card background
  },
  fonts: {
    display: 'Space Grotesk',
    body: 'Inter',
  },
};

/**
 * YouTubeThumbnail — renders a 1280x720 thumbnail
 *
 * @param {object} props
 * @param {string} props.title - Heavy display title (max 3-4 words recommended)
 * @param {string} props.subtitle - Context tag or small descriptor (optional)
 * @param {string} props.category - Category badge text (optional)
 * @param {string} props.heroImage - URL to main visual subject (e.g., photo cutout, screenshot)
 * @param {string} props.brandLogo - URL to brand/creator icon
 * @param {string} props.backgroundImage - Optional background pattern/mesh gradient URL
 */
export function YouTubeThumbnail({
  title,
  subtitle,
  category,
  heroImage,
  brandLogo,
  backgroundImage,
}) {
  const { colors, fonts } = tokens;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 1280,
        height: 720,
        backgroundColor: colors.background,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'radial-gradient(circle at 10% 20%, rgba(255, 0, 85, 0.15) 0%, transparent 50%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: fonts.body,
        color: colors.structure,
        padding: 60,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Left Content: Typography Block ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '55%',
          height: '100%',
          zIndex: 2,
        }}
      >
        {/* Category Pill */}
        {category && (
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 0, 85, 0.1)',
              border: `1px solid ${colors.accent}`,
              borderRadius: 30,
              padding: '6px 16px',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: fonts.display,
              color: colors.accent,
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 20,
            }}
          >
            {category}
          </div>
        )}

        {/* Main Title - Massive Scale for Readability on Mobile */}
        <h1
          style={{
            fontFamily: fonts.display,
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            color: colors.structure,
            margin: 0,
            marginBottom: 20,
            textShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </h1>

        {/* Subtitle / Context Label */}
        {subtitle && (
          <p
            style={{
              fontSize: 24,
              color: colors.structure,
              opacity: 0.8,
              margin: 0,
              fontWeight: 500,
              lineHeight: 1.4,
              maxWidth: '90%',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* ── Right Content: Hero Image / Visual Anchor ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '40%',
          height: '100%',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {heroImage ? (
          <img
            src={heroImage}
            alt="Hero Subject"
            style={{
              maxHeight: '90%',
              maxWidth: '100%',
              objectFit: 'contain',
              borderRadius: 24,
              border: '2px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          />
        ) : (
          // Placeholder Graphic System (e.g., Code window)
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: 380,
              backgroundColor: colors.neutralBg,
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Window Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                backgroundColor: 'rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27c93f' }} />
            </div>
            {/* Mock Code Body */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: 24,
                fontFamily: 'monospace',
                fontSize: 16,
                color: '#a9b1d6',
              }}
            >
              <span style={{ color: '#f7768e' }}>const <span style={{ color: '#7aa2f7' }}>Forge</span> = () =&gt; &#123;</span>
              <span style={{ paddingLeft: 20, color: '#e0af68' }}>return (</span>
              <span style={{ paddingLeft: 40, color: '#9ece6a' }}>&lt;<span style={{ color: '#f7768e' }}>PixelPerfect</span> /&gt;</span>
              <span style={{ paddingLeft: 20, color: '#e0af68' }}>);</span>
              <span style={{ color: '#f7768e' }}>&#125;;</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Brand Logo / Watermark ── */}
      {brandLogo && (
        <img
          src={brandLogo}
          alt="Brand Logo"
          style={{
            position: 'absolute',
            bottom: 40,
            left: 60,
            height: 32,
            opacity: 0.6,
            zIndex: 3,
          }}
        />
      )}
    </div>
  );
}
