import { useEffect, useState } from 'react'
import ReportList from '../components/ReportList'
import SiteHeader from '../components/SiteHeader'
import { fetchCurrentUser, getCurrentUser } from '../services/authService'
import { getMyReports } from '../services/aiService'
import '../App.css'

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
          <section className="common-section profile-grid">
            <div><span>Name</span><strong>{user.name}</strong></div>
            <div><span>Email</span><strong>{user.email}</strong></div>
            <div><span>Role</span><strong>{user.role}</strong></div>
            <div><span>Reports</span><strong>{reports.length}</strong></div>
          </section>
        )}
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
