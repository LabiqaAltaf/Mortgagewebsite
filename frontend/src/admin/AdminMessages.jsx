import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api/client.js'
import { Card, Loading, EmptyState, Badge, useToast } from './ui.jsx'
import { timeAgo, statusTone } from './format.js'

/**
 * Centralized admin inbox: unread contact messages + unread notifications.
 * Unread items are visually highlighted. Never exposes sensitive data beyond
 * what the admin dashboard already shows.
 */
function LegacyAdminMessages() {
  const toast = useToast()
  const [contacts, setContacts] = useState(null)
  const [notifications, setNotifications] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.listContacts({ filter: 'unread', page: 1, limit: 30 }), api.listNotifications({ filter: 'unread', page: 1, limit: 30 })])
      .then(async ([c, n]) => {
        if (!cancelled) {
          setContacts(c)
          setNotifications(n)
        }
      })
      .catch((e) => {
        if (!cancelled) toast.error(e.message || 'Unable to load inbox.')
      })
    return () => {
      cancelled = true
    }
  }, [toast])

  const loading = !contacts || !notifications
  const totalUnread = (contacts?.unread || 0) + (notifications?.unreadCount || 0)

  return (
    <div className="a-dash">
      <Card title={`Messages & notifications${loading ? '' : ` — ${totalUnread} unread`}`}>
        {loading ? (
          <Loading label="Loading inbox…" />
        ) : contacts.data.length === 0 && notifications.data.length === 0 ? (
          <EmptyState title="Your inbox is clear." sub="New contact messages and notifications will show here." />
        ) : (
          <div className="a-msg-inbox">
            <section>
              <h3 className="a-inbox-title">Contact messages · {contacts.unread} unread</h3>
              {contacts.data.length === 0 ? (
                <p className="a-inbox-empty">No unread contact messages.</p>
              ) : (
                <ul className="a-notif-list">
                  {contacts.data.map((m) => (
                    <li key={m._id} className="unread">
                      <Link to={`/admin/contacts/${m._id}`} className="a-notif-open">
                        <span className="a-notif-icon contact">
                          <i className="bi bi-envelope" />
                        </span>
                        <span className="a-notif-body">
                          <strong>{m.subject || 'New contact message'}</strong>
                          <span>
                            {m.name} — {m.email}
                          </span>
                          <small>{timeAgo(m.createdAt)}</small>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="a-inbox-title">Notifications · {notifications.unreadCount} unread</h3>
              {notifications.data.length === 0 ? (
                <p className="a-inbox-empty">No unread notifications.</p>
              ) : (
                <ul className="a-notif-list">
                  {notifications.data.map((n) => (
                    <li key={n._id} className="unread">
                      <Link to="/admin/notifications" className="a-notif-open">
                        <span className="a-notif-icon system">
                          <i className="bi bi-bell" />
                        </span>
                        <span className="a-notif-body">
                          <strong>{n.title}</strong>
                          <span>{n.message}</span>
                          <small>{timeAgo(n.createdAt)}</small>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </Card>
    </div>
  )
}

const filters = ['all', 'unread', 'new', 'replied', 'closed', 'users', 'team']

export default function AdminMessages() {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState(null)
  const [users, setUsers] = useState([])
  const [team, setTeam] = useState([])
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try { setData(await api.listContacts({ page: 1, limit: 100, filter, search })) }
    catch (error) { toast.error(error.message || 'Unable to load messages.') }
  }, [filter, search, toast])

  useEffect(() => { load() }, [load])

  const openNew = async (recipientType = 'user') => {
    try {
      const [userResult, teamResult] = await Promise.all([api.listUsers({ page: 1, limit: 200, role: 'user', status: 'active' }), api.listTeamMembers()])
      setUsers(userResult.data || [])
      setTeam(teamResult.data || [])
      setDraft({ recipientType, recipientId: '', subject: '', message: '' })
    } catch (error) { toast.error(error.message || 'Unable to load recipients.') }
  }

  const send = async (event) => {
    event.preventDefault()
    if (!draft.recipientId || draft.message.trim().length < 10) return toast.error('Recipient and a message of at least 10 characters are required.')
    setSaving(true)
    try {
      const result = await api.createAdminMessage({ ...draft, subject: draft.subject.trim(), message: draft.message.trim() })
      setDraft(null)
      await load()
      toast.success(result.message)
    } catch (error) { toast.error(error.message || 'Unable to save message.') }
    finally { setSaving(false) }
  }

  return <div>
    <Card title={`Messages${data ? ` (${data.total})` : ''}`} actions={<div className='a-rowgap'><button className='a-btn a-btn-sm a-btn-ghost' onClick={() => openNew('user')}>Message User</button><button className='a-btn a-btn-sm a-btn-ghost' onClick={() => openNew('team')}>Message Team</button><button className='a-btn a-btn-sm a-btn-brand' onClick={() => openNew()}>New Message</button></div>}>
      <div className='a-filters'>
        {filters.map((value) => <button key={value} className={`a-chip${filter === value ? ' active' : ''}`} onClick={() => setFilter(value)}>{value === 'all' ? 'All' : value === 'users' ? 'Users / Clients' : value[0].toUpperCase() + value.slice(1)}</button>)}
      </div>
      <label className='a-search'><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Search name, email, subject or message' aria-label='Search messages' /><i className='bi bi-search' /></label>
      {!data ? <Loading label='Loading messages…' /> : data.data.length === 0 ? <EmptyState title='No messages found.' sub='Website communication and admin conversations appear here.' /> : <div className='a-table-wrap'><table className='a-table'>
        <thead><tr><th>Sender / recipient</th><th>Subject</th><th>Source</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{data.data.map((item) => <tr key={item._id} className={!item.read ? 'row-unread' : ''}>
          <td><strong>{item.name}</strong><span className='a-cell-sub'>{item.email || (item.recipientType === 'team' ? 'Team member' : 'No email available')}</span></td>
          <td>{item.subject || '—'}<span className='a-cell-sub'>{item.message}</span></td>
          <td>{item.direction === 'outbound' ? `Admin → ${item.recipientType === 'team' ? 'Team' : 'User'}` : (item.sourcePage || 'Website')}</td>
          <td>{timeAgo(item.createdAt)}</td>
          <td><Badge tone={statusTone(item.status || (!item.read ? 'unread' : 'read'))}>{item.status || (!item.read ? 'New' : 'Read')}</Badge></td>
          <td><div className='a-rowgap'><Link className='a-btn a-btn-sm a-btn-ghost' to={`/admin/messages/${item._id}`}>View</Link><Link className='a-btn a-btn-sm a-btn-brand' to={`/admin/messages/${item._id}#reply`}>Reply</Link></div></td>
        </tr>)}</tbody>
      </table></div>}
    </Card>
    {draft && <div className='a-modal-overlay' onClick={() => !saving && setDraft(null)}><div className='a-modal a-modal-lg' role='dialog' aria-modal='true' onClick={(event) => event.stopPropagation()}>
      <h3>New Message</h3><form onSubmit={send}>
        <label className='a-field'><span>Recipient type</span><select className='a-select' value={draft.recipientType} onChange={(event) => setDraft((current) => ({ ...current, recipientType: event.target.value, recipientId: '' }))}><option value='user'>User / Client</option><option value='team'>Team Member</option></select></label>
        <label className='a-field'><span>Recipient</span><select className='a-select' value={draft.recipientId} onChange={(event) => setDraft((current) => ({ ...current, recipientId: event.target.value }))} required><option value=''>Select a recipient</option>{(draft.recipientType === 'team' ? team : users).map((person) => <option key={person._id} value={person._id}>{person.name}{person.email ? ` (${person.email})` : person.role ? ` — ${person.role}` : ''}</option>)}</select></label>
        <label className='a-field'><span>Subject</span><input value={draft.subject} onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))} /></label>
        <label className='a-field'><span>Message</span><textarea rows={5} value={draft.message} onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))} required /></label>
        <div className='a-modal-actions'><button type='button' className='a-btn a-btn-ghost' disabled={saving} onClick={() => setDraft(null)}>Cancel</button><button type='submit' className='a-btn a-btn-brand' disabled={saving}>{saving ? 'Saving…' : 'Send Message'}</button></div>
      </form>
    </div></div>}
  </div>
}
