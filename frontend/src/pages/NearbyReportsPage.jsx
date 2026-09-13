import { useState } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import ReportFilters from '../components/ReportFilters'
import SiteHeader from '../components/SiteHeader'
import { getNearbyReports } from '../services/aiService'
import { configureLeafletIcon } from '../utils/leafletIcon'
import '../App.css'

function NearbyReportsPage() {
  configureLeafletIcon()

  const [filters, setFilters] = useState({ radius: '1000' })
  const [position, setPosition] = useState(null)
  const [groups, setGroups] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function loadNearby(latitude, longitude, nextFilters = filters) {
    setError('')
    setMessage('Loading nearby issue groups...')
    getNearbyReports({ ...nextFilters, latitude, longitude })
      .then((data) => {
        setGroups(data.issue_groups)
        setPosition([latitude, longitude])
        setMessage(`${data.issue_groups.length} issue groups found within ${data.radius_meters} meters.`)
      })
      .catch((requestError) => {
        setGroups([])
        setError(requestError.message)
        setMessage('')
      })
  }

  function handleLocate() {
    if (!navigator.geolocation) {
      setError('Location is unavailable in this browser.')
      return
    }
    setMessage('Requesting your current location...')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => loadNearby(coords.latitude, coords.longitude),
      () => {
        setMessage('')
        setError('Location permission is required for nearby search.')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  function handleFiltersChange(nextFilters) {
    setFilters(nextFilters)
    if (position) {
      loadNearby(position[0], position[1], nextFilters)
    }
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="main-content reports-page">
        <section className="intro">
          <p className="eyebrow">Map search</p>
          <h1>Nearby Reports</h1>
        </section>
        <div className="nearby-controls">
          <ReportFilters filters={filters} onChange={handleFiltersChange} />
          <label>
            Radius meters
            <input
              type="number"
              min="1"
              max="50000"
              value={filters.radius || '1000'}
              onChange={(event) => handleFiltersChange({ ...filters, radius: event.target.value })}
            />
          </label>
          <button className="button button-primary" type="button" onClick={handleLocate}>Use current location</button>
        </div>
        {message && <p className="message report-message">{message}</p>}
        {error && <p className="message message-error">{error}</p>}
        {position && (
          <section className="common-section">
            <div className="nearby-map">
              <MapContainer center={position} zoom={14} scrollWheelZoom>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Circle center={position} radius={Number(filters.radius || 1000)} pathOptions={{ color: '#1463d8' }} />
                <Marker position={position}><Popup>Your search location</Popup></Marker>
                {groups.map((group) => (
                  <Marker key={group.id} position={[group.latitude, group.longitude]}>
                    <Popup>
                      {group.issue_type.replaceAll('_', ' ')}<br />
                      {group.distance_meters} meters away<br />
                      {group.status}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default NearbyReportsPage
