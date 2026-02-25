import { useState, useEffect, useCallback, useRef } from 'react'
import useStore from '../../store/useStore'
import { searchProperties } from '../../services/arcgis'

const SEARCH_TYPES = [
  { value: 'owner', label: 'Owner Name', placeholder: 'Search by owner name...' },
  { value: 'address', label: 'Address', placeholder: 'Search by address...' },
  { value: 'parcel', label: 'Parcel ID', placeholder: 'Enter Map-Lot (e.g., 123-45)...' },
  { value: 'yearBuilt', label: 'Year Built', placeholder: 'e.g., 1900-1950' },
]

export default function SearchBar() {
  const {
    search,
    setSearchQuery,
    setSearchType,
    setSearchResults,
    setSearchLoading,
    setSearchError,
    fiscalYear,
  } = useStore()

  const [inputValue, setInputValue] = useState(search.query)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  const debouncedSearch = useCallback(async (query, type) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setSearchLoading(true)
    setShowDropdown(true)

    try {
      const results = await searchProperties(query, type, fiscalYear)
      setSearchResults(results)
    } catch (error) {
      setSearchError('Search failed. Please try again.')
    }
  }, [fiscalYear, setSearchResults, setSearchLoading, setSearchError])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (search.type !== 'yearBuilt' || /^\d{4}-\d{4}$/.test(inputValue)) {
        debouncedSearch(inputValue, search.type)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [inputValue, search.type, debouncedSearch])

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setSearchQuery(e.target.value)
  }

  const handleTypeChange = (type) => {
    setInputValue('')
    setSearchType(type)
    setSearchResults([])
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (!showDropdown || search.results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, search.results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelectResult(search.results[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setSelectedIndex(-1)
    }
  }

  const handleSelectResult = (result) => {
    setInputValue(result.Address || result.Owner_Name || result.MapLot || '')
    setSearchQuery(result.MapLot)
    setShowDropdown(false)
    
    const { selectParcel, setActiveProperty, setPropertyPanelOpen } = useStore.getState()
    if (result.MapLot) {
      selectParcel(result.MapLot)
      setActiveProperty(result.MapLot)
      setPropertyPanelOpen(true)
    }
  }

  const currentType = SEARCH_TYPES.find(t => t.value === search.type)

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <select
          value={search.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="h-10 pl-3 pr-2 text-sm bg-transparent border-r border-gray-200 text-gray-600 focus:outline-none cursor-pointer"
          aria-label="Search type"
        >
          {SEARCH_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => search.results.length > 0 && setShowDropdown(true)}
            placeholder={currentType?.placeholder || 'Search...'}
            className="w-full h-10 px-3 pr-10 text-sm bg-transparent focus:outline-none"
            aria-label="Search input"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
          />
          
          {search.loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50"
          role="listbox"
        >
          {search.results.length > 0 ? (
            search.results.map((result, index) => (
              <button
                key={`${result.PID}-${result.MapLot}-${index}`}
                onClick={() => handleSelectResult(result)}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 focus:bg-blue-50 focus:outline-none ${
                  index === selectedIndex ? 'bg-blue-50' : ''
                }`}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="font-medium text-gray-900">
                  {result.Address || result.Owner_Name}
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {result.MapLot && <span>Map-Lot: {result.MapLot}</span>}
                  {result.AssessedValue && (
                    <span className="ml-2">&#8226; ${result.AssessedValue.toLocaleString()}</span>
                  )}
                </div>
              </button>
            ))
          ) : !search.loading && inputValue ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              <p className="font-medium">No results found</p>
              <p className="mt-1 text-xs">Try checking the spelling or searching by address instead.</p>
            </div>
          ) : null}
        </div>
      )}

      {search.error && (
        <div className="absolute top-full left-0 right-0 mt-1 px-4 py-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {search.error}
        </div>
      )}
    </div>
  )
}