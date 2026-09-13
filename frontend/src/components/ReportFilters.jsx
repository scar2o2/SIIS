const issueTypes = [
  ['', 'All issues'],
  ['POTHOLE', 'Pothole'],
  ['ROAD_CRACK', 'Road crack'],
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
  function setFilter(key, value) {
    onChange({ ...filters, [key]: value })
  }

  function handleReset() {
    onChange({})
  }

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== '')

  return (
    <div className="filters">
      {includeSearch && (
        <div className="filter-field filter-field--search">
          <label htmlFor="filter-search" className="filter-label">Search</label>
          <input
            id="filter-search"
            className="filter-input"
            placeholder="ID, description, status..."
            value={filters.search || ''}
            onChange={(event) => setFilter('search', event.target.value)}
          />
        </div>
      )}

      <div className="filter-field">
        <label htmlFor="filter-issue" className="filter-label">Issue type</label>
        <select
          id="filter-issue"
          className="filter-input"
          value={filters.issue_type || ''}
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
          value={filters.severity || ''}
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
          value={filters.priority || ''}
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
          value={filters.status || ''}
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
          value={filters.date_from || ''}
          onChange={(event) => setFilter('date_from', event.target.value)}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="filter-date-to" className="filter-label">To date</label>
        <input
          id="filter-date-to"
          className="filter-input"
          type="date"
          value={filters.date_to || ''}
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
    </div>
  )
}

export default ReportFilters