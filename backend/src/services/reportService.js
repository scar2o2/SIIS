const crypto = require('node:crypto')
const path = require('node:path')

const { supabase } = require('../db')
const { REPORTS_BUCKET } = require('../storage')
const { predictImage } = require('./aiService')
const { resolveIssueGroup } = require('./issueGroupingService')
const { calculateSeverity, severityRank } = require('./severityService')
const { calculatePriority, priorityRank } = require('./priorityService')
const { notifyNewIssue } = require('./notificationService')
const { createAnnotatedImage } = require('./annotationService')

const REPORT_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ACKNOWLEDGED',
  'RESOLVED',
  'REJECTED',
]

function normalizeIssueType(issueType) {
  const normalized = String(issueType || '').toLowerCase()
  if (normalized === 'road_crack') return 'ROAD_CRACK'
  if (normalized === 'waterlogging') return 'WATERLOGGING'
  if (normalized === 'trash_overflow') return 'TRASH_OVERFLOW'
  return 'POTHOLE'
}

class ReportServiceError extends Error {
  constructor(message, statusCode = 500, options = {}) {
    super(message, options)
    this.name = 'ReportServiceError'
    this.statusCode = statusCode
  }
}

function validateStatus(status) {
  if (!REPORT_STATUSES.includes(status)) {
    throw new ReportServiceError(
      `Status must be one of: ${REPORT_STATUSES.join(', ')}.`,
      400
    )
  }
}

function parseCoordinate(value, name, minimum, maximum) {
  const coordinate = Number(value)
  if (!Number.isFinite(coordinate) || coordinate < minimum || coordinate > maximum) {
    throw new ReportServiceError(
      `${name} must be a number between ${minimum} and ${maximum}.`,
      400
    )
  }
  return coordinate
}

function storageExtension(mimetype) {
  return mimetype === 'image/png' ? 'png' : 'jpg'
}

function safeMetadataFilename(filename) {
  const basename = path.basename(filename || 'report-image')
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'report-image'
}

function normalizeFilter(value) {
  return String(value || '').trim()
}

function normalizeEnumFilter(value) {
  return normalizeFilter(value).toUpperCase()
}

function normalizeIssueFilter(value) {
  const normalized = normalizeFilter(value)
  if (['waterlogging', 'trash_overflow'].includes(normalized.toLowerCase())) {
    return normalized.toLowerCase()
  }
  return normalized.toUpperCase()
}

function normalizeDate(value, endOfDay = false) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new ReportServiceError('Date filters must be valid dates.', 400)
  }
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    date.setUTCHours(23, 59, 59, 999)
  }
  return date
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const radiusMeters = 6371000
  const toRadians = (degrees) => degrees * Math.PI / 180
  const deltaLat = toRadians(lat2 - lat1)
  const deltaLon = toRadians(lon2 - lon1)
  const a = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(deltaLon / 2) ** 2
  return 2 * radiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function parseRadius(value) {
  const radius = value === undefined || value === null || value === ''
    ? 1000
    : Number(value)
  if (!Number.isFinite(radius) || radius <= 0 || radius > 50000) {
    throw new ReportServiceError('Radius must be a number between 1 and 50000 meters.', 400)
  }
  return radius
}

async function removeStorageFile(storagePath) {
  const { error } = await supabase.storage.from(REPORTS_BUCKET).remove([storagePath])
  if (error) {
    console.error(`Unable to remove storage file ${storagePath}: ${error.message}`)
  }
}

async function signedImageUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from(REPORTS_BUCKET)
    .createSignedUrl(storagePath, 60 * 10)
  if (error) {
    console.error(`Unable to sign storage file ${storagePath}: ${error.message}`)
    return null
  }
  return data.signedUrl
}

async function attachSignedImages(report) {
  if (!report?.images) return report
  const images = await Promise.all(report.images.map(async (image) => ({
    ...image,
    signed_url: await signedImageUrl(image.storage_path),
  })))
  return { ...report, images }
}

