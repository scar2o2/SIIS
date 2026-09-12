const crypto = require('node:crypto')
const path = require('node:path')

const { supabase } = require('../db')
const { REPORTS_BUCKET } = require('../storage')
const { predictImage } = require('./aiService')
const { resolveIssueGroup } = require('./issueGroupingService')

class ReportServiceError extends Error {
  constructor(message, statusCode = 500, options = {}) {
    super(message, options)
    this.name = 'ReportServiceError'
    this.statusCode = statusCode
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

async function removeStorageFile(storagePath) {
  const { error } = await supabase.storage.from(REPORTS_BUCKET).remove([storagePath])
  if (error) {
    console.error(`Unable to remove storage file ${storagePath}: ${error.message}`)
  }
}

async function createReport({ file, latitude, longitude, description }) {
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
      status: 'SUBMITTED',
      description: description || null,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
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
      const issueType = detection.issue_type === 'road_crack' ? 'ROAD_CRACK' : 'POTHOLE'
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
    for (const groupId of groupIds) {
      const { data: group, error: groupReadError } = await supabase
        .from('issue_groups')
        .select('report_count')
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

    return {
      success: true,
      report_id: reportId,
      image_id: image.id,
      detections: aiResult.detections,
      image: aiResult.image,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
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

module.exports = {
  ReportServiceError,
  createReport,
}
