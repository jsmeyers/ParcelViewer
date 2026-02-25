import { useState } from 'react'
import useStore from '../../store/useStore'

export default function ExportModal({ isOpen, onClose }) {
  const { selectedParcels, favorites, fiscalYear, propertyCache } = useStore()
  const [format, setFormat] = useState('csv')
  const [dataSource, setDataSource] = useState('selected')

  if (!isOpen) return null

  const exportData = dataSource === 'selected' ? selectedParcels : favorites

  const handleExport = () => {
    if (exportData.length === 0) return

    const records = exportData.map(mapLot => {
      const cached = propertyCache[mapLot]
      return {
        MapLot: mapLot,
        Address: cached?.Address || '',
        Owner: cached?.Owner_Name || '',
        AssessedValue: cached?.AssessedValue || '',
        YearBuilt: cached?.Condition_YearBuilt || '',
        Bedrooms: cached?.Interior_Bedrooms || '',
        LivingArea: cached?.Interior_LivingArea || '',
        FiscalYear: fiscalYear,
      }
    })

    let content, filename, mimeType

    if (format === 'csv') {
      const headers = Object.keys(records[0] || {})
      const csvRows = [
        headers.join(','),
        ...records.map(row => 
          headers.map(h => {
            const val = row[h]
            if (val == null) return ''
            if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
              return `"${val.replace(/"/g, '""')}"`
            }
            return val
          }).join(',')
        ),
      ]
      content = csvRows.join('\n')
      filename = `cambridge-parcels-${dataSource}-${new Date().toISOString().split('T')[0]}.csv`
      mimeType = 'text/csv'
    } else {
      content = JSON.stringify({
        source: dataSource,
        fiscalYear,
        exportedAt: new Date().toISOString(),
        count: records.length,
        parcels: records,
      }, null, 2)
      filename = `cambridge-parcels-${dataSource}-${new Date().toISOString().split('T')[0]}.json`
      mimeType = 'application/json'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Export Data</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="dataSource"
                  value="selected"
                  checked={dataSource === 'selected'}
                  onChange={(e) => setDataSource(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">Selected Parcels ({selectedParcels.length})</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="dataSource"
                  value="favorites"
                  checked={dataSource === 'favorites'}
                  onChange={(e) => setDataSource(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">Favorites ({favorites.length})</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">CSV</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === 'json'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">JSON</span>
              </label>
            </div>
          </div>

          {exportData.length === 0 && (
            <p className="text-sm text-amber-600">
              No {dataSource === 'selected' ? 'selected parcels' : 'favorites'} to export.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exportData.length === 0}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  )
}