import { useCallback, useEffect, useState } from 'react'
import * as api from '../api/client.js'
import { Card, Loading, EmptyState, Badge, ConfirmDialog, useToast } from './ui.jsx'

const EMPTY_FORM = {
  name: '',
  role: '',
  email: '',
  image: '',
  description: '',
  displayOrder: 0,
  active: true,
}

/**
 * Admin: manage the entries shown in the public "Meet Our Mortgage Experts"
 * section (and their individual detail pages at /experts/:id) — add, edit,
 * update the photo, or delete. Uses the existing /api/team admin endpoints.
 */
export default function AdminTeam() {
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      const q = {}
      if (search.trim()) q.search = search.trim()
      const res = await api.listTeamMembers(q)
      setItems(res.data || [])
    } catch (e) {
      toast.error(e.message || 'Unable to load team members.')
    }
  }, [search, toast])

  useEffect(() => {
    load()
  }, [load])

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (member) => {
    setEditingId(member._id)
    setForm({
      name: member.name || '',
      role: member.role || '',
      email: member.email || '',
      image: member.image || '',
      description: member.description || '',
      displayOrder: member.displayOrder ?? 0,
      active: member.active !== false,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    if (saving) return
    setShowForm(false)
  }

  const submitForm = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.role.trim()) {
      toast.error('Name and role are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        email: form.email.trim(),
        image: form.image.trim(),
        description: form.description.trim(),
        displayOrder: Number(form.displayOrder) || 0,
        active: !!form.active,
      }
      if (editingId) {
        await api.updateTeamMember(editingId, payload)
        toast.success('Team member updated.')
      } else {
        await api.createTeamMember(payload)
        toast.success('Team member added.')
      }
      setShowForm(false)
      await load()
    } catch (e) {
      toast.error(e.message || 'Unable to save team member.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await api.removeTeamMember(confirmDeleteId)
      toast.success('Team member deleted.')
      setConfirmDeleteId(null)
      await load()
    } catch (e) {
      toast.error(e.message || 'Unable to delete team member.')
    } finally {
      setDeleting(false)
    }
  }

  const deletingMember = items?.find((m) => m._id === confirmDeleteId)

  return (
    <div>
      <Card
        title={`Team / Experts${items ? ` (${items.length})` : ''}`}
        actions={
          <div className="a-rowgap">
            <form
              className="a-search"
              onSubmit={(e) => {
                e.preventDefault()
                setSearch(searchInput)
              }}
            >
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search name, role…" />
              <button className="a-btn a-btn-sm a-btn-ghost" type="submit" aria-label="Search">
                <i className="bi bi-search" />
              </button>
            </form>
            <button className="a-btn a-btn-sm a-btn-brand" onClick={openAdd}>
              <i className="bi bi-plus-lg" /> Add team member
            </button>
          </div>
        }
      >
        <p className="a-hint">
          These entries power the public "Meet Our Mortgage Experts" section and each member's
          detail page. Add a photo URL, name and role, then mark it active to show it live.
        </p>

        {!items ? (
          <Loading label="Loading team members…" />
        ) : items.length === 0 ? (
          <EmptyState title="No team members yet." sub="Add one to show it on the public site." />
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m._id}>
                    <td>
                      {m.image ? (
                        <img className="a-team-thumb" src={m.image} alt={m.name} />
                      ) : (
                        <span className="a-avatar a-avatar-sm">{(m.name || '?').slice(0, 1)}</span>
                      )}
                      <strong>{m.name}</strong>
                    </td>
                    <td>{m.role}</td>
                    <td>{m.email || '—'}</td>
                    <td>{m.displayOrder}</td>
                    <td>
                      <Badge tone={m.active ? 'green' : 'gray'}>{m.active ? 'Active' : 'Hidden'}</Badge>
                    </td>
                    <td>
                      <div className="a-rowgap">
                        <button className="a-btn a-btn-sm a-btn-ghost" onClick={() => openEdit(m)}>
                          <i className="bi bi-pencil" /> Edit
                        </button>
                        <button className="a-btn a-btn-sm a-btn-danger-ghost" onClick={() => setConfirmDeleteId(m._id)}>
                          <i className="bi bi-trash" /> Delete
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

      {showForm && (
        <div className="a-modal-overlay" onClick={closeForm}>
          <div className="a-modal a-modal-lg" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Edit team member' : 'Add team member'}</h3>

            <form onSubmit={submitForm}>
              {form.image && <img className="a-team-preview" src={form.image} alt="Preview" />}

              <label className="a-field">
                <span>Photo URL</span>
                <input
                  value={form.image}
                  onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                  placeholder="https://…"
                />
              </label>

              <label className="a-field">
                <span>Name</span>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </label>

              <label className="a-field">
                <span>Role</span>
                <input
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  placeholder="e.g. Senior Mortgage Advisor"
                  required
                />
              </label>

              <label className="a-field">
                <span>Email (used for admin messages)</span>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </label>

              <label className="a-field">
                <span>Bio (shown on the detail page)</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Optional — leave blank to use the default bio text."
                />
              </label>

              <label className="a-field">
                <span>Display order</span>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm((p) => ({ ...p, displayOrder: e.target.value }))}
                />
              </label>

              <label className="a-check">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                />
                <span>Active (visible on the public site)</span>
              </label>

              <div className="a-modal-actions">
                <button type="button" className="a-btn a-btn-ghost" onClick={closeForm} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="a-btn a-btn-brand" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete team member?"
        message={`Are you sure you want to delete "${deletingMember?.name || 'this member'}"? This also removes their detail page. This cannot be undone.`}
        busy={deleting}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
