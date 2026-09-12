const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

function priorityFromScore(score) {
  if (score >= 80) {
    return 'CRITICAL'
  }
  if (score >= 55) {
    return 'HIGH'
  }
  if (score >= 30) {
    return 'MEDIUM'
  }
  return 'LOW'
}

function calculatePriority({ severity, severityScore, reportCount, issueTypes }) {
  const severityContribution = {
    LOW: 10,
    MEDIUM: 30,
    HIGH: 55,
    CRITICAL: 75,
  }[severity] || 0
  const recurrenceContribution = Math.min(Math.max(reportCount - 1, 0) * 5, 15)
  const issueTypeContribution = issueTypes.includes('ROAD_CRACK') ? 5 : 0
  const supportingScore = Math.min(Math.max(Number(severityScore) || 0, 0) / 4, 10)
  const score = Number((
    severityContribution
    + recurrenceContribution
    + issueTypeContribution
    + supportingScore
  ).toFixed(4))

  return {
    score,
    level: priorityFromScore(score),
  }
}

function priorityRank(level) {
  return PRIORITY_LEVELS.indexOf(level)
}

module.exports = {
  calculatePriority,
  priorityRank,
}
