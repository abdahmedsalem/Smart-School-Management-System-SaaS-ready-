// Service Notes - Gère l'accès aux données (mock ou API)
import { API_CONFIG, delay, buildUrl } from '../api/config'

// ============ FONCTIONS MOCK ============
const mockNotes = []

const mockGetAllNotes = async (filters = {}) => {
  await delay()
  let result = [...mockNotes]

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

const mockGetNoteById = async (id) => {
  await delay()
  return mockNotes.find(n => n.id === id) || null
}

const mockGetNotesByEleve = async (eleveId, periodeId = null) => {
  await delay()
  let result = mockNotes.filter(n => n.eleveId === eleveId)
  if (periodeId) {
    result = result.filter(n => n.periodeId === periodeId)
  }
  return result
}

const mockCreateNote = async (data) => {
  await delay()
  const newNote = {
    ...data,
    id: mockNotes.length + 1,
    eleveNom: 'Mock',
    elevePrenom: 'Eleve',
    eleveMatricule: `EL-${mockNotes.length + 1}`,
    matiere: 'Matière',
  }
  mockNotes.push(newNote)
  return newNote
}

const mockCreateNotesBulk = async (notesArray) => {
  await delay()
  const createdNotes = notesArray.map((note, index) => ({
    ...note,
    id: mockNotes.length + index + 1,
  }))
  mockNotes.push(...createdNotes)
  return createdNotes
}

const mockUpdateNote = async (id, data) => {
  await delay()
  const index = mockNotes.findIndex(n => n.id === id)
  if (index === -1) throw new Error('Note non trouvée')
  mockNotes[index] = { ...mockNotes[index], ...data }
  return mockNotes[index]
}

const mockDeleteNote = async (id) => {
  await delay()
  const index = mockNotes.findIndex(n => n.id === id)
  if (index === -1) throw new Error('Note non trouvée')
  mockNotes.splice(index, 1)
  return true
}

const mockGetStats = async () => {
  await delay()
  return {
    totalNotes: mockNotes.length,
    moyenneGenerale: 13.5,
    tauxReussite: 85
  }
}

// ============ FONCTIONS API ============
const apiGetAllNotes = async (filters = {}) => {
  try {
    let url = buildUrl('/notes')
    const params = new URLSearchParams()

    if (filters.eleveId) params.append('eleveId', filters.eleveId)
    if (filters.matiereId) params.append('matiereId', filters.matiereId)
    if (filters.periodeId) params.append('periodeId', filters.periodeId)

    if (params.toString()) url += `?${params.toString()}`

    const response = await fetch(url)
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur lors du chargement des notes')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API getAllNotes:', error)
    throw error
  }
}

const apiGetNoteById = async (id) => {
  try {
    const response = await fetch(buildUrl(`/notes/${id}`))
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Note non trouvée')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API getNoteById:', error)
    throw error
  }
}

const apiGetNotesByEleve = async (eleveId, periodeId = null) => {
  try {
    let url = buildUrl(`/notes/eleve/${eleveId}`)
    if (periodeId) {
      url = buildUrl(`/notes/eleve/${eleveId}/periode/${periodeId}`)
    }

    const response = await fetch(url)
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur lors du chargement des notes')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API getNotesByEleve:', error)
    throw error
  }
}

const apiCreateNote = async (data) => {
  try {
    const payload = {
      eleveId: data.eleveId,
      matiereId: data.matiereId,
      examenId: data.examenId || null,
      periodeId: data.periodeId,
      valeur: parseFloat(data.valeur),
      type: data.type || 'Devoir',
      dateNote: data.dateNote || new Date().toISOString().split('T')[0],
      commentaire: data.commentaire || null,
      anneeScolaire: data.anneeScolaire || '2023-2024'
    }

    const response = await fetch(buildUrl('/notes'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur lors de la création de la note')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API createNote:', error)
    throw error
  }
}

const apiCreateNotesBulk = async (notesArray) => {
  try {
    // Créer les notes une par une (ou utiliser un endpoint bulk si disponible)
    const promises = notesArray.map(note => apiCreateNote(note))
    return await Promise.all(promises)
  } catch (error) {
    console.error('Erreur API createNotesBulk:', error)
    throw error
  }
}

const apiUpdateNote = async (id, data) => {
  try {
    const payload = {
      eleveId: data.eleveId,
      matiereId: data.matiereId,
      examenId: data.examenId || null,
      periodeId: data.periodeId,
      valeur: parseFloat(data.valeur),
      type: data.type || 'Devoir',
      dateNote: data.dateNote,
      commentaire: data.commentaire || null,
      anneeScolaire: data.anneeScolaire
    }

    const response = await fetch(buildUrl(`/notes/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur lors de la mise à jour de la note')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API updateNote:', error)
    throw error
  }
}

const apiDeleteNote = async (id) => {
  try {
    const response = await fetch(buildUrl(`/notes/${id}`), {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur lors de la suppression de la note')
    }
    return true
  } catch (error) {
    console.error('Erreur API deleteNote:', error)
    throw error
  }
}

const apiGetStats = async () => {
  try {
    const response = await fetch(buildUrl('/notes/stats'))
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur lors du chargement des statistiques')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API getStats:', error)
    throw error
  }
}

// ============ SERVICE EXPORTÉ ============
export const notesService = {
  getAllNotes: API_CONFIG.USE_MOCK ? mockGetAllNotes : apiGetAllNotes,
  getNoteById: API_CONFIG.USE_MOCK ? mockGetNoteById : apiGetNoteById,
  getNotesByEleve: API_CONFIG.USE_MOCK ? mockGetNotesByEleve : apiGetNotesByEleve,
  createNote: API_CONFIG.USE_MOCK ? mockCreateNote : apiCreateNote,
  createNotesBulk: API_CONFIG.USE_MOCK ? mockCreateNotesBulk : apiCreateNotesBulk,
  updateNote: API_CONFIG.USE_MOCK ? mockUpdateNote : apiUpdateNote,
  deleteNote: API_CONFIG.USE_MOCK ? mockDeleteNote : apiDeleteNote,
  getStats: API_CONFIG.USE_MOCK ? mockGetStats : apiGetStats,
}
