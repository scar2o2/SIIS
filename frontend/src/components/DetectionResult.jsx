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
          Try another image if you expected a pothole or road crack.
        </p>
      </div>
    )
  }

  return (
    <>
      {result.severity && (
        <div className="report-summary">
          <span>Severity: {result.severity}</span>
          <span>Priority: {result.priority || 'LOW'}</span>
          <span>Detection count: {result.detections.length}</span>
        </div>
      )}
      <ol className="detection-list">
      {result.detections.map((detection, index) => (
        <li
          className={`detection-item ${detection.issue_type === 'road_crack' ? 'crack' : ''}`}
          key={`${detection.issue_type}-${index}`}
        >
          <div className="detection-label">
            {index + 1}. {formatIssueType(detection.issue_type)}
          </div>
          <div className="detection-meta">
            Confidence: {Math.round(detection.confidence * 100)}%
          </div>
        </li>
      ))}
      </ol>
    </>
  )
}

export default DetectionResult
