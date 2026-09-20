import { formatIssueType } from '../utils/imageUtils'

function DetectionOverlay({ imageUrl, image, detections }) {
  return (
    <div className="image-stage">
      <img src={imageUrl} alt="Analyzed road with detected issues" />
      {detections.map((detection, index) => {
        const { x1, y1, x2, y2 } = detection.bounding_box
        const left = (x1 / image.width) * 100
        const top = (y1 / image.height) * 100
        const width = ((x2 - x1) / image.width) * 100
        const height = ((y2 - y1) / image.height) * 100
        const className = detection.issue_type === 'road_crack'
          ? 'box crack'
          : ['waterlogging', 'trash_overflow'].includes(detection.issue_type)
            ? 'box trash'
            : 'box'
        const labelValue = detection.class_name || detection.issue_type

        return (
          <div
            className={className}
            key={`${detection.issue_type}-${index}`}
            style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
          >
            <span className="box-label">
              {formatIssueType(labelValue)} {Math.round(detection.confidence * 100)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default DetectionOverlay
