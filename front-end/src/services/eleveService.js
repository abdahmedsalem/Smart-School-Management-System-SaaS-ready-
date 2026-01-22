// Service Élèves - Gère l'accès aux données (mock ou API)
import { API_CONFIG, delay, buildUrl } from '../api/config'
import { elevesMock, elevesStatsMock } from '../data/eleves.mock'

// ============ FONCTIONS MOCK ============
const mockGetAll = async (filters = {}) => {
  await delay()
  let result = [...elevesMock]

  if (filters.classeId) {
    result = result.filter(e => e.classeId === filters.classeId)
  }
  if (filters.statut) {
    result = result.filter(e => e.statut === filters.statut)
  }
  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(e =>
      e.nom.toLowerCase().includes(search) ||
      e.prenom.toLowerCase().includes(search) ||
      e.matricule.toLowerCase().includes(search)
    )
  }

  return result
}

const mockGetById = async (id) => {
  await delay()
  return elevesMock.find(e => e.id === id) || null
}

const mockCreate = async (data) => {
  await delay()
  const newEleve = {
    ...data,
    id: elevesMock.length + 1,
    matricule: `E2024-${String(elevesMock.length + 1).padStart(3, '0')}`,
    dateInscription: new Date().toISOString().split('T')[0],
  }
  elevesMock.push(newEleve)
  return newEleve
}

const mockUpdate = async (id, data) => {
  await delay()
  const index = elevesMock.findIndex(e => e.id === id)
  if (index === -1) throw new Error('Élève non trouvé')
  elevesMock[index] = { ...elevesMock[index], ...data }
  return elevesMock[index]
}

const mockDelete = async (id) => {
  await delay()
  const index = elevesMock.findIndex(e => e.id === id)
  if (index === -1) throw new Error('Élève non trouvé')
  elevesMock.splice(index, 1)
  return true
}

const mockGetStats = async () => {
  await delay()
  return elevesStatsMock
}

const mockChangeStatut = async (id, statut) => {
  await delay()
  const index = elevesMock.findIndex(e => e.id === id)
  if (index === -1) throw new Error('Élève non trouvé')
  elevesMock[index].statut = statut
  return elevesMock[index]
}

const mockGetWilayas = async () => {
  await delay()
  return [
    'Nouakchott-Nord', 'Nouakchott-Ouest', 'Nouakchott-Sud',
    'Nouadhibou', 'Atar', 'Kaédi', 'Rosso', 'Zouérate',
    'Kiffa', 'Néma', 'Aioun', 'Tidjikja', 'Sélibaby'
  ]
}

// ============ FONCTIONS API ============
const apiGetAll = async (filters = {}) => {
  const params = new URLSearchParams(filters)
  const response = await fetch(`${buildUrl('/eleves')}?${params}`)
  if (!response.ok) throw new Error('Erreur lors du chargement des élèves')
  return response.json()
}

const apiGetById = async (id) => {
  const response = await fetch(buildUrl(`/eleves/${id}`))
  if (!response.ok) throw new Error('Élève non trouvé')
  return response.json()
}

const apiCreate = async (data) => {
  const response = await fetch(buildUrl('/eleves'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la création')
  return response.json()
}

const apiUpdate = async (id, data) => {
  const response = await fetch(buildUrl(`/eleves/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la mise à jour')
  return response.json()
}

const apiDelete = async (id) => {
  const response = await fetch(buildUrl(`/eleves/${id}`), {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Erreur lors de la suppression')
  return true
}

const apiGetStats = async () => {
  const response = await fetch(buildUrl('/eleves/stats'))
  if (!response.ok) throw new Error('Erreur lors du chargement des statistiques')
  return response.json()
}

const apiChangeStatut = async (id, statut) => {
  const response = await fetch(buildUrl(`/eleves/${id}/statut`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statut }),
  })
  if (!response.ok) throw new Error('Erreur lors du changement de statut')
  return response.json()
}

const apiGetWilayas = async () => {
  const response = await fetch(buildUrl('/eleves/wilayas'))
  if (!response.ok) throw new Error('Erreur lors du chargement des wilayas')
  return response.json()
}

// ============ SERVICE EXPORTÉ ============
export const eleveService = {
  getAll: API_CONFIG.USE_MOCK ? mockGetAll : apiGetAll,
  getById: API_CONFIG.USE_MOCK ? mockGetById : apiGetById,
  create: API_CONFIG.USE_MOCK ? mockCreate : apiCreate,
  update: API_CONFIG.USE_MOCK ? mockUpdate : apiUpdate,
  delete: API_CONFIG.USE_MOCK ? mockDelete : apiDelete,
  getStats: API_CONFIG.USE_MOCK ? mockGetStats : apiGetStats,
  changeStatut: API_CONFIG.USE_MOCK ? mockChangeStatut : apiChangeStatut,
  getWilayas: API_CONFIG.USE_MOCK ? mockGetWilayas : apiGetWilayas,
}
