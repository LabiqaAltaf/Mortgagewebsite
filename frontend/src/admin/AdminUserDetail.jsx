import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as api from '../api/client.js'
import { Loading, EmptyState, Badge, Card, useToast } from './ui.jsx'
import { formatDate, formatDateTime, initials, roleLabel, statusTone, applicationStatusLabel, mortgageTypeLabel } from './format.js'

export default function AdminUserDetail() {
  const { id } = useParams()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setData(await api.getUser(id))
    } catch (e) {
      toast.error(e.message || 'Unable to load user.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const toggleStatus = async (next) => {
    setSaving(true)
    try {
      await api.updateUserStatus(id, next)
      toast.success(next === 'disabled' ? 'User disabled.' : 'User enabled.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Unable to update user.')
    } finally {
      setSaving(false)
    }
  }

  const changeRole = async (role) => {
    setSaving(true)
    try {
      await api.updateUserRole(id, role)
      toast.success(`Role updated to ${role}.`)
      await load()
    } catch (e) {
      toast.error(e.message || 'Unable to change role.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading label="Loading user…" />
  if (!data) return <EmptyState title="User not found." />

  const u = data.user
  const Row = ({ label, value }) => (
    <div className="a-kv">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  )

  return (
    <div className="a-detail">
      <div className="a-detail-top">
        <Link className="a-btn a-btn-sm a-btn-ghost" to="/admin/users">
          <i className="bi bi-arrow-left" /> Back to users
        </Link>
        <button className={`a-btn a-btn-sm ${u.status === 'active' ? 'a-btn-ghost' : 'a-btn-brand'}`} disabled={saving} onClick={() => toggleStatus(u.status === 'active' ? 'disabled' : 'active')}>
          {u.status === 'active' ? 'Disable account' : 'Enable account'}
        </button>
      </div>

      <Card title="User details">
        <div className="a-user-head">
          <span className="a-avatar a-avatar-lg">{initials(u.name)}</span>
          <div>
            <h2 className="a-detail-name">{u.name}</h2>
            <div className="a-rowgap">
              <Badge tone={statusTone(u.role === 'admin' ? 'admin' : 'user')}>{roleLabel(u.role)}</Badge>
              <Badge tone={statusTone(u.status)}>{u.status === 'active' ? 'Active' : 'Disabled'}</Badge>
              <Badge tone={statusTone(u.isVerified ? 'verified' : 'unread')}>{u.isVerified ? 'Verified' : 'Unverified'}</Badge>
            </div>
          </div>
        </div>

        <div className="a-kv-grid">
          <div>
            <h3>Account</h3>
            <Row label={'Last logout'} value={u.lastLogout ? formatDateTime(u.lastLogout) : 'Never'} />
            <Row label="Name" value={u.name} />
            <Row label="Email" value={u.email} />
            <Row label="Phone" value={u.phone} />
            <Row label="Registration date" value={formatDateTime(u.createdAt)} />
            <Row label="Last login" value={u.lastLogin ? formatDateTime(u.lastLogin) : 'Never'} />
          </div>
          <div>
            <h3>Administration</h3>
            <div className="a-kv">
              <span>Role</span>
              <select className="a-select" disabled={saving} value={u.role} onChange={(e) => changeRole(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <p className="a-hint">
              Changing roles is audit-logged. You cannot demote yourself or remove the final admin.
            </p>
          </div>
        </div>
      </Card>

      <Card title="User applications">
        {data.applications.length === 0 ? (
          <EmptyState title="No applications." sub="This user has not submitted any applications yet." />
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Postcode</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.applications.map((a) => (
                  <tr key={a._id}>
                    <td>{mortgageTypeLabel[a.mortgageType] || '—'}</td>
                    <td>{a.postcode || '—'}</td>
                    <td>
                      <Badge tone={statusTone(a.status)}>{applicationStatusLabel[a.status] || a.status}</Badge>
                    </td>
                    <td>{formatDate(a.createdAt)}</td>
                    <td>
                      <Link className="a-btn a-btn-sm a-btn-ghost" to={`/admin/applications/${a._id}`}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
