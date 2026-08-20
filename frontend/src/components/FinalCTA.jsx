import { finalCta, websiteImages } from '../data/websiteData.js'
import { Link } from 'react-router-dom'

/**
 * Final CTA: compact rounded card — property image on one side,
 * white content panel (heading, text, two pill buttons) on the other —
 * sitting on top of a full-width blue band that bleeds behind it.
 */
export default function FinalCTA() {
  return (
    <section className="section final-cta-section" id="contact">
      <div className="mw-container final-cta-wrap">
        <div className="cta-band" aria-hidden="true"></div>

        <div className="final-cta-card">
          <div className="cta-media">
            <img src={websiteImages.finalCTA} alt="Dream family home" loading="lazy" />
          </div>
          <div className="cta-content">
            <h2 className="cta-title">{finalCta.heading}</h2>
            <p className="cta-text">{finalCta.paragraph}</p>
            <div className="cta-actions">
              <Link to="/apply" className="btn btn-cta-primary">
                {finalCta.primaryCta.label}
              </Link>
              <Link to="/contact" className="btn btn-cta-secondary">
                {finalCta.secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}