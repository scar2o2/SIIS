const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { jwtExpiresIn, jwtSecret } = require('../config')
const { supabase } = require('../db')

class AuthServiceError extends Error {
  constructor(message, statusCode = 400, details = {}) {
    super(message)
    this.name = 'AuthServiceError'
    this.statusCode = statusCode
    Object.assign(this, details)
  }
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function validateCredentials(email, password) {
  const normalizedEmail = normalizeEmail(email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new AuthServiceError('A valid email address is required.')
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw new AuthServiceError('Password must be at least 8 characters long.')
  }
  return normalizedEmail
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

function createToken(user) {
  if (!jwtSecret) {
    throw new AuthServiceError('JWT_SECRET is not configured on the backend.', 500)
  }
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  )
}

async function register({ name, email, password }) {
  const normalizedEmail = validateCredentials(email, password)
  const trimmedName = String(name || '').trim()
  if (!trimmedName) {
    throw new AuthServiceError('Name is required.')
  }

  const { data: existingUser, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()
  if (lookupError) {
    throw new AuthServiceError('Unable to check account availability.', 502, { cause: lookupError })
  }
  if (existingUser) {
    throw new AuthServiceError('An account with this email already exists.', 409)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const { data: user, error: insertError } = await supabase
    .from('users')
    .insert({
      name: trimmedName,
      email: normalizedEmail,
      password_hash: passwordHash,
      role: 'USER',
    })
    .select('id, name, email, role')
    .single()
  if (insertError) {
    if (insertError.code === '23505') {
      throw new AuthServiceError('An account with this email already exists.', 409)
    }
    throw new AuthServiceError('Unable to create the account.', 502, { cause: insertError })
  }

  return { success: true, user: publicUser(user), token: createToken(user) }
}

async function login({ email, password }) {
  const normalizedEmail = validateCredentials(email, password)
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, role, password_hash')
    .eq('email', normalizedEmail)
    .maybeSingle()
  if (error) {
    throw new AuthServiceError('Unable to sign in right now.', 502, { cause: error })
  }
  if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AuthServiceError('Invalid email or password.', 401)
  }

  return { success: true, user: publicUser(user), token: createToken(user) }
}

async function getCurrentUser(userId) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new AuthServiceError('Unable to load the current user.', 502, { cause: error })
  }
  if (!user) {
    throw new AuthServiceError('The authenticated user no longer exists.', 404)
  }

  return { success: true, user }
}

module.exports = { AuthServiceError, getCurrentUser, login, register }
