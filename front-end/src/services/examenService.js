// Service Examens - Gère l'accès aux données (mock ou API)
import { API_CONFIG, delay, buildUrl } from '../api/config'
import { examensMock, resultatsExamensMock, examensStatsMock } from '../data/examens.mock'

// ============ FONCTIONS MOCK ============
const mockGetAllExamens = async (filters = {}) => {
  await delay()
  let result = [...examensMock]

  if (filters.classeId) {
    result = result.filter(e => e.classeId === filters.classeId)
  }
  if (filters.periodeId) {
    result = result.filter(e => e.periodeId === filters.periodeId)
  }
  if (filters.matiereId) {
    result = result.filter(e => e.matiereId === filters.matiereId)
  }
  if (filters.statut) {
    result = result.filter(e => e.statut === filters.statut)
  }
  if (filters.dateDebut && filters.dateFin) {
    result = result.filter(e => e.date >= filters.dateDebut && e.date <= filters.dateFin)
  }

  return result
}

const mockGetExamenById = async (id) => {
  await delay()
  return examensMock.find(e => e.id === id) || null
}

const mockCreateExamen = async (data) => {
  await delay()
  const newExamen = {
    ...data,
    id: examensMock.length + 1,
    statut: 'planifie',
  }
  examensMock.push(newExamen)
  return newExamen
}

const mockUpdateExamen = async (id, data) => {
  await delay()
  const index = examensMock.findIndex(e => e.id === id)
  if (index === -1) throw new Error('Examen non trouvé')
  examensMock[index] = { ...examensMock[index], ...data }
  return examensMock[index]
}

const mockDeleteExamen = async (id) => {
  await delay()
  const index = examensMock.findIndex(e => e.id === id)
  if (index === -1) throw new Error('Examen non trouvé')
  examensMock.splice(index, 1)
  return true
}

const mockGetResultats = async (examenId) => {
  await delay()
  return resultatsExamensMock.filter(r => r.examenId === examenId)
}

const mockSaveResultat = async (data) => {
  await delay()
  const existing = resultatsExamensMock.find(
    r => r.examenId === data.examenId && r.eleveId === data.eleveId
  )
  if (existing) {
    Object.assign(existing, data)
    return existing
  }
  const newResultat = { ...data, id: resultatsExamensMock.length + 1 }
  resultatsExamensMock.push(newResultat)
  return newResultat
}

const mockSaveResultatsBulk = async (resultats) => {
  await delay()
  resultats.forEach(r => {
    const existing = resultatsExamensMock.find(
      er => er.examenId === r.examenId && er.eleveId === r.eleveId
    )
    if (existing) {
      Object.assign(existing, r)
    } else {
      resultatsExamensMock.push({ ...r, id: resultatsExamensMock.length + 1 })
    }
  })
  return true
}

const mockGetStats = async () => {
  await delay()
  return examensStatsMock
}

// ============ FONCTIONS API ============
const apiGetAllExamens = async (filters = {}) => {
  const params = new URLSearchParams(filters)
  const response = await fetch(`${buildUrl('/examens')}?${params}`)
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetExamenById = async (id) => {
  const response = await fetch(buildUrl(`/examens/${id}`))
  if (!response.ok) throw new Error('Examen non trouvé')
  return response.json()
}

const apiCreateExamen = async (data) => {
  const response = await fetch(buildUrl('/examens'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la création')
  return response.json()
}

const apiUpdateExamen = async (id, data) => {
  const response = await fetch(buildUrl(`/examens/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la mise à jour')
  return response.json()
}

const apiDeleteExamen = async (id) => {
  const response = await fetch(buildUrl(`/examens/${id}`), {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Erreur lors de la suppression')
  return true
}

const apiGetResultats = async (examenId) => {
  const response = await fetch(buildUrl(`/examens/${examenId}/resultats`))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiSaveResultat = async (examenId, data) => {
  const response = await fetch(buildUrl(`/examens/${examenId}/resultats`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la sauvegarde')
  return response.json()
}

const apiSaveResultatsBulk = async (examenId, resultats) => {
  // Enregistrer les résultats un par un
  const results = []
  for (const resultat of resultats) {
    const response = await fetch(buildUrl(`/examens/${examenId}/resultats`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultat),
    })
    if (response.ok) {
      results.push(await response.json())
    }
  }
  return results
}

const apiGetStats = async () => {
  const response = await fetch(buildUrl('/examens/stats'))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

// ============ SERVICE EXPORTÉ ============
export const examenService = {
  getAllExamens: API_CONFIG.USE_MOCK ? mockGetAllExamens : apiGetAllExamens,
  getExamenById: API_CONFIG.USE_MOCK ? mockGetExamenById : apiGetExamenById,
  createExamen: API_CONFIG.USE_MOCK ? mockCreateExamen : apiCreateExamen,
  updateExamen: API_CONFIG.USE_MOCK ? mockUpdateExamen : apiUpdateExamen,
  deleteExamen: API_CONFIG.USE_MOCK ? mockDeleteExamen : apiDeleteExamen,
  getResultats: API_CONFIG.USE_MOCK ? mockGetResultats : apiGetResultats,
  saveResultat: API_CONFIG.USE_MOCK ? mockSaveResultat : apiSaveResultat,
  saveResultatsBulk: API_CONFIG.USE_MOCK ? mockSaveResultatsBulk : apiSaveResultatsBulk,
  getStats: API_CONFIG.USE_MOCK ? mockGetStats : apiGetStats,
}
