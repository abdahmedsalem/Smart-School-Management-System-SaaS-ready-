// Service Présences - Gère l'accès aux données (mock ou API)
import { API_CONFIG, delay, buildUrl } from '../api/config'
import { presencesMock, alertesAbsenceMock, presenceStatsMock } from '../data/presences.mock'

// ============ FONCTIONS MOCK ============
const mockGetPresences = async (filters = {}) => {
  await delay()
  let result = [...presencesMock]

  if (filters.eleveId) {
    result = result.filter(p => p.eleveId === filters.eleveId)
  }
  if (filters.date) {
    result = result.filter(p => p.date === filters.date)
  }
  if (filters.classeId) {
    // Nécessiterait une jointure avec les élèves
    result = result.filter(p => p.classeId === filters.classeId)
  }
  if (filters.statut) {
    result = result.filter(p => p.statut === filters.statut)
  }

  return result
}

const mockCreatePresence = async (data) => {
  await delay()
  const newPresence = {
    ...data,
    id: presencesMock.length + 1,
  }
  presencesMock.push(newPresence)
  return newPresence
}

const mockUpdatePresence = async (id, data) => {
  await delay()
  const index = presencesMock.findIndex(p => p.id === id)
  if (index === -1) throw new Error('Présence non trouvée')
  presencesMock[index] = { ...presencesMock[index], ...data }
  return presencesMock[index]
}

const mockSavePresencesBulk = async (presences) => {
  await delay()
  // Sauvegarde en masse des présences pour une classe
  presences.forEach(p => {
    const existing = presencesMock.find(
      ep => ep.eleveId === p.eleveId && ep.date === p.date
    )
    if (existing) {
      Object.assign(existing, p)
    } else {
      presencesMock.push({ ...p, id: presencesMock.length + 1 })
    }
  })
  return true
}

const mockGetAlertes = async () => {
  await delay()
  return [...alertesAbsenceMock]
}

const mockTraiterAlerte = async (id) => {
  await delay()
  const index = alertesAbsenceMock.findIndex(a => a.id === id)
  if (index === -1) throw new Error('Alerte non trouvée')
  alertesAbsenceMock[index].traite = true
  return alertesAbsenceMock[index]
}

const mockGetStats = async () => {
  await delay()
  return presenceStatsMock
}

// ============ FONCTIONS API ============
const apiGetPresences = async (filters = {}) => {
  let url = '/presences'
  if (filters.eleveId && filters.debut && filters.fin) {
    url = `/presences/eleve/${filters.eleveId}/periode?debut=${filters.debut}&fin=${filters.fin}`
  } else if (filters.eleveId) {
    url = `/presences/eleve/${filters.eleveId}`
  } else if (filters.classeId && filters.date) {
    url = `/presences/classe/${filters.classeId}/date/${filters.date}`
  }
  const response = await fetch(buildUrl(url))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiCreatePresence = async (data) => {
  const response = await fetch(buildUrl('/presences'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la création')
  return response.json()
}

const apiUpdatePresence = async (id, data) => {
  const response = await fetch(buildUrl(`/presences/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la mise à jour')
  return response.json()
}

const apiSavePresencesBulk = async (classeId, date, seanceId, presences) => {
  const response = await fetch(buildUrl(`/presences/classe/${classeId}?date=${date}&seanceId=${seanceId}`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(presences),
  })
  if (!response.ok) throw new Error('Erreur lors de la sauvegarde')
  return response.json()
}

const apiGetAlertes = async () => {
  // Pas d'endpoint alertes spécifique, retourne liste vide
  return []
}

const apiTraiterAlerte = async (id) => {
  // Justifier une absence
  const response = await fetch(buildUrl(`/presences/${id}/justifier`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motif: 'Justifié' }),
  })
  if (!response.ok) throw new Error('Erreur lors du traitement')
  return response.json()
}

const apiGetStats = async () => {
  const response = await fetch(buildUrl('/presences/stats'))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

// ============ SERVICE EXPORTÉ ============
export const presenceService = {
  getPresences: API_CONFIG.USE_MOCK ? mockGetPresences : apiGetPresences,
  createPresence: API_CONFIG.USE_MOCK ? mockCreatePresence : apiCreatePresence,
  updatePresence: API_CONFIG.USE_MOCK ? mockUpdatePresence : apiUpdatePresence,
  savePresencesBulk: API_CONFIG.USE_MOCK ? mockSavePresencesBulk : apiSavePresencesBulk,
  getAlertes: API_CONFIG.USE_MOCK ? mockGetAlertes : apiGetAlertes,
  traiterAlerte: API_CONFIG.USE_MOCK ? mockTraiterAlerte : apiTraiterAlerte,
  getStats: API_CONFIG.USE_MOCK ? mockGetStats : apiGetStats,
}
