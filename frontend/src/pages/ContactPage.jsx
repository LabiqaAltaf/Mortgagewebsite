import { useState } from 'react'
import { Link } from 'react-router-dom'
import { submitContactMessage } from '../api/client.js'

const EMPTY_FORM = { name: '', email: '', phone: '', subject: '', message: '' }

/**
 * Simple Bootstrap-only contact page — submits to the existing
 * POST /api/contact endpoint, which creates a MongoDB ContactMessage
 * record, a Notification, and shows up in the Admin Dashboard.
 */
export default function ContactPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')
    try {
      await submitContactMessage({ ...form, sourcePage: '/contact' })
      setStatus('success')
      setForm(EMPTY_FORM)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: '640px' }}>
      <Link to="/" className="d-inline-block mb-4 text-decoration-none">
        &larr; Back to home
      </Link>

      <h1 className="h3 mb-1">Get In Touch</h1>
      <p className="text-muted mb-4">Have a question? Send us a message and we'll get back to you.</p>

      {status === 'success' && (
        <div className="alert alert-success" role="alert">
          Thanks! Your message has been sent — we'll be in touch soon.
        </div>
      )}

      {status === 'error' && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name *</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={form.name}
            onChange={onChange}
            required
            minLength={2}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email *</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone</label>
          <input
            type="tel"
            className="form-control"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="subject" className="form-label">Subject</label>
          <input
            type="text"
            className="form-control"
            id="subject"
            name="subject"
            value={form.subject}
            onChange={onChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="message" className="form-label">Message *</label>
          <textarea
            className="form-control"
            id="message"
            name="message"
            rows="4"
            value={form.message}
            onChange={onChange}
            required
            minLength={10}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary px-4"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  )
}
