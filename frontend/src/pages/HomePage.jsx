import { useEffect, useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import { getCurrentUser } from '../services/authService'
import { getCommonReports } from '../services/aiService'
import '../App.css'

function HomePage() {
  const user = getCurrentUser()
  const [summary, setSummary] = useState({ reports: 0, groups: 0 })

  useEffect(() => {
    getCommonReports()
      .then((data) => setSummary({
        reports: data.reports.length,
        groups: data.issue_groups.length,
      }))
      .catch(() => {})
  }, [])

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="main-content">
        <section className="home-hero">
          <p className="eyebrow">Report. Detect. Prioritize.</p>
          <h1>INFRA-SIGHT</h1>
          <p className="intro-copy">
            AI-powered infrastructure monitoring for safer and better-connected cities.
          </p>
          <div className="action-row">
            <a className="button button-primary" href={user ? '/detect' : '/register'}>{user ? 'Report an Issue' : 'Create Account'}</a>
            <a className="button button-secondary hero-secondary" href="/reports">Explore Nearby Issues</a>
          </div>
        </section>
        <section className="stats-strip">
          <div><strong>{summary.reports}</strong><span>Reports</span></div>
          <div><strong>{summary.groups}</strong><span>Issue groups</span></div>
          <div><strong>{user ? user.role.toLowerCase() : 'guest'}</strong><span>Current access</span></div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
