import { useEffect, useState } from 'react'
import { getCurrentUser, logout } from '../services/authService'

function initials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  )
}

function MenuIcon({ type }) {
  const paths = {
    home: 'M3 10.5 12 3l9 7.5M5 9v11h14V9M9 20v-6h6v6',
    report: 'M12 3 21 19H3L12 3Zm0 5v5m0 3h.01',
    reports: 'M6 3h12v18H6zM9 7h6M9 11h6M9 15h4',
    mine: 'M6 3h12v18H6zM9 7h6M9 11h6M9 15h3',
    profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
    admin: 'M12 3 20 6v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Zm0 5v5m0 3h.01',
    manage: 'M4 5h16M4 12h16M4 19h16',
    nearby: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  }
  return <svg className="drawer-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={paths[type]} /></svg>
}

function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const user = getCurrentUser()
  const isAdmin = user?.role === 'ADMIN'
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'

  function handleLogout() {
    logout()
    window.location.href = '/'
  }

  function handleNavigation() {
    setIsOpen(false)
    document.body.style.overflow = ''
  }

  // Close drawer on escape key & manage body scroll lock
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  function linkClass(path) {
    return currentPath === path ? 'active' : ''
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">SIIS</span>
            <span className="brand-name">
              <span>INFRASTRUCTURE</span>
              <span>INTELLIGENCE</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="site-nav" aria-label="Main Navigation">
            <a className={linkClass('/')} href="/">Home</a>
            <a className={linkClass('/detect')} href="/detect">Report Issue</a>
            <a className={linkClass('/reports')} href="/reports">Reports</a>
            {user && <a className={linkClass('/my-reports')} href="/my-reports">My Reports</a>}
            {user && <a className={linkClass('/me')} href="/me">Profile</a>}
            {isAdmin && <a className={linkClass('/admin')} href="/admin">Admin</a>}
            {user ? (
              <button className="nav-button" type="button" onClick={handleLogout}>Logout</button>
            ) : (
              <a className={linkClass('/login')} href="/login">Login</a>
            )}
          </nav>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            className={`hamburger-btn ${isOpen ? 'active' : ''}`}
            type="button"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-backdrop ${isOpen ? 'open' : ''}`}
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Off-Canvas Sidebar Drawer */}
      <aside className={`mobile-drawer ${isOpen ? 'open' : ''}`} aria-label="Mobile Navigation">
        <div className="drawer-header">
          <button
            className="drawer-close-btn"
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* User Card in Drawer */}
        <div className="drawer-user-info">
          {user ? (
            <div className="drawer-user-badge">
              <div className="drawer-avatar">{initials(user.name)}</div>
              <div className="drawer-user-meta">
                <strong>{user.name || 'Citizen'}</strong>
                <span>{user.email}</span>
                <span className="drawer-role-pill">{user.role}</span>
              </div>
            </div>
          ) : (
            <div className="drawer-guest-banner">
              <p>Sign in to report road issues and track municipal repair updates.</p>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav className="drawer-nav">
          <a className={`drawer-link ${linkClass('/')}`} href="/" onClick={handleNavigation}>
            <MenuIcon type="home" />
            <span>Home</span>
          </a>
          <a className={`drawer-link ${linkClass('/detect')}`} href="/detect" onClick={handleNavigation}>
            <MenuIcon type="report" />
            <span>Report Issue</span>
          </a>
          <a className={`drawer-link ${linkClass('/reports')}`} href="/reports" onClick={handleNavigation}>
            <MenuIcon type="reports" />
            <span>Community Reports</span>
          </a>
          <a className={`drawer-link ${linkClass('/nearby')}`} href="/nearby" onClick={handleNavigation}>
            <MenuIcon type="nearby" />
            <span>Nearby Map</span>
          </a>

          {user && (
            <a className={`drawer-link ${linkClass('/my-reports')}`} href="/my-reports" onClick={handleNavigation}>
              <MenuIcon type="mine" />
              <span>My Reports</span>
            </a>
          )}

          {user && (
            <a className={`drawer-link ${linkClass('/me')}`} href="/me" onClick={handleNavigation}>
              <MenuIcon type="profile" />
              <span>My Profile</span>
            </a>
          )}

          {isAdmin && (
            <>
              <div className="drawer-divider">Admin Portal</div>
              <a className={`drawer-link ${linkClass('/admin')}`} href="/admin" onClick={handleNavigation}>
                <MenuIcon type="admin" />
                <span>Admin Dashboard</span>
              </a>
              <a className={`drawer-link ${linkClass('/admin/reports')}`} href="/admin/reports" onClick={handleNavigation}>
                <MenuIcon type="manage" />
                <span>Manage Reports</span>
              </a>
            </>
          )}
        </nav>

        {/* Drawer Footer Actions */}
        <div className="drawer-footer">
          {user ? (
            <button className="button drawer-logout-btn" type="button" onClick={handleLogout}>
              Sign Out
            </button>
          ) : (
            <div className="drawer-auth-buttons">
              <a className="button button-primary" href="/login" onClick={handleNavigation}>
                Sign In
              </a>
              <a className="button button-secondary" href="/register" onClick={handleNavigation}>
                Register
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default SiteHeader
