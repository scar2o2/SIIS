import NearbyReportsPage from './pages/NearbyReportsPage'
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
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/login') return <AuthPage />
  if (path === '/register') return <AuthPage mode="register" />
  if (path === '/') return <HomePage />
  if (path === '/detect') return requireSignedIn(<DetectionPage />)
  if (path === '/me') return requireSignedIn(<ProfilePage />)
  if (path === '/my-reports') return requireSignedIn(<MyReportsPage />)
  if (path === '/nearby') return <NearbyReportsPage />
  if (path === '/admin') return requireAdmin(<AdminDashboardPage />)
  if (path === '/admin/reports') return requireAdmin(<AdminReportsPage />)
  const reportDetailsMatch = path.match(/^\/reports\/([^/]+)$/)
  if (reportDetailsMatch) {
    return <ReportDetailsPage reportId={reportDetailsMatch[1]} />
  }
  return path === '/reports'
    ? <CommonReportsPage />
    : <HomePage />
}

export default App
