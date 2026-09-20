export function Skeleton({ className = '' }) {
  return <span className={`skeleton ${className}`} aria-hidden="true" />
}

export function SkeletonCards({ count = 3 }) {
  return (
    <div className="common-grid skeleton-grid" aria-label="Loading content">
      {Array.from({ length: count }, (_, index) => (
        <article className="common-card skeleton-card" key={index}>
          <Skeleton className="skeleton-title" />
          <Skeleton />
          <Skeleton className="skeleton-short" />
        </article>
      ))}
    </div>
  )
}

export function SkeletonReportList({ count = 4 }) {
  return (
    <div className="skeleton-report-list" aria-label="Loading reports">
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-report-row" key={index}>
          <Skeleton className="skeleton-title" />
          <Skeleton />
          <Skeleton className="skeleton-short" />
        </div>
      ))}
    </div>
  )
}
