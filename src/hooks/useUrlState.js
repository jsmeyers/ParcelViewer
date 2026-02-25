import { useEffect, useCallback } from 'react'
import useStore from '../store/useStore'

export function useUrlState() {
  const {
    selectedParcels,
    setSelectedParcels,
    favorites,
    fiscalYear,
    setFiscalYear,
    search,
    setSearchQuery,
    setSearchType,
    setSearchResults,
  } = useStore()

  const syncToUrl = useCallback(() => {
    const params = new URLSearchParams()
    
    if (selectedParcels.length > 0) {
      params.set('selected', selectedParcels.join(','))
    }
    if (favorites.length > 0) {
      params.set('favorites', favorites.join(','))
    }
    if (fiscalYear !== 'FY2024') {
      params.set('year', fiscalYear)
    }
    if (search.query) {
      params.set('q', search.query)
      params.set('type', search.type)
    }

    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    
    window.history.replaceState({}, '', newUrl)
  }, [selectedParcels, favorites, fiscalYear, search])

  const syncFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search)
    
    const selected = params.get('selected')
    if (selected) {
      setSelectedParcels(selected.split(',').slice(0, 20))
    }
    
    const year = params.get('year')
    if (year && ['FY2022', 'FY2023', 'FY2024'].includes(year)) {
      setFiscalYear(year)
    }

    const query = params.get('q')
    const type = params.get('type')
    if (query) {
      setSearchQuery(query)
    }
    if (type && ['owner', 'address', 'parcel', 'yearBuilt'].includes(type)) {
      setSearchType(type)
    }
  }, [setSelectedParcels, setFiscalYear, setSearchQuery, setSearchType])

  useEffect(() => {
    syncFromUrl()
  }, [])

  useEffect(() => {
    syncToUrl()
  }, [selectedParcels, favorites, fiscalYear, search.query, search.type, syncToUrl])

  useEffect(() => {
    const handlePopState = () => {
      syncFromUrl()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [syncFromUrl])

  const getShareUrl = useCallback(() => {
    return window.location.href
  }, [])

  const copyShareUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      return true
    } catch {
      return false
    }
  }, [])

  return { getShareUrl, copyShareUrl }
}