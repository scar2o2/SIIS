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

  return (
    <form className="filters" onSubmit={(event) => event.preventDefault()}>
      {includeSearch && (
        <label>
          Search
          <input
            value={filters.search || ''}
            onChange={(event) => setFilter('search', event.target.value)}
          />
        </label>
      )}
      <label>
        Issue
        <select value={filters.issue_type || ''} onChange={(event) => setFilter('issue_type', event.target.value)}>
          {issueTypes.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
        </select>
      </label>
      <label>
        Severity
        <select value={filters.severity || ''} onChange={(event) => setFilter('severity', event.target.value)}>
          {levels.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
        </select>
      </label>
      <label>
        Priority
        <select value={filters.priority || ''} onChange={(event) => setFilter('priority', event.target.value)}>
          {levels.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
        </select>
      </label>
      <label>
        Status
        <select value={filters.status || ''} onChange={(event) => setFilter('status', event.target.value)}>
          {statuses.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
        </select>
      </label>
      <label>
        From
        <input type="date" value={filters.date_from || ''} onChange={(event) => setFilter('date_from', event.target.value)} />
      </label>
      <label>
        To
        <input type="date" value={filters.date_to || ''} onChange={(event) => setFilter('date_to', event.target.value)} />
      </label>
    </form>
  )
}

export default ReportFilters
