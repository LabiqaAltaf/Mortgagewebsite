import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api/client.js'
import { Card, Loading, EmptyState, Badge } from './ui.jsx'
import { formatDate, applicationStatusLabel, mortgageTypeLabel, statusTone, timeAgo } from './format.js'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await api.getDashboard()
      setData(res.data)
      setError('')
    } catch (e) {
      if (!data) setError(e.message || 'Unable to load dashboard.')
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error && !data) {
    return (
      <div className="a-page-error">
        <i className="bi bi-exclamation-triangle" /> {error}
      </div>
    )
  }
  if (!data) return <Loading label="Loading dashboard…" />

  const { applications, contacts, users } = data

  const cards = [
    { label: 'TOTAL APPLICATIONS', value: applications.total, icon: 'bi-folder2-open', tone: 'blue' },
    { label: 'NEW APPLICATIONS', value: applications.new, icon: 'bi-plus-circle', tone: 'blue' },
    { label: 'PENDING APPLICATIONS', value: applications.pending, icon: 'bi-hourglass-split', tone: 'amber' },
    { label: 'CONTACT MESSAGES', value: contacts.total, icon: 'bi-envelope', tone: 'gray' },
    { label: 'REGISTERED USERS', value: users.total, icon: 'bi-people', tone: 'gray' },
    { label: 'VERIFIED USERS', value: users.verified, icon: 'bi-person-check', tone: 'green' },
  ]

  return (
    <div className="a-dash">
      <div className="a-stat-grid">
        {cards.map((c) => (
          <div className="a-stat" key={c.label}>
            <div className={`a-stat-icon a-stat-${c.tone}`}>
              <i className={`bi ${c.icon}`} />
            </div>
            <div className="a-stat-num">{c.value}</div>
            <div className="a-stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="a-dash-cols">
        <Card
          title="Recent Applications"
          actions={
            <Link className="a-btn a-btn-sm a-btn-ghost" to="/admin/applications">
              View all
            </Link>
          }
        >
          {data.recentApplications.length === 0 ? (
            <EmptyState title="No applications yet." sub="New mortgage applications will appear here." />
          ) : (
            <div className="a-table-wrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Type</th>
                    <th>Postcode</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentApplications.map((a) => (
                    <tr key={a._id}>
                      <td>
                        <strong>{a.fullName}</strong>
                        <span className="a-cell-sub">{a.email}</span>
                      </td>
                      <td>{mortgageTypeLabel[a.mortgageType] || '—'}</td>
                      <td>{a.postcode || '—'}</td>
                      <td>
                        <Badge tone={statusTone(a.status)}>{applicationStatusLabel[a.status] || a.status}</Badge>
                      </td>
                      <td>{formatDate(a.createdAt)}</td>
                      <td>
                        <Link className="a-btn a-btn-sm a-btn-ghost" to={`/admin/applications/${a._id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card
          title="Recent Messages"
          actions={
            <Link className="a-btn a-btn-sm a-btn-ghost" to="/admin/contacts">
              View all
            </Link>
          }
        >
          {data.recentMessages.length === 0 ? (
            <EmptyState title="No contact messages." sub="New contact messages will appear here." />
          ) : (
            <ul className="a-msg-list">
              {data.recentMessages.map((m) => (
                <li key={m._id}>
                  <div className="a-msg-dot" />
                  <div className="a-msg-body">
                    <strong>{m.name}</strong>
                    <span>{m.subject || 'Message'}</span>
                    <small>{timeAgo(m.createdAt)}</small>
                  </div>
                  <Link className="a-btn a-btn-sm a-btn-ghost" to={`/admin/contacts/${m._id}`}>
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}