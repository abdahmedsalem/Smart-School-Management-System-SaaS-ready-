// Service Paiements - Gère l'accès aux données via l'API backend
import { API_CONFIG, delay, buildUrl } from '../api/config'

// ============ FONCTIONS API ============
const apiGetAll = async (filters = {}) => {
  const response = await fetch(buildUrl('/paiements'))
  if (!response.ok) throw new Error('Erreur lors du chargement des paiements')
  return response.json()
}

const apiGetById = async (id) => {
  const response = await fetch(buildUrl(`/paiements/${id}`))
  if (!response.ok) throw new Error('Paiement non trouvé')
  return response.json()
}

const apiGetByEleve = async (eleveId) => {
  const response = await fetch(buildUrl(`/paiements/eleve/${eleveId}`))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiCreate = async (data) => {
  console.log('Envoi paiement au backend:', data)
  const response = await fetch(buildUrl('/paiements'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Erreur backend paiement:', response.status, errorText)
    throw new Error(`Erreur lors de la création: ${response.status} - ${errorText}`)
  }
  return response.json()
}

const apiUpdate = async (id, data) => {
  const response = await fetch(buildUrl(`/paiements/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de la mise à jour')
  return response.json()
}

const apiEnregistrerPaiement = async (id, data) => {
  const response = await fetch(buildUrl(`/paiements/${id}/enregistrer`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Erreur lors de l\'enregistrement')
  return response.json()
}

const apiGetTypesFrais = async () => {
  const response = await fetch(buildUrl('/paiements/types-frais'))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetSoldeEleve = async (eleveId) => {
  const response = await fetch(buildUrl(`/paiements/solde/eleve/${eleveId}`))
  if (!response.ok) throw new Error('Erreur lors du chargement')
  return response.json()
}

const apiGetStats = async () => {
  const response = await fetch(buildUrl('/paiements/stats'))
  if (!response.ok) throw new Error('Erreur lors du chargement des statistiques')
  return response.json()
}

// ============ SERVICE EXPORTÉ ============
export const paiementService = {
  getAll: apiGetAll,
  getById: apiGetById,
  getByEleve: apiGetByEleve,
  create: apiCreate,
  update: apiUpdate,
  enregistrerPaiement: apiEnregistrerPaiement,
  getTypesFrais: apiGetTypesFrais,
  getSoldeEleve: apiGetSoldeEleve,
  getStats: apiGetStats,
}
