import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as api from '../api/client.js'
import { Loading, EmptyState, Badge, ConfirmDialog, Card, useToast } from './ui.jsx'
import { formatDateTime, applicationStatusLabel, mortgageTypeLabel, money, statusTone } from './format.js'

const STATUSES = ['pending', 'reviewing', 'approved', 'rejected']

export default function AdminApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [reply, setReply] = useState('')
  const [replying, setReplying] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .getApplication(id)
      .then((res) => {
        if (!cancelled) setApp(res.data)
      })
      .catch((e) => toast.error(e.message || 'Unable to load application.'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, toast])

  const changeStatus = async (next) => {
    setSaving(true)
    try {
      const res = await api.updateApplicationStatus(id, next)
      setApp(res.data)
      toast.success('Application status updated.')
    } catch (e) {
      toast.error(e.message || 'Unable to update application.')
    } finally {
      setSaving(false)
    }
  }

  const deleteApplication = async () => {
    setDeleting(true)
    try {
      await api.removeApplication(id)
      toast.success('Application deleted.')
      navigate('/admin/applications')
    } catch (e) {
      toast.error(e.message || 'Unable to delete application.')
      setDeleting(false)
    }
  }

  if (loading) return <Loading label="Loading application…" />
  if (!app) return <EmptyState title="Application not found." />

  const Row = ({ label, value }) => (
    <div className="a-kv">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  )

  // Only show optional rows when a value exists.
  const optional = [
    { label: 'Property value', value: money(app.propertyValue) },
    { label: 'Mortgage amount', value: money(app.mortgageAmount) },
    { label: 'Deposit', value: money(app.deposit) },
    { label: 'Employment status', value: app.employmentStatus },
    { label: 'Employer', value: app.employerName },
    { label: 'Annual income', value: money(app.annualIncome) },
  ].filter((r) => r.value !== '—')

  return (
    <div className="a-detail">
      <div className="a-detail-top">
        <Link className="a-btn a-btn-sm a-btn-ghost" to="/admin/applications">
          <i className="bi bi-arrow-left" /> Back to applications
        </Link>
        <button className="a-btn a-btn-sm a-btn-danger-ghost" onClick={() => setConfirmDelete(true)}>
          <i className="bi bi-trash" /> Delete
        </button>
      </div>

      <Card title="Application details">
        <h2 className="a-detail-name">{app.fullName}</h2>
        <div className="a-detail-badge">
          <Badge tone={statusTone(app.status)}>{applicationStatusLabel[app.status] || app.status}</Badge>
        </div>

        <div className="a-kv-grid">
          <div>
            <h3>Applicant Information</h3>
            <Row label="Name" value={app.fullName} />
            <Row label="Email" value={app.email} />
            <Row label="Phone" value={app.phone} />
          </div>

          <div>
            <h3>Mortgage Information</h3>
            <Row label="Mortgage type" value={mortgageTypeLabel[app.mortgageType]} />
            {optional.map((r) => (
              <Row key={r.label} label={r.label} value={r.value} />
            ))}
          </div>

          <div>
            <h3>Additional Information</h3>
            <Row label="Postcode" value={app.postcode} />
            <div className="a-kv">
              <span>Message / details</span>
              <p className="a-detail-paragraph">{app.details || 'No additional details provided.'}</p>
            </div>
          </div>

          <div>
            <h3>Application Information</h3>
            <Row label="Status" value={applicationStatusLabel[app.status]} />
            <Row label="Created" value={formatDateTime(app.createdAt)} />
            <Row label="Updated" value={formatDateTime(app.updatedAt)} />
          </div>
        </div>

        <div className="a-detail-actions">
          <span className="a-detail-actions-label">Set status:</span>
          {STATUSES.map((s) => (
            <button key={s} className={`a-btn a-btn-sm ${app.status === s ? 'a-btn-brand' : 'a-btn-ghost'}`} disabled={saving || app.status === s} onClick={() => changeStatus(s)}>
              {applicationStatusLabel[s]}
            </button>
          ))}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete application?"
        message={`Are you sure you want to delete this application from ${app.fullName}? This cannot be undone.`}
        busy={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={deleteApplication}
      />
    </div>
  )
}
