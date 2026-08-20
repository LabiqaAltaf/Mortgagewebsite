import { useRef, useState } from 'react'
import { testimonialsHeading, testimonials as fallbackTestimonials } from '../data/websiteData.js'
import usePublicList from '../hooks/usePublicList.js'
import { getTestimonialsPublic } from '../api/client.js'

/** Renders a row of filled star icons. */
function Stars({ count }) {
  return (
    <div className="t-stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <i key={i} className="bi bi-star-fill" />
      ))}
    </div>
  )
}

/**
 * Testimonials: heading plus a horizontally-scrolling row of client review
 * cards mapped from data. Prev/next arrows sit at the row's edges and
 * actually scroll the track (matching the reference carousel behaviour).
 */
export default function TestimonialsSection() {
  // Only verified + active testimonials are ever returned by the API;
  // falls back to the static defaults if the API/DB is unavailable.
  const testimonials = usePublicList(getTestimonialsPublic, fallbackTestimonials)
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)

  const scroll = (dir) => {
    const track = trackRef.current
    if (!track) return
    const cardEl = track.querySelector('.t-card-wrap')
    const step = cardEl ? cardEl.getBoundingClientRect().width + 20 : 300
    const maxIndex = testimonials.length - 1
    const nextIndex = Math.min(Math.max(index + dir, 0), maxIndex)
    setIndex(nextIndex)
    track.scrollTo({ left: nextIndex * step, behavior: 'smooth' })
  }

  return (
    <section className="section testimonials-section" id="reviews">
      <div className="mw-container">
        <div className="testimonials-head">
          <div className="testimonials-head-text">
            <h2 className="sec-title">{testimonialsHeading.heading}</h2>
          </div>
        </div>

        <div className="t-carousel">
          <button
            type="button"
            className="pg-arrow t-arrow t-arrow-left"
            aria-label="Previous testimonial"
            disabled={index === 0}
            onClick={() => scroll(-1)}
          >
            ‹
          </button>

          <div className="t-track" ref={trackRef}>
            {testimonials.map((item) => (
              <div className="t-card-wrap" key={item._id || item.name}>
                <div className="t-card">
                  <Stars count={item.rating} />
                  <p className="t-text">“{item.text}”</p>
                  <img className="t-avatar" src={item.avatar} alt={item.name} loading="lazy" />
                </div>
                <div className="t-person">
                  <div className="t-name">{item.name}</div>
                  <div className="t-info">{item.info}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="pg-arrow pg-arrow-active t-arrow t-arrow-right"
            aria-label="Next testimonial"
            disabled={index === testimonials.length - 1}
            onClick={() => scroll(1)}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  )
}