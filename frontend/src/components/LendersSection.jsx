import { lendersHeading, lenders as fallbackLenders } from '../data/websiteData.js'
import usePublicList from '../hooks/usePublicList.js'
import { getLendersPublic } from '../api/client.js'

/**
 * Lenders: heading plus a clean horizontal row of lender marks — a small
 * coloured icon next to the bold name, no button/pill background, matching
 * the reference design. Generic icons are used on purpose (not real bank
 * logos) since these are illustrative marks, not official trademarks.
 *
 * Data source: admin-managed lenders (active only), fetched from
 * GET /api/lenders/public. Falls back to the static defaults if the
 * API/DB is unavailable so the section is never blank.
 */
export default function LendersSection() {
  const lenders = usePublicList(getLendersPublic, fallbackLenders)

  return (
    <section className="section lenders-section">
      <div className="mw-container">
        <div className="lenders-head">
          <h2 className="sec-title">{lendersHeading.heading}</h2>
          <p className="sec-sub lender-head-sub">{lendersHeading.description}</p>
        </div>

        <div className="lenders-row">
          {lenders.map((lender) => (
            <span className="lender-item" key={lender._id || lender.name}>
              <i className={`bi ${lender.icon} lender-icon`} style={{ color: lender.color }} />
              {lender.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}