import { useCallback, useEffect, useState } from 'react'
import * as api from '../api/client.js'
import { Card, Loading, EmptyState, ConfirmDialog, useToast } from './ui.jsx'

const blank = { name: '', info: '', text: '', rating: 5, avatar: '', verified: true, active: true }

export default function AdminTestimonials() {
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [form, setForm] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const load = useCallback(async () => { try { const result = await api.listTestimonials({ search }); setItems(result.data || []) } catch (error) { toast.error(error.message || 'Unable to load testimonials.') } }, [toast, search])
  useEffect(() => { load() }, [load])
  const save = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.text.trim()) return toast.error('Name and message are required.')
    setSaving(true)
    try {
      const payload = { ...form, name: form.name.trim(), info: form.info.trim(), text: form.text.trim(), avatar: form.avatar.trim(), rating: Number(form.rating) }
      if (form._id) await api.updateTestimonial(form._id, payload); else await api.createTestimonial(payload)
      setForm(null); await load(); toast.success('Testimonial saved.')
    } catch (error) { toast.error(error.message || 'Unable to save testimonial.') } finally { setSaving(false) }
  }
  const remove = async () => { try { await api.removeTestimonial(deleting._id); setDeleting(null); await load(); toast.success('Testimonial deleted.') } catch (error) { toast.error(error.message || 'Unable to delete testimonial.') } }
  return <div>
    <Card title={items ? `What Clients Say (${items.length})` : 'What Clients Say'} actions={<button className='a-btn a-btn-sm a-btn-brand' onClick={() => setForm({ ...blank })}>Add Client Message</button>}>
      <label className='a-search'><i className='bi bi-search' /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Search client messages' aria-label='Search client messages' /></label>
      {!items ? <Loading label='Loading testimonials…' /> : items.length === 0 ? <EmptyState title='No client testimonials found.' /> : <div className='a-table-wrap'><table className='a-table'><thead><tr><th>Client</th><th>Details</th><th>Rating</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item._id}><td><strong>{item.name}</strong><span className='a-cell-sub'>{item.text}</span></td><td>{item.info || '—'}</td><td>{item.rating}/5</td><td>{item.active && item.verified ? 'Visible' : 'Hidden'}</td><td><div className='a-rowgap'><button className='a-btn a-btn-sm a-btn-ghost' onClick={() => setForm({ ...item })}>Edit</button><button className='a-btn a-btn-sm a-btn-danger-ghost' onClick={() => setDeleting(item)}>Delete</button></div></td></tr>)}</tbody></table></div>}
    </Card>
    {form && <div className='a-modal-overlay' onClick={() => !saving && setForm(null)}><div className='a-modal a-modal-lg' role='dialog' aria-modal='true' onClick={(event) => event.stopPropagation()}><h3>{form._id ? 'Edit client message' : 'Add client message'}</h3><form onSubmit={save}><label className='a-field'><span>Client name</span><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></label><label className='a-field'><span>Client type / details</span><input value={form.info} onChange={(e) => setForm((p) => ({ ...p, info: e.target.value }))} /></label><label className='a-field'><span>Message</span><textarea rows={5} value={form.text} onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))} required /></label><label className='a-field'><span>Rating</span><select className='a-select' value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value} / 5 stars</option>)}</select></label><label className='a-field'><span>Avatar image URL</span><input value={form.avatar} onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))} /></label><label className='a-check'><input type='checkbox' checked={!!form.verified} onChange={(e) => setForm((p) => ({ ...p, verified: e.target.checked }))} /><span>Verified (visible publicly)</span></label><label className='a-check'><input type='checkbox' checked={!!form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} /><span>Active</span></label><div className='a-modal-actions'><button type='button' className='a-btn a-btn-ghost' onClick={() => setForm(null)} disabled={saving}>Cancel</button><button type='submit' className='a-btn a-btn-brand' disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></div></form></div></div>}
    <ConfirmDialog open={!!deleting} title='Delete client message?' message={`Delete the testimonial from ${deleting?.name || 'this client'}?`} onCancel={() => setDeleting(null)} onConfirm={remove} />
  </div>
}
