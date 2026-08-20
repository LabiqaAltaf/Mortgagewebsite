import { useWebsiteContent } from '../context/WebsiteContentContext.jsx'
import { Link } from 'react-router-dom'

/**
 * "What we do?" section — matches reference composition:
 * white background, centered container, aligned typography,
 * four feature words without cards/borders/icons/shadows,
 * two overlapping images, and a floating white CTA circle.
 */
export default function ApproachSection() {
  const { approachHeading, approachWords, websiteImages, approachCta } = useWebsiteContent()

  const ctaHref = (approachCta?.href || '/apply').trim() || '/apply'
  const ctaLabel = approachCta?.label || 'Get Start Online'

  /** Renders the CTA circle with the same styling for any destination type. */
  function renderCta() {
    if (ctaHref.startsWith('http://') || ctaHref.startsWith('https://')) {
      return (
        <a href={ctaHref} className="approach-cta-circle" target="_blank" rel="noopener noreferrer">
          {ctaLabel}
        </a>
      )
    }
    if (ctaHref.startsWith('#')) {
      return (
        <a href={ctaHref} className="approach-cta-circle">
          {ctaLabel}
        </a>
      )
    }
    return (
      <Link to={ctaHref} className="approach-cta-circle">
        {ctaLabel}
      </Link>
    )
  }

  return (
    <section className="section approach-section" id="approach">
      <div className="approach-container">
        <div className="approach-copy">
          <span className="approach-eyebrow">{approachHeading.eyebrow}</span>
          <p className="approach-lead">{approachHeading.paragraph}</p>
        </div>

        <div className="approach-words">
          {approachWords.map((word) => (
            <span className="approach-word" key={word.number}>
              <sup className="approach-word-num">{word.number}</sup> {word.label}
            </span>
          ))}
        </div>

        <div className="approach-images">
          <div className="composition-image composition-imageLeft">
            <img
              src={websiteImages.interiorLarge}
              alt=""
              loading="lazy"
            />
          </div>
          <div className="composition-image composition-imageRight">
            <img
              src={websiteImages.interiorSmall}
              alt=""
              loading="lazy"
            />
          </div>
          {renderCta()}
        </div>
      </div>
    </section>
  )
}