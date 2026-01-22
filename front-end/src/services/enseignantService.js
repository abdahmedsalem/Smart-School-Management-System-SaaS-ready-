// Service Enseignants - Gère l'accès aux données (mock ou API)
import { API_CONFIG, delay, buildUrl } from '../api/config'
import { enseignantsMock, personnelAdminMock, personnelStatsMock } from '../data/enseignants.mock'

// ============ FONCTIONS MOCK ============
const mockGetAllEnseignants = async (filters = {}) => {
  await delay()
  let result = [...enseignantsMock]

  if (filters.specialite) {
    result = result.filter(e => e.specialite === filters.specialite)
  }
  if (filters.statut) {
    result = result.filter(e => e.statut === filters.statut)
  }
  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(e =>
      e.nom.toLowerCase().includes(search) ||
      e.prenom.toLowerCase().includes(search)
    )
  }

  return result
}

const mockGetAllPersonnelAdmin = async (filters = {}) => {
  await delay()
  let result = [...personnelAdminMock]

  if (filters.departement) {
    result = result.filter(p => p.departement === filters.departement)
  }
  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(p =>
      p.nom.toLowerCase().includes(search) ||
      p.prenom.toLowerCase().includes(search)
    )
  }

  return result
}

const mockGetById = async (id, type = 'enseignant') => {
  await delay()
  const list = type === 'enseignant' ? enseignantsMock : personnelAdminMock
  return list.find(p => p.id === id) || null
}

const mockCreate = async (data, type = 'enseignant') => {
  await delay()
  const list = type === 'enseignant' ? enseignantsMock : personnelAdminMock
  const prefix = type === 'enseignant' ? 'ENS' : 'ADM'
  const newPersonnel = {
    ...data,
    id: list.length + 1,
    matricule: `${prefix}-${String(list.length + 1).padStart(3, '0')}`,
  }
  list.push(newPersonnel)
  return newPersonnel
}

const mockUpdate = async (id, data, type = 'enseignant') => {
  await delay()
  const list = type === 'enseignant' ? enseignantsMock : personnelAdminMock
  const index = list.findIndex(p => p.id === id)
  if (index === -1) throw new Error('Personnel non trouvé')
  list[index] = { ...list[index], ...data }
  return list[index]
}

const mockDelete = async (id, type = 'enseignant') => {
  await delay()
  const list = type === 'enseignant' ? enseignantsMock : personnelAdminMock
  const index = list.findIndex(p => p.id === id)
  if (index === -1) throw new Error('Personnel non trouvé')
  list.splice(index, 1)
  return true
}

const mockGetStats = async () => {
  await delay()
  return personnelStatsMock
}

// ============ FONCTIONS API ============
const apiGetAllEnseignants = async (filters = {}) => {
  try {
    const response = await fetch(buildUrl('/personnel/enseignants'))
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur lors du chargement des enseignants')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API getAllEnseignants:', error)
    throw error
  }
}

const apiGetAllPersonnelAdmin = async (filters = {}) => {
  try {
    const response = await fetch(buildUrl('/personnel/administratifs'))
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur lors du chargement du personnel administratif')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API getAllPersonnelAdmin:', error)
    throw error
  }
}

const apiGetById = async (id, type = 'enseignant') => {
  try {
    const response = await fetch(buildUrl(`/personnel/${id}`))
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Personnel non trouvé')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API getById:', error)
    throw error
  }
}

const apiCreate = async (data, type = 'enseignant') => {
  try {
    // Normaliser le type pour le backend (administration -> admin)
    const normalizedType = type === 'administration' ? 'admin' : 'enseignant'

    // Construire le payload selon le type
    const payload = {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email || null,
      telephone: data.telephone,
      dateNaissance: data.dateNaissance || null,
      adresse: data.adresse || null,
      cin: data.cin || null,
      dateEmbauche: data.dateEmbauche,
      statut: data.statut?.toLowerCase() || 'actif',
      type: normalizedType
    }

    // Ajouter les champs spécifiques enseignant
    if (normalizedType === 'enseignant') {
      payload.specialite = data.specialite || null
      payload.diplome = data.diplome || null
    }

    // Ajouter les champs spécifiques administration
    if (normalizedType === 'admin') {
      payload.fonction = data.poste || null
      payload.departement = data.departement || null
    }

    const response = await fetch(buildUrl('/personnel'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur lors de la création')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API create:', error)
    throw error
  }
}

const apiUpdate = async (id, data, type = 'enseignant') => {
  try {
    // Normaliser le type pour le backend
    const normalizedType = type === 'administration' ? 'admin' : 'enseignant'

    // Construire le payload
    const payload = {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email || null,
      telephone: data.telephone,
      dateNaissance: data.dateNaissance || null,
      adresse: data.adresse || null,
      cin: data.cin || null,
      dateEmbauche: data.dateEmbauche,
      statut: data.statut?.toLowerCase() || 'actif',
      type: normalizedType
    }

    // Ajouter les champs spécifiques
    if (normalizedType === 'enseignant') {
      payload.specialite = data.specialite || null
      payload.diplome = data.diplome || null
    } else {
      payload.fonction = data.poste || null
      payload.departement = data.departement || null
    }

    const response = await fetch(buildUrl(`/personnel/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur lors de la mise à jour')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API update:', error)
    throw error
  }
}

const apiDelete = async (id, type = 'enseignant') => {
  try {
    const response = await fetch(buildUrl(`/personnel/${id}`), {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur lors de la suppression')
    }
    return true
  } catch (error) {
    console.error('Erreur API delete:', error)
    throw error
  }
}

const apiGetStats = async () => {
  try {
    const response = await fetch(buildUrl('/personnel/stats'))
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
export const enseignantService = {
  getAllEnseignants: API_CONFIG.USE_MOCK ? mockGetAllEnseignants : apiGetAllEnseignants,
  getAllPersonnelAdmin: API_CONFIG.USE_MOCK ? mockGetAllPersonnelAdmin : apiGetAllPersonnelAdmin,
  getById: API_CONFIG.USE_MOCK ? mockGetById : apiGetById,
  create: API_CONFIG.USE_MOCK ? mockCreate : apiCreate,
  update: API_CONFIG.USE_MOCK ? mockUpdate : apiUpdate,
  delete: API_CONFIG.USE_MOCK ? mockDelete : apiDelete,
  getStats: API_CONFIG.USE_MOCK ? mockGetStats : apiGetStats,
}
