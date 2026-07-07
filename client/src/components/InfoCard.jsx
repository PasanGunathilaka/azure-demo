export default function InfoCard({ info, error }) {
  return (
    <div className="card">
      <div className="card-title">Server Info</div>
      {info ? (
        <>
          <span className="badge">Live from backend</span>
          <p className="card-body-text">{info.message}</p>
          <div className="kv-row">
            <span>Server name</span>
            <span>{info.serverName}</span>
          </div>
          <div className="kv-row">
            <span>.NET version</span>
            <span>{info.dotnetVersion}</span>
          </div>
          <div className="kv-row">
            <span>Uptime</span>
            <span>{info.uptime}</span>
          </div>
        </>
      ) : (
        <p className={error ? 'error-text' : 'card-body-text'}>
          {error ? 'Cannot reach the API.' : 'Loading server info...'}
        </p>
      )}
    </div>
  )
}
