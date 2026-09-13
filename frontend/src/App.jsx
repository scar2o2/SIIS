import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminReportsPage from './pages/AdminReportsPage'
import DetectionPage from './pages/DetectionPage'
import HomePage from './pages/HomePage'
import CommonReportsPage from './pages/CommonReportsPage'
import ReportDetailsPage from './pages/ReportDetailsPage'
import AuthPage from './pages/AuthPage'
import MyReportsPage from './pages/MyReportsPage'
import ProfilePage from './pages/ProfilePage'
import { getCurrentUser, isAuthenticated } from './services/authService'

function redirect(path) {
  window.location.href = path
  return null
}

function requireSignedIn(page) {
  return isAuthenticated() ? page : redirect('/login')
}

function requireAdmin(page) {
  const user = getCurrentUser()
  if (!isAuthenticated()) return redirect('/login')
  return user?.role === 'ADMIN' ? page : redirect('/me')
}

function App() {
  if (window.location.pathname === '/login') return <AuthPage />
  if (window.location.pathname === '/register') return <AuthPage mode="register" />
  if (window.location.pathname === '/') return <HomePage />
  if (window.location.pathname === '/detect') return requireSignedIn(<DetectionPage />)
  if (window.location.pathname === '/me') return requireSignedIn(<ProfilePage />)
  if (window.location.pathname === '/my-reports') return requireSignedIn(<MyReportsPage />)
  if (window.location.pathname === '/nearby') return redirect('/reports')
  if (window.location.pathname === '/admin') return requireAdmin(<AdminDashboardPage />)
  if (window.location.pathname === '/admin/reports') return requireAdmin(<AdminReportsPage />)
  const reportDetailsMatch = window.location.pathname.match(/^\/reports\/([^/]+)$/)
  if (reportDetailsMatch) {
    return requireSignedIn(<ReportDetailsPage reportId={reportDetailsMatch[1]} />)
  }
  return window.location.pathname === '/reports'
    ? <CommonReportsPage />
    : <HomePage />
}

export default App
