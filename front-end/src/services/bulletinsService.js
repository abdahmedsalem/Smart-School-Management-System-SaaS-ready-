// Service Bulletins - Gère l'accès aux données (mock ou API)
import { API_CONFIG, delay, buildUrl } from '../api/config'

// ============ FONCTIONS MOCK ============
const mockBulletins = [
  {
    id: 1,
    eleveId: 1,
    eleveNom: 'Diallo',
    elevePrenom: 'Amadou',
    eleveMatricule: 'EL-001',
    eleveClasse: '3ème Collège A',
    periodeId: 1,
    moyenneGenerale: 14.5,
    rang: 5,
    totalEleves: 35,
    appreciation: 'Bon élève, continue tes efforts',
    decision: 'Admis',
    anneeScolaire: '2023-2024',
    dateGeneration: '2024-01-20',
    notesMatieres: [
      {
        matiereId: 1,
        matiere: 'Mathématiques',
        coefficient: 4,
        moyenne: 15.5,
        moyenneClasse: 12.0,
        appreciation: 'Très bien'
      },
      {
        matiereId: 2,
        matiere: 'Français',
        coefficient: 4,
        moyenne: 13.5,
        moyenneClasse: 11.5,
        appreciation: 'Bien'
      }
    ]
  }
]

const mockGetBulletinEleve = async (eleveId, periodeId) => {
  await delay()
  const bulletin = mockBulletins.find(
    b => b.eleveId === eleveId && b.periodeId === periodeId
  )
  if (!bulletin) {
    throw new Error('Bulletin non trouvé')
  }
  return bulletin
}

const mockGenererBulletin = async (eleveId, periodeId) => {
  await delay()
  // Simuler la génération d'un bulletin
  const newBulletin = {
    id: mockBulletins.length + 1,
    eleveId,
    periodeId,
    eleveNom: 'Diallo',
    elevePrenom: 'Amadou',
    eleveMatricule: 'EL-001',
    eleveClasse: '3ème Collège A',
    moyenneGenerale: 14.0,
    rang: 8,
    totalEleves: 35,
    appreciation: 'Bulletin généré',
    decision: 'Admis',
    anneeScolaire: '2023-2024',
    dateGeneration: new Date().toISOString().split('T')[0],
    notesMatieres: []
  }
  mockBulletins.push(newBulletin)
  return newBulletin
}

const mockGetBulletinsClasse = async (classeId, periodeId) => {
  await delay()
  return mockBulletins.filter(b => b.periodeId === periodeId)
}

const mockGetBulletinsEleve = async (eleveId) => {
  await delay()
  return mockBulletins.filter(b => b.eleveId === eleveId)
}

// ============ FONCTIONS API ============
const apiGetBulletinEleve = async (eleveId, periodeId) => {
  try {
    const response = await fetch(
      buildUrl(`/notes/bulletin/eleve/${eleveId}/periode/${periodeId}`)
    )
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Bulletin non trouvé')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API getBulletinEleve:', error)
    throw error
  }
}

const apiGenererBulletin = async (eleveId, periodeId) => {
  try {
    const payload = { eleveId, periodeId }

    const response = await fetch(buildUrl('/notes/bulletin/generer'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur lors de la génération du bulletin')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API genererBulletin:', error)
    throw error
  }
}

const apiGetBulletinsClasse = async (classeId, periodeId) => {
  try {
    const response = await fetch(
      buildUrl(`/notes/bulletins/classe/${classeId}/periode/${periodeId}`)
    )
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur lors du chargement des bulletins')
    }
    return response.json()
  } catch (error) {
    console.error('Erreur API getBulletinsClasse:', error)
    throw error
  }
}

const apiGetBulletinsEleve = async (eleveId) => {
  try {
    // Endpoint à implémenter côté backend si nécessaire
    // Pour l'instant, utiliser l'endpoint par période
    return []
  } catch (error) {
    console.error('Erreur API getBulletinsEleve:', error)
    throw error
  }
}

// ============ SERVICE EXPORTÉ ============
export const bulletinsService = {
  getBulletinEleve: API_CONFIG.USE_MOCK ? mockGetBulletinEleve : apiGetBulletinEleve,
  genererBulletin: API_CONFIG.USE_MOCK ? mockGenererBulletin : apiGenererBulletin,
  getBulletinsClasse: API_CONFIG.USE_MOCK ? mockGetBulletinsClasse : apiGetBulletinsClasse,
  getBulletinsEleve: API_CONFIG.USE_MOCK ? mockGetBulletinsEleve : apiGetBulletinsEleve,
}
