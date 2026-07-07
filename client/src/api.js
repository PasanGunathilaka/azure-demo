export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5158'

export async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`)
  }
  return response.json()
}
