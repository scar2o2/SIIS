import { useEffect, useState } from 'react'
import ReportMap from '../components/ReportMap'
import SiteHeader from '../components/SiteHeader'
import { getReport, updateReportStatus } from '../services/aiService'
import { getCurrentUser } from '../services/authService'
import { formatIssueType } from '../utils/imageUtils'
import '../App.css'

function ReportDetailsPage({ reportId }) {
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const isAdmin = getCurrentUser()?.role === 'ADMIN'

  useEffect(() => {
    getReport(reportId).then(setReport).catch((requestError) => setError(requestError.message))
  }, [reportId])

  async function handleStatusChange(status) {
    setIsUpdating(true)
    setError('')
    setMessage('')
    try {
      await updateReportStatus(reportId, status)
      setReport((current) => ({ ...current, status }))
      setMessage('Report status updated.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="main-content reports-page">
        <a className="back-link" href="/reports">Back to common reports</a>
        <section className="intro">
          <p className="eyebrow">Report details</p>
          <h1>{report ? 'Infrastructure report' : 'Loading report'}</h1>
        </section>
        {error && <p className="message message-error">{error}</p>}
        {message && <p className="message report-message">{message}</p>}
        {!report && !error && <p className="message report-message">Loading report details...</p>}
        {report && (
          <div className="details-layout">
            <section className="common-section">
              <h2 className="panel-title">Summary</h2>
              <div className="detail-list">
                <span><strong>Report ID:</strong> {report.id}</span>
                <span><strong>Status:</strong> {report.status}</span>
                <span><strong>Severity:</strong> {report.severity}</span>
                <span><strong>Priority:</strong> {report.priority}</span>
                <span><strong>Submitted:</strong> {new Date(report.created_at).toLocaleString()}</span>
                <span><strong>Location:</strong> {report.latitude}, {report.longitude}</span>
              </div>
              {isAdmin && (
                <label className="status-control">
                  Update status
                  <select
                    value={report.status}
                    disabled={isUpdating}
                    onChange={(event) => handleStatusChange(event.target.value)}
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under review</option>
                    <option value="ACKNOWLEDGED">Acknowledged</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </label>
              )}
              <ReportMap latitude={report.latitude} longitude={report.longitude} />
            </section>
            <section className="common-section">
              <h2 className="panel-title">Detections</h2>
              <div className="common-grid">
                {report.detections.map((detection) => (
                  <article className="common-card" key={detection.id}>
                    <strong>{formatIssueType(detection.issue_type.toLowerCase())}</strong>
                    <span>Confidence: {Math.round(Number(detection.confidence) * 100)}%</span>
                    <span>Issue group: {detection.issue_group_id || 'Not grouped'}</span>
                  </article>
                ))}
              </div>
            </section>
            <section className="common-section">
              <h2 className="panel-title">Submitted evidence</h2>
              <div className="common-grid">
                {report.images.map((image) => (
                  <article className="common-card" key={image.id}>
                    <strong>{image.file_name}</strong>
                    {image.signed_url && <img className="evidence-image" src={image.signed_url} alt={image.file_name} />}
                    <span>Type: {image.mime_type}</span>
                    <span>Size: {Math.round(image.file_size / 1024)} KB</span>
                    <span>Dimensions: {image.width} x {image.height}</span>
                    <span>Uploaded: {new Date(image.created_at).toLocaleString()}</span>
                  </article>
                ))}
              </div>
            </section>
            <section className="common-section">
              <h2 className="panel-title">Evidence history</h2>
              <div className="common-grid">
                {report.report_history.map((event) => (
                  <article className="common-card" key={event.id}>
                    <strong>{event.event_type.replace('_', ' ')}</strong>
                    <span>Status: {event.status}</span>
                    <span>{new Date(event.created_at).toLocaleString()}</span>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default ReportDetailsPage
