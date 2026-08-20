import { useState } from 'react'
import { useWebsiteContent } from '../context/WebsiteContentContext.jsx'

export default function TrustSection() {
  const { reviews, reviewStats, aboutEntries } = useWebsiteContent()
  const [index, setIndex] = useState(0)
  const entries = Array.isArray(aboutEntries) && aboutEntries.length ? aboutEntries : [reviews]
  const entry = entries[index % entries.length] || reviews
  const move = (amount) => setIndex((current) => (current + amount + entries.length) % entries.length)

  return <section className='section review-section' id='about'>
    <div className='review-section-inner'>
      <div className='review-left'>
        <span className='google-review-label'>{reviews.eyebrow}</span>
        <div className='stats-list'>{reviewStats.map((stat, statIndex) => <div className='stat' key={stat._id || stat.label || statIndex}><div className='stat-value'>{stat.value}</div><div className='stat-label'>{stat.label}</div></div>)}</div>
      </div>
      <div className='review-right'>
        <div className='review-heading'><h2 className='sec-title google-reviews-title'><span className='review-title-line'>{entry.heading1 || ''}</span><span className='review-title-line'>{entry.heading2 || ''}</span></h2></div>
        <div className='review-description'><p className='sec-sub review-paragraph'>{entry.paragraph || ''}</p></div>
        <div className='review-client'><div className='review-name'>{entry.reviewerName || ''}</div><div className='review-location'>{entry.reviewerLocation || ''}</div></div>
        <div className='review-controls' aria-label='Review navigation'>
          <span className='review-chevron' role='button' tabIndex={0} onClick={() => move(-1)} onKeyDown={(event) => event.key === 'Enter' && move(-1)} aria-label='Previous review'>&lt;</span>
          <span className='review-chevron' role='button' tabIndex={0} onClick={() => move(1)} onKeyDown={(event) => event.key === 'Enter' && move(1)} aria-label='Next review'>&gt;</span>
        </div>
      </div>
    </div>
  </section>
}
