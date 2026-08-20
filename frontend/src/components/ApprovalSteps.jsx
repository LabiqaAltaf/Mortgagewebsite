import { useWebsiteContent } from '../context/WebsiteContentContext.jsx'
import { Link } from 'react-router-dom'

/**
 * Approval process: heading + supporting paragraph + CTA on the left side,
 * and three compact step cards stacked vertically on the right side.
 */
export default function ApprovalSteps() {
  const { stepsHeading, steps } = useWebsiteContent()

  return (
    <section className="section steps-section" id="steps">
      <div className="mw-container">
        <div className="row g-5">
          <div className="col-lg-5 col-md-12">
            <div className="steps-intro">
              <span className="eyebrow steps-chip">{stepsHeading.eyebrow}</span>
              <h2 className="sec-title">
                <span className="steps-heading-light">{stepsHeading.heading1}</span>
                <span className="line-break">
                  <span className="steps-highlight">{stepsHeading.heading2}</span>
                  <span className="steps-check" aria-hidden="true">✅</span>
                </span>
              </h2>
              <p className="sec-sub">{stepsHeading.description}</p>
              <div className="mt-4">
                <Link to="/apply" className="btn btn-brand">
                  {stepsHeading.cta.label}
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-7 col-md-12">
            <div className="steps-right">
              {steps.map((step) => (
                <div className="step-card" key={step.number}>
                  <div className="step-icon">
                    <i className={`bi ${step.icon}`} />
                  </div>
                  <div className="step-body">
                    <span className="step-num">{step.number}</span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}