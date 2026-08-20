import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as api from '../api/client.js'

/**
 * Unified auth for public users and admins.
 * Backend User.role is always authoritative — frontend "Admin Login" vs
 * "User Login" only controls UX routing, never privileges.
 */
const AuthCtx = createContext(null)

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function init() {
      if (!api.getToken()) {
        setInitializing(false)
        return
      }
      try {
        const res = await api.fetchMe()
        if (!cancelled) {
          if (res.user) setUser(res.user)
          else {
            api.clearToken()
            setUser(null)
          }
        }
      } catch {
        if (!cancelled) {
          api.clearToken()
          setUser(null)
        }
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  /**
   * Authenticate. expectedRole is UX-only:
   *  - 'admin' → reject if backend role is not admin
   *  - 'user'  → reject if backend role is admin (admins use Admin Login)
   *  - null    → accept any active account
   */
  const login = useCallback(async (email, password, remember = true, expectedRole = null) => {
    const res = await api.authLogin({ email, password })
    if (!res.user) {
      api.clearToken()
      throw new Error('Unable to log in. Please try again.')
    }

    if (expectedRole === 'admin' && res.user.role !== 'admin') {
      api.clearToken()
      throw new Error('Access denied. An admin account is required.')
    }

    if (expectedRole === 'user' && res.user.role === 'admin') {
      if (res.token) api.setToken(res.token, remember)
      setUser(res.user)
      const err = new Error('This is an administrator account. Redirecting to the Admin Dashboard.')
      err.code = 'ADMIN_ACCOUNT'
      err.user = res.user
      throw err
    }

    if (res.token) api.setToken(res.token, remember)
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.authLogout()
    } catch {
      // always clear local state
    }
    api.clearToken()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await api.fetchMe()
    setUser(res.user)
    return res.user
  }, [])

  const value = {
    user,
    initializing,
    login,
    logout,
    refreshUser,
    isAdmin: !!user && user.role === 'admin',
    isAuthenticated: !!user,
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
