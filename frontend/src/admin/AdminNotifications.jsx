import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../api/client.js'
import { useAdminNotifs } from './AdminLayout.jsx'
import { Card, Loading, EmptyState, Badge, ConfirmDialog, useToast } from './ui.jsx'
import { timeAgo } from './format.js'

const iconFor = (t) =>
  ({ application: 'bi-folder2-open', contact: 'bi-envelope', user: 'bi-person-plus', system: 'bi-bell' })[t] || 'bi-bell'

export default function AdminNotifications() {
  const toast = useToast()
  const { refresh } = useAdminNotifs()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [filter, setFilter] = useState('all')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(null)

  const load = useCallback(async () => {
    try {
      setData(await api.listNotifications({ page: 1, limit: 100, filter }))
    } catch (e) {
      toast.error(e.message || 'Unable to load notifications.')
    }
  }, [filter, toast])

  useEffect(() => {
    load()
  }, [load])

  const openTarget = (n) => {
    let path = '/admin/notifications'
    if (n.type === 'application' && n.relatedId) path = `/admin/applications/${n.relatedId}`
    else if (n.type === 'contact' && n.relatedId) path = `/admin/contacts/${n.relatedId}`
    else if (n.type === 'user' && n.relatedId) path = `/admin/users/${n.relatedId}`
    return path
  }

  const markRead = async (n) => {
    if (n.read) return
    setSaving(n._id)
    try {
      await api.markNotificationRead(n._id)
      toast.success('Notification marked as read.')
      await load()
      refresh()
    } catch (e) {
      toast.error(e.message || 'Unable to update notification.')
    } finally {
      setSaving(null)
    }
  }

  const markAll = async () => {
    try {
      await api.markAllNotificationsRead()
      toast.success('All notifications marked as read.')
      await load()
      refresh()
    } catch (e) {
      toast.error(e.message || 'Unable to update notifications.')
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await api.removeNotification(toDelete._id)
      toast.success('Notification deleted.')
      setToDelete(null)
      await load()
      refresh()
    } catch (e) {
      toast.error(e.message || 'Unable to delete notification.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <Card
        title={`Notifications${data && filter === 'all' ? ` (${data.total})` : ''}`}
        actions={
          <button className="a-btn a-btn-sm a-btn-ghost" onClick={markAll}>
            Mark all as read
          </button>
        }
      >
        <div className="a-filters">
          {['all', 'unread', 'read'].map((f) => (
            <button key={f} className={`a-chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Read'}
              {f === 'unread' && data?.unreadCount ? ` (${data.unreadCount})` : ''}
            </button>
          ))}
        </div>

        {!data ? (
          <Loading label="Loading notifications…" />
        ) : data.data.length === 0 ? (
          <EmptyState title="You're all caught up." sub="New notifications will appear here." />
        ) : (
          <ul className="a-notif-list">
            {data.data.map((n) => (
              <li key={n._id} className={n.read ? '' : 'unread'}>
                <button className="a-notif-open" onClick={() => navigate(openTarget(n))}>
                  <span className={`a-notif-icon ${n.type}`}>
                    <i className={`bi ${iconFor(n.type)}`} />
                  </span>
                  <span className="a-notif-body">
                    <strong>{n.title}</strong>
                    <span>{n.message}</span>
                    <small>{timeAgo(n.createdAt)}</small>
                  </span>
                  {!n.read && <span className="a-notif-dot" />}
                </button>
                <div className="a-notif-actions">
                  {!n.read ? (
                    <button className="a-btn a-btn-sm a-btn-ghost" disabled={saving === n._id} onClick={() => markRead(n)}>Mark read</button>
                  ) : (
                    <Badge tone="read">Read</Badge>
                  )}
                  <button className="a-btn a-btn-sm a-btn-danger-ghost" onClick={() => setToDelete(n)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete notification?"
        message="Are you sure you want to delete this notification? This cannot be undone."
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}