import { useAnimatedCounter } from '../useAnimatedCounter'

function Stat({ value, label }) {
  const animated = useAnimatedCounter(typeof value === 'number' ? value : 0)
  return (
    <div className="stat-item">
      <span className="stat-value">{typeof value === 'number' ? animated.toLocaleString() : value ?? '-'}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

export default function StatsCard({ stats, error }) {
  return (
    <div className="card">
      <div className="card-title">Live Dashboard Stats</div>
      {stats ? (
        <div className="stats-grid">
          <Stat value={stats.visitors} label="Visitors" />
          <Stat value={stats.requestsServed} label="Requests served" />
          <Stat value={stats.activeConnections} label="Active connections" />
          <Stat value={stats.avgResponseTimeMs} label="Avg response (ms)" />
          <div className="stat-item">
            <span className="stat-value">{stats.region}</span>
            <span className="stat-label">Region</span>
          </div>
        </div>
      ) : (
        <p className={error ? 'error-text' : 'card-body-text'}>
          {error ? 'Cannot reach the API.' : 'Loading stats...'}
        </p>
      )}
    </div>
  )
}
