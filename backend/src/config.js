const path = require('node:path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const port = Number.parseInt(process.env.PORT || '3000', 10)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port between 1 and 65535')
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
}

module.exports = {
  port,
  frontendOrigins: [
    ...new Set([
      process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ]),
  ],
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
  aiServiceTimeoutMs: Number.parseInt(process.env.AI_SERVICE_TIMEOUT_MS || '60000', 10),
  duplicateDistanceMeters: Number.parseFloat(process.env.DUPLICATE_DISTANCE_METERS || '50'),
  duplicateShapeTolerance: Number.parseFloat(process.env.DUPLICATE_SHAPE_TOLERANCE || '0.35'),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
}