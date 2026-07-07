export default function HealthCard({ health, error }) {
  const status = error ? 'unhealthy' : health ? 'healthy' : 'pending'
  const label = error ? 'Unreachable' : health ? 'Healthy' : 'Checking...'

  return (
    <div className="card">
      <div className="card-title">
        API Health
        <span className={`status-dot ${status}`} />
      </div>
      <div className="card-headline">{label}</div>
      {health && !error ? (
        <>
          <div className="kv-row">
            <span>Environment</span>
            <span>{health.environment}</span>
          </div>
          <div className="kv-row">
            <span>Checked at</span>
            <span>{new Date(health.timestamp).toLocaleTimeString()}</span>
          </div>
        </>
      ) : (
        <p className="card-body-text">
          {error ? 'Cannot reach the API right now. Is the backend running?' : 'Polling the backend...'}
        </p>
      )}
    </div>
  )
}
