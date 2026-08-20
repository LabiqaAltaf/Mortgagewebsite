import { useParams, Link } from 'react-router-dom'
import { experts as fallbackExperts } from '../data/websiteData.js'
import usePublicList from '../hooks/usePublicList.js'
import { getTeamPublic } from '../api/client.js'
import Navbar from '../components/Navbar.jsx'
import FinalCTA from '../components/FinalCTA.jsx'

/**
 * Expert / Advisor detail page.
 *
 * Reached by clicking any card in the "Meet Our Mortgage Experts" section
 * (previously those cards weren't clickable and didn't lead anywhere).
 * Uses the same admin-managed team data (with the same static fallback)
 * as the homepage section, so it always matches what's shown there.
 */
export default function ExpertDetailPage() {
  const { id } = useParams()
  const experts = usePublicList(getTeamPublic, fallbackExperts)
  // "id" is either a Mongo _id (admin-managed data) or a plain array index
  // (static fallback data), so match on whichever applies.
  const expert = experts.find((e) => e._id === id) || experts[Number(id)]

  if (!expert) {
    return (
      <>
        <Navbar />
        <section className="section">
          <div className="mw-container expert-detail-notfound">
            <h1 className="sec-title">Advisor not found</h1>
            <p className="expert-detail-bio">
              We couldn't find the advisor you're looking for.
            </p>
            <Link to="/" className="btn-hero-primary">
              Back To Home
            </Link>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <Navbar />

      <section className="section expert-detail-section">
        <div className="mw-container">
          <Link to="/#team" className="expert-detail-back">
            &larr; Back To Our Team
          </Link>

          <div className="expert-detail-grid">
            <div className="expert-detail-photo">
              <img src={expert.image} alt={expert.name} />
            </div>

            <div className="expert-detail-info">
              <span className="eyebrow">Mortgage Expert</span>
              <h1 className="sec-title expert-detail-name">{expert.name}</h1>
              <p className="expert-detail-role">{expert.role}</p>

              <p className="expert-detail-bio">
                {expert.description || (
                  <>
                    {expert.name} is a trusted member of our mortgage team,
                    helping clients navigate {expert.role.toLowerCase()} matters
                    with clear, honest advice. Whether you're a first-time buyer,
                    remortgaging, or dealing with a more complex case, {expert.name.split(' ')[0]}{' '}
                    works closely with you from application to approval, making
                    sure you understand every step and always get a straight
                    answer.
                  </>
                )}
              </p>

              <ul className="expert-detail-highlights">
                <li>
                  <i className="bi bi-patch-check-fill" /> FCA-regulated advice
                </li>
                <li>
                  <i className="bi bi-people-fill" /> Works with straightforward
                  and complex cases alike
                </li>
                <li>
                  <i className="bi bi-chat-dots-fill" /> Clear communication,
                  start to finish
                </li>
              </ul>

              <div className="expert-detail-actions">
                <Link to="/apply" className="btn-hero-primary">
                  Get Start Online
                </Link>
                <Link to="/contact" className="btn-hero-secondary">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  )
}