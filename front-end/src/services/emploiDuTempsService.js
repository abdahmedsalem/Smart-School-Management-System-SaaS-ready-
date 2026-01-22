// Service Emploi du Temps - Gère l'accès aux données via l'API backend
import { API_CONFIG, delay, buildUrl } from '../api/config'

// ============ FONCTIONS API ============
const apiGetAllSeances = async () => {
  const response = await fetch(buildUrl('/emploi-du-temps/seances'))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetSeanceById = async (id) => {
  const response = await fetch(buildUrl(`/emploi-du-temps/seances/${id}`))
  if (!response.ok) throw new Error('Séance non trouvée')
  return response.json()
}

const apiGetByClasse = async (classeId) => {
  const response = await fetch(buildUrl(`/emploi-du-temps/classe/${classeId}`))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetByClasseStructure = async (classeId) => {
  const response = await fetch(buildUrl(`/emploi-du-temps/classe/${classeId}/structure`))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetByProfesseur = async (professeurId) => {
  const response = await fetch(buildUrl(`/emploi-du-temps/professeur/${professeurId}`))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetByJour = async (jourSemaine) => {
  const response = await fetch(buildUrl(`/emploi-du-temps/jour/${jourSemaine}`))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiCreateSeance = async (data) => {
  const response = await fetch(buildUrl('/emploi-du-temps/seances'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la création')
  return response.json()
}

const apiUpdateSeance = async (id, data) => {
  const response = await fetch(buildUrl(`/emploi-du-temps/seances/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la mise à jour')
  return response.json()
}

const apiDeleteSeance = async (id) => {
  const response = await fetch(buildUrl(`/emploi-du-temps/seances/${id}`), {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Erreur lors de la suppression')
  return true
}

const apiVerifierConflits = async (data) => {
  const response = await fetch(buildUrl('/emploi-du-temps/verifier-conflits'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la vérification')
  return response.json()
}

// ============ SERVICE EXPORTÉ ============
export const emploiDuTempsService = {
  getAllSeances: apiGetAllSeances,
  getSeanceById: apiGetSeanceById,
  getByClasse: apiGetByClasse,
  getByClasseStructure: apiGetByClasseStructure,
  getByProfesseur: apiGetByProfesseur,
  getByJour: apiGetByJour,
  createSeance: apiCreateSeance,
  updateSeance: apiUpdateSeance,
  deleteSeance: apiDeleteSeance,
  verifierConflits: apiVerifierConflits,
}
