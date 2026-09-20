const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function detectionScore(detection, image) {
  const boxWidth = Math.max(0, detection.bounding_box.x2 - detection.bounding_box.x1)
  const boxHeight = Math.max(0, detection.bounding_box.y2 - detection.bounding_box.y1)
  const imageArea = image.width * image.height
  const areaRatio = imageArea > 0 ? (boxWidth * boxHeight) / imageArea : 0
  const areaScore = clamp(areaRatio * 100, 0, 50)
  const confidenceSupport = clamp(detection.confidence, 0, 1) * 20
  const issueTypeWeight = detection.issue_type === 'road_crack'
    ? 5
    : ['waterlogging', 'trash_overflow'].includes(detection.issue_type) ? 3 : 0

  return areaScore + confidenceSupport + issueTypeWeight
}

function severityFromScore(score) {
  if (score >= 75) {
    return 'CRITICAL'
  }
  if (score >= 50) {
    return 'HIGH'
  }
  if (score >= 25) {
    return 'MEDIUM'
  }
  return 'LOW'
}

function calculateSeverity({ detections, image }) {
  if (!detections.length) {
    return {
      score: 0,
      level: 'LOW',
    }
  }

  const detectionScores = detections.map((detection) => detectionScore(detection, image))
  const strongestDetection = Math.max(...detectionScores)
  const countContribution = clamp((detections.length - 1) * 5, 0, 20)
  const score = Number((strongestDetection + countContribution).toFixed(4))

  return {
    score,
    level: severityFromScore(score),
  }
}

function severityRank(level) {
  return SEVERITY_LEVELS.indexOf(level)
}

module.exports = {
  calculateSeverity,
  severityRank,
}
