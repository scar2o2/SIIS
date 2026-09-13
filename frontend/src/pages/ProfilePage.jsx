import { useEffect, useState } from 'react'
import ReportList from '../components/ReportList'
import SiteHeader from '../components/SiteHeader'
import { fetchCurrentUser, getCurrentUser } from '../services/authService'
import { getMyReports } from '../services/aiService'
import '../App.css'

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'
}

function ProfilePage() {
  const [user, setUser] = useState(getCurrentUser())
  const [reports, setReports] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetchCurrentUser(), getMyReports()])
      .then(([nextUser, reportData]) => {
        setUser(nextUser)
        setReports(reportData.reports)
      })
      .catch((requestError) => setError(requestError.message))
  }, [])

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="main-content reports-page">
        <section className="intro">
          <p className="eyebrow">Your account</p>
          <h1>Profile</h1>
        </section>
        {error && <p className="message message-error">{error}</p>}
        {user && (
          <section className="profile-card">
            <div className="profile-avatar">{initials(user.name)}</div>
            <div>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <span>Member since {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Sep 2026'}</span>
            </div>
          </section>
        )}
        <section className="stats-strip">
          <div><strong>{reports.length}</strong><span>Reports</span></div>
          <div><strong>{reports.filter((report) => report.status !== 'RESOLVED' && report.status !== 'REJECTED').length}</strong><span>Open</span></div>
          <div><strong>{reports.filter((report) => report.status === 'RESOLVED').length}</strong><span>Resolved</span></div>
        </section>
        <section className="common-section">
          <div className="results-header">
            <h2 className="panel-title">Recent reports</h2>
            <a href="/my-reports">View all</a>
          </div>
          <ReportList reports={reports.slice(0, 5)} />
        </section>
      </main>
    </div>
  )
}

export default ProfilePage
