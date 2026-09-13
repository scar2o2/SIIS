import { useEffect, useState } from 'react'
import ReportFilters from '../components/ReportFilters'
import ReportList from '../components/ReportList'
import SiteHeader from '../components/SiteHeader'
import { getMyReports } from '../services/aiService'
import '../App.css'

function MyReportsPage() {
  const [filters, setFilters] = useState({})
  const [reports, setReports] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    getMyReports(filters)
      .then((data) => {
        setReports(data.reports)
        setError('')
      })
      .catch((requestError) => setError(requestError.message))
  }, [filters])

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="main-content reports-page">
        <section className="intro">
          <p className="eyebrow">Your submissions</p>
          <h1>My Reports</h1>
        </section>
        <ReportFilters filters={filters} onChange={setFilters} />
        {error && <p className="message message-error">{error}</p>}
        <section className="common-section">
          <div className="results-header">
            <h2 className="panel-title">Owned reports</h2>
            <span className="result-count">{reports.length} reports</span>
          </div>
          <ReportList reports={reports} />
        </section>
      </main>
    </div>
  )
}

export default MyReportsPage
