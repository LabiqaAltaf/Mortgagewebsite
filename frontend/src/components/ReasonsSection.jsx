import { useWebsiteContent } from '../context/WebsiteContentContext.jsx'

/**
 * Small abstract pastel "3D block" illustrations, one per reason, built as
 * inline SVG so no external image assets are required.
 */
function Illustration({ type }) {
  if (type === 'regulated') {
    return (
      <svg viewBox="0 0 200 150" className="reason-illustration" aria-hidden="true">
        <rect x="30" y="90" width="70" height="14" rx="7" fill="#bcdcff" />
        <rect x="46" y="60" width="14" height="34" rx="4" fill="#8ec3ff" />
        <rect x="70" y="50" width="14" height="44" rx="4" fill="#1769ff" />
        <circle cx="140" cy="70" r="26" fill="#dceaff" />
        <path d="M128 78 L140 58 L152 78 Z" fill="#4a90ff" />
      </svg>
    )
  }
  if (type === 'happen') {
    return (
      <svg viewBox="0 0 200 150" className="reason-illustration" aria-hidden="true">
        <rect x="40" y="70" width="120" height="16" rx="8" fill="#dcefe6" />
        <rect x="60" y="40" width="18" height="34" rx="5" fill="#9fd6bd" />
        <rect x="90" y="30" width="18" height="44" rx="5" fill="#6fb99a" />
        <rect x="120" y="50" width="18" height="24" rx="5" fill="#bfe6d3" />
        <circle cx="70" cy="100" r="10" fill="#ff8fab" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 200 150" className="reason-illustration" aria-hidden="true">
      <circle cx="100" cy="75" r="34" fill="none" stroke="#ffb0c8" strokeWidth="16" />
      <circle cx="100" cy="75" r="10" fill="#8ec3ff" />
      <path d="M60 105 L46 118" stroke="#1769ff" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Reasons: two-line underlined heading, then three feature cards —
 * one full-width card (text + image side by side) followed by two half-width
 * stacked cards (text on top, image below).
 */
export default function ReasonsSection() {
  const { reasonsHeading, reasons } = useWebsiteContent()
  const [wide, ...stacked] = reasons

  return (
    <section className="section reasons-section" id="services">
      <div className="mw-container">
        <div className="reasons-head">
          <h2 className="sec-title">
            <span className="steps-heading-light">{reasonsHeading.heading1}</span>
            <span className="line-break">
              <span className="steps-highlight">{reasonsHeading.heading2}</span>
            </span>
          </h2>
        </div>

        <div className="reasons-grid">
          <div className="reason-card reason-card-wide">
            <div className="reason-text">
              <h3>{wide.title}</h3>
              <p>{wide.description}</p>
              <a href={wide.cta.href} className="reason-link">
                {wide.cta.label}
              </a>
            </div>
            <div className="reason-media">
              <Illustration type={wide.illustration} />
            </div>
          </div>

          {stacked.map((reason) => (
            <div className="reason-card reason-card-stacked" key={reason.title}>
              <div className="reason-text">
                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
                <a href={reason.cta.href} className="reason-link">
                  {reason.cta.label}
                </a>
              </div>
              <div className="reason-media">
                <Illustration type={reason.illustration} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}