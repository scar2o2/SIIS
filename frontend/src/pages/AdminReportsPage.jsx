import { useEffect, useState } from 'react'
import ReportFilters from '../components/ReportFilters'
import ReportList from '../components/ReportList'
import SiteHeader from '../components/SiteHeader'
import { SkeletonReportList } from '../components/Skeleton'
import { getAdminReports, updateReportStatus } from '../services/aiService'
import '../App.css'

function AdminReportsPage() {
  const [filters, setFilters] = useState({})
  const [reports, setReports] = useState([])
  const [error, setError] = useState('')
  const [updatingReportId, setUpdatingReportId] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getAdminReports(filters)
      .then((data) => {
        setReports(data.reports)
        setError('')
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false))
  }, [filters])

  async function handleStatusChange(reportId, status) {
    setUpdatingReportId(reportId)
    setError('')
    try {
      await updateReportStatus(reportId, status)
      setReports((current) => current.map((report) => (
        report.id === reportId ? { ...report, status } : report
      )))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdatingReportId('')
    }
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="main-content reports-page">
        <section className="intro">
          <p className="eyebrow">Municipal operations</p>
          <h1>Reports</h1>
        </section>
        <ReportFilters filters={filters} onChange={setFilters} />
        {error && <p className="message message-error">{error}</p>}
        <section className="common-section">
          <div className="results-header">
            <h2 className="panel-title">All reports</h2>
            <span className="result-count">{isLoading ? 'Loading' : `${reports.length} reports`}</span>
          </div>
          {isLoading ? <SkeletonReportList /> : <ReportList
            reports={reports}
            admin
            onStatusChange={handleStatusChange}
            updatingReportId={updatingReportId}
          />}
        </section>
      </main>
    </div>
  )
}

export default AdminReportsPage
