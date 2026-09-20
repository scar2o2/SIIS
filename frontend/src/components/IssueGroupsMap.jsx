import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { configureLeafletIcon } from '../utils/leafletIcon'

function validPosition(group) {
  const latitude = Number(group.latitude)
  const longitude = Number(group.longitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return [latitude, longitude]
}

function FitIssueBounds({ groups }) {
  const map = useMap()

  useEffect(() => {
    const positions = groups.map(validPosition).filter(Boolean)
    if (positions.length === 1) {
      map.setView(positions[0], 15)
      return
    }
    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [32, 32] })
    }
  }, [groups, map])

  return null
}

function IssueGroupsMap({ groups }) {
  configureLeafletIcon()

  const positions = groups.map(validPosition).filter(Boolean)
  if (!positions.length) {
    return <p className="message report-message">No issue locations match the current filters.</p>
  }

  return (
    <div className="issue-groups-map">
      <MapContainer center={positions[0]} zoom={13} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitIssueBounds groups={groups} />
        {groups.map((group) => {
          const position = validPosition(group)
          if (!position) return null

          return (
            <Marker key={group.id} position={position}>
              <Popup>
                <strong>{(group.issue_types || [group.issue_type]).join(' + ').replaceAll('_', ' ')}</strong><br />
                Status: {group.status}<br />
                Severity: {group.severity}<br />
                Priority: {group.priority}<br />
                Reports: {group.report_count}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default IssueGroupsMap
