import { useState } from 'react'
import { SkeletonReportList } from './Skeleton'

function formatValue(value) {
  return String(value || '').replaceAll('_', ' ').toLowerCase()
}

function ReportList({ reports, admin = false, onStatusChange, updatingReportId, loading = false }) {
  const [visibleCount, setVisibleCount] = useState(3)
  if (loading) {
    return <SkeletonReportList count={4} />
  }

  if (!reports.length) {
    return <p className="message report-message">No reports match the current view.</p>
  }

  const visibleReports = reports.slice(0, visibleCount)
  return (
    <div className="reports-list-container">
      {/* Desktop Table */}
      <div className="table-wrap desktop-only">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Status</th>
              <th>Severity</th>
              <th>Priority</th>
              <th>Detections</th>
              {admin && <th>Reporter</th>}
              <th>Submitted</th>
              {admin && <th>Update</th>}
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {visibleReports.map((report) => (
              <tr key={report.id}>
                <td>{(report.issue_types || []).map(formatValue).join(', ') || 'none'}</td>
                <td><span className={`status-pill ${report.status.toLowerCase()}`}>{formatValue(report.status)}</span></td>
                <td><span className={`status-pill severity-${report.severity.toLowerCase()}`}>{formatValue(report.severity)}</span></td>
                <td><span className={`status-pill priority-${report.priority.toLowerCase()}`}>{formatValue(report.priority)}</span></td>
                <td>{report.detection_count}</td>
                {admin && <td>{report.users?.email || 'Unknown'}</td>}
                <td>{new Date(report.created_at).toLocaleString()}</td>
                {admin && (
                  <td>
                    <select
                      value={report.status}
                      disabled={updatingReportId === report.id}
                      onChange={(event) => onStatusChange(report.id, event.target.value)}
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under review</option>
                      <option value="ACKNOWLEDGED">Acknowledged</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                )}
                <td>
                  <a href={`/reports/${report.id}`}>Open</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="mobile-reports-grid mobile-only">
        {visibleReports.map((report) => {
          return (
            <article className="mobile-report-card" key={report.id}>
              <div className="mobile-card-header">
                <strong className="mobile-card-issue">
                  {(report.issue_types || []).map(formatValue).join(', ') || 'Unspecified Issue'}
                </strong>
                <span className={`status-pill ${report.status.toLowerCase()}`}>
                  {formatValue(report.status)}
                </span>
              </div>

              <div className="mobile-card-meta">
                <div className="mobile-badge-row">
                  <span className={`status-pill severity-${report.severity.toLowerCase()}`}>
                    Sev: {formatValue(report.severity)}
                  </span>
                  <span className={`status-pill priority-${report.priority.toLowerCase()}`}>
                    Pri: {formatValue(report.priority)}
                  </span>
                  <span className="mobile-detection-pill">
                    {report.detection_count} {report.detection_count === 1 ? 'detection' : 'detections'}
                  </span>
                </div>

                {admin && report.users?.email && (
                  <div className="mobile-card-reporter">
                    <span>Reported by:</span> <strong>{report.users.email}</strong>
                  </div>
                )}

                <div className="mobile-card-date">
                  <span>Submitted:</span>{' '}
                  {new Date(report.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {admin && (
                <div className="mobile-card-admin-action">
                  <label htmlFor={`status-${report.id}`}>Update Status:</label>
                  <select
                    id={`status-${report.id}`}
                    value={report.status}
                    disabled={updatingReportId === report.id}
                    onChange={(event) => onStatusChange(report.id, event.target.value)}
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under review</option>
                    <option value="ACKNOWLEDGED">Acknowledged</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              )}

              <div className="mobile-card-footer">
                <a className="button button-secondary mobile-view-btn" href={`/reports/${report.id}`}>
                  View Details & Map →
                </a>
              </div>
            </article>
          )
        })}
      </div>
      <div className="view-more-actions">
        {visibleCount < reports.length && (
          <button className="button button-secondary view-more-button" type="button" onClick={() => setVisibleCount((count) => count + 3)}>
            View more ({reports.length - visibleCount} remaining)
          </button>
        )}
        {visibleCount > 3 && (
          <button className="button button-secondary view-more-button" type="button" onClick={() => setVisibleCount(3)}>
            View less
          </button>
        )}
      </div>
    </div>
  )
}

export default ReportList
