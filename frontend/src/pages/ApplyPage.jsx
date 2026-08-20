import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { submitApplication } from '../api/client.js'

const MORTGAGE_TYPES = [
  { value: 'buying', label: 'Buying a property', icon: 'bi-house' },
  { value: 'remortgaging', label: 'Remortgaging', icon: 'bi-arrow-repeat' },
  { value: 'buy-to-let', label: 'Buy-to-let', icon: 'bi-key' },
  { value: 'not-sure', label: "I'm not sure yet", icon: 'bi-question-circle' },
]

const EMPLOYMENT_OPTIONS = [
  'Employed (full time)',
  'Employed (part time)',
  'Self-employed',
  'Contractor',
  'Company director',
  'Retired',
  'Other',
]

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  mortgageType: 'buying',
  postcode: '',
  propertyValue: '',
  mortgageAmount: '',
  deposit: '',
  employmentStatus: '',
  employerName: '',
  annualIncome: '',
  details: '',
}

const STEPS = [
  { n: '1', title: 'Tell us about you', text: 'Your contact details so a dedicated expert can reach you.' },
  { n: '2', title: 'Your property & mortgage', text: 'The amount you need and rough property value.' },
  { n: '3', title: 'Your income', text: 'How you earn so we match the right lender.' },
  { n: '4', title: 'Leave the rest to us', text: 'We handle the criteria check and application.' },
]

export default function ApplyPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.fullName.trim() || form.fullName.trim().length < 2) next.fullName = 'Please enter your full name.'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = 'Please enter a valid email address.'
    if (!form.phone.trim() || form.phone.trim().length < 6) next.phone = 'Please enter a valid phone number.'
    if (!form.postcode.trim()) next.postcode = 'Please enter your postcode (optional but helpful).'
    if (form.propertyValue && Number(form.propertyValue) <= 0) next.propertyValue = 'Property value must be positive.'
    if (form.mortgageAmount && Number(form.mortgageAmount) <= 0) next.mortgageAmount = 'Amount must be positive.'
    if (form.deposit && Number(form.deposit) <= 0) next.deposit = 'Deposit must be positive.'
    if (form.annualIncome && Number(form.annualIncome) <= 0) next.annualIncome = 'Income must be positive.'
    return next
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'submitting') return // prevent accidental double submit
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      setStatus('idle')
      setServerError('')
      return
    }
    setServerError('')
    setStatus('submitting')
    try {
      await submitApplication(form)
      setStatus('success')
      setForm(EMPTY_FORM)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setStatus('error')
      setServerError(err.message || 'Something went wrong. Please try again.')
    }
  }

  const fieldError = (name) => (errors[name] ? <span className="gs-error-text">{errors[name]}</span> : null)
