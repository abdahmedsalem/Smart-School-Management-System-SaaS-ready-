import { create } from 'zustand'

// Store registry pour gérer plusieurs groupes de filtres
const stores = {}

export function useFilterStore(groupId) {
  if (!stores[groupId]) {
    stores[groupId] = create((set, get) => ({
      filters: {},
      active: [],

      update: (name, value, meta = {}) => {
        set((state) => {
          const newFilters = { ...state.filters, [name]: value }
          const existingIndex = state.active.findIndex((f) => f.name === name)
          const newActive = [...state.active]

          const activeItem = {
            name,
            value,
            title: meta.title || name,
            display: meta.display || value,
          }

          if (existingIndex >= 0) {
            newActive[existingIndex] = activeItem
          } else {
            newActive.push(activeItem)
          }

          return { filters: newFilters, active: newActive }
        })
      },

      remove: (name) => {
        set((state) => {
          const newFilters = { ...state.filters }
          delete newFilters[name]
          const newActive = state.active.filter((f) => f.name !== name)
          return { filters: newFilters, active: newActive }
        })
      },

      clear: () => {
        set({ filters: {}, active: [] })
      },

      get: (name) => get().filters[name],
    }))
  }

  return stores[groupId]
}
