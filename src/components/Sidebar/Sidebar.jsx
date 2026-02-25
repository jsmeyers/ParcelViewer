import { useState } from 'react'
import useStore from '../../store/useStore'
import { FISCAL_YEARS } from '../../services/arcgis'
import SearchBar from '../Search/SearchBar'
import ExportModal from '../Export/ExportModal'

export default function Sidebar() {
  const {
    layers,
    toggleLayer,
    fiscalYear,
    setFiscalYear,
    favorites,
    selectedParcels,
    toggleFavorite,
    setSelectedParcels,
    clearSelection,
    selectedParcels: selectedList,
    toggleSidebar,
    ui: { sidebarOpen, onboardingShown },
    setOnboardingShown,
  } = useStore()

  const [activeTab, setActiveTab] = useState('layers')
  const [showExportModal, setShowExportModal] = useState(false)

  const handleRemoveFavorite = (mapLot) => {
    toggleFavorite(mapLot)
  }

  const handleRemoveSelection = (mapLot) => {
    setSelectedParcels(selectedList.filter(id => id !== mapLot))
  }

  return (
    <>
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-20 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <div className="flex h-full">
        <div className={`transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0'}`}>
          {sidebarOpen && (
            <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg font-bold text-gray-900">Cambridge Parcels</h1>
                <button
                  onClick={toggleSidebar}
                  className="p-1 hover:bg-gray-100 rounded"
                  aria-label="Close sidebar"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <SearchBar />
              
              <div className="mt-3">
                <label htmlFor="fiscal-year" className="sr-only">Fiscal Year</label>
                <select
                  id="fiscal-year"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  {FISCAL_YEARS.map(year => (
                    <option key={year} value={year}>
                      {year.replace('FY', 'FY ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-b border-gray-200">
              <nav className="flex">
                {['layers', 'selected', 'favorites'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'selected' && selectedParcels.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                        {selectedParcels.length}
                      </span>
                    )}
                    {tab === 'favorites' && favorites.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-600 rounded-full">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === 'layers' && (
                <div className="p-4 space-y-2">
                  <LayerToggle
                    label="Parcels"
                    checked={layers.parcels}
                    onChange={() => {}}
                    disabled
                    description="Property boundaries (always visible)"
                  />
                  <LayerToggle
                    label="Flood Zones"
                    checked={layers.flood}
                    onChange={() => toggleLayer('flood')}
                    description="100-year floodplain"
                  />
                  <LayerToggle
                    label="Zoning"
                    checked={layers.zoning}
                    onChange={() => toggleLayer('zoning')}
                    description="Zoning districts"
                  />

                  {(layers.flood || layers.zoning) && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Legend</h4>
                      {layers.flood && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(6, 182, 212, 0.4)' }}></div>
                          <span>Flood Zone</span>
                        </div>
                      )}
                      {layers.zoning && (
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.4)' }}></div>
                            <span>Residential</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.4)' }}></div>
                            <span>Business</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(139, 92, 246, 0.4)' }}></div>
                            <span>Office</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(115, 115, 115, 0.4)' }}></div>
                            <span>Industrial</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'selected' && (
                <div className="p-4">
                  {selectedParcels.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p>No parcels selected</p>
                      <p className="text-xs mt-1">Click on a parcel and press "Select" to add it here</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-500">{selectedParcels.length} selected</span>
                        <button
                          onClick={clearSelection}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Clear all
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {selectedParcels.map(mapLot => (
                          <li
                            key={mapLot}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm font-medium">{mapLot}</span>
                            <button
                              onClick={() => handleRemoveSelection(mapLot)}
                              className="p-1 text-gray-400 hover:text-red-500"
                              aria-label={`Remove ${mapLot} from selection`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="p-4">
                  {favorites.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <p>No favorites yet</p>
                      <p className="text-xs mt-1">Star a property to save it here</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {favorites.map(mapLot => (
                        <li
                          key={mapLot}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm font-medium">{mapLot}</span>
                          <button
                            onClick={() => handleRemoveFavorite(mapLot)}
                            className="p-1 text-yellow-500 hover:text-yellow-600"
                            aria-label={`Remove ${mapLot} from favorites`}
                          >
                            <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowExportModal(true)}
                disabled={selectedParcels.length === 0 && favorites.length === 0}
                className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors ${
                  selectedParcels.length > 0 || favorites.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Export Data
              </button>
            </div>
            </div>
          )}
        </div>
      </div>

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </>
  )
}

function LayerToggle({ label, checked, onChange, disabled, description }) {
  return (
    <label className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${disabled ? 'opacity-60' : 'hover:bg-gray-50 cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
    </label>
  )
}