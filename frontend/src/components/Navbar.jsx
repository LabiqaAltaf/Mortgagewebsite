import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../admin/adminAuth.jsx'

/**
 * Minimal premium navbar: logo mark + wordmark on the left; auth actions and
 * "Get Start Online" on the right. Visual style unchanged — only auth state
 * and CTA destination are functional.
 */
function Logo() {
  return (
    <Link className="site-logo" to="/" aria-label="mainly mortgages">
      <svg className="logo-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M9 29 L15 11" stroke="#1769FF" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M15 11 L19 22 L23 11" stroke="#1769FF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 11 L29 29" stroke="#1769FF" strokeWidth="3.4" strokeLinecap="round" />
      </svg>
      <span className="logo-word">
        <span className="logo-word-sub">mainly</span>
        <span className="logo-word-main">mortgages</span>
      </span>
    </Link>
  )
}

function displayName(user) {
  if (!user) return ''
  if (user.firstName) return user.firstName
  if (user.name) return user.name.split(' ')[0] || user.name
  return 'Account'
}

export default function Navbar() {
  const auth = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (!auth?.logout || loggingOut) return
    setLoggingOut(true)
    try {
      await auth.logout()
    } finally {
      setLoggingOut(false)
    }
  }

  const user = auth?.user
  const isAdmin = auth?.isAdmin
  const isUser = false
  const initializing = auth?.initializing

  return (
    <header className="site-nav">
      <div className="mw-container nav-inner">
        <Logo />
        <div className="nav-actions">
          {!initializing && isUser && (
            <>
              <span className="nav-user-name" title={user?.email || ''}>
                {displayName(user)}
              </span>
              <button
                type="button"
                className="nav-login nav-logout-btn"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? 'Logging out…' : 'Logout'}
              </button>
            </>
          )}

          {!initializing && isAdmin && (
            <>
              <Link to="/admin" className="nav-login">
                Dashboard
              </Link>
              <button
                type="button"
                className="nav-login nav-logout-btn"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? 'Logging out…' : 'Logout'}
              </button>
            </>
          )}

          {!initializing && !user && (
            <Link to="/login" className="nav-login">
              Log in
            </Link>
          )}

          <Link to="/apply" className="nav-cta">
            Get Start Online
          </Link>
        </div>
      </div>
    </header>
  )
}
