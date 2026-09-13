import { getCurrentUser, logout } from '../services/authService'

function SiteHeader() {
  const user = getCurrentUser()
  const isAdmin = user?.role === 'ADMIN'

  function handleLogout() {
    logout()
    window.location.href = '/'
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">IS</span>
          <span className="brand-name">INFRA-SIGHT</span>
        </a>
        <nav className="site-nav">
          <a href="/">Home</a>
          <a href="/detect">Report Issue</a>
          <a href="/reports">Reports</a>
          {user && <a href="/my-reports">My Reports</a>}
          {user && <a href="/me">Profile</a>}
          {isAdmin && <a href="/admin">Admin</a>}
          {user ? (
            <button className="nav-button" type="button" onClick={handleLogout}>Logout</button>
          ) : (
            <a href="/login">Login</a>
          )}
        </nav>
      </div>
    </header>
  )
}

export default SiteHeader
