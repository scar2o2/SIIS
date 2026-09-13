import { useEffect, useState } from 'react'
import SiteHeader from '../components/SiteHeader'
import { getStatistics } from '../services/aiService'
import '../App.css'

function metricEntries(object = {}) {
  return Object.entries(object).sort(([left], [right]) => left.localeCompare(right))
}

function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getStatistics()
      .then((data) => setStats(data.statistics))
      .catch((requestError) => setError(requestError.message))
  }, [])

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="main-content reports-page">
        <section className="intro">
          <p className="eyebrow">Admin</p>
          <h1>Dashboard</h1>
        </section>
        {error && <p className="message message-error">{error}</p>}
        {!stats && !error && <p className="message report-message">Loading dashboard...</p>}
        {stats && (
          <>
            <section className="stats-strip">
              <div><strong>{stats.total_reports}</strong><span>Total reports</span></div>
              <div><strong>{stats.total_issue_groups}</strong><span>Issue groups</span></div>
              <div><strong>{stats.total_detections}</strong><span>Detections</span></div>
              <div><strong>{stats.duplicate_reports}</strong><span>Duplicates</span></div>
            </section>
            <section className="common-section metric-grid">
              {[
                ['Status', stats.reports_by_status],
                ['Severity', stats.reports_by_severity],
                ['Priority', stats.reports_by_priority],
                ['Issue type', stats.detections_by_type],
              ].map(([title, values]) => (
                <article className="common-card" key={title}>
                  <strong>{title}</strong>
                  {metricEntries(values).map(([name, count]) => (
                    <span key={name}>{name.replaceAll('_', ' ')}: {count}</span>
                  ))}
                </article>
              ))}
            </section>
            <a className="button button-primary" href="/admin/reports">Manage reports</a>
          </>
        )}
      </main>
    </div>
  )
}

export default AdminDashboardPage
