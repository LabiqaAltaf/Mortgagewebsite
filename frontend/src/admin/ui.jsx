import { createContext, useCallback, useContext, useState } from 'react'

/* ----------------------------- Toast ----------------------------- */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (type, message) => {
      const id = Date.now() + Math.random()
      setItems((prev) => [...prev, { id, type, message }])
      setTimeout(() => remove(id), 4200)
    },
    [remove],
  )

  const toast = useCallback(
    (type, message) => push(type, message),
    [push],
  )
  toast.success = (m) => push('success', m)
  toast.error = (m) => push('error', m)

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="a-toast-stack" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`a-toast a-toast-${t.type}`}>
            <i className={`bi ${t.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} />
            <span>{t.message}</span>
            <button className="a-toast-close" onClick={() => remove(t.id)} aria-label="Dismiss">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

/* ----------------------------- Badge ----------------------------- */
export function Badge({ tone = 'blue', children }) {
  return <span className={`a-badge a-badge-${tone}`}>{children}</span>
}

/* ----------------------------- Loading --------------------------- */
export function Loading({ label = 'Loading…' }) {
  return (
    <div className="a-loading">
      <span className="a-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

/* ---------------------------- Empty state ------------------------ */
export function EmptyState({ title = 'Nothing here yet.', sub = '' }) {
  return (
    <div className="a-empty">
      <i className="bi bi-inbox" aria-hidden="true" />
      <p className="a-empty-title">{title}</p>
      {sub && <p className="a-empty-sub">{sub}</p>}
    </div>
  )
}

/* ----------------------------- Card ------------------------------ */
export function Card({ title, actions, children }) {
  return (
    <div className="a-card">
      {(title || actions) && (
        <div className="a-card-head">
          <h3 className="a-card-title">{title}</h3>
          {actions && <div className="a-card-actions">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

/* -------------------------- Confirm dialog ----------------------- */
export function ConfirmDialog({ open, title = 'Confirm', message = '', confirmLabel = 'Delete', busy = false, onCancel, onConfirm }) {
  if (!open) return null
  return (
    <div className="a-modal-overlay" onClick={busy ? undefined : onCancel}>
      <div className="a-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="a-modal-actions">
          <button className="a-btn a-btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="a-btn a-btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}