function summarizeReport(report) {
  const detections = report.detections || []
  return {
    ...report,
    detection_count: detections.length,
    issue_types: [...new Set(detections.map((detection) => detection.issue_type))],
    issue_group_ids: [...new Set(
      detections
        .map((detection) => detection.issue_group_id)
        .filter(Boolean)
    )],
  }
}

function reportMatchesFilters(report, filters = {}) {
  const issueType = normalizeIssueFilter(filters.issue_type)
  const severity = normalizeEnumFilter(filters.severity)
  const priority = normalizeEnumFilter(filters.priority)
  const status = normalizeEnumFilter(filters.status)
  const search = normalizeFilter(filters.search).toLowerCase()
  const dateFrom = normalizeDate(filters.date_from)
  const dateTo = normalizeDate(filters.date_to, true)
  const createdAt = new Date(report.created_at)

  if (issueType && !(report.issue_types || []).includes(issueType)) return false
  if (severity && report.severity !== severity) return false
  if (priority && report.priority !== priority) return false
  if (status && report.status !== status) return false
  if (dateFrom && createdAt < dateFrom) return false
  if (dateTo && createdAt > dateTo) return false
  if (search) {
    const haystack = [
      report.id,
      report.description,
      report.status,
      report.severity,
      report.priority,
      ...(report.issue_types || []),
      report.users?.name,
      report.users?.email,
    ].filter(Boolean).join(' ').toLowerCase()
    if (!haystack.includes(search)) return false
  }

  return true
}

function groupMatchesFilters(group, filters = {}) {
  const issueType = normalizeIssueFilter(filters.issue_type)
  const severity = normalizeEnumFilter(filters.severity)
  const priority = normalizeEnumFilter(filters.priority)
  const status = normalizeEnumFilter(filters.status)
  const search = normalizeFilter(filters.search).toLowerCase()
  const dateFrom = normalizeDate(filters.date_from)
  const dateTo = normalizeDate(filters.date_to, true)
  const updatedAt = new Date(group.updated_at || group.created_at)

  if (issueType && !(group.issue_types || [group.issue_type]).includes(issueType)) return false
  if (severity && group.severity !== severity) return false
  if (priority && group.priority !== priority) return false
  if (status && group.status !== status) return false
  if (dateFrom && updatedAt < dateFrom) return false
  if (dateTo && updatedAt > dateTo) return false
  if (search) {
    const haystack = [
      group.id,
      group.issue_type,
      group.status,
      group.severity,
      group.priority,
    ].join(' ').toLowerCase()
    if (!haystack.includes(search)) return false
  }

  return true
}

async function enrichIssueGroups(groups) {
  const groupIds = groups.map((group) => group.id).filter(Boolean)
  if (groupIds.length === 0) return groups

  const { data: linkedDetections, error } = await supabase
    .from('detections')
    .select('issue_group_id, report_id, issue_type')
    .in('issue_group_id', groupIds)

  if (error) {
    throw new ReportServiceError('Unable to load issue-group detections.', 502, { cause: error })
  }

  const reportIds = [...new Set((linkedDetections || []).map((detection) => detection.report_id))]
  let reportDetections = []
  if (reportIds.length > 0) {
    const { data, error: reportDetectionError } = await supabase
      .from('detections')
      .select('report_id, issue_type')
      .in('report_id', reportIds)

    if (reportDetectionError) {
      throw new ReportServiceError('Unable to load report issue types.', 502, {
        cause: reportDetectionError,
      })
    }
    reportDetections = data || []
  }

  const reportTypes = new Map()
  for (const detection of reportDetections) {
    const currentTypes = reportTypes.get(detection.report_id) || []
    currentTypes.push(detection.issue_type)
    reportTypes.set(detection.report_id, [...new Set(currentTypes)])
  }

  const groupTypes = new Map()
  for (const detection of linkedDetections || []) {
    const currentTypes = groupTypes.get(detection.issue_group_id) || []
    currentTypes.push(detection.issue_type)
    currentTypes.push(...(reportTypes.get(detection.report_id) || []))
    groupTypes.set(detection.issue_group_id, [...new Set(currentTypes)])
  }

  return groups.map((group) => ({
    ...group,
    issue_types: groupTypes.get(group.id) || [group.issue_type],
  }))
}

async function listReports({ filters = {}, userId = null, includeUser = false } = {}) {
  let query = supabase
    .from('reports')
    .select(`
      id,
      user_id,
      status,
      description,
      latitude,
      longitude,
      severity,
      severity_score,
      priority,
      priority_score,
      created_at,
      updated_at,
      images (id, file_name, mime_type, width, height, created_at),
      detections (id, issue_type, confidence, issue_group_id, created_at)
      ${includeUser ? ', users (id, name, email, role)' : ''}
    `)
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query
  if (error) {
    throw new ReportServiceError('Unable to retrieve reports.', 502, { cause: error })
  }

  return (data || [])
    .map(summarizeReport)
    .filter((report) => reportMatchesFilters(report, filters))
}

async function createReport({ file, latitude, longitude, description, userId }) {
  if (!file) {
    throw new ReportServiceError('An image is required.', 400)
  }

  const parsedLatitude = parseCoordinate(latitude, 'Latitude', -90, 90)
  const parsedLongitude = parseCoordinate(longitude, 'Longitude', -180, 180)
  const aiResult = await predictImage({
    buffer: file.buffer,
    filename: file.originalname,
    mimetype: file.mimetype,
  })
  const severity = calculateSeverity({
    detections: aiResult.detections,
    image: aiResult.image,
  })
  const initialPriority = calculatePriority({
    severity: severity.level,
    severityScore: severity.score,
    reportCount: 1,
    issueTypes: [...new Set(aiResult.detections.map((detection) => (
      normalizeIssueType(detection.issue_type)
    )))],
  })
  let annotatedImage
  try {
    annotatedImage = await createAnnotatedImage({
      buffer: file.buffer,
      image: aiResult.image,
      detections: aiResult.detections,
    })
  } catch (annotationError) {
    throw new ReportServiceError('Unable to create the annotated report image.', 500, {
      cause: annotationError,
    })
  }
  const reportId = crypto.randomUUID()
  const storagePath = `reports/${reportId}/${crypto.randomUUID()}.${storageExtension(file.mimetype)}`

  const { error: uploadError } = await supabase.storage
    .from(REPORTS_BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    })
  if (uploadError) {
    throw new ReportServiceError('Unable to store the report image.', 502, {
      cause: uploadError,
    })
  }

  let reportCreated = false
  let imageCreated = false
  let imageId
  const createdGroupIds = []
  const incrementedGroupIds = []
  try {
    const { error: reportError } = await supabase.from('reports').insert({
      id: reportId,
      user_id: userId,
      status: 'SUBMITTED',
      description: description || null,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      severity: severity.level,
      severity_score: severity.score,
      priority: initialPriority.level,
      priority_score: initialPriority.score,
    })
    if (reportError) {
      throw new ReportServiceError('Unable to create the report.', 502, { cause: reportError })
    }
    reportCreated = true

    const { data: image, error: imageError } = await supabase
      .from('images')
      .insert({
        report_id: reportId,
        storage_path: storagePath,
        file_name: safeMetadataFilename(file.originalname),
        mime_type: file.mimetype,
        file_size: file.size,
        width: aiResult.image.width,
        height: aiResult.image.height,
      })
      .select('id')
      .single()
    if (imageError) {
      throw new ReportServiceError('Unable to save image metadata.', 502, { cause: imageError })
    }
    imageCreated = true
    imageId = image.id

    const groupedDetections = []
    for (const detection of aiResult.detections) {
      const issueType = normalizeIssueType(detection.issue_type)
      const groupResult = await resolveIssueGroup({
        issueType,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        detection,
        image: aiResult.image,
      })
      if (groupResult.created) {
        createdGroupIds.push(groupResult.group.id)
      }
      groupedDetections.push({
        detection,
        issueType,
        group: groupResult.group,
        isDuplicate: !groupResult.created,
      })
    }

    const detectionRows = groupedDetections.map(({ detection, issueType, group }) => ({
      report_id: reportId,
      image_id: image.id,
      issue_type: issueType,
      confidence: detection.confidence,
      x1: detection.bounding_box.x1,
      y1: detection.bounding_box.y1,
      x2: detection.bounding_box.x2,
      y2: detection.bounding_box.y2,
      issue_group_id: group.id,
    }))
    if (detectionRows.length > 0) {
      const { error: detectionError } = await supabase.from('detections').insert(detectionRows)
      if (detectionError) {
        throw new ReportServiceError('Unable to save detection records.', 502, {
          cause: detectionError,
        })
      }
    }

    const groupIds = [...new Set(groupedDetections.map(({ group }) => group.id))]
    const groupTypes = new Map()
    for (const { group, issueType } of groupedDetections) {
      const types = groupTypes.get(group.id) || []
      types.push(issueType)
      groupTypes.set(group.id, [...new Set(types)])
    }
    for (const groupId of groupIds) {
      const { data: group, error: groupReadError } = await supabase
        .from('issue_groups')
        .select('report_count, severity, severity_score, priority, priority_score')
        .eq('id', groupId)
        .single()
      if (groupReadError) {
        throw new ReportServiceError('Unable to update issue-group history.', 502, {
          cause: groupReadError,
        })
      }

      const { error: groupUpdateError } = await supabase
        .from('issue_groups')
        .update({
          report_count: group.report_count + 1,
          severity: severityRank(severity.level) > severityRank(group.severity)
            ? severity.level
            : group.severity,
          severity_score: Math.max(Number(group.severity_score), severity.score),
          priority: priorityRank(calculatePriority({
            severity: severity.level,
            severityScore: severity.score,
            reportCount: group.report_count + 1,
            issueTypes: groupTypes.get(groupId) || [],
          }).level) > priorityRank(group.priority)
            ? calculatePriority({
              severity: severity.level,
              severityScore: severity.score,
              reportCount: group.report_count + 1,
              issueTypes: groupTypes.get(groupId) || [],
            }).level
            : group.priority,
          priority_score: Math.max(
            Number(group.priority_score),
            calculatePriority({
              severity: severity.level,
              severityScore: severity.score,
              reportCount: group.report_count + 1,
              issueTypes: groupTypes.get(groupId) || [],
            }).score
          ),
          updated_at: new Date().toISOString(),
        })
        .eq('id', groupId)
      if (groupUpdateError) {
        throw new ReportServiceError('Unable to update issue-group history.', 502, {
          cause: groupUpdateError,
        })
      }
      incrementedGroupIds.push(groupId)
    }

    const historyRows = [{
      report_id: reportId,
      status: 'SUBMITTED',
      event_type: 'CREATED',
      details: {
        detection_count: groupedDetections.length,
        issue_group_ids: groupIds,
      },
    }]
    for (const { group, isDuplicate } of groupedDetections) {
      if (isDuplicate) {
        historyRows.push({
          report_id: reportId,
          status: 'SUBMITTED',
          event_type: 'GROUPED',
          details: { issue_group_id: group.id },
        })
      }
    }
    const { error: historyError } = await supabase.from('report_history').insert(historyRows)
    if (historyError) {
      throw new ReportServiceError('Unable to save report history.', 502, {
        cause: historyError,
      })
    }

    const issueTypes = [...new Set(groupedDetections.map(({ issueType }) => issueType))]
    const { data: reporter, error: reporterError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', userId)
      .maybeSingle()
    if (reporterError) {
      throw new ReportServiceError('Unable to load report owner details.', 502, {
        cause: reporterError,
      })
    }
    try {
      await notifyNewIssue({
        reportId,
        issueTypes,
        severity: severity.level,
        priority: initialPriority.level,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        detectionCount: aiResult.detections.length,
        duplicate: groupedDetections.some(({ isDuplicate }) => isDuplicate),
        reporter,
        annotatedImage,
      })
    } catch (notificationError) {
      console.error(`Unable to send issue notification: ${notificationError.message}`)
    }

    return {
      success: true,
      report_id: reportId,
      image_id: image.id,
      detections: aiResult.detections,
      image: aiResult.image,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      severity: severity.level,
      severity_score: severity.score,
      priority: initialPriority.level,
      priority_score: initialPriority.score,
      issue_group_ids: groupIds,
      duplicate: groupedDetections.some(({ isDuplicate }) => isDuplicate),
    }
  } catch (error) {
    for (const groupId of incrementedGroupIds) {
      const { data: group } = await supabase
        .from('issue_groups')
        .select('report_count')
        .eq('id', groupId)
        .maybeSingle()
      if (group) {
        await supabase
          .from('issue_groups')
          .update({ report_count: Math.max(0, group.report_count - 1) })
          .eq('id', groupId)
      }
    }
    if (imageCreated) {
      await supabase.from('images').delete().eq('id', imageId)
    }
    if (reportCreated) {
      await supabase.from('reports').delete().eq('id', reportId)
    }
    if (createdGroupIds.length > 0) {
      await supabase.from('issue_groups').delete().in('id', createdGroupIds)
    }
    await removeStorageFile(storagePath)
    throw error
  }
}

