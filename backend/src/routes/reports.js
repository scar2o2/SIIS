const express = require('express')
const multer = require('multer')

const {
  ReportServiceError,
  createReport,
  getReport,
  getStatistics,
  updateReportStatus,
} = require('../services/reportService')

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      callback(null, true)
      return
    }
    callback(new ReportServiceError('Only JPG, JPEG, and PNG images are supported.', 415))
  },
})

router.post('/', upload.single('image'), async (request, response, next) => {
  try {
    const result = await createReport({
      file: request.file,
      latitude: request.body.latitude,
      longitude: request.body.longitude,
      description: request.body.description,
    })
    response.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/statistics', async (_request, response, next) => {
  try {
    response.json(await getStatistics())
  } catch (error) {
    next(error)
  }
})

router.get('/:reportId', async (request, response, next) => {
  try {
    response.json(await getReport(request.params.reportId))
  } catch (error) {
    next(error)
  }
})

router.patch('/:reportId/status', async (request, response, next) => {
  try {
    response.json(await updateReportStatus({
      reportId: request.params.reportId,
      status: request.body.status,
    }))
  } catch (error) {
    next(error)
  }
})

module.exports = router