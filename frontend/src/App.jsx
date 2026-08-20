import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import ApplyPage from './pages/ApplyPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import ExpertDetailPage from './pages/ExpertDetailPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import './styles/home.css'
import './admin/admin.css'
import { AdminAuthProvider } from './admin/adminAuth.jsx'
import RequireAdmin from './admin/RequireAdmin.jsx'
import AdminLogin from './admin/AdminLogin.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import AdminApplications from './admin/AdminApplications.jsx'
import AdminApplicationDetail from './admin/AdminApplicationDetail.jsx'
import AdminContacts from './admin/AdminContacts.jsx'
import AdminContactDetail from './admin/AdminContactDetail.jsx'
import AdminUsers from './admin/AdminUsers.jsx'
import AdminUserDetail from './admin/AdminUserDetail.jsx'
import AdminNotifications from './admin/AdminNotifications.jsx'
import AdminTestimonials from './admin/AdminTestimonials.jsx'
import AdminMessages from './admin/AdminMessages.jsx'
import AdminTeam from './admin/AdminTeam.jsx'
import AdminContent from './admin/AdminContent.jsx'
import AdminHome from './admin/AdminHome.jsx'
import AdminAudit from './admin/AdminAudit.jsx'
import AdminSettings from './admin/AdminSettings.jsx'
import AdminProfile from './admin/AdminProfile.jsx'

/**
 * App routes:
 *  - "/"          public website (unchanged)
 *  - "/login"     public login (User + Admin options)
 *  - "/apply"     Get Start Online application page
 *  - "/admin/*"   separate, protected admin dashboard (login required, admin role only)
 */
function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/expert/:id" element={<ExpertDetailPage />} />


        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="home" element={<AdminHome />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="applications/:id" element={<AdminApplicationDetail />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="contacts/:id" element={<AdminContactDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="messages/:id" element={<AdminContactDetail />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminAuthProvider>
  )
}

export default App