async function getReport(reportId) {
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select(`
      id,
      user_id,
      status,
      description,
      latitude,
      longitude,
      severity,
      severity_score,
      priority,
      priority_score,
      created_at,
      updated_at,
      images (
        id,
        storage_path,
        file_name,
        mime_type,
        file_size,
        width,
        height,
        created_at
      ),
      detections (
        id,
        image_id,
        issue_type,
        confidence,
        x1,
        y1,
        x2,
        y2,
        issue_group_id,
        created_at
      ),
      report_history (
        id,
        status,
        event_type,
        details,
        created_at
      )
    `)
    .eq('id', reportId)
    .single()

  if (reportError) {
    if (reportError.code === 'PGRST116') {
      throw new ReportServiceError('Report not found.', 404)
    }
    throw new ReportServiceError('Unable to retrieve the report.', 502, {
      cause: reportError,
    })
  }

  return {
    success: true,
    report: await attachSignedImages(report),
  }
}

async function getCommonReports(filters = {}) {
  const [reportsResult, groupsResult] = await Promise.all([
    listReports({ filters }),
    supabase
      .from('issue_groups')
      .select(`
        id,
        issue_type,
        latitude,
        longitude,
        severity,
        severity_score,
        priority,
        priority_score,
        status,
        report_count,
        created_at,
        updated_at
      `)
      .order('updated_at', { ascending: false }),
  ])

  if (groupsResult.error) {
    throw new ReportServiceError('Unable to retrieve common reports.', 502, {
      cause: groupsResult.error,
    })
  }

  return {
    success: true,
    reports: reportsResult,
    issue_groups: (await enrichIssueGroups(groupsResult.data || []))
      .filter((group) => groupMatchesFilters(group, filters)),
  }
}

