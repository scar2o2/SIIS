import { getCurrentUser } from '../services/authService'

function formatValue(value) {
  return String(value || '').replaceAll('_', ' ').toLowerCase()
}

function ReportList({ reports, admin = false, onStatusChange, updatingReportId }) {
  const user = getCurrentUser()

  if (!reports.length) {
    return <p className="message report-message">No reports match the current view.</p>
  }

  return (
    <div className="table-wrap">
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
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{(report.issue_types || []).map(formatValue).join(', ') || 'none'}</td>
              <td><span className={`status-pill ${report.status.toLowerCase()}`}>{formatValue(report.status)}</span></td>
              <td>{formatValue(report.severity)}</td>
              <td>{formatValue(report.priority)}</td>
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
                {user?.role === 'ADMIN' || user?.id === report.user_id ? (
                  <a href={`/reports/${report.id}`}>Open</a>
                ) : user ? (
                  <span>Private</span>
                ) : (
                  <a href="/login">Login</a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ReportList