return (
    <>
      <Navbar />
      <div className="gs-page">
        <section className="gs-hero">
          <div className="mw-container">
            <Link to="/" className="gs-back">
              <i className="bi bi-arrow-left" /> Back to home
            </Link>
            <p className="eyebrow">Get Started Online</p>
            <h1 className="gs-title">Start your mortgage journey</h1>
            <p className="gs-sub">
              Tell us a little about you and your plans. A dedicated UK mortgage expert will review
              your details and come back to you with your options — no jargon, no obligation.
            </p>
          </div>
        </section>

        <section className="gs-steps">
          <div className="mw-container">
            {STEPS.map((s) => (
              <div className="gs-step" key={s.n}>
                <span className="gs-step-num">{s.n}</span>
                <div className="gs-step-body">
                  <strong>{s.title}</strong>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {status === 'success' && (
          <section className="gs-success">
            <div className="gs-success-card">
              <div className="gs-success-ic">
                <i className="bi bi-check-lg" />
              </div>
              <h2>Application received</h2>
              <p>
                Thank you, <strong>{form.fullName || 'there'}</strong>. Your enquiry has been safely
                received and one of our mortgage experts will be in touch shortly.
              </p>
              <Link to="/" className="btn-hero-primary">
                Back to homepage
              </Link>
            </div>
          </section>
        )}

        {status !== 'success' && (
          <section className="gs-form-wrap">
            <div className="mw-container gs-form-inner">
              {status === 'error' && (
                <div className="gs-alert gs-alert-error" role="alert">
                  <i className="bi bi-exclamation-circle" /> {serverError}
                </div>
              )}

              <form className="gs-form" onSubmit={onSubmit} noValidate>
                <fieldset className="gs-section" disabled={status === 'submitting'}>
                  <legend className="gs-fieldset-title">
                    <span className="gs-fieldset-num">1</span> Your details
                  </legend>
                  <div className="gs-grid">
                    <label className="gs-field">
                      <span>
                        Full name <b className="gs-req">*</b>
                      </span>
                      <input
                        name="fullName"
                        value={form.fullName}
                        onChange={onChange}
                        placeholder="e.g. Jamie Taylor"
                        autoComplete="name"
                      />
                      {fieldError('fullName')}
                    </label>
                    <label className="gs-field">
                      <span>
                        Email <b className="gs-req">*</b>
                      </span>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                      {fieldError('email')}
                    </label>
                    <label className="gs-field">
                      <span>
                        Phone <b className="gs-req">*</b>
                      </span>
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={onChange}
                        placeholder="07xxx xxxxxx"
                        autoComplete="tel"
                      />
                      {fieldError('phone')}
                    </label>
                    <label className="gs-field">
                      <span>Postcode</span>
                      <input
                        name="postcode"
                        value={form.postcode}
                        onChange={onChange}
                        placeholder="e.g. SW1A 1AA"
                        autoComplete="postal-code"
                      />
                      {fieldError('postcode')}
                    </label>
                  </div>
                </fieldset>
<fieldset className="gs-section" disabled={status === 'submitting'}>
                  <legend className="gs-fieldset-title">
                    <span className="gs-fieldset-num">2</span> Property & mortgage
                  </legend>
                  <p className="gs-field-hint">What are you planning to do?</p>
                  <div className="gs-types">
                    {MORTGAGE_TYPES.map((t) => (
                      <button
                        type="button"
                        key={t.value}
                        className={`gs-type${form.mortgageType === t.value ? ' is-active' : ''}`}
                        onClick={() => setForm((p) => ({ ...p, mortgageType: t.value }))}
                      >
                        <i className={`bi ${t.icon}`} />
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="gs-grid gs-grid-3">
                    <label className="gs-field">
                      <span>Property value (£)</span>
                      <input
                        name="propertyValue"
                        type="number"
                        min="0"
                        value={form.propertyValue}
                        onChange={onChange}
                        placeholder="e.g. 250000"
                      />
                      {fieldError('propertyValue')}
                    </label>
                    <label className="gs-field">
                      <span>Mortgage amount (£)</span>
                      <input
                        name="mortgageAmount"
                        type="number"
                        min="0"
                        value={form.mortgageAmount}
                        onChange={onChange}
                        placeholder="e.g. 200000"
                      />
                      {fieldError('mortgageAmount')}
                    </label>
                    <label className="gs-field">
                      <span>Deposit (£)</span>
                      <input
                        name="deposit"
                        type="number"
                        min="0"
                        value={form.deposit}
                        onChange={onChange}
                        placeholder="e.g. 50000"
                      />
                      {fieldError('deposit')}
                    </label>
                  </div>
                </fieldset>

                <fieldset className="gs-section" disabled={status === 'submitting'}>
                  <legend className="gs-fieldset-title">
                    <span className="gs-fieldset-num">3</span> Employment & income
                  </legend>
                  <div className="gs-grid gs-grid-3">
                    <label className="gs-field">
                      <span>Employment status</span>
                      <select name="employmentStatus" value={form.employmentStatus} onChange={onChange}>
                        <option value="">Select…</option>
                        {EMPLOYMENT_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="gs-field">
                      <span>Employer / company</span>
                      <input
                        name="employerName"
                        value={form.employerName}
                        onChange={onChange}
                        placeholder="Employer name"
                      />
                    </label>
                    <label className="gs-field">
                      <span>Annual income (£)</span>
                      <input
                        name="annualIncome"
                        type="number"
                        min="0"
                        value={form.annualIncome}
                        onChange={onChange}
                        placeholder="e.g. 35000"
                      />
                      {fieldError('annualIncome')}
                    </label>
                  </div>
                </fieldset>

                <fieldset className="gs-section" disabled={status === 'submitting'}>
                  <legend className="gs-fieldset-title">
                    <span className="gs-fieldset-num">4</span> Anything else?
                  </legend>
                  <label className="gs-field">
                    <span>Tell us about your situation (optional)</span>
                    <textarea
                      name="details"
                      rows={4}
                      value={form.details}
                      onChange={onChange}
                      placeholder="Adverse credit, self-employed history, previous refusals, or anything you'd like us to know…"
                    />
                  </label>
                </fieldset>

                <div className="gs-submit-row">
                  <p className="gs-legal">
                    Your home may be repossessed if you do not keep up repayments on your mortgage.
                    Submitting does not affect your credit score.
                  </p>
                  <button type="submit" className="btn-hero-primary gs-submit" disabled={status === 'submitting'}>
                    {status === 'submitting' ? (
                      <>
                        <span className="gs-spinner" aria-hidden="true" /> Submitting…
                      </>
                    ) : (
                      <>
                        Submit my enquiry <i className="bi bi-arrow-right" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