async function getMyReports({ userId, filters = {} }) {
  return {
    success: true,
    reports: await listReports({ userId, filters }),
  }
}

async function getAdminReports(filters = {}) {
  return {
    success: true,
    reports: await listReports({ filters, includeUser: true }),
  }
}

async function getNearbyReports({ latitude, longitude, radius, filters = {} }) {
  const parsedLatitude = parseCoordinate(latitude, 'Latitude', -90, 90)
  const parsedLongitude = parseCoordinate(longitude, 'Longitude', -180, 180)
  const parsedRadius = parseRadius(radius)

  const [reports, groupsResult] = await Promise.all([
    listReports({ filters }),
    supabase
      .from('issue_groups')
      .select(`
        id,
        issue_type,
        latitude,
        longitude,
        severity,
        severity_score,
        priority,
        priority_score,
        status,
        report_count,
        created_at,
        updated_at
      `)
      .order('updated_at', { ascending: false }),
  ])

  if (groupsResult.error) {
    throw new ReportServiceError('Unable to retrieve nearby reports.', 502, {
      cause: groupsResult.error,
    })
  }

  const withDistance = (item) => ({
    ...item,
    distance_meters: Math.round(haversineMeters(
      parsedLatitude,
      parsedLongitude,
      Number(item.latitude),
      Number(item.longitude)
    )),
  })

  return {
    success: true,
    radius_meters: parsedRadius,
    reports: reports
      .map(withDistance)
      .filter((report) => report.distance_meters <= parsedRadius)
      .sort((a, b) => a.distance_meters - b.distance_meters),
    issue_groups: (await enrichIssueGroups(groupsResult.data || []))
      .map(withDistance)
      .filter((group) => group.distance_meters <= parsedRadius)
      .filter((group) => groupMatchesFilters(group, filters))
      .sort((a, b) => a.distance_meters - b.distance_meters),
  }
}

