import { useCallback, useEffect, useRef, useState } from 'react'
import NearbyReportsMap from '../components/NearbyReportsMap'
import ReportFilters from '../components/ReportFilters'
import ReportList from '../components/ReportList'
import SiteHeader from '../components/SiteHeader'
import { SkeletonCards, SkeletonReportList } from '../components/Skeleton'
import { getCommonReports, getNearbyReports } from '../services/aiService'
import '../App.css'

function mapUrl(latitude, longitude) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
}

function CommonReportsPage() {
  const [data, setData] = useState(null)
  const [filters, setFilters] = useState({})
  const [mapFilters, setMapFilters] = useState({ radius: '1000' })
  const [mapPosition, setMapPosition] = useState(null)
  const [nearbyGroups, setNearbyGroups] = useState([])
  const [mapMessage, setMapMessage] = useState('')
  const [error, setError] = useState('')
  const [mapError, setMapError] = useState('')
  const [isLoadingReports, setIsLoadingReports] = useState(true)
  const [visibleGroupCount, setVisibleGroupCount] = useState(3)
  const autoLocatedRef = useRef(false)

  useEffect(() => {
    getCommonReports(filters)
      .then(setData)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoadingReports(false))
  }, [filters])

  const loadNearby = useCallback((latitude, longitude, nextFilters = mapFilters) => {
    setMapError('')
    setMapMessage('Loading nearby issue groups...')
    getNearbyReports({ ...nextFilters, latitude, longitude })
      .then((nearbyData) => {
        setNearbyGroups(nearbyData.issue_groups || [])
        setMapPosition([latitude, longitude])
        setMapMessage(`${nearbyData.issue_groups?.length || 0} issue groups found within ${nearbyData.radius_meters} meters.`)
      })
      .catch((requestError) => {
        setNearbyGroups([])
        setMapError(requestError.message)
        setMapMessage('')
      })
  }, [mapFilters])

  const handleLocate = useCallback((isManual = false) => {
    if (!navigator.geolocation) {
      if (isManual) setMapError('Location is unavailable in this browser.')
      return
    }
    setMapMessage('Requesting your current location...')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => loadNearby(coords.latitude, coords.longitude),
      (geoErr) => {
        setMapMessage('')
        if (isManual) setMapError(geoErr?.code === 1
          ? 'Location permission was denied. Please allow location access in your browser settings.'
          : 'Could not acquire location. Please verify device GPS is enabled.')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    )
  }, [loadNearby])

  useEffect(() => {
    if (autoLocatedRef.current) return
    autoLocatedRef.current = true
    handleLocate(false)
  }, [handleLocate])

  function handleMapFiltersChange(nextFilters) {
    setMapFilters(nextFilters)
    if (mapPosition) loadNearby(mapPosition[0], mapPosition[1], nextFilters)
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="main-content reports-page">
        <section className="intro">
          <p className="eyebrow">Community reporting</p>
          <h1>Reports</h1>
          <p className="intro-copy">View reports submitted by everyone and see which reports refer to the same infrastructure issue group.</p>
        </section>

        <ReportFilters filters={filters} onChange={setFilters} />
        {error && <p className="message message-error">{error}</p>}

        <section className="common-section">
          <div className="results-header">
            <h2 className="panel-title">Issue groups</h2>
            <span className="result-count">{data ? `${data.issue_groups.length} groups` : 'Loading'}</span>
          </div>
          {isLoadingReports && <SkeletonCards count={3} />}
          {!isLoadingReports && data && (
            <div className="common-grid">
              {data.issue_groups.slice(0, visibleGroupCount).map((group) => (
                <article className="common-card" key={group.id}>
                  <strong>{(group.issue_types || [group.issue_type]).join(' + ').replaceAll('_', ' ')}</strong>
                  <span>{group.report_count} report{group.report_count === 1 ? '' : 's'}</span>
                  <span className={`status-pill severity-${group.severity.toLowerCase()}`}>Severity: {group.severity}</span>
                  <span className={`status-pill priority-${group.priority.toLowerCase()}`}>Priority: {group.priority}</span>
                  <span className={`status-pill ${group.status.toLowerCase()}`}>{group.status.replaceAll('_', ' ')}</span>
                  <a href={mapUrl(group.latitude, group.longitude)} target="_blank" rel="noreferrer">Open in Google Maps</a>
                </article>
              ))}
            </div>
          )}
          {!isLoadingReports && data && (visibleGroupCount < data.issue_groups.length || visibleGroupCount > 3) && (
            <div className="view-more-actions">
              {visibleGroupCount < data.issue_groups.length && (
                <button className="button button-secondary view-more-button" type="button" onClick={() => setVisibleGroupCount((count) => count + 3)}>
                  View more ({data.issue_groups.length - visibleGroupCount} remaining)
                </button>
              )}
              {visibleGroupCount > 3 && (
                <button className="button button-secondary view-more-button" type="button" onClick={() => setVisibleGroupCount(3)}>
                  View less
                </button>
              )}
            </div>
          )}
        </section>

        <section className="common-section">
          <div className="results-header">
            <h2 className="panel-title">All submitted reports</h2>
            <span className="result-count">{data ? `${data.reports.length} reports` : 'Loading'}</span>
          </div>
          {isLoadingReports ? <SkeletonReportList /> : data && <ReportList reports={data.reports} />}
        </section>

        <section className="common-section nearby-section">
          <div className="results-header">
            <h2 className="panel-title">Nearby map</h2>
            <div className="marker-legend" aria-label="Map marker legend">
              <span><i className="legend-dot pothole" />Pothole</span>
              <span><i className="legend-dot road-crack" />Road crack</span>
              <span><i className="legend-dot waterlogging" />Waterlogging</span>
              <span><i className="legend-dot trash" />Trash overflow</span>
              <span><i className="legend-dot mixed" />Mixed</span>
            </div>
          </div>
          <ReportFilters filters={mapFilters} onChange={handleMapFiltersChange} includeSearch={false} />
          <div className="nearby-row">
            <div className="filter-field">
              <label htmlFor="map-radius" className="filter-label">Radius (meters)</label>
              <input id="map-radius" className="filter-input" type="number" min="1" max="50000" value={mapFilters.radius || '1000'} onChange={(event) => handleMapFiltersChange({ ...mapFilters, radius: event.target.value })} />
            </div>
            <button className="button button-primary" type="button" onClick={() => handleLocate(true)}>Refresh current location</button>
          </div>
          {mapMessage && <p className="message report-message">{mapMessage}</p>}
          {mapError && <p className="message message-error">{mapError}</p>}
          {!mapPosition && !mapError && <div className="map-skeleton" aria-label="Loading nearby map"><span>Map will appear after location is available</span></div>}
          {mapPosition && <NearbyReportsMap position={mapPosition} radius={mapFilters.radius} issueGroups={nearbyGroups} />}
        </section>
      </main>
    </div>
  )
}

export default CommonReportsPage
