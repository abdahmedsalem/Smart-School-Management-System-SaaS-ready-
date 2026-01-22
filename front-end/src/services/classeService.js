// Service Classes - Gère l'accès aux données (mock ou API)
import { API_CONFIG, delay, buildUrl } from '../api/config'
import {
  classesMock,
  cyclesMock,
  niveauxMock,
  sallesMock,
  specialitesMock,
  professeursMock,
  matieresByCycleMock,
  structureStatsMock,
} from '../data/classes.mock'

// ============ FONCTIONS MOCK ============
const mockGetAllClasses = async (filters = {}) => {
  await delay()
  let result = [...classesMock]

  if (filters.cycleId) {
    result = result.filter(c => c.cycleId === filters.cycleId)
  }
  if (filters.cycle) {
    result = result.filter(c => c.cycle === filters.cycle)
  }
  if (filters.niveauId) {
    result = result.filter(c => c.niveauId === filters.niveauId)
  }
  if (filters.statut) {
    result = result.filter(c => c.statut === filters.statut)
  }
  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(c =>
      c.nom.toLowerCase().includes(search)
    )
  }

  return result
}

const mockGetAllCycles = async () => {
  await delay()
  return [...cyclesMock]
}

const mockGetAllNiveaux = async (cycleId = null) => {
  await delay()
  if (cycleId) {
    return niveauxMock.filter(n => n.cycleId === cycleId)
  }
  return [...niveauxMock]
}

const mockGetAllSpecialites = async (cycleId = null) => {
  await delay()
  if (cycleId) {
    return specialitesMock.filter(s => s.cycleId === cycleId)
  }
  return [...specialitesMock]
}

const mockGetAllProfesseurs = async () => {
  await delay()
  return [...professeursMock]
}

const mockGetMatieresByCycle = async (cycle, specialite = null) => {
  await delay()
  if (cycle === 'Lycée' && specialite) {
    return matieresByCycleMock.Lycée[specialite] || []
  }
  return matieresByCycleMock[cycle] || []
}

const mockGetAllMatieres = async () => {
  await delay()
  // Retourner toutes les matières sous forme d'objets avec id et nom
  const allMatieres = []
  let id = 1
  Object.values(matieresByCycleMock).forEach(value => {
    if (Array.isArray(value)) {
      value.forEach(matiere => allMatieres.push({ id: id++, nom: matiere }))
    } else {
      Object.values(value).forEach(arr => {
        arr.forEach(matiere => allMatieres.push({ id: id++, nom: matiere }))
      })
    }
  })
  return allMatieres
}

const mockGetAllSalles = async (filters = {}) => {
  await delay()
  let result = [...sallesMock]

  if (filters.type) {
    result = result.filter(s => s.type === filters.type)
  }
  if (filters.disponible !== undefined) {
    result = result.filter(s => s.disponible === filters.disponible)
  }

  return result
}

const mockGetClasseById = async (id) => {
  await delay()
  return classesMock.find(c => c.id === id) || null
}

const mockCreateClasse = async (data) => {
  await delay()
  const cycle = cyclesMock.find(c => c.id === data.cycleId)
  const niveau = niveauxMock.find(n => n.id === data.niveauId)
  const specialite = data.specialiteId ? specialitesMock.find(s => s.id === data.specialiteId) : null

  const newClasse = {
    ...data,
    id: Math.max(...classesMock.map(c => c.id), 0) + 1,
    cycle: cycle?.nom || '',
    niveau: niveau?.nom || '',
    specialite: specialite?.nom || null,
    effectif: 0,
    anneeScolaire: '2024-2025',
  }
  classesMock.push(newClasse)
  return newClasse
}

const mockUpdateClasse = async (id, data) => {
  await delay()
  const index = classesMock.findIndex(c => c.id === id)
  if (index === -1) throw new Error('Classe non trouvée')

  const cycle = data.cycleId ? cyclesMock.find(c => c.id === data.cycleId) : null
  const niveau = data.niveauId ? niveauxMock.find(n => n.id === data.niveauId) : null
  const specialite = data.specialiteId ? specialitesMock.find(s => s.id === data.specialiteId) : null

  const updatedData = { ...data }
  if (cycle) updatedData.cycle = cycle.nom
  if (niveau) updatedData.niveau = niveau.nom
  if (specialite) updatedData.specialite = specialite.nom
  else if (data.specialiteId === null) updatedData.specialite = null

  classesMock[index] = { ...classesMock[index], ...updatedData }
  return classesMock[index]
}

const mockArchiveClasse = async (id) => {
  await delay()
  const index = classesMock.findIndex(c => c.id === id)
  if (index === -1) throw new Error('Classe non trouvée')
  classesMock[index].statut = 'Archivée'
  return classesMock[index]
}

const mockDeleteClasse = async (id) => {
  await delay()
  const index = classesMock.findIndex(c => c.id === id)
  if (index === -1) throw new Error('Classe non trouvée')
  classesMock.splice(index, 1)
  return true
}

const mockGetStats = async () => {
  await delay()
  const activeClasses = classesMock.filter(c => c.statut === 'Active')
  return {
    totalClasses: activeClasses.length,
    totalEleves: activeClasses.reduce((sum, c) => sum + c.effectif, 0),
    totalCapacite: activeClasses.reduce((sum, c) => sum + c.capacite, 0),
    tauxRemplissage: Math.round(
      (activeClasses.reduce((sum, c) => sum + c.effectif, 0) /
        activeClasses.reduce((sum, c) => sum + c.capacite, 0)) * 100
    ) || 0,
  }
}

