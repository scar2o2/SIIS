import { useEffect, useState } from 'react'
import ReportFilters from '../components/ReportFilters'
import ReportList from '../components/ReportList'
import SiteHeader from '../components/SiteHeader'
import { SkeletonReportList } from '../components/Skeleton'
import { getMyReports } from '../services/aiService'
import '../App.css'

function MyReportsPage() {
  const [filters, setFilters] = useState({})
  const [reports, setReports] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getMyReports(filters)
      .then((data) => {
        setReports(data.reports)
        setError('')
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false))
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
            <span className="result-count">{isLoading ? 'Loading' : `${reports.length} reports`}</span>
          </div>
          {isLoading ? <SkeletonReportList /> : <ReportList reports={reports} />}
        </section>
      </main>
    </div>
  )
}

export default MyReportsPage
