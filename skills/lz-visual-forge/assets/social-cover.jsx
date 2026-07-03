/**
 * Social Cover Component Template
 *
 * Base JSX component for rendering post cover images via Satori.
 * Supports multiple platform dimensions via a `platform` prop.
 * The agent adapts this template per-project using tokens from DESIGN-SYSTEM.md.
 */

// --- Design Tokens (read from DESIGN-SYSTEM.md) ---
const tokens = {
  colors: {
    background: '#1a1a2e',
    structure: '#e2e2e2',
    accent: '#00d4ff',
  },
  fonts: {
    display: 'Space Grotesk',
    body: 'Inter',
  },
};

// --- Platform Dimensions ---
const platformDimensions = {
  instagram: { width: 1080, height: 1350 },   // 4:5 portrait
  'instagram-square': { width: 1080, height: 1080 }, // 1:1
  'instagram-story': { width: 1080, height: 1920 },  // 9:16
  linkedin: { width: 1080, height: 1350 },    // 4:5 document
  'linkedin-link': { width: 1200, height: 627 },     // 1.91:1 link preview
  twitter: { width: 1600, height: 900 },      // 16:9
};

/**
 * SocialCover — renders a post cover image
 *
 * @param {object} props
 * @param {string} props.platform - Target platform key from platformDimensions
 * @param {string} props.headline - Main headline text
 * @param {string} props.subheadline - Supporting text (optional)
 * @param {string} props.tag - Series or category tag (optional)
 * @param {string} props.handle - Creator's social handle
 * @param {string} props.backgroundImage - URL to a diffusion-generated background
 * @param {string} props.accentColor - Override accent color (optional)
 */
export function SocialCover({
  platform = 'instagram',
  headline,
  subheadline,
  tag,
  handle = '@username',
  backgroundImage,
  accentColor,
}) {
  const { colors, fonts } = tokens;
  const dims = platformDimensions[platform] || platformDimensions.instagram;
  const accent = accentColor || colors.accent;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: dims.width,
        height: dims.height,
        padding: 80,
        backgroundColor: colors.background,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: fonts.body,
        color: colors.structure,
        position: 'relative',
      }}
    >
      {/* Overlay for readability when using background image */}
      {backgroundImage && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
          }}
        />
      )}

      {/* Series Tag */}
      {tag && (
        <div
          style={{
            display: 'flex',
            fontSize: 18,
            fontWeight: 600,
            fontFamily: fonts.body,
            color: accent,
            textTransform: 'uppercase',
            letterSpacing: 3,
            marginBottom: 24,
          }}
        >
          {tag}
        </div>
      )}

      {/* Headline */}
      <h1
        style={{
          fontFamily: fonts.display,
          fontSize: Math.min(72, dims.width / 15),
          fontWeight: 700,
          color: colors.structure,
          lineHeight: 1.1,
          margin: 0,
          marginBottom: 20,
          maxWidth: '90%',
        }}
      >
        {headline}
      </h1>

      {/* Subheadline */}
      {subheadline && (
        <p
          style={{
            fontSize: 24,
            lineHeight: 1.5,
            color: colors.structure,
            opacity: 0.75,
            margin: 0,
            maxWidth: '80%',
          }}
        >
          {subheadline}
        </p>
      )}

      {/* Handle — bottom left */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 80,
          fontSize: 16,
          opacity: 0.4,
          fontFamily: fonts.body,
        }}
      >
        {handle}
      </div>

      {/* Accent bar — bottom edge */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: accent,
        }}
      />
    </div>
  );
}
