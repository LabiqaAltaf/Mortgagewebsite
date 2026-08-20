/**
 * API client for the Mortgage Website (public + admin).
 *
 * The JSON base URL is read from VITE_API_URL (frontend/.env), e.g.
 * http://localhost:5000/api. This is only the HTTP address of the backend.
 * MongoDB credentials NEVER appear anywhere in the frontend.
 *
 * The admin JWT is stored locally (localStorage or sessionStorage) purely so
 * the admin stays logged in - it is NOT a MongoDB credential.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const KEY = 'mw_admin_token'
const SESSION_KEY = 'mw_admin_token_session'

export function getToken() {
  return localStorage.getItem(KEY) || sessionStorage.getItem(SESSION_KEY) || null
}

export function setToken(token, remember = true) {
  clearToken()
  if (remember) localStorage.setItem(KEY, token)
  else sessionStorage.setItem(SESSION_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

async function request(path, { body, method, auth = false, ...options } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: method || 'GET',
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401 && auth) clearToken()
    const error = new Error(data?.message || 'Something went wrong. Please try again.')
    error.status = response.status
    throw error
  }

  return data
}

// ---- Public website ----
export const submitApplication = (payload) => request('/applications', { method: 'POST', body: payload })
export const submitContactMessage = (payload) => request('/contact', { method: 'POST', body: payload })

// Admin-managed content shown publicly (active/verified records only).
export const getTeamPublic = () => request('/team/public')
export const getTestimonialsPublic = () => request('/testimonials/public')
export const listTestimonials = (q = {}) => request('/testimonials?' + new URLSearchParams(q), { auth: true })
export const createTestimonial = (payload) => request('/testimonials', { method: 'POST', auth: true, body: payload })
export const updateTestimonial = (id, payload) => request(`/testimonials/${id}`, { method: 'PATCH', auth: true, body: payload })
export const removeTestimonial = (id) => request(`/testimonials/${id}`, { method: 'DELETE', auth: true })
export const getLendersPublic = () => request('/lenders/public')
export const getPublicContent = () => request('/content/public')

// Approved user messages/comments shown on the public Learn More page.
export const getContactMessagesPublic = () => request('/contact/public')

// ---- Auth (public + authenticated) ----
export const authLogin = (payload) => request('/auth/login', { method: 'POST', body: payload })
export const authLogout = () => request('/auth/logout', { method: 'POST', auth: true })
export const fetchMe = () => request('/auth/me', { auth: true })
export const updateMyProfile = (payload) => request('/auth/profile', { method: 'PATCH', auth: true, body: payload })
export const changeMyPassword = (payload) => request('/auth/change-password', { method: 'PATCH', auth: true, body: payload })
// ---- Admin endpoints (all require the admin JWT) ----
export const getDashboard = () => request('/admin/dashboard', { auth: true })

export const listApplications = (q = {}) => request('/applications?' + new URLSearchParams(q), { auth: true })
export const getApplication = (id) => request(`/applications/${id}`, { auth: true })
export const updateApplicationStatus = (id, status) => request(`/applications/${id}/status`, { method: 'PATCH', auth: true, body: { status } })
export const replyToApplication = (id, body) => request(`/applications/${id}/reply`, { method: 'POST', auth: true, body: { body } })
export const removeApplication = (id) => request(`/applications/${id}`, { method: 'DELETE', auth: true })

export const listContacts = (q = {}) => request('/contact?' + new URLSearchParams(q), { auth: true })
export const getContact = (id) => request(`/contact/${id}`, { auth: true })
export const updateContactRead = (id, read) => request(`/contact/${id}/read`, { method: 'PATCH', auth: true, body: { read } })
export const updateContactStatus = (id, status) => request(`/contact/${id}/status`, { method: 'PATCH', auth: true, body: { status } })
export const updateContactApproval = (id, approved) => request(`/contact/${id}/approve`, { method: 'PATCH', auth: true, body: { approved } })
export const replyToContact = (id, payload) => request(`/contact/${id}/reply`, { method: 'POST', auth: true, body: typeof payload === 'string' ? { body: payload } : payload })
export const createAdminMessage = (payload) => request('/contact/admin-message', { method: 'POST', auth: true, body: payload })
export const removeContact = (id) => request(`/contact/${id}`, { method: 'DELETE', auth: true })

export const listUsers = (q = {}) => request('/users?' + new URLSearchParams(q), { auth: true })
export const getUser = (id) => request(`/users/${id}`, { auth: true })
export const updateUserStatus = (id, status) => request(`/users/${id}/status`, { method: 'PATCH', auth: true, body: { status } })
export const updateUserRole = (id, role) => request(`/users/${id}/role`, { method: 'PATCH', auth: true, body: { role } })

export const listNotifications = (q = {}) => request('/notifications?' + new URLSearchParams(q), { auth: true })
export const markNotificationRead = (id) => request(`/notifications/${id}/read`, { method: 'PATCH', auth: true, body: {} })
export const markAllNotificationsRead = () => request('/notifications/read-all', { method: 'PATCH', auth: true, body: {} })
export const removeNotification = (id) => request(`/notifications/${id}`, { method: 'DELETE', auth: true })

export const listTeamMembers = (q = {}) => request('/team?' + new URLSearchParams(q), { auth: true })
export const getTeamMember = (id) => request(`/team/${id}`, { auth: true })
export const createTeamMember = (payload) => request('/team', { method: 'POST', auth: true, body: payload })
export const updateTeamMember = (id, payload) => request(`/team/${id}`, { method: 'PATCH', auth: true, body: payload })
export const removeTeamMember = (id) => request(`/team/${id}`, { method: 'DELETE', auth: true })

export const getSiteContent = () => request('/site/content', { auth: true })
export const updateSiteContent = (content) => request('/site/content', { method: 'PATCH', auth: true, body: { content } })

// Public website content managed via Admin Home / Content (PublicContent).
export const getAdminContent = () => request('/content', { auth: true })
export const updateAdminContent = (content) => request('/content', { method: 'PATCH', auth: true, body: { content } })

// Audit / activity logs (admin only).
export const listAuditLogs = (q = {}) => request('/audit?' + new URLSearchParams(q), { auth: true })
