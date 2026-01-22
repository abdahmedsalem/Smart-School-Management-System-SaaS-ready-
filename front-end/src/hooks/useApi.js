// Hook personnalisé pour les appels API
import { useState, useEffect, useCallback } from 'react'

/**
 * Hook pour gérer les appels API avec états de chargement et erreur
 * @param {Function} apiFunction - La fonction du service à appeler
 * @param {Array} deps - Dépendances pour le rechargement automatique
 * @param {boolean} immediate - Charger immédiatement au montage
 */
export function useApi(apiFunction, deps = [], immediate = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFunction(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, deps)

  return { data, loading, error, execute, setData }
}

/**
 * Hook pour les mutations (create, update, delete)
 * @param {Function} apiFunction - La fonction du service à appeler
 */
export function useMutation(apiFunction) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFunction(...args)
      return result
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunction])

  return { mutate, loading, error }
}

export default useApi
