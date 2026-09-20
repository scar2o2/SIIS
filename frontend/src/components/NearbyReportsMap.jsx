import L from 'leaflet'
import { useEffect } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { configureLeafletIcon } from '../utils/leafletIcon'

function groupPosition(group) {
  const latitude = Number(group.latitude)
  const longitude = Number(group.longitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return [latitude, longitude]
}

function markerKind(group) {
  const issueTypes = new Set(group.issue_types || [group.issue_type])
  if (issueTypes.size > 1) return 'mixed'
  if (issueTypes.has('WATERLOGGING')) return 'waterlogging'
  if (issueTypes.has('TRASH_OVERFLOW')) return 'trash'
  if (issueTypes.has('ROAD_CRACK')) return 'road-crack'
  return 'pothole'
}

function markerLabel(kind) {
  if (kind === 'mixed') return 'M'
  if (kind === 'road-crack') return 'C'
  if (kind === 'waterlogging') return 'W'
  if (kind === 'trash') return 'T'
  return 'P'
}

function groupIcon(group) {
  const kind = markerKind(group)
  return L.divIcon({
    className: `issue-marker issue-marker-${kind}`,
    html: `<span>${markerLabel(kind)}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  })
}

function FitNearbyBounds({ position, issueGroups }) {
  const map = useMap()

  useEffect(() => {
    const positions = [position, ...issueGroups.map(groupPosition).filter(Boolean)]
    if (positions.length === 1) {
      map.setView(position, 14)
      return
    }
    map.fitBounds(positions, { padding: [34, 34] })
  }, [map, position, issueGroups])

  return null
}

function NearbyReportsMap({ position, radius, issueGroups }) {
  configureLeafletIcon()

  return (
    <div className="nearby-map">
      <MapContainer center={position} zoom={14} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitNearbyBounds position={position} issueGroups={issueGroups} />
        <Circle center={position} radius={Number(radius || 1000)} pathOptions={{ color: '#1463d8' }} />
        <Marker position={position}><Popup>Your search location</Popup></Marker>
        {issueGroups.map((group) => {
          const positionValue = groupPosition(group)
          if (!positionValue) return null
          const kind = markerKind(group)

          return (
            <Marker key={group.id} position={positionValue} icon={groupIcon(group)}>
              <Popup>
                <strong>{kind.replace('-', ' ')}</strong><br />
                Types: {(group.issue_types || [group.issue_type]).join(', ')}<br />
                Status: {group.status}<br />
                Severity: {group.severity}<br />
                Priority: {group.priority}<br />
                Reports: {group.report_count}<br />
                Distance: {group.distance_meters} meters
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default NearbyReportsMap
