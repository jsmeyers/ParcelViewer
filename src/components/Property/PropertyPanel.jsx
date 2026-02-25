import { useState, useEffect } from 'react'
import useStore from '../../store/useStore'
import { queryPropertyByMapLot } from '../../services/arcgis'
import {
  formatCurrency,
  formatSquareFeet,
  formatYearBuilt,
  formatBedroomsBaths,
  formatDate,
  truncateText,
} from '../../utils/formatters'

export default function PropertyPanel() {
  const {
    activePropertyId,
    ui: { propertyPanelOpen },
    setPropertyPanelOpen,
    fiscalYear,
    favorites,
    toggleFavorite,
    selectedParcels,
    selectParcel,
    propertyCache,
    cacheProperty,
  } = useStore()

  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(false)
  const [condoUnits, setCondoUnits] = useState([])
  const [selectedUnit, setSelectedUnit] = useState(null)

  useEffect(() => {
    if (!activePropertyId) {
      setProperty(null)
      setCondoUnits([])
      setSelectedUnit(null)
      return
    }

    const cached = propertyCache[activePropertyId]
    if (cached) {
      if (cached.length > 1) {
        setCondoUnits(cached)
        setSelectedUnit(cached[0])
      } else {
        setProperty(cached[0])
        setCondoUnits([])
        setSelectedUnit(null)
      }
      return
    }

    const fetchProperty = async () => {
      setLoading(true)
      try {
        const results = await queryPropertyByMapLot(activePropertyId, fiscalYear)
        if (results.length > 0) {
          cacheProperty(activePropertyId, results)
          if (results.length > 1) {
            setCondoUnits(results)
            setSelectedUnit(results[0])
          } else {
            setProperty(results[0])
            setCondoUnits([])
            setSelectedUnit(null)
          }
        } else {
          setProperty(null)
          setCondoUnits([])
        }
      } catch (error) {
        console.error('Error fetching property:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [activePropertyId, fiscalYear, propertyCache, cacheProperty])

  useEffect(() => {
    if (condoUnits.length > 0 && selectedUnit === null && property) {
      setSelectedUnit(property)
    }
  }, [condoUnits, selectedUnit, property])

  const displayProperty = condoUnits.length > 0 ? selectedUnit : property
  const isFavorite = favorites.includes(activePropertyId)
  const isSelected = selectedParcels.includes(activePropertyId)

  return propertyPanelOpen ? (
    <div className="fixed right-0 top-0 w-80 h-screen z-[9999] bg-white/95 backdrop-blur-sm border-l border-gray-200 overflow-y-auto flex flex-col shadow-2xl">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Property Details</h2>
        <button
          onClick={() => setPropertyPanelOpen(false)}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : !displayProperty ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-500 text-sm">No property data available for {fiscalYear}.</p>
          <p className="text-gray-400 text-xs mt-1">Try selecting a different fiscal year.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-lg text-gray-900">
              {displayProperty.Address || 'Unknown Address'}
              {displayProperty.Unit && <span className="text-gray-500 ml-1">#{displayProperty.Unit}</span>}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Map-Lot: {displayProperty.MapLot}</p>
            
            {displayProperty.PID && (
              <a 
                href={`https://www.cambridgema.gov/propertydatabase/${displayProperty.PID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                View on Property Database →
              </a>
            )}
            
            {condoUnits.length > 1 && (
              <select
                value={selectedUnit ? condoUnits.indexOf(selectedUnit) : ''}
                onChange={(e) => {
                  const unit = condoUnits[Number(e.target.value)]
                  setSelectedUnit(unit)
                }}
                className="mt-2 w-full text-sm border border-gray-300 rounded px-2 py-1.5"
              >
                {condoUnits.map((unit, index) => (
                  <option key={index} value={index}>
                    Unit {unit.Unit || unit.BldgNum || `Unit ${index + 1}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <PropertySection title="Ownership">
            <PropertyField label="Owner" value={truncateText(displayProperty.Owner_Name, 40)} />
            {displayProperty.Owner_CoOwnerName && (
              <PropertyField label="Co-Owner" value={truncateText(displayProperty.Owner_CoOwnerName, 40)} />
            )}
            {displayProperty.Owner_Address && (
              <PropertyField
                label="Mailing Address"
                value={`${displayProperty.Owner_Address}${displayProperty.Owner_City ? `, ${displayProperty.Owner_City}` : ''}${displayProperty.Owner_State ? `, ${displayProperty.Owner_State}` : ''} ${displayProperty.Owner_Zip || ''}`}
              />
            )}
          </PropertySection>

          <PropertySection title="Assessment">
            <PropertyField label="Assessed Value" value={formatCurrency(displayProperty.AssessedValue)} highlight />
            <div className="grid grid-cols-2 gap-2">
              <PropertyField label="Land" value={formatCurrency(displayProperty.LandValue)} />
              <PropertyField label="Building" value={formatCurrency(displayProperty.BuildingValue)} />
            </div>
            <PropertyField label="Property Class" value={displayProperty.PropertyClass} />
            <PropertyField label="Zoning" value={displayProperty.Zoning} />
          </PropertySection>

          <PropertySection title="Building">
            <PropertyField label="Year Built" value={formatYearBuilt(displayProperty.Condition_YearBuilt)} />
            <PropertyField
              label="Bedrooms/Baths"
              value={formatBedroomsBaths(
                displayProperty.Interior_Bedrooms,
                displayProperty.Interior_FullBaths,
                displayProperty.Interior_HalfBaths
              )}
            />
            <PropertyField label="Living Area" value={formatSquareFeet(displayProperty.Interior_LivingArea)} />
            <PropertyField label="Total Rooms" value={displayProperty.Interior_TotalRooms} />
            <PropertyField label="Style" value={displayProperty.Exterior_Style} />
            <PropertyField label="Stories" value={displayProperty.Exterior_NumStories} />
          </PropertySection>

          <PropertySection title="Systems">
            <PropertyField label="Heating" value={displayProperty.Systems_HeatType} />
            <PropertyField label="Fuel" value={displayProperty.Systems_HeatFuel} />
            <PropertyField label="Central Air" value={displayProperty.Systems_CentralAir} />
          </PropertySection>

          <PropertySection title="Sales">
            <PropertyField label="Sale Date" value={formatDate(displayProperty.SaleDate)} />
            <PropertyField label="Sale Price" value={formatCurrency(displayProperty.SalePrice)} />
          </PropertySection>

          <div className="p-4 text-xs text-gray-400 border-t border-gray-100">
            Data as of {fiscalYear.replace('FY', 'Fiscal Year ')}
          </div>
        </div>
      )}

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => selectParcel(activePropertyId)}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
          <button
            onClick={() => toggleFavorite(activePropertyId)}
            className={`p-2 rounded transition-colors ${
              isFavorite
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  ) : null
}

function PropertySection({ title, children }) {
  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

function PropertyField({ label, value, highlight = false }) {
  if (value == null || value === '' || value === 'N/A') return null
  
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm text-right ${highlight ? 'font-semibold text-blue-600' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  )
}