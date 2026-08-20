import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, useToast } from './ui.jsx'
import { changeMyPassword, updateMyProfile } from '../api/client.js'
import { useAuth } from './adminAuth.jsx'
import { formatDate, initials, roleLabel } from './format.js'

export default function AdminProfile() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingPass, setSavingPass] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

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

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/admin/login', { replace: true })
  }

  const Row = ({ label, value }) => (
    <div className="a-kv">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  )

  return (
    <div className="a-dash">
      <div className="a-dash-cols">
        <Card title="Admin profile">
          <div className="a-user-head">
            <span className="a-avatar a-avatar-lg">{initials(user?.name)}</span>
            <div>
              <h2 className="a-detail-name">{user?.name}</h2>
              <span className="a-cell-sub">{user?.email}</span>
              <div className="a-mt4">
                <span className="a-badge a-badge-blue">{roleLabel(user?.role)}</span>
              </div>
            </div>
          </div>
          <Row label="Account created" value={formatDate(user?.createdAt)} />
          <Row label="Last login" value={user?.lastLogin ? formatDate(user.lastLogin) : 'Never'} />
          <div className="a-detail-actions">
            <button className="a-btn a-btn-ghost" onClick={handleLogout} disabled={loggingOut}>
              <i className="bi bi-box-arrow-right" /> {loggingOut ? 'Logging out…' : 'Logout'}
            </button>
          </div>
        </Card>

        <Card title="Edit profile">
          <form onSubmit={saveProfile}>
            <label className="a-field">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="a-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <div className="a-detail-actions">
              <button className="a-btn a-btn-brand" disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </Card>

        <Card title="Change password">
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
                {savingPass ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}