import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../admin/adminAuth.jsx'

export default function LoginPage() {
  const { login, initializing, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (initializing) return <div className='auth-page'><div className='auth-card auth-card--loading'><span className='auth-spinner' /><p>Loading…</p></div></div>
  if (isAdmin) return <Navigate to='/admin' replace />

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password, remember, 'admin')
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to log in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <div className='auth-page'>
    <div className='auth-bg' aria-hidden='true' />
    <div className='auth-card'>
      <Link to='/' className='auth-brand' aria-label='mainly mortgages home'>
        <svg className='auth-logo-mark' viewBox='0 0 40 40' fill='none' aria-hidden='true'>
          <path d='M9 29 L15 11' stroke='#1769FF' strokeWidth='3.4' strokeLinecap='round' />
          <path d='M15 11 L19 22 L23 11' stroke='#1769FF' strokeWidth='3.4' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M23 11 L29 29' stroke='#1769FF' strokeWidth='3.4' strokeLinecap='round' />
        </svg>
        <span className='auth-brand-text'><span className='auth-brand-sub'>mainly</span><span className='auth-brand-main'>mortgages</span></span>
      </Link>
      <p className='auth-eyebrow'>Secure sign in</p>
      <h1 className='auth-title'>Admin Login</h1>
      <p className='auth-sub'>Administrator access only. Your account role is checked on the server.</p>
      {error && <div className='auth-error' role='alert'><i className='bi bi-exclamation-circle' aria-hidden='true' /><span>{error}</span></div>}
      <form onSubmit={onSubmit} className='auth-form' noValidate>
        <label className='auth-field'><span>Email</span><input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='admin@example.com' autoComplete='email' required disabled={busy} /></label>
        <label className='auth-field'><span>Password</span><input type='password' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='current-password' required disabled={busy} /></label>
        <label className='auth-check'><input type='checkbox' checked={remember} onChange={(e) => setRemember(e.target.checked)} disabled={busy} /><span>Keep me signed in</span></label>
        <button type='submit' className='auth-submit' disabled={busy}>{busy ? 'Signing in…' : 'Sign in as Admin'}</button>
      </form>
      <p className='auth-foot'><Link to='/'>← Back to website</Link> · <Link to='/admin/login'>Classic admin login</Link></p>
    </div>
  </div>
}
