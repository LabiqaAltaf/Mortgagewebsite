import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './adminAuth.jsx'
import { ToastProvider } from './ui.jsx'
import * as api from '../api/client.js'
import { timeAgo, initials } from './format.js'

// Shares the live notification badge + recent notifications with child pages.
const NotifCtx = createContext({ unreadCount: 0, recent: [], refresh: () => {} })
export const useAdminNotifs = () => useContext(NotifCtx)

function NotificationsController({ children }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [recent, setRecent] = useState([])

  const refresh = useCallback(async () => {
    try {
      const res = await api.listNotifications({ page: 1, limit: 8 })
      setUnreadCount(res.unreadCount || 0)
      setRecent(res.data || [])
    } catch {
      // silent - polling retries shortly
    }
  }, [])

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 30000)
    return () => clearInterval(t)
  }, [refresh])

  return <NotifCtx.Provider value={{ unreadCount, recent, refresh }}>{children}</NotifCtx.Provider>
}

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'bi-speedometer2', end: true },
  { to: '/admin/home', label: 'Home', icon: 'bi-house' },
  { to: '/admin/applications', label: 'Applications', icon: 'bi-folder2-open' },
  { to: '/admin/contacts', label: 'Contacts', icon: 'bi-envelope' },
  { to: '/admin/messages', label: 'Messages', icon: 'bi-chat-left-text' },
  { to: '/admin/users', label: 'Users', icon: 'bi-people' },
  { to: '/admin/notifications', label: 'Notifications', icon: 'bi-bell' },
  { to: '/admin/testimonials', label: 'Client Messages', icon: 'bi-chat-quote' },
  { to: '/admin/team', label: 'Team / Experts', icon: 'bi-people-fill' },
  { to: '/admin/content', label: 'Website Content', icon: 'bi-file-earmark-text' },
  { to: '/admin/audit', label: 'Activity / Audit Logs', icon: 'bi-clock-history' },
  { to: '/admin/settings', label: 'Settings', icon: 'bi-gear' },
]

const TITLES = {
  '/home': 'Home',
  '/applications': 'Applications',
  '/contacts': 'Contacts',
  '/users': 'Users',
  '/notifications': 'Notifications',
  '/testimonials': 'Client Messages',
  '/messages': 'Messages',
  '/team': 'Team / Experts',
  '/content': 'Website Content',
  '/audit': 'Activity / Audit Logs',
  '/settings': 'Settings',
  '/profile': 'Admin Profile',
}

function NotificationBell() {
  const { unreadCount, recent, refresh } = useAdminNotifs()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const openNotification = async (n) => {
    if (!n.read) {
      try {
        await api.markNotificationRead(n._id)
        refresh()
      } catch {
        /* keep browsing */
      }
    }
    setOpen(false)
    let path = '/admin/notifications'
    if (n.type === 'application' && n.relatedId) path = `/admin/applications/${n.relatedId}`
    else if (n.type === 'contact' && n.relatedId) path = `/admin/contacts/${n.relatedId}`
    else if (n.type === 'user' && n.relatedId) path = `/admin/users/${n.relatedId}`
    navigate(path)
  }

  const icon =
    (t) =>
      t === 'application'
        ? 'bi-folder2-open'
        : t === 'contact'
          ? 'bi-envelope'
          : t === 'user'
            ? 'bi-person-plus'
            : 'bi-bell'

  return (
    <div className="a-bell">
      <button className="a-icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        <i className="bi bi-bell" />
        {unreadCount > 0 && <span className="a-bell-dot">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>
      {open && (
        <div className="a-bell-panel">
          <div className="a-bell-head">
            <span>Notifications</span>
            <button
              className="a-bell-mark"
              onClick={() => {
                api.markAllNotificationsRead().then(refresh).catch(() => {})
                setOpen(false)
              }}
            >
              Mark all read
            </button>
          </div>
          <div className="a-bell-list">
            {recent.length === 0 && <p className="a-bell-empty">You're all caught up.</p>}
            {recent.map((n) => (
              <button key={n._id} className={`a-bell-item${n.read ? '' : ' unread'}`} onClick={() => openNotification(n)}>
                <span className="a-bell-item-icon">
                  <i className={`bi ${icon(n.type)}`} />
                </span>
                <span className="a-bell-item-body">
                  <strong>{n.title}</strong>
                  <span>{n.message}</span>
                  <small>{timeAgo(n.createdAt)}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Resolve the top-bar page title from the current path.
  let location = ''
  // eslint-disable-next-line no-undef
  location = window.location.pathname

  let title = 'Dashboard'
  if (location !== '/admin') {
    for (const [key, label] of Object.entries(TITLES)) {
      if (location.startsWith('/admin' + key)) {
        title = label
        break
      }
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <ToastProvider>
      <NotificationsController>
        <div className="admin admin-shell">
          {menuOpen && <div className="admin-overlay" onClick={() => setMenuOpen(false)} />}

          <aside className={`admin-sidebar${menuOpen ? ' open' : ''}`}>
            <a className="a-brand" href="/">
              <span className="a-logo-mark" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
                  <path d="M9 29 L15 11" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" />
                  <path d="M15 11 L19 22 L23 11" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M23 11 L29 29" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" />
                </svg>
              </span>
              <span className="a-brand-text">
                <small>mainly</small>
                <strong>mortgages</strong>
              </span>
            </a>

            <nav className="a-nav">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `a-nav-link${isActive ? ' active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <i className={`bi ${item.icon}`} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="a-sidebar-foot">
              <NavLink
                to="/admin/profile"
                className={({ isActive }) => `a-nav-link${isActive ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <i className="bi bi-person-circle" />
                <span>Admin Profile</span>
              </NavLink>
              <button className="a-nav-link a-logout" onClick={handleLogout} disabled={loggingOut}>
                <i className="bi bi-box-arrow-right" />
                <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
              </button>
            </div>
          </aside>

          <div className="admin-main">
            <header className="admin-topbar">
              <button className="a-icon-btn a-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
                <i className="bi bi-list" />
              </button>
              <h1 className="a-page-title">{title}</h1>
              <div className="a-topbar-right">
                <NotificationBell />
                <div className="a-admin-chip">
                  <span className="a-avatar">{initials(user?.name)}</span>
                  <span className="a-admin-name">
                    {user?.name}
                    <small>{user?.email}</small>
                  </span>
                </div>
              </div>
            </header>

            <main className="admin-content">
              <Outlet />
            </main>
          </div>
        </div>
      </NotificationsController>
    </ToastProvider>
  )
}