async function updateReportStatus({ reportId, status }) {
  validateStatus(status)

  const { data: report, error: updateError } = await supabase
    .from('reports')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId)
    .select('id, status, updated_at')
    .maybeSingle()

  if (updateError) {
    throw new ReportServiceError('Unable to update report status.', 502, {
      cause: updateError,
    })
  }
  if (!report) {
    throw new ReportServiceError('Report not found.', 404)
  }

  const { error: historyError } = await supabase.from('report_history').insert({
    report_id: reportId,
    status,
    event_type: 'STATUS_CHANGED',
    details: { status },
  })
  if (historyError) {
    throw new ReportServiceError('Report status changed but history could not be saved.', 502, {
      cause: historyError,
    })
  }

  return {
    success: true,
    report,
  }
}

function countBy(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] || 0) + 1
    return counts
  }, {})
}

async function getStatistics() {
  const [
    reportsResult,
    groupsResult,
    detectionsResult,
  ] = await Promise.all([
    supabase
      .from('reports')
      .select('status, severity, priority', { count: 'exact' }),
    supabase
      .from('issue_groups')
      .select('id, report_count', { count: 'exact' }),
    supabase
      .from('detections')
      .select('issue_type', { count: 'exact' }),
  ])

  const failedResult = [reportsResult, groupsResult, detectionsResult]
    .find((result) => result.error)
  if (failedResult) {
    throw new ReportServiceError('Unable to retrieve report statistics.', 502, {
      cause: failedResult.error,
    })
  }

  const reports = reportsResult.data || []
  const groups = groupsResult.data || []
  const detections = detectionsResult.data || []

  return {
    success: true,
    statistics: {
      total_reports: reportsResult.count || 0,
      total_issue_groups: groupsResult.count || 0,
      total_detections: detectionsResult.count || 0,
      duplicate_reports: groups
        .filter((group) => Number(group.report_count) > 1)
        .reduce((total, group) => total + Number(group.report_count) - 1, 0),
      reports_by_status: countBy(reports.map((report) => report.status)),
      reports_by_severity: countBy(reports.map((report) => report.severity)),
      reports_by_priority: countBy(reports.map((report) => report.priority)),
      detections_by_type: countBy(detections.map((detection) => detection.issue_type)),
    },
  }
}

module.exports = {
  ReportServiceError,
  createReport,
  getAdminReports,
  getCommonReports,
  getMyReports,
  getNearbyReports,
  getReport,
  getStatistics,
  updateReportStatus,
}
