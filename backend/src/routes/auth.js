const express = require('express')

const { requireAuth } = require('../middleware/auth')
const { getCurrentUser, login, register } = require('../services/authService')

const router = express.Router()

router.post('/register', async (request, response, next) => {
  try {
    response.status(201).json(await register(request.body || {}))
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (request, response, next) => {
  try {
    response.json(await login(request.body || {}))
  } catch (error) {
    next(error)
  }
})

router.get('/me', requireAuth, async (request, response, next) => {
  try {
    response.json(await getCurrentUser(request.user.sub))
  } catch (error) {
    next(error)
  }
})

router.post('/logout', requireAuth, (_request, response) => {
  response.json({ success: true })
})

module.exports = router
