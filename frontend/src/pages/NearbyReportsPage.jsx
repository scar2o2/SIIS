import { useEffect, useRef, useState } from 'react'
import ReportFilters from '../components/ReportFilters'
import NearbyReportsMap from '../components/NearbyReportsMap'
import SiteHeader from '../components/SiteHeader'
import { getNearbyReports } from '../services/aiService'
import { configureLeafletIcon } from '../utils/leafletIcon'
import '../App.css'

const DEFAULT_POSITION = [13.185565, 80.105153]

function mapUrl(latitude, longitude) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
}

function formatIssueTypes(group) {
  return (group.issue_types || [group.issue_type])
    .filter(Boolean)
    .join(' + ')
    .replaceAll('_', ' ')
}

function NearbyReportsPage() {
  configureLeafletIcon()

  const [filters, setFilters] = useState({ radius: '1000' })
  const [position, setPosition] = useState(DEFAULT_POSITION)
  const [groups, setGroups] = useState([])
  const [reports, setReports] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const radiusTimer = useRef(null)

  useEffect(() => () => window.clearTimeout(radiusTimer.current), [])

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
        setGroups(data.issue_groups || [])
        setReports(data.reports || [])
        setPosition([latitude, longitude])
        setMessage(`${data.issue_groups?.length || 0} issue groups found within ${data.radius_meters} meters.`)
      })
      .catch((requestError) => {
        setGroups([])
        setReports([])
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

  function handleRadiusChange(value) {
    const nextFilters = { ...filters, radius: value }
    setFilters(nextFilters)
    window.clearTimeout(radiusTimer.current)
    radiusTimer.current = window.setTimeout(() => {
      if (position) loadNearby(position[0], position[1], nextFilters)
    }, 400)
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
              onChange={(event) => handleRadiusChange(event.target.value)}
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

        <section className="common-section">
          <div className="results-header">
            <h2 className="panel-title">Issues on this map</h2>
            <span className="result-count">{groups.length} issue groups</span>
          </div>
          {!groups.length && <p className="message report-message">No issues were found in this area.</p>}
          {!!groups.length && (
            <div className="common-grid">
              {groups.map((group) => {
                const report = reports.find((item) => (
                  item.issue_group_ids || []
                ).includes(group.id))

                return (
                  <article className="common-card" key={group.id}>
                    <strong>{formatIssueTypes(group)}</strong>
                    <span>{group.report_count} report{group.report_count === 1 ? '' : 's'}</span>
                    <span className={`status-pill severity-${group.severity.toLowerCase()}`}>
                      Severity: {group.severity}
                    </span>
                    <span className={`status-pill priority-${group.priority.toLowerCase()}`}>
                      Priority: {group.priority}
                    </span>
                    <span className={`status-pill ${group.status.toLowerCase()}`}>
                      {group.status.replaceAll('_', ' ')}
                    </span>
                    <span>Distance: {group.distance_meters} meters</span>
                    <div className="card-actions">
                      {report ? (
                        <a className="button button-secondary" href={`/reports/${report.id}`}>
                          View Details
                        </a>
                      ) : (
                        <span className="message report-message">Details unavailable</span>
                      )}
                      <a
                        className="button button-secondary"
                        href={mapUrl(group.latitude, group.longitude)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Map
                      </a>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default NearbyReportsPage