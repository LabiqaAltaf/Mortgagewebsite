import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api/client.js'
import { Card, Loading, EmptyState, Badge, useToast } from './ui.jsx'
import { formatDate, initials, roleLabel, statusTone } from './format.js'

export default function AdminUsers() {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [verified, setVerified] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(null)

  const load = useCallback(async () => {
    try {
      const q = { page: 1, limit: 50 }
      if (search.trim()) q.search = search.trim()
      if (verified) q.verified = verified
      if (status) q.status = status
      setData(await api.listUsers(q))
    } catch (e) {
      toast.error(e.message || 'Unable to load users.')
    }
  }, [search, verified, status, toast])

  useEffect(() => {
    load()
  }, [load])

  const toggleStatus = async (u) => {
    setSaving(u._id)
    const next = u.status === 'active' ? 'disabled' : 'active'
    try {
      await api.updateUserStatus(u._id, next)
      toast.success(next === 'disabled' ? 'User disabled.' : 'User enabled.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Unable to update user.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div>
      <Card
        title={`Users${data ? ` (${data.total})` : ''}`}
        actions={
          <form
            className="a-search"
            onSubmit={(e) => {
              e.preventDefault()
              setSearch(searchInput)
            }}
          >
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search name, email…" />
            <button className="a-btn a-btn-sm a-btn-ghost" type="submit" aria-label="Search">
              <i className="bi bi-search" />
            </button>
          </form>
        }
      >
        <div className="a-filters">
          <select className="a-select" value={verified} onChange={(e) => setVerified(e.target.value)}>
            <option value="">Verification: All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <select className="a-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Status: All</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {!data ? (
          <Loading label="Loading users…" />
        ) : data.data.length === 0 ? (
          <EmptyState title="No users found." sub="Registered website users will appear here." />
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Verification</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <span className="a-avatar a-avatar-sm">{initials(u.name)}</span>
                      <strong>{u.name}</strong>
                      <span className="a-cell-sub">{u.email}</span>
                    </td>
                    <td>
                      <Badge tone={statusTone(u.isVerified ? 'verified' : 'unread')}>
                        {u.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </td>
                    <td>{roleLabel(u.role)}</td>
                    <td>
                      <Badge tone={statusTone(u.status)}>{u.status === 'active' ? 'Active' : 'Disabled'}</Badge>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <div className="a-rowgap">
                        <Link className="a-btn a-btn-sm a-btn-ghost" to={`/admin/users/${u._id}`}>View</Link>
                        <button className="a-btn a-btn-sm a-btn-ghost" disabled={saving === u._id} onClick={() => toggleStatus(u)}>
                          {u.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                      </div>
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