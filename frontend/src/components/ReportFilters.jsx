import { useEffect, useRef, useState } from 'react'

const issueTypes = [
  ['', 'All issues'],
  ['POTHOLE', 'Pothole'],
  ['ROAD_CRACK', 'Road crack'],
  ['WATERLOGGING', 'Waterlogging'],
  ['TRASH_OVERFLOW', 'Trash overflow'],
]

const levels = [
  ['', 'Any level'],
  ['LOW', 'Low'],
  ['MEDIUM', 'Medium'],
  ['HIGH', 'High'],
  ['CRITICAL', 'Critical'],
]

const statuses = [
  ['', 'Any status'],
  ['SUBMITTED', 'Submitted'],
  ['UNDER_REVIEW', 'Under review'],
  ['ACKNOWLEDGED', 'Acknowledged'],
  ['RESOLVED', 'Resolved'],
  ['REJECTED', 'Rejected'],
]

function ReportFilters({ filters, onChange, includeSearch = true }) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingFilters, setPendingFilters] = useState(filters)
  const skipInitialChange = useRef(true)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (skipInitialChange.current) {
      skipInitialChange.current = false
      return undefined
    }

    const timer = window.setTimeout(() => onChangeRef.current(pendingFilters), 400)
    return () => window.clearTimeout(timer)
  }, [pendingFilters])

  function setFilter(key, value) {
    setPendingFilters((current) => ({ ...current, [key]: value }))
  }

  function handleReset() {
    setPendingFilters({})
    onChange({})
  }

  const hasActiveFilters = Object.values(pendingFilters).some((v) => v && v !== '')
  const activeFilterCount = Object.values(pendingFilters).filter((v) => v && v !== '').length

  return (
    <div className="filter-panel">
      <button
        className={`filter-toggle ${hasActiveFilters ? 'has-active' : ''}`}
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
        <span>{isOpen ? 'Hide filters' : 'Show filters'}</span>
        {hasActiveFilters && <span className="filter-count">{activeFilterCount}</span>}
      </button>
      {isOpen && <div className="filters">
      {includeSearch && (
        <div className="filter-field filter-field--search">
          <label htmlFor="filter-search" className="filter-label">Search</label>
          <input
            id="filter-search"
            className="filter-input"
            placeholder="ID, description, status..."
            value={pendingFilters.search || ''}
            onChange={(event) => setFilter('search', event.target.value)}
          />
        </div>
      )}

      <div className="filter-field">
        <label htmlFor="filter-issue" className="filter-label">Issue type</label>
        <select
          id="filter-issue"
          className="filter-input"
          value={pendingFilters.issue_type || ''}
          onChange={(event) => setFilter('issue_type', event.target.value)}
        >
          {issueTypes.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-severity" className="filter-label">Severity</label>
        <select
          id="filter-severity"
          className="filter-input"
          value={pendingFilters.severity || ''}
          onChange={(event) => setFilter('severity', event.target.value)}
        >
          {levels.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-priority" className="filter-label">Priority</label>
        <select
          id="filter-priority"
          className="filter-input"
          value={pendingFilters.priority || ''}
          onChange={(event) => setFilter('priority', event.target.value)}
        >
          {levels.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-status" className="filter-label">Status</label>
        <select
          id="filter-status"
          className="filter-input"
          value={pendingFilters.status || ''}
          onChange={(event) => setFilter('status', event.target.value)}
        >
          {statuses.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-date-from" className="filter-label">From date</label>
        <input
          id="filter-date-from"
          className="filter-input"
          type="date"
          value={pendingFilters.date_from || ''}
          onChange={(event) => setFilter('date_from', event.target.value)}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="filter-date-to" className="filter-label">To date</label>
        <input
          id="filter-date-to"
          className="filter-input"
          type="date"
          value={pendingFilters.date_to || ''}
          onChange={(event) => setFilter('date_to', event.target.value)}
        />
      </div>

      {hasActiveFilters && (
        <div className="filter-field filter-field--action">
          <span className="filter-label" aria-hidden="true"> </span>
          <button type="button" className="button button-secondary filter-reset" onClick={handleReset}>
            Clear filters
          </button>
        </div>
      )}
      </div>}
    </div>
  )
}

export default ReportFilters
