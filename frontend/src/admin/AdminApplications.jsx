import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api/client.js'
import { Card, Loading, EmptyState, Badge, ConfirmDialog, useToast } from './ui.jsx'
import { formatDate, applicationStatusLabel, mortgageTypeLabel, statusTone } from './format.js'

const STATUSES = ['new', 'pending', 'reviewing', 'approved', 'rejected']

export default function AdminApplications() {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(null)

  const load = useCallback(async () => {
    try {
      const q = { page, limit: 15, sort }
      if (search.trim()) q.search = search.trim()
      if (status) q.status = status
      setData(await api.listApplications(q))
    } catch (e) {
      toast.error(e.message || 'Unable to load applications.')
    }
  }, [page, search, status, sort, toast])

  useEffect(() => {
    load()
  }, [load])

  const changeStatus = async (id, next) => {
    setSaving(id)
    try {
      await api.updateApplicationStatus(id, next)
      toast.success('Application status updated.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Unable to update application.')
    } finally {
      setSaving(null)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await api.removeApplication(toDelete._id)
      toast.success('Application deleted.')
      setToDelete(null)
      await load()
    } catch (e) {
      toast.error(e.message || 'Unable to delete application.')
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = data ? Math.max(Math.ceil(data.total / (data.limit || 15)), 1) : 1

  return (
    <div>
      <Card
        title={`Applications${data ? ` (${data.total})` : ''}`}
        actions={
          <form
            className="a-search"
            onSubmit={(e) => {
              e.preventDefault()
              setSearch(searchInput)
              setPage(1)
            }}
          >
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search name, email, phone, postcode…" />
            <button className="a-btn a-btn-sm a-btn-ghost" type="submit" aria-label="Search">
              <i className="bi bi-search" />
            </button>
          </form>
        }
      >
        <div className="a-filters">
          <select className="a-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{applicationStatusLabel[s]}</option>
            ))}
          </select>
          <select className="a-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {!data ? (
          <Loading label="Loading applications…" />
        ) : data.data.length === 0 ? (
          <EmptyState title="No applications found." sub="Match your search/filters, or submit a new application from the site." />
        ) : (
<div className="a-table-wrap">
                <table className="a-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Phone</th>
                      <th>Type</th>
                      <th>Postcode</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((a) => (
                      <tr key={a._id}>
                        <td>
                          <strong>{a.fullName}</strong>
                          <span className="a-cell-sub">{a.email}</span>
                        </td>
                        <td>{a.phone || '—'}</td>
                        <td>{mortgageTypeLabel[a.mortgageType] || '—'}</td>
                        <td>{a.postcode || '—'}</td>
                        <td>{formatDate(a.createdAt)}</td>
                        <td>
                          <select
                            className="a-select a-select-sm"
                            value={a.status}
                            disabled={saving === a._id}
                            onChange={(e) => changeStatus(a._id, e.target.value)}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{applicationStatusLabel[s]}</option>
                            ))}
                          </select>
                          <div className="a-mt4">
                            <Badge tone={statusTone(a.status)}>{applicationStatusLabel[a.status] || a.status}</Badge>
                          </div>
                        </td>
                        <td>
                          <div className="a-rowgap">
                            <Link className="a-btn a-btn-sm a-btn-ghost" to={`/admin/applications/${a._id}`}>View</Link>
                            <button className="a-btn a-btn-sm a-btn-danger-ghost" onClick={() => setToDelete(a)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

        {data && totalPages > 1 && (
          <div className="a-pagination">
            <button className="a-btn a-btn-sm a-btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button className="a-btn a-btn-sm a-btn-ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete application?"
        message={`Are you sure you want to delete the application from ${toDelete?.fullName || 'this applicant'}? This cannot be undone.`}
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}