import { formatIssueType } from '../utils/imageUtils'

function DetectionResult({ result }) {
  if (!result) {
    return (
      <div className="empty-results">
        <p>
          <strong>Ready for analysis</strong>
          Upload a road image to see supported infrastructure issues.
        </p>
      </div>
    )
  }

  if (result.detections.length === 0) {
    return (
      <div className="empty-results">
        <p>
          <strong>No supported infrastructure issue detected.</strong>
          Try another image if you expected a pothole, road crack, or trash detection.
        </p>
      </div>
    )
  }

  return (
    <>
      {result.severity && (
        <div className="report-summary">
          <span className={`status-pill severity-${result.severity.toLowerCase()}`}>Severity: {result.severity}</span>
          <span className={`status-pill priority-${(result.priority || 'LOW').toLowerCase()}`}>Priority: {result.priority || 'LOW'}</span>
          <span>Detection count: {result.detections.length}</span>
        </div>
      )}
      <ol className="detection-list">
      {result.detections.map((detection, index) => {
        const label = detection.class_name || detection.issue_type
        return (
          <li
            className={`detection-item ${detection.issue_type === 'road_crack' ? 'crack' : ['waterlogging', 'trash_overflow'].includes(detection.issue_type) ? 'trash' : ''}`}
            key={`${detection.issue_type}-${index}`}
          >
            <div className="detection-label">
              {index + 1}. {formatIssueType(label)}
            </div>
            <div className="detection-meta">
              Confidence: {Math.round(detection.confidence * 100)}%
            </div>
          </li>
        )
      })}
      </ol>
    </>
  )
}

export default DetectionResult
