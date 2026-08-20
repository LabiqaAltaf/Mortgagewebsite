import { Link } from 'react-router-dom'
import { expertsHeading, experts as fallbackExperts } from '../data/websiteData.js'
import usePublicList from '../hooks/usePublicList.js'
import { getTeamPublic } from '../api/client.js'

/**
 * Experts: light-blue section with a heading and a grid of professional
 * headshots mapped from the experts array (4 per row on desktop).
 *
 * Data source: admin-managed team members (active only), fetched from
 * GET /api/team/public. Falls back to the static defaults if the API/DB
 * is unavailable so the section is never blank.
 */
export default function ExpertsSection() {
  const experts = usePublicList(getTeamPublic, fallbackExperts)

  return (
    <section className="section experts-section" id="team">
      <div className="mw-container">
        <div className="experts-head">
          <div className="experts-head-text">
            <span className="eyebrow">{expertsHeading.eyebrow}</span>
            <h2 className="sec-title">{expertsHeading.heading}</h2>
          </div>
          <div className="experts-pagination">
            <button type="button" className="pg-arrow" aria-label="Previous">‹</button>
            <span className="pg-count">1/{experts.length}</span>
            <button type="button" className="pg-arrow pg-arrow-active" aria-label="Next">›</button>
          </div>
        </div>

        <div className="row g-4 experts-grid">
          {experts.map((expert, index) => (
            <div className="col-lg-3 col-md-6 col-12" key={expert._id || expert.name}>
              <Link to={`/expert/${expert._id || index}`} className="expert-card">
                <div className="expert-photo">
                  <img src={expert.image} alt={expert.name} loading="lazy" />
                </div>
                <h3>{expert.name}</h3>
                <p className="expert-role">{expert.role}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}