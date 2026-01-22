// Service Matières et Notes - Gère l'accès aux données (mock ou API)
import { API_CONFIG, delay, buildUrl } from '../api/config'
import { matieresMock, notesMock, periodesMock, bulletinsMock, academicStatsMock } from '../data/matieres.mock'

// ============ FONCTIONS MOCK ============
const mockGetAllMatieres = async (niveauId = null) => {
  await delay()
  if (niveauId) {
    return matieresMock.filter(m => m.niveauId === niveauId)
  }
  return [...matieresMock]
}

const mockGetAllPeriodes = async () => {
  await delay()
  return [...periodesMock]
}

const mockGetNotes = async (filters = {}) => {
  await delay()
  let result = [...notesMock]

  if (filters.eleveId) {
    result = result.filter(n => n.eleveId === filters.eleveId)
  }
  if (filters.matiereId) {
    result = result.filter(n => n.matiereId === filters.matiereId)
  }
  if (filters.periodeId) {
    result = result.filter(n => n.periodeId === filters.periodeId)
  }

  return result
}

const mockCreateNote = async (data) => {
  await delay()
  const newNote = {
    ...data,
    id: notesMock.length + 1,
    date: new Date().toISOString().split('T')[0],
  }
  notesMock.push(newNote)
  return newNote
}

const mockUpdateNote = async (id, data) => {
  await delay()
  const index = notesMock.findIndex(n => n.id === id)
  if (index === -1) throw new Error('Note non trouvée')
  notesMock[index] = { ...notesMock[index], ...data }
  return notesMock[index]
}

const mockDeleteNote = async (id) => {
  await delay()
  const index = notesMock.findIndex(n => n.id === id)
  if (index === -1) throw new Error('Note non trouvée')
  notesMock.splice(index, 1)
  return true
}

const mockGetBulletins = async (filters = {}) => {
  await delay()
  let result = [...bulletinsMock]

  if (filters.eleveId) {
    result = result.filter(b => b.eleveId === filters.eleveId)
  }
  if (filters.periodeId) {
    result = result.filter(b => b.periodeId === filters.periodeId)
  }

  return result
}

const mockGenerateBulletin = async (eleveId, periodeId) => {
  await delay()
  // Simulation de génération de bulletin
  const newBulletin = {
    id: bulletinsMock.length + 1,
    eleveId,
    periodeId,
    moyenneGenerale: Math.round((Math.random() * 8 + 10) * 100) / 100,
    rang: Math.floor(Math.random() * 30) + 1,
    appreciation: 'Bulletin généré automatiquement',
    dateGeneration: new Date().toISOString().split('T')[0],
  }
  bulletinsMock.push(newBulletin)
  return newBulletin
}

const mockGetStats = async () => {
  await delay()
  return academicStatsMock
}

// ============ FONCTIONS API ============
const apiGetAllMatieres = async (niveauId = null) => {
  const url = niveauId ? `/academique/matieres/niveau/${niveauId}` : '/academique/matieres'
  const response = await fetch(buildUrl(url))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetAllPeriodes = async () => {
  const response = await fetch(buildUrl('/academique/periodes'))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetNotes = async (filters = {}) => {
  let url = '/notes'
  if (filters.eleveId && filters.periodeId) {
    url = `/notes/eleve/${filters.eleveId}/periode/${filters.periodeId}`
  } else if (filters.eleveId) {
    url = `/notes/eleve/${filters.eleveId}`
  }
  const response = await fetch(buildUrl(url))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiCreateNote = async (data) => {
  const response = await fetch(buildUrl('/notes'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la création')
  return response.json()
}

const apiUpdateNote = async (id, data) => {
  const response = await fetch(buildUrl(`/notes/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la mise à jour')
  return response.json()
}

const apiDeleteNote = async (id) => {
  const response = await fetch(buildUrl(`/notes/${id}`), {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Erreur lors de la suppression')
  return true
}

const apiGetBulletins = async (filters = {}) => {
  let url = '/notes/bulletins'
  if (filters.eleveId && filters.periodeId) {
    url = `/notes/bulletin/eleve/${filters.eleveId}/periode/${filters.periodeId}`
  } else if (filters.classeId && filters.periodeId) {
    url = `/notes/bulletins/classe/${filters.classeId}/periode/${filters.periodeId}`
  }
  const response = await fetch(buildUrl(url))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGenerateBulletin = async (eleveId, periodeId) => {
  const response = await fetch(buildUrl('/notes/bulletin/generer'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eleveId, periodeId }),
  })
  if (!response.ok) throw new Error('Erreur lors de la génération')
  return response.json()
}

const apiGetStats = async () => {
  // Stats académiques - pas d'endpoint dédié, on retourne des stats calculées
  const [matieres, periodes] = await Promise.all([
    fetch(buildUrl('/academique/matieres')).then(r => r.json()),
    fetch(buildUrl('/academique/periodes')).then(r => r.json())
  ])
  return {
    totalMatieres: matieres.length,
    totalPeriodes: periodes.length
  }
}

// ============ SERVICE EXPORTÉ ============
export const matiereService = {
  getAllMatieres: API_CONFIG.USE_MOCK ? mockGetAllMatieres : apiGetAllMatieres,
  getAllPeriodes: API_CONFIG.USE_MOCK ? mockGetAllPeriodes : apiGetAllPeriodes,
  getNotes: API_CONFIG.USE_MOCK ? mockGetNotes : apiGetNotes,
  createNote: API_CONFIG.USE_MOCK ? mockCreateNote : apiCreateNote,
  updateNote: API_CONFIG.USE_MOCK ? mockUpdateNote : apiUpdateNote,
  deleteNote: API_CONFIG.USE_MOCK ? mockDeleteNote : apiDeleteNote,
  getBulletins: API_CONFIG.USE_MOCK ? mockGetBulletins : apiGetBulletins,
  generateBulletin: API_CONFIG.USE_MOCK ? mockGenerateBulletin : apiGenerateBulletin,
  getStats: API_CONFIG.USE_MOCK ? mockGetStats : apiGetStats,
}
