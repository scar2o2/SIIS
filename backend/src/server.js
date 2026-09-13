const cors = require('cors')
const express = require('express')

const { frontendOrigins, port } = require('./config')
const aiRouter = require('./routes/ai')
const authRouter = require('./routes/auth')
const reportsRouter = require('./routes/reports')

const app = express()

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        frontendOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      ) {
        callback(null, true)
        return
      }
      callback(new Error('Origin is not allowed by backend CORS policy'))
    },
  })
)
app.use(express.json())

app.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'backend',
  })
})

app.use('/api/ai', aiRouter)
app.use('/api/auth', authRouter)
app.use('/api/reports', reportsRouter)

app.use((error, _request, response, _next) => {
  console.error(error)
  const statusCode = error.code === 'LIMIT_FILE_SIZE'
    ? 413
    : Number.isInteger(error.statusCode) ? error.statusCode : 500
  response.status(statusCode).json({
    success: false,
    message: statusCode === 500
      ? 'The backend encountered an unexpected error.'
      : statusCode === 413
        ? 'The image must be 10 MB or smaller.'
        : error.message,
  })
})

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`)
  })
}

module.exports = app