// ============ FONCTIONS API ============
const apiGetAllClasses = async (filters = {}) => {
  const params = new URLSearchParams(filters)
  const response = await fetch(`${buildUrl('/classes')}?${params}`)
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetAllCycles = async () => {
  const response = await fetch(buildUrl('/cycles'))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetAllNiveaux = async (cycleId = null) => {
  const url = cycleId ? `/niveaux?cycleId=${cycleId}` : '/niveaux'
  const response = await fetch(buildUrl(url))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetAllSpecialites = async (cycleId = null) => {
  const url = cycleId ? `/specialites?cycleId=${cycleId}` : '/specialites'
  const response = await fetch(buildUrl(url))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetAllProfesseurs = async () => {
  const response = await fetch(buildUrl('/personnel/enseignants'))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetMatieresByCycle = async (cycle, specialite = null) => {
  const params = new URLSearchParams({ cycle })
  if (specialite) params.append('specialite', specialite)
  const response = await fetch(`${buildUrl('/matieres')}?${params}`)
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetAllMatieres = async () => {
  const response = await fetch(buildUrl('/matieres/all'))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetFilteredMatieres = async (cycleId = null, niveauId = null) => {
  const params = new URLSearchParams()
  if (cycleId) params.append('cycleId', cycleId)
  if (niveauId) params.append('niveauId', niveauId)
  const response = await fetch(`${buildUrl('/matieres/filtered')}?${params}`)
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetAllSalles = async (filters = {}) => {
  const params = new URLSearchParams(filters)
  const response = await fetch(`${buildUrl('/salles')}?${params}`)
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetClasseById = async (id) => {
  const response = await fetch(buildUrl(`/classes/${id}`))
  if (!response.ok) throw new Error('Classe non trouvée')
  return response.json()
}

const apiCreateClasse = async (data) => {
  const response = await fetch(buildUrl('/classes'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la création')
  return response.json()
}

const apiUpdateClasse = async (id, data) => {
  const response = await fetch(buildUrl(`/classes/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la mise à jour')
  return response.json()
}

const apiArchiveClasse = async (id) => {
  const response = await fetch(buildUrl(`/classes/${id}/archive`), {
    method: 'PATCH',
  })
  if (!response.ok) throw new Error('Erreur lors de l\'archivage')
  return response.json()
}

const apiDeleteClasse = async (id) => {
  const response = await fetch(buildUrl(`/classes/${id}`), {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Erreur lors de la suppression')
  return true
}

const apiGetStats = async () => {
  const response = await fetch(buildUrl('/structure/stats'))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

// Mock pour getFilteredMatieres
const mockGetFilteredMatieres = async (cycleId = null, niveauId = null) => {
  await delay()
  const allMatieres = []
  let id = 1
  Object.values(matieresByCycleMock).forEach(value => {
    if (Array.isArray(value)) {
      value.forEach(matiere => allMatieres.push({ id: id++, nom: matiere }))
    } else {
      Object.values(value).forEach(arr => {
        arr.forEach(matiere => allMatieres.push({ id: id++, nom: matiere }))
      })
    }
  })
  // Pour le mock, on retourne toutes les matières
  return allMatieres
}

// ============ SERVICE EXPORTÉ ============
export const classeService = {
  getAllClasses: API_CONFIG.USE_MOCK ? mockGetAllClasses : apiGetAllClasses,
  getAllCycles: API_CONFIG.USE_MOCK ? mockGetAllCycles : apiGetAllCycles,
  getAllNiveaux: API_CONFIG.USE_MOCK ? mockGetAllNiveaux : apiGetAllNiveaux,
  getAllSpecialites: API_CONFIG.USE_MOCK ? mockGetAllSpecialites : apiGetAllSpecialites,
  getAllProfesseurs: API_CONFIG.USE_MOCK ? mockGetAllProfesseurs : apiGetAllProfesseurs,
  getMatieresByCycle: API_CONFIG.USE_MOCK ? mockGetMatieresByCycle : apiGetMatieresByCycle,
  getAllMatieres: API_CONFIG.USE_MOCK ? mockGetAllMatieres : apiGetAllMatieres,
  getFilteredMatieres: API_CONFIG.USE_MOCK ? mockGetFilteredMatieres : apiGetFilteredMatieres,
  getAllSalles: API_CONFIG.USE_MOCK ? mockGetAllSalles : apiGetAllSalles,
  getClasseById: API_CONFIG.USE_MOCK ? mockGetClasseById : apiGetClasseById,
  createClasse: API_CONFIG.USE_MOCK ? mockCreateClasse : apiCreateClasse,
  updateClasse: API_CONFIG.USE_MOCK ? mockUpdateClasse : apiUpdateClasse,
  archiveClasse: API_CONFIG.USE_MOCK ? mockArchiveClasse : apiArchiveClasse,
  deleteClasse: API_CONFIG.USE_MOCK ? mockDeleteClasse : apiDeleteClasse,
  getStats: API_CONFIG.USE_MOCK ? mockGetStats : apiGetStats,
}
