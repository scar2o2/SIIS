import { authHeaders } from './authService'

const DEFAULT_WEB_API_URL = 'http://127.0.0.1:3000'
const DEFAULT_ANDROID_API_URL = 'http://10.0.2.2:3000'

function resolveApiUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL
  if (configuredUrl) return configuredUrl

  if (window.Capacitor && window.Capacitor.isNativePlatform?.()) {
    return import.meta.env.VITE_API_URL_ANDROID || DEFAULT_ANDROID_API_URL
  }

  return DEFAULT_WEB_API_URL
}

const API_URL = resolveApiUrl()
const REQUEST_TIMEOUT_MS = 60_000

function queryString(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value)
    }
  })
  const value = params.toString()
  return value ? `?${value}` : ''
}

async function readJsonResponse(response, fallbackMessage) {
  let payload
  try {
    payload = await response.json()
  } catch (error) {
    throw new Error('The backend returned an invalid response.', { cause: error })
  }
  if (!response.ok || payload.success !== true) {
    throw new Error(payload.message || fallbackMessage)
  }
  return payload
}

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
      headers: authHeaders(),
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
      headers: authHeaders(),
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

export async function getCommonReports(filters = {}) {
  let response
  try {
    response = await fetch(`${API_URL}/api/reports${queryString(filters)}`)
  } catch (error) {
    throw new Error('Unable to connect to the backend. Please make sure it is running.', {
      cause: error,
    })
  }

  return readJsonResponse(response, 'Unable to load common reports.')
}

export async function getMyReports(filters = {}) {
  const response = await fetch(`${API_URL}/api/reports/mine${queryString(filters)}`, {
    headers: authHeaders(),
  })
  return readJsonResponse(response, 'Unable to load your reports.')
}

export async function getAdminReports(filters = {}) {
  const response = await fetch(`${API_URL}/api/reports/admin${queryString(filters)}`, {
    headers: authHeaders(),
  })
  return readJsonResponse(response, 'Unable to load admin reports.')
}

export async function getStatistics() {
  const response = await fetch(`${API_URL}/api/reports/statistics`, {
    headers: authHeaders(),
  })
  return readJsonResponse(response, 'Unable to load dashboard statistics.')
}

export async function getNearbyReports(filters = {}) {
  const response = await fetch(`${API_URL}/api/reports/nearby${queryString(filters)}`, {
    headers: authHeaders(),
  })
  return readJsonResponse(response, 'Unable to load nearby reports.')
}

export async function getReport(reportId) {
  const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
    headers: authHeaders(),
  })
  const payload = await readJsonResponse(response, 'Unable to load report details.')
  return payload.report
}

export async function updateReportStatus(reportId, status) {
  const response = await fetch(`${API_URL}/api/reports/${reportId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ status }),
  })
  return readJsonResponse(response, 'Unable to update report status.')
}
