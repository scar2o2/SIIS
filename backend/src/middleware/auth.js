const jwt = require('jsonwebtoken')

const { jwtSecret } = require('../config')

function requireAuth(request, _response, next) {
  const header = request.get('authorization') || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    next(Object.assign(new Error('Authentication is required.'), { statusCode: 401 }))
    return
  }

  try {
    request.user = jwt.verify(token, jwtSecret)
    next()
  } catch (error) {
    next(Object.assign(new Error('The authentication token is invalid or expired.'), {
      statusCode: 401,
      cause: error,
    }))
  }
}

function requireRole(...roles) {
  return (request, _response, next) => {
    if (!request.user) {
      next(Object.assign(new Error('Authentication is required.'), { statusCode: 401 }))
      return
    }

    if (!roles.includes(request.user.role)) {
      next(Object.assign(new Error('You do not have permission to perform this action.'), {
        statusCode: 403,
      }))
      return
    }

    next()
  }
}

module.exports = { requireAuth, requireRole }
