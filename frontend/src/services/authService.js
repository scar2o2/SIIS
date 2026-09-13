const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000'

function storeSession(payload) {
  window.localStorage.setItem('siis_token', payload.token)
  window.localStorage.setItem('siis_user', JSON.stringify(payload.user))
  return payload
}

async function request(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = await response.json()
  if (!response.ok || payload.success !== true) {
    throw new Error(payload.message || 'Authentication request failed.')
  }
  return storeSession(payload)
}

export function getToken() {
  return window.localStorage.getItem('siis_token')
}

export function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function register(credentials) {
  return request('/api/auth/register', credentials)
}

export function login(credentials) {
  return request('/api/auth/login', credentials)
}

export function logout() {
  window.localStorage.removeItem('siis_token')
  window.localStorage.removeItem('siis_user')
}

export function getCurrentUser() {
  const value = window.localStorage.getItem('siis_user')
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    logout()
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export async function fetchCurrentUser() {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: authHeaders(),
  })
  const payload = await response.json()
  if (!response.ok || payload.success !== true) {
    logout()
    throw new Error(payload.message || 'Unable to load your profile.')
  }
  window.localStorage.setItem('siis_user', JSON.stringify(payload.user))
  return payload.user
}
