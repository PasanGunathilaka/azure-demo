import { useEffect, useState } from 'react'
import './App.css'
import { fetchJson } from './api'
import HealthCard from './components/HealthCard'
import InfoCard from './components/InfoCard'
import StatsCard from './components/StatsCard'
import WeatherCard from './components/WeatherCard'

const HEALTH_POLL_INTERVAL_MS = 10_000

export default function App() {
  const [health, setHealth] = useState(null)
  const [healthError, setHealthError] = useState(false)
  const [info, setInfo] = useState(null)
  const [infoError, setInfoError] = useState(false)
  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState(false)
  const [weather, setWeather] = useState(null)
  const [weatherError, setWeatherError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function pollHealth() {
      try {
        const data = await fetchJson('/api/health')
        if (!cancelled) {
          setHealth(data)
          setHealthError(false)
        }
      } catch {
        if (!cancelled) setHealthError(true)
      }
    }

    pollHealth()
    const id = setInterval(pollHealth, HEALTH_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    fetchJson('/api/info')
      .then(setInfo)
      .catch(() => setInfoError(true))

    fetchJson('/api/stats')
      .then(setStats)
      .catch(() => setStatsError(true))

    fetchJson('/api/weather')
      .then(setWeather)
      .catch(() => setWeatherError(true))
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <span className="logo-badge">Azure Deployment Tech Talk</span>
        <h1>Cloud-Native Dashboard</h1>
        <p>React frontend + .NET Web API, deployed end-to-end on Azure</p>
      </header>

      <div className="grid">
        <HealthCard health={health} error={healthError} />
        <InfoCard info={info} error={infoError} />
        <StatsCard stats={stats} error={statsError} />
        <WeatherCard weather={weather} error={weatherError} />
      </div>

      <footer className="app-footer">
        Deployed on <strong>Azure Static Web Apps</strong> + <strong>App Service</strong>
      </footer>
    </div>
  )
}
