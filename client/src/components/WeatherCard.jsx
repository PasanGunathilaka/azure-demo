export default function WeatherCard({ weather, error }) {
  return (
    <div className="card">
      <div className="card-title">Weather in Colombo</div>
      {error && !weather ? (
        <p className="error-text">Cannot reach the API.</p>
      ) : !weather ? (
        <p className="card-body-text">Loading weather...</p>
      ) : weather.available ? (
        <>
          <div className="weather-main">
            {weather.icon && (
              <img
                className="weather-icon"
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
              />
            )}
            <span className="weather-temp">{Math.round(weather.temperature)}°C</span>
          </div>
          <p className="card-body-text" style={{ textTransform: 'capitalize' }}>
            {weather.description}
          </p>
          <div className="kv-row">
            <span>Feels like</span>
            <span>{Math.round(weather.feelsLike)}°C</span>
          </div>
          <div className="kv-row">
            <span>Humidity</span>
            <span>{weather.humidity}%</span>
          </div>
        </>
      ) : (
        <p className="card-body-text">{weather.message}</p>
      )}
    </div>
  )
}
