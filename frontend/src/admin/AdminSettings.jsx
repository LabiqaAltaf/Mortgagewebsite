import { useState } from 'react'
import { Card, useToast } from './ui.jsx'
import { changeMyPassword, updateMyProfile, updateSiteContent } from '../api/client.js'
import { useAuth } from './adminAuth.jsx'

export default function AdminSettings() {
  const { user, refreshUser } = useAuth()
  const toast = useToast()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingPass, setSavingPass] = useState(false)

  const [siteForm, setSiteForm] = useState({
    businessName: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
  })
  const [savingSite, setSavingSite] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await updateMyProfile({ name, email })
      await refreshUser()
      toast.success('Profile updated.')
    } catch (err) {
      toast.error(err.message || 'Unable to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setSavingPass(true)
    try {
      await changeMyPassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      toast.success('Password updated.')
    } catch (err) {
      toast.error(err.message || 'Unable to change password.')
    } finally {
      setSavingPass(false)
    }
  }

  const saveSite = async (e) => {
    e.preventDefault()
    setSavingSite(true)
    try {
      await updateSiteContent({
        'business.businessName': siteForm.businessName,
        'business.contactEmail': siteForm.contactEmail,
        'business.contactPhone': siteForm.contactPhone,
        'business.contactAddress': siteForm.contactAddress,
      })
      toast.success('Website settings updated.')
    } catch (err) {
      toast.error(err.message || 'Unable to update website settings.')
    } finally {
      setSavingSite(false)
    }
  }

  return (
    <div className="a-dash">
      <div className="a-dash-cols">
        <Card title="Account settings">
          <form onSubmit={saveProfile}>
            <label className="a-field">
              <span>Admin name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="a-field">
              <span>Admin email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <div className="a-detail-actions">
              <button className="a-btn a-btn-brand" disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save account'}
              </button>
            </div>
          </form>
        </Card>

        <Card title="Security">
          <form onSubmit={savePassword}>
            <label className="a-field">
              <span>Current password</span>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </label>
            <label className="a-field">
              <span>New password</span>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
            </label>
            <div className="a-detail-actions">
              <button className="a-btn a-btn-brand" disabled={savingPass}>
                {savingPass ? 'Updating…' : 'Change password'}
              </button>
            </div>
          </form>
        </Card>

        <Card title="Website settings">
          <form onSubmit={saveSite}>
            <label className="a-field">
              <span>Business name</span>
              <input value={siteForm.businessName} onChange={(e) => setSiteForm((p) => ({ ...p, businessName: e.target.value }))} />
            </label>
            <label className="a-field">
              <span>Business email</span>
              <input value={siteForm.contactEmail} onChange={(e) => setSiteForm((p) => ({ ...p, contactEmail: e.target.value }))} />
            </label>
            <label className="a-field">
              <span>Business phone</span>
              <input value={siteForm.contactPhone} onChange={(e) => setSiteForm((p) => ({ ...p, contactPhone: e.target.value }))} />
            </label>
            <label className="a-field">
              <span>Business address</span>
              <input value={siteForm.contactAddress} onChange={(e) => setSiteForm((p) => ({ ...p, contactAddress: e.target.value }))} />
            </label>
            <p className="a-hint">Stored in MongoDB. Database credentials are never shown here.</p>
            <div className="a-detail-actions">
              <button className="a-btn a-btn-brand" disabled={savingSite}>
                {savingSite ? 'Saving…' : 'Save website settings'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}