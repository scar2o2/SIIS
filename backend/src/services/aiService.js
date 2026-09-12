const { aiServiceTimeoutMs, aiServiceUrl } = require('../config')

class AiServiceError extends Error {
  constructor(message, options = {}) {
    super(message, options)
    this.name = 'AiServiceError'
    this.statusCode = options.statusCode || 502
  }
}

function validatePredictionResponse(payload) {
  if (
    !payload ||
    payload.success !== true ||
    !payload.image ||
    !Number.isFinite(payload.image.width) ||
    !Number.isFinite(payload.image.height) ||
    !Array.isArray(payload.detections)
  ) {
    throw new AiServiceError('The AI service returned an invalid response.')
  }

  for (const detection of payload.detections) {
    const box = detection?.bounding_box
    if (
      !['pothole', 'road_crack'].includes(detection?.issue_type) ||
      !Number.isFinite(detection?.confidence) ||
      detection.confidence < 0 ||
      detection.confidence > 1 ||
      !box ||
      !['x1', 'y1', 'x2', 'y2'].every((key) => Number.isFinite(box[key])) ||
      box.x1 < 0 ||
      box.y1 < 0 ||
      box.x2 <= box.x1 ||
      box.y2 <= box.y1 ||
      box.x2 > payload.image.width ||
      box.y2 > payload.image.height
    ) {
      throw new AiServiceError('The AI service returned an invalid response.')
    }
  }

  return payload
}

async function predictImage({ buffer, filename, mimetype }) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new AiServiceError('An image is required.', { statusCode: 400 })
  }

  const formData = new FormData()
  formData.append('file', new Blob([buffer], { type: mimetype }), filename)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), aiServiceTimeoutMs)

  let response
  try {
    response = await fetch(`${aiServiceUrl}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AiServiceError(
        'The AI service timed out while processing the image.',
        { cause: error, statusCode: 504 }
      )
    }
    throw new AiServiceError(
      'Unable to connect to the AI service.',
      { cause: error, statusCode: 502 }
    )
  } finally {
    clearTimeout(timeoutId)
  }

  let payload
  try {
    payload = await response.json()
  } catch (error) {
    throw new AiServiceError(
      'The AI service returned an invalid response.',
      { cause: error }
    )
  }

  if (!response.ok) {
    throw new AiServiceError(
      payload.detail || 'The AI service could not process the image.',
      { statusCode: response.status }
    )
  }

  return validatePredictionResponse(payload)
}

module.exports = {
  AiServiceError,
  predictImage,
  validatePredictionResponse,
}