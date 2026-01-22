// Configuration API - Basculer entre mock et backend
export const API_CONFIG = {
  // Mettre à false pour utiliser le backend Spring Boot
  USE_MOCK: false,

  // URL du backend Spring Boot
  BASE_URL: 'http://localhost:8080/api',

  // Délai simulé pour les mock (ms)
  MOCK_DELAY: 300,
}

// Helper pour simuler un délai réseau
export const delay = (ms = API_CONFIG.MOCK_DELAY) =>
  new Promise(resolve => setTimeout(resolve, ms))

// Helper pour construire les URLs
export const buildUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`
