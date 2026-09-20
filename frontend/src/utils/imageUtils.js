const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png']

export function validateImage(file) {
  if (!file) {
    return 'Please choose an image before continuing.'
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPG, JPEG, and PNG images are supported.'
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'The image must be 10 MB or smaller.'
  }

  return null
}

export function formatIssueType(issueType) {
  const value = String(issueType || '').trim()
  if (!value) return 'Unknown issue'

  const normalized = value.toLowerCase()
  if (normalized === 'road_crack') return 'Road crack'
  if (normalized === 'pothole') return 'Pothole'
  if (normalized === 'waterlogging') return 'Waterlogging'
  if (normalized === 'trash_overflow') return 'Trash overflow'
  if (value.includes('_')) return value
  return value
}
