const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000'
const REQUEST_TIMEOUT_MS = 60_000

export async function predictImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${API_URL}/api/ai/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'The analysis timed out. Please try a smaller image or try again.',
        { cause: error }
      )
    }
    throw new Error(
      'Unable to connect to the backend. Please make sure the backend is running.',
      { cause: error }
    )
  } finally {
    clearTimeout(timeoutId)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('The AI service returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(payload.detail || 'The AI service could not process this image.')
  }

  if (
    payload.success !== true ||
    !payload.image ||
    !Array.isArray(payload.detections)
  ) {
    throw new Error('The AI service returned an invalid response.')
  }

  return payload
}

export async function createReport({ file, latitude, longitude, description = '' }) {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('latitude', String(latitude))
  formData.append('longitude', String(longitude))
  if (description) {
    formData.append('description', description)
  }

  let response
  try {
    response = await fetch(`${API_URL}/api/reports`, {
      method: 'POST',
      body: formData,
    })
  } catch (error) {
    throw new Error('Unable to connect to the backend. Please make sure it is running.', {
      cause: error,
    })
  }

  let payload
  try {
    payload = await response.json()
  } catch (error) {
    throw new Error('The backend returned an invalid response.', { cause: error })
  }

  if (!response.ok || payload.success !== true) {
    throw new Error(payload.message || 'Unable to save the report.')
  }

  return payload
}
