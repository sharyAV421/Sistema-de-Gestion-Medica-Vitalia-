const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  const raw = await response.text()
  let data = null
  try { data = raw ? JSON.parse(raw) : null } catch { data = raw }
  if (!response.ok) throw new Error(data?.message || data?.mensaje || `Error HTTP ${response.status}`)
  return data
}

export const api = {
  base: API_BASE,
  register: payload => request('/api/clinica/paciente', { method: 'POST', body: JSON.stringify(payload) }),
  bookAppointment: payload => request('/api/clinica/cita', { method: 'POST', body: JSON.stringify(payload) }),
  history: id => request(`/api/clinica/historia/${encodeURIComponent(id)}`),
  prescribe: payload => request('/api/clinica/prescripcion', { method: 'POST', body: JSON.stringify(payload) }),
  requestLabs: payload => request('/api/clinica/laboratorio', { method: 'POST', body: JSON.stringify(payload) }),
  doctors: specialty => request(`/api/clinica/medicos?especialidad=${encodeURIComponent(specialty || '')}`)
}
export function normalizeList(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.contenido)) return value.contenido
  if (Array.isArray(value?.resultados)) return value.resultados
  return []
}