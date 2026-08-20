import { useCallback, useEffect, useState } from 'react'
import * as api from '../api/client.js'
import { Card, EmptyState, Loading, useToast, Badge } from './ui.jsx'
import { formatDateTime, timeAgo } from './format.js'

/**
 * Admin Audit / Activity page — shows authentication activity (logins,
 * logouts, and other admin actions) recorded by the backend AuditLog model.
 * Admin only; the API itself is protected by authenticateUser + requireAdmin.
 */
const ACTION_FILTERS = [
  { key: '', label: 'All activity' },
  { key: 'login', label: 'Logins' },
  { key: 'logout', label: 'Logouts' },
  { key: 'register', label: 'Registrations' },
  { key: 'content', label: 'Content changes' },
]

const ACTION_ICON = (action = '') => {
  if (action.includes('login')) return 'bi-box-arrow-in-right'
  if (action.includes('logout')) return 'bi-box-arrow-right'
  if (action.includes('register')) return 'bi-person-plus'
  if (action.includes('content')) return 'bi-pencil-square'
  if (action.includes('delete')) return 'bi-trash'
  return 'bi-activity'
}

const ACTION_TONE = (action = '') => {
  if (action.includes('login')) return 'green'
  if (action.includes('logout')) return 'gray'
  if (action.includes('register')) return 'blue'
  return 'amber'
}

export default function AdminAudit() {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 50 }
      if (actionFilter) params.action = actionFilter
      const res = await api.listAuditLogs(params)
      setData(res)
    } catch (e) {
      toast.error(e.message || 'Unable to load activity logs.')
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter, toast])

  useEffect(() => {
    load()
  }, [load])

  const rows = data?.data || []
  const totalPages = Math.max(Math.ceil((data?.total || 0) / (data?.limit || 50)), 1)

  return (
    <div>
      <div className="a-home-head">
        <div>
          <h2 className="a-home-title">Activity / Audit Logs</h2>
          <p className="a-hint">
            Login and logout events recorded by the backend AuditLog. Visible to administrators only.
          </p>
        </div>
      </div>

      <Card
        title="Authentication activity"
        actions={
          <div className="a-audit-filters">
            {ACTION_FILTERS.map((f) => (
              <button
                key={f.key}
                className={`a-chip${actionFilter === f.key ? ' is-active' : ''}`}
                onClick={() => {
                  setActionFilter(f.key)
                  setPage(1)
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      >
        {loading && !data ? (
          <Loading label="Loading activity…" />
        ) : rows.length === 0 ? (
          <EmptyState title="No activity recorded yet." sub="Login and logout events will appear here." />
        ) : (
          <div className="a-audit-list">
            {rows.map((log) => {
              const d = log.details || {}
              const name = d.name || log.actor || '—'
              const email = d.email || log.actor || ''
              const role = d.role || ''
              return (
                <div className="a-audit-row" key={log._id}>
                  <div className="a-audit-ic">
                    <i className={`bi ${ACTION_ICON(log.action)}`} />
                  </div>
                  <div className="a-audit-main">
                    <div className="a-audit-topline">
                      <strong>{name}</strong>
                      {role && <Badge tone={role === 'admin' ? 'blue' : 'gray'}>{role}</Badge>}
                      {email && <span className="a-audit-mail">{email}</span>}
                    </div>
                    <div className="a-audit-action">
                      <code>{log.action || '—'}</code>
                      {log.ip && <span className="a-audit-ip">IP: {log.ip}</span>}
                    </div>
                    {(log.targetType || log.targetId) && (
                      <div className="a-audit-meta">
                        {log.targetType && <span>target: {log.targetType}</span>}
                        {log.targetId && <span>id: {String(log.targetId)}</span>}
                      </div>
                    )}
                  </div>
                  <div className="a-audit-when" title={formatDateTime(log.createdAt)}>
                    {timeAgo(log.createdAt)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {data && totalPages > 1 && (
          <div className="a-pagination">
            <button className="a-btn a-btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button className="a-btn a-btn-ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}