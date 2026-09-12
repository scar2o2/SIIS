const express = require('express')
const multer = require('multer')

const { AiServiceError, predictImage } = require('../services/aiService')

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      callback(null, true)
      return
    }
    callback(new AiServiceError('Only JPG, JPEG, and PNG images are supported.', {
      statusCode: 415,
    }))
  },
})

router.post('/predict', upload.single('file'), async (request, response, next) => {
  if (!request.file) {
    next(new AiServiceError('An image is required.', { statusCode: 400 }))
    return
  }

  try {
    const result = await predictImage({
      buffer: request.file.buffer,
      filename: request.file.originalname,
      mimetype: request.file.mimetype,
    })
    response.json(result)
  } catch (error) {
    next(error)
  }
})

module.exports = router
