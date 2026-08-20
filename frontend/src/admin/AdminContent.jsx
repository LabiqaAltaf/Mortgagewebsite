import { useEffect, useState } from 'react'
import * as api from '../api/client.js'
import { Card, Loading, useToast } from './ui.jsx'

const FIELDS = [
  { key: 'business.businessName', label: 'Business name' },
  { key: 'business.contactEmail', label: 'Contact email' },
  { key: 'business.contactPhone', label: 'Contact phone' },
  { key: 'business.contactAddress', label: 'Contact address' },
  { key: 'hero.heading1', label: 'Hero heading — line 1' },
  { key: 'hero.heading2', label: 'Hero heading — line 2' },
]

function getByPath(obj, path) {
  return path.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), obj) ?? ''
}

export default function AdminContent() {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .getSiteContent()
      .then((r) => {
        if (cancelled) return
        setData(r)
        const f = {}
        for (const field of FIELDS) f[field.key] = getByPath(r.content, field.key)
        setForm(f)
      })
      .catch((e) => toast.error(e.message || 'Unable to load content.'))
    return () => {
      cancelled = true
    }
  }, [toast])

  const save = async () => {
    setSaving(true)
    try {
      await api.updateSiteContent(form)
      toast.success('Website content updated.')
    } catch (e) {
      toast.error(e.message || 'Unable to update content.')
    } finally {
      setSaving(false)
    }
  }

  if (!data) return <Loading label="Loading website content…" />

  return (
    <div className="a-dash">
      <div className="a-dash-cols">
        <Card title="Editable content">
          <p className="a-hint">
            These fields are stored in MongoDB and saved through the admin API. The public site
            currently uses its own static content — editing these values updates the stored
            settings so they are ready to be wired up.
          </p>
          {FIELDS.map((field) => (
            <label className="a-field" key={field.key}>
              <span>{field.label}</span>
              <input value={form[field.key] ?? ''} onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))} />
            </label>
          ))}
          <div className="a-detail-actions">
            <button className="a-btn a-btn-brand" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </Card>

        <Card title="Current public site reference">
          <h3 className="a-inbox-title">Hero</h3>
          <p className="a-message-box">
            <strong>{data.content.hero.heading1}</strong> - <strong>{data.content.hero.heading2}</strong>
            <br />
            CTA: {data.content.hero.primaryCta} · {data.content.hero.secondaryCta}
          </p>

          <p className="a-hint">To update the live Hero copy on the public pages, edit the static data in frontend/src/data/websiteData.js. The footer section was removed as an extra section.</p>
        </Card>
      </div>
    </div>
  )
}