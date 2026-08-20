import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './adminAuth.jsx'
import { Loading } from './ui.jsx'

/**
 * Guards the /admin layout. Redirects to login when unauthenticated and shows
 * an Access Denied page for non-admin accounts. The backend independently
 * enforces admin-only on every admin API route.
 */
export default function RequireAdmin({ children }) {
  const { user, initializing } = useAuth()

  if (initializing) {
    return (
      <div className="admin auth-preloader">
        <Loading label="Checking session…" />
      </div>
    )
  }

  if (!user) return <Navigate to="/admin/login" replace />

  if (user.role !== 'admin') {
    return <AccessDenied />
  }

  return children
}

function AccessDenied() {
  const navigate = useNavigate()
  return (
    <div className="admin access-denied">
      <div className="access-denied-card">
        <div className="access-denied-icon">
          <i className="bi bi-shield-lock" />
        </div>
        <h1>Access Denied</h1>
        <p>Your account does not have administrator permission to view this area.</p>
        <button className="a-btn a-btn-brand" onClick={() => navigate('/')}>
          Go to the public website
        </button>
      </div>
    </div>
  )
}