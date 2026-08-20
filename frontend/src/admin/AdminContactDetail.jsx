import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import * as api from '../api/client.js'
import { Loading, EmptyState, Badge, ConfirmDialog, Card, useToast } from './ui.jsx'
import { formatDateTime, statusTone } from './format.js'

export default function AdminContactDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [reply, setReply] = useState('')
  const [replySubject, setReplySubject] = useState('')
  const [replying, setReplying] = useState(false)

  // GET marks the message as read automatically (status persists to MongoDB).
  useEffect(() => {
    let cancelled = false
    api
      .getContact(id)
      .then((res) => {
        if (!cancelled) setMsg(res.data)
      })
      .catch((e) => toast.error(e.message || 'Unable to load message.'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, toast])

  const setRead = async (read) => {
    setSaving(true)
    try {
      const res = await api.updateContactRead(id, read)
      setMsg(res.data)
      toast.success(read ? 'Message marked as read.' : 'Message marked as unread.')
    } catch (e) {
      toast.error(e.message || 'Unable to update message.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await api.removeContact(id)
      toast.success('Contact message deleted.')
      navigate(location.pathname.startsWith('/admin/messages') ? '/admin/messages' : '/admin/contacts')
    } catch (e) {
      toast.error(e.message || 'Unable to delete contact message.')
      setSaving(false)
    }
  }

  const changeStatus = async (status) => {
    setSaving(true)
    try {
      const res = await api.updateContactStatus(id, status)
      setMsg(res.data)
      toast.success('Message status updated.')
    } catch (e) { toast.error(e.message || 'Unable to update status.') }
    finally { setSaving(false) }
  }

  const sendReply = async (event) => {
    event.preventDefault()
    if (!reply.trim()) return toast.error('Reply message is required.')
    setReplying(true)
    try {
      const res = await api.replyToContact(id, { subject: replySubject.trim(), body: reply.trim() })
      setMsg(res.data)
      setReply('')
      setReplySubject('')
      toast.success(res.message || 'Reply saved.')
    } catch (e) { toast.error(e.message || 'Unable to save reply.') }
    finally { setReplying(false) }
  }

  if (loading) return <Loading label="Loading message…" />
  if (!msg) return <EmptyState title="Contact message not found." />

  const Row = ({ label, value }) => (
    <div className="a-kv">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  )

  return (
    <div className="a-detail">
      <div className="a-detail-top">
        <Link className="a-btn a-btn-sm a-btn-ghost" to={location.pathname.startsWith('/admin/messages') ? '/admin/messages' : '/admin/contacts'}>
          <i className="bi bi-arrow-left" /> Back to messages
        </Link>
        <div className="a-rowgap">
          <button className="a-btn a-btn-sm a-btn-ghost" disabled={saving} onClick={() => setRead(!msg.read)}>
            {msg.read ? 'Mark as Unread' : 'Mark as Read'}
          </button>
          <select className="a-select" value={msg.status || (msg.read ? 'read' : 'new')} disabled={saving} onChange={(e) => changeStatus(e.target.value)} aria-label="Message status">
            <option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="closed">Closed</option>
          </select>
          <button className="a-btn a-btn-sm a-btn-danger-ghost" onClick={() => setDeleteOpen(true)}>
            <i className="bi bi-trash" /> Delete
          </button>
        </div>
      </div>

      <Card title="Contact message">
        <div className="a-detail-badge">
          <Badge tone={statusTone(msg.read ? 'read' : 'unread')}>{msg.read ? 'Read' : 'Unread'}</Badge>
        </div>

        <div className="a-kv-grid">
          <div>
            <h3>Sender</h3>
            <Row label="Name" value={msg.name} />
            <Row label="Email" value={msg.email} />
            <Row label="Phone" value={msg.phone} />
            <Row label="Subject" value={msg.subject || '—'} />
            <Row label="Submitted" value={formatDateTime(msg.createdAt)} />
            <Row label="Source" value={msg.sourcePage || 'Website'} />
          </div>
        </div>

        <h3 className="a-detail-section">Message</h3>
        <div className="a-message-box">{msg.message}</div>
        <h3 className="a-detail-section">Conversation</h3>
        {(msg.replies || []).length === 0 ? <p className="a-inbox-empty">No replies yet.</p> : (msg.replies || []).map((entry) => <div className="a-message-box" key={entry._id || entry.createdAt}><strong>{entry.adminName || 'Admin'}</strong><span className="a-cell-sub">{entry.subject || 'Reply'} · {formatDateTime(entry.createdAt)}{entry.deliveryStatus ? ` · Email: ${entry.deliveryStatus.replace('_', ' ')}` : ''}</span><div>{entry.body}</div></div>)}
        <form id="reply" onSubmit={sendReply}>
          <label className="a-field"><span>Subject</span><input value={replySubject} onChange={(e) => setReplySubject(e.target.value)} placeholder={msg.subject ? `Re: ${msg.subject}` : 'Reply subject'} /></label>
          <label className="a-field"><span>Reply</span><textarea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" /></label>
          <button className="a-btn a-btn-brand" type="submit" disabled={replying}>{replying ? 'Sending…' : 'Send Reply'}</button>
        </form>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete message?"
        message={`Are you sure you want to delete the message from ${msg.name}? This cannot be undone.`}
        busy={saving}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
