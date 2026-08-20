import { useWebsiteContent } from '../context/WebsiteContentContext.jsx'

/**
 * Bad Credit: full-width bright blue rounded banner with a small white logo,
 * a compact heading + subheading, two rows of pill tags and subtle abstract
 * decorative circles. Matches the reference template exactly.
 */
export default function BadCreditBanner() {
  const { badCredit } = useWebsiteContent()

  return (
    <section className="badcredit-section">
      <div className="mw-container">
        <div className="badcredit-banner">
          <span className="deco" aria-hidden="true" />

          <a className="bc-logo" href="#home" aria-label="mainly mortgages">
            <svg className="bc-logo-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path d="M9 29 L15 11" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M15 11 L19 22 L23 11" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M23 11 L29 29" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
            </svg>
            <span className="bc-logo-word">
              <span className="bc-logo-word-sub">mainly</span>
              <span className="bc-logo-word-main">mortgages</span>
            </span>
          </a>

          <h2 className="bc-title">{badCredit.heading}</h2>
          <p className="bc-text">{badCredit.subheading}</p>

          <div className="bc-tags">
            {badCredit.tagRows.map((row, i) => (
              <div className="bc-tag-row" key={i}>
                {row.map((tag) => (
                  <span className="bc-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}