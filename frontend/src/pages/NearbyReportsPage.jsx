import { useEffect, useState } from 'react'
import ReportFilters from '../components/ReportFilters'
import NearbyReportsMap from '../components/NearbyReportsMap'
import SiteHeader from '../components/SiteHeader'
import { getNearbyReports } from '../services/aiService'
import { configureLeafletIcon } from '../utils/leafletIcon'
import '../App.css'

const DEFAULT_POSITION = [13.185565, 80.105153]

function NearbyReportsPage() {
  configureLeafletIcon()

  const [filters, setFilters] = useState({ radius: '1000' })
  const [position, setPosition] = useState(DEFAULT_POSITION)
  const [groups, setGroups] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadNearby(DEFAULT_POSITION[0], DEFAULT_POSITION[1])
    // The initial map query intentionally uses the project default location.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

        <ReportFilters filters={filters} onChange={handleFiltersChange} includeSearch={false} />

        <div className="nearby-row">
          <div className="filter-field">
            <label htmlFor="nearby-radius" className="filter-label">Radius (meters)</label>
            <input
              id="nearby-radius"
              className="filter-input"
              type="number"
              min="1"
              max="50000"
              value={filters.radius || '1000'}
              onChange={(event) => handleFiltersChange({ ...filters, radius: event.target.value })}
            />
          </div>
          <button className="button button-primary" type="button" onClick={handleLocate}>
            Use current location
          </button>
        </div>

        {message && <p className="message report-message">{message}</p>}
        {error && <p className="message message-error">{error}</p>}
        <section className="common-section">
          <div className="results-header">
            <h2 className="panel-title">Marker legend</h2>
            <div className="marker-legend" aria-label="Map marker legend">
              <span><i className="legend-dot pothole" />Pothole</span>
              <span><i className="legend-dot road-crack" />Road crack</span>
              <span><i className="legend-dot waterlogging" />Waterlogging</span>
              <span><i className="legend-dot trash" />Trash overflow</span>
              <span><i className="legend-dot mixed" />Mixed issues</span>
            </div>
          </div>
          <NearbyReportsMap
            position={position}
            radius={filters.radius}
            issueGroups={groups}
          />
        </section>
      </main>
    </div>
  )
}

export default NearbyReportsPage