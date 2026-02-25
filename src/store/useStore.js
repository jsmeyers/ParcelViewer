import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MAX_SELECTION, FISCAL_YEARS } from '../services/arcgis'

const useStore = create(
  persist(
    (set, get) => ({
      map: {
        extent: null,
        zoom: null,
        center: null,
      },

      layers: {
        parcels: true,
        flood: false,
        zoning: false,
      },

      fiscalYear: 'FY2024',

      selectedParcels: [],
      activePropertyId: null,

      favorites: [],

      search: {
        query: '',
        type: 'owner',
        results: [],
        loading: false,
        error: null,
      },

      propertyCache: {},

      ui: {
        sidebarOpen: true,
        propertyPanelOpen: false,
        onboardingShown: false,
      },

      toasts: [],

      setMapExtent: (extent) => set((state) => ({ map: { ...state.map, extent } })),

      toggleLayer: (layerName) => set((state) => ({
        layers: { ...state.layers, [layerName]: !state.layers[layerName] },
      })),

      setFiscalYear: (year) => {
        if (FISCAL_YEARS.includes(year)) {
          set({ fiscalYear: year })
        }
      },

      selectParcel: (mapLot) => set((state) => {
        if (state.selectedParcels.includes(mapLot)) {
          return { selectedParcels: state.selectedParcels.filter(id => id !== mapLot) }
        }
        if (state.selectedParcels.length >= MAX_SELECTION) {
          return state
        }
        return { selectedParcels: [...state.selectedParcels, mapLot] }
      }),

      setSelectedParcels: (parcels) => set({ selectedParcels: parcels.slice(0, MAX_SELECTION) }),

      clearSelection: () => set({ selectedParcels: [], activePropertyId: null }),

      setActiveProperty: (propertyId) => set({ activePropertyId: propertyId }),

      toggleFavorite: (mapLot) => set((state) => {
        const isFavorite = state.favorites.includes(mapLot)
        return {
          favorites: isFavorite
            ? state.favorites.filter(id => id !== mapLot)
            : [...state.favorites, mapLot],
        }
      }),

      setFavorites: (favorites) => set({ favorites }),

      setSearchQuery: (query) => set((state) => ({
        search: { ...state.search, query },
      })),

      setSearchType: (type) => set((state) => ({
        search: { ...state.search, type },
      })),

      setSearchResults: (results) => set((state) => ({
        search: { ...state.search, results, loading: false, error: null },
      })),

      setSearchLoading: (loading) => set((state) => ({
        search: { ...state.search, loading },
      })),

      setSearchError: (error) => set((state) => ({
        search: { ...state.search, error, loading: false },
      })),

      clearSearch: () => set((state) => ({
        search: { ...state.search, query: '', results: [], error: null },
      })),

      cacheProperty: (mapLot, data) => set((state) => ({
        propertyCache: { ...state.propertyCache, [mapLot]: data },
      })),

      getCachedProperty: (mapLot) => get().propertyCache[mapLot],

      toggleSidebar: () => set((state) => ({
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
      })),

      setPropertyPanelOpen: (open) => set((state) => ({
        ui: { ...state.ui, propertyPanelOpen: open },
      })),

      setOnboardingShown: (shown) => set((state) => ({
        ui: { ...state.ui, onboardingShown: shown },
      })),

      addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { id: Date.now(), ...toast }],
      })),

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id),
      })),
    }),
    {
      name: 'parcel-viewer-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        fiscalYear: state.fiscalYear,
        ui: { onboardingShown: state.ui.onboardingShown },
      }),
    }
  )
)

export default useStore