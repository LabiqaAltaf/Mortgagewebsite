import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from './adminAuth.jsx'
import { Loading } from './ui.jsx'

export default function AdminLogin() {
  const { login, user, initializing } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (initializing) {
    return (
      <div className="admin admin-login">
        <Loading label="Loading…" />
      </div>
    )
  }
  if (user && user.role === 'admin') return <Navigate to="/admin" replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const loggedIn = await login(email, password, remember)
      if (loggedIn && loggedIn.role === 'admin') navigate('/admin', { replace: true })
      else navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to log in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin admin-login">
      <div className="login-card">
        <div className="login-brand">
          <span className="a-logo-mark" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
              <path d="M9 29 L15 11" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M15 11 L19 22 L23 11" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M23 11 L29 29" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="a-brand-text">
            <small>mainly</small>
            <strong>mortgages</strong>
          </span>
        </div>

        <div className="login-eyebrow">Admin Dashboard</div>
        <h1 className="login-title">Admin Login</h1>
        <p className="login-sub">Sign in with your administrator account to manage the site.</p>

        {error && (
          <div className="login-error">
            <i className="bi bi-exclamation-circle" /> {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <label className="a-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="a-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          <label className="a-check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Remember me</span>
          </label>

          <button className="a-btn a-btn-brand a-btn-block" disabled={busy}>
            {busy ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className="login-foot">Authorised administrators only. Normal website users cannot access this area.</p>
      </div>
    </div>
  )
}