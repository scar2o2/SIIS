import { useEffect, useState } from 'react'
import ReportFilters from '../components/ReportFilters'
import ReportList from '../components/ReportList'
import SiteHeader from '../components/SiteHeader'
import { getAdminReports, updateReportStatus } from '../services/aiService'
import '../App.css'

function AdminReportsPage() {
  const [filters, setFilters] = useState({})
  const [reports, setReports] = useState([])
  const [error, setError] = useState('')
  const [updatingReportId, setUpdatingReportId] = useState('')

  useEffect(() => {
    getAdminReports(filters)
      .then((data) => {
        setReports(data.reports)
        setError('')
      })
      .catch((requestError) => setError(requestError.message))
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
          <p className="eyebrow">Admin</p>
          <h1>Reports</h1>
        </section>
        <ReportFilters filters={filters} onChange={setFilters} />
        {error && <p className="message message-error">{error}</p>}
        <section className="common-section">
          <div className="results-header">
            <h2 className="panel-title">All reports</h2>
            <span className="result-count">{reports.length} reports</span>
          </div>
          <ReportList
            reports={reports}
            admin
            onStatusChange={handleStatusChange}
            updatingReportId={updatingReportId}
          />
        </section>
      </main>
    </div>
  )
}

export default AdminReportsPage
