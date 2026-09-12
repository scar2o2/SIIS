const { duplicateDistanceMeters, duplicateShapeTolerance } = require('../config')
const { supabase } = require('../db')

const EARTH_RADIUS_METERS = 6_371_000

function toRadians(value) {
  return (value * Math.PI) / 180
}

function distanceInMeters(latitudeA, longitudeA, latitudeB, longitudeB) {
  const latitudeDelta = toRadians(latitudeB - latitudeA)
  const longitudeDelta = toRadians(longitudeB - longitudeA)
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(latitudeA))
      * Math.cos(toRadians(latitudeB))
      * Math.sin(longitudeDelta / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a))
}

function detectionShape(detection, image) {
  const width = image.width
  const height = image.height
  const boxWidth = Math.max(0, detection.bounding_box.x2 - detection.bounding_box.x1)
  const boxHeight = Math.max(0, detection.bounding_box.y2 - detection.bounding_box.y1)
  return {
    areaRatio: (boxWidth * boxHeight) / (width * height),
    aspectRatio: boxHeight === 0 ? 0 : boxWidth / boxHeight,
  }
}

function shapesMatch(first, second) {
  const areaDifference = Math.abs(first.areaRatio - second.areaRatio)
  const aspectDifference = Math.abs(first.aspectRatio - second.aspectRatio)
  return areaDifference <= duplicateShapeTolerance
    && aspectDifference <= duplicateShapeTolerance * 4
}

async function findMatchingGroup({ issueType, latitude, longitude, detection, image }) {
  const latitudeDelta = duplicateDistanceMeters / 111_320
  const longitudeDelta = latitudeDelta / Math.max(Math.cos(toRadians(latitude)), 0.01)
  const { data: candidates, error } = await supabase
    .from('issue_groups')
    .select('id, latitude, longitude, issue_type')
    .eq('issue_type', issueType)
    .gte('latitude', latitude - latitudeDelta)
    .lte('latitude', latitude + latitudeDelta)
    .gte('longitude', longitude - longitudeDelta)
    .lte('longitude', longitude + longitudeDelta)

  if (error) {
    throw new Error(`Unable to check issue groups: ${error.message}`)
  }

  const currentShape = detectionShape(detection, image)
  for (const candidate of candidates || []) {
    if (distanceInMeters(latitude, longitude, candidate.latitude, candidate.longitude)
      > duplicateDistanceMeters) {
      continue
    }

    const { data: representative, error: detectionError } = await supabase
      .from('detections')
      .select('x1, y1, x2, y2, images(width, height)')
      .eq('issue_group_id', candidate.id)
      .limit(1)
      .maybeSingle()

    if (detectionError) {
      throw new Error(`Unable to compare issue-group evidence: ${detectionError.message}`)
    }
    if (!representative || !representative.images) {
      return candidate
    }

    const representativeShape = detectionShape(
      {
        bounding_box: {
          x1: Number(representative.x1),
          y1: Number(representative.y1),
          x2: Number(representative.x2),
          y2: Number(representative.y2),
        },
      },
      representative.images
    )
    if (shapesMatch(currentShape, representativeShape)) {
      return candidate
    }
  }

  return null
}

async function resolveIssueGroup({ issueType, latitude, longitude, detection, image }) {
  const matchingGroup = await findMatchingGroup({
    issueType,
    latitude,
    longitude,
    detection,
    image,
  })
  if (matchingGroup) {
    return { group: matchingGroup, created: false }
  }

  const { data: group, error } = await supabase
    .from('issue_groups')
    .insert({
      issue_type: issueType,
      latitude,
      longitude,
    })
    .select('id, latitude, longitude, issue_type')
    .single()

  if (error) {
    throw new Error(`Unable to create issue group: ${error.message}`)
  }
  return { group, created: true }
}

module.exports = {
  resolveIssueGroup,
}
