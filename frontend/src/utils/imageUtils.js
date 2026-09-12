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
  return issueType === 'road_crack' ? 'Road crack' : 'Pothole'
}
