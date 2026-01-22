// Service Salle - Gère l'accès aux données des salles via l'API backend
import { buildUrl } from '../api/config'

// ============ FONCTIONS API ============
const apiGetAllSalles = async (type = null, disponible = null) => {
  let url = '/salles'
  const params = new URLSearchParams()
  if (type) params.append('type', type)
  if (disponible !== null) params.append('disponible', disponible)
  if (params.toString()) url += `?${params.toString()}`

  const response = await fetch(buildUrl(url))
  if (!response.ok) throw new Error('Erreur lors du chargement des salles')
  return response.json()
}

const apiGetSalleById = async (id) => {
  const response = await fetch(buildUrl(`/salles/${id}`))
  if (!response.ok) throw new Error('Salle non trouvée')
  return response.json()
}

const apiCreateSalle = async (data) => {
  const response = await fetch(buildUrl('/salles'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la création de la salle')
  return response.json()
}

const apiUpdateSalle = async (id, data) => {
  const response = await fetch(buildUrl(`/salles/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la mise à jour de la salle')
  return response.json()
}

const apiDeleteSalle = async (id) => {
  const response = await fetch(buildUrl(`/salles/${id}`), {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Erreur lors de la suppression de la salle')
  return true
}

// ============ SERVICE EXPORTÉ ============
export const salleService = {
  getAllSalles: apiGetAllSalles,
  getSalleById: apiGetSalleById,
  createSalle: apiCreateSalle,
  updateSalle: apiUpdateSalle,
  deleteSalle: apiDeleteSalle,
}
