import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api/client.js'
import { Card, Loading, EmptyState, Badge, ConfirmDialog, useToast } from './ui.jsx'
import { formatDate, statusTone } from './format.js'

export default function AdminContacts() {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(null)

  const load = useCallback(async () => {
    try {
      const q = { page: 1, limit: 30, filter }
      if (search.trim()) q.search = search.trim()
      setData(await api.listContacts(q))
    } catch (e) {
      toast.error(e.message || 'Unable to load messages.')
    }
  }, [filter, search, toast])

  useEffect(() => {
    load()
  }, [load])

  const toggleRead = async (m) => {
    setSaving(m._id)
    try {
      await api.updateContactRead(m._id, !m.read)
      toast.success(m.read ? 'Message marked as unread.' : 'Message marked as read.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Unable to update message.')
    } finally {
      setSaving(null)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await api.removeContact(toDelete._id)
      toast.success('Contact message deleted.')
      setToDelete(null)
      await load()
    } catch (e) {
      toast.error(e.message || 'Unable to delete message.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <Card
        title={`Contact Messages${data ? ` (${data.total})` : ''}`}
        actions={
          <form
            className="a-search"
            onSubmit={(e) => {
              e.preventDefault()
              setSearch(searchInput)
            }}
          >
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search name or email…" />
            <button className="a-btn a-btn-sm a-btn-ghost" type="submit" aria-label="Search">
              <i className="bi bi-search" />
            </button>
          </form>
        }
      >
        <div className="a-filters">
          {['all', 'unread', 'read'].map((f) => (
            <button
              key={f}
              className={`a-chip${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Read'}
              {f === 'unread' && data?.unread ? ` (${data.unread})` : ''}
            </button>
          ))}
        </div>

        {!data ? (
          <Loading label="Loading messages…" />
        ) : data.data.length === 0 ? (
          <EmptyState title="No contact messages." sub="New contact messages will appear here." />
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((m) => (
                  <tr key={m._id} className={!m.read ? 'row-unread' : ''}>
                    <td>
                      <strong>{m.name}</strong>
                      <span className="a-cell-sub">{m.email}</span>
                    </td>
                    <td>{m.phone || '—'}</td>
                    <td>{m.subject || '—'}</td>
                    <td>{formatDate(m.createdAt)}</td>
                    <td>
                      <Badge tone={statusTone(m.read ? 'read' : 'unread')}>{m.read ? 'Read' : 'Unread'}</Badge>
                    </td>
                    <td>
                      <div className="a-rowgap">
                        <Link className="a-btn a-btn-sm a-btn-ghost" to={`/admin/contacts/${m._id}`}>View</Link>
                        <button className="a-btn a-btn-sm a-btn-ghost" disabled={saving === m._id} onClick={() => toggleRead(m)}>
                          {m.read ? 'Unread' : 'Read'}
                        </button>
                        <button className="a-btn a-btn-sm a-btn-danger-ghost" onClick={() => setToDelete(m)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete message?"
        message={`Are you sure you want to delete the message from ${toDelete?.name || 'this person'}? This cannot be undone.`}
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}