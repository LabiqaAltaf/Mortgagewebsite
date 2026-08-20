import { Link } from 'react-router-dom'
import { useWebsiteContent } from '../context/WebsiteContentContext.jsx'

/**
 * Hero - one composed section.
 * Content (copy, CTAs, image) comes from WebsiteContentContext / admin.
 */
function Scribble() {
  return (
    <svg
      className="hero-scribble"
      viewBox="0 0 64 40"
      width="64"
      height="40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 34 C 22 8, 40 6, 58 12"
        stroke="#1769FF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M46 8 C 52 8, 55 11, 55 16 C 55 23, 50 30, 44 31"
        stroke="#1769FF"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Render CTA as internal Link, external URL, or in-page hash anchor. */
function HeroCta({ cta, className, fallbackTo = '/apply', fallbackLabel = 'Get Start Online' }) {
  const label = cta?.label || fallbackLabel
  const href = (cta?.href || fallbackTo || '#').trim() || fallbackTo

  if (href.startsWith('http://') || href.startsWith('https://')) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    )
  }

  if (href.startsWith('#')) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    )
  }

  return (
    <Link to={href} className={className}>
      {label}
    </Link>
  )
}

export default function Hero() {
  const { hero, websiteImages } = useWebsiteContent()
  // Admin-configured hero image takes priority; falls back to the static
  // default so the hero never renders blank before/without an admin save.
  const heroImage = hero?.image || websiteImages?.hero || ''

  return (
    <section className="hero" id="home">
      <div className="hero-inner">
        <h1 className="hero-title">
          <span className="hero-title-line hero-title-light">
            {hero.heading1}
          </span>
          <span className="hero-title-line hero-line-two hero-title-heavy">
            <span className="hero-highlight">{hero.heading2}</span>
            <Scribble />
          </span>
        </h1>

        <p className="hero-sub">{hero.description}</p>

        <div className="hero-actions">
          <HeroCta
            cta={hero.primaryCta}
            className="btn-hero-primary"
            fallbackTo="/apply"
            fallbackLabel="Get Start Online"
          />
          <HeroCta
            cta={hero.secondaryCta}
            className="btn-hero-secondary"
            fallbackTo="#about"
            fallbackLabel="Learn More"
          />
        </div>
      </div>

      <div className="hero-visual">
        <img
          src={heroImage}
          alt="Three modern wooden houses with large windows and greenery"
          loading="eager"
        />
      </div>
    </section>
  )
}
