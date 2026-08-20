export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(value) {
  if (!value) return ''
  const then = new Date(value).getTime()
  const diff = Date.now() - then
  const sec = Math.round(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 7) return `${day}d ago`
  return formatDate(value)
}

export const mortgageTypeLabel = {
  buying: 'Buying a home',
  remortgaging: 'Remortgaging',
  'buy-to-let': 'Buy to let',
  'not-sure': 'Just exploring',
}

export const applicationStatusLabel = {
  new: 'New',
  pending: 'Pending',
  reviewing: 'Reviewing',
  approved: 'Approved',
  rejected: 'Rejected',
}

export const statusTone = (status) =>
  ({
    new: 'blue',
    pending: 'amber',
    reviewing: 'gray',
    approved: 'green',
    rejected: 'red',
    active: 'green',
    disabled: 'red',
    read: 'gray',
    unread: 'blue',
    verified: 'green',
    admin: 'blue',
    user: 'gray',
  })[status] || 'blue'

export function money(value) {
  if (value === null || value === undefined || value === '') return '—'
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(Number(value))
}

export function initials(name) {
  if (!name) return 'A'
  return String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export const roleLabel = (role) => (role === 'admin' ? 'Admin' : 'User')