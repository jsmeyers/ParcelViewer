import { useEffect, useRef, useCallback } from 'react'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Graphic from '@arcgis/core/Graphic'
import OpenStreetMapLayer from '@arcgis/core/layers/OpenStreetMapLayer'
import useStore from '../../store/useStore'
import { ARCGIS_SERVICES, CAMBRIDGE_EXTENT } from '../../services/arcgis'

const parcelRenderer = {
  type: 'simple',
  symbol: {
    type: 'simple-fill',
    color: [76, 129, 205, 0.15],
    outline: {
      color: [59, 130, 246, 0.6],
      width: 1,
    },
  },
}

const selectionSymbol = {
  type: 'simple-fill',
  color: [59, 130, 246, 0.4],
  outline: {
    color: [59, 130, 246, 1],
    width: 2,
  },
}

const floodRenderer = {
  type: 'simple',
  symbol: {
    type: 'simple-fill',
    color: [6, 182, 212, 0.3],
    outline: {
      color: [6, 182, 212, 0.8],
      width: 1,
    },
  },
}

const zoningRenderer = {
  type: 'unique-value',
  field: 'Zoning',
  uniqueValueInfos: [
    { value: 'Business 1', symbol: { type: 'simple-fill', color: [239, 68, 68, 0.3], outline: { color: [239, 68, 68, 0.8], width: 1 } } },
    { value: 'Business 2', symbol: { type: 'simple-fill', color: [249, 115, 22, 0.3], outline: { color: [249, 115, 22, 0.8], width: 1 } } },
    { value: 'Business 3', symbol: { type: 'simple-fill', color: [245, 158, 11, 0.3], outline: { color: [245, 158, 11, 0.8], width: 1 } } },
    { value: 'Business 4', symbol: { type: 'simple-fill', color: [234, 179, 8, 0.3], outline: { color: [234, 179, 8, 0.8], width: 1 } } },
    { value: 'Business 5', symbol: { type: 'simple-fill', color: [202, 138, 4, 0.3], outline: { color: [202, 138, 4, 0.8], width: 1 } } },
    { value: 'Business A', symbol: { type: 'simple-fill', color: [251, 191, 36, 0.3], outline: { color: [251, 191, 36, 0.8], width: 1 } } },
    { value: 'Business B', symbol: { type: 'simple-fill', color: [252, 211, 77, 0.3], outline: { color: [252, 211, 77, 0.8], width: 1 } } },
    { value: 'Business C', symbol: { type: 'simple-fill', color: [253, 224, 71, 0.3], outline: { color: [253, 224, 71, 0.8], width: 1 } } },
    { value: 'Residence 1', symbol: { type: 'simple-fill', color: [34, 197, 94, 0.3], outline: { color: [34, 197, 94, 0.8], width: 1 } } },
    { value: 'Residence 2', symbol: { type: 'simple-fill', color: [22, 163, 74, 0.3], outline: { color: [22, 163, 74, 0.8], width: 1 } } },
    { value: 'Residence 3', symbol: { type: 'simple-fill', color: [21, 128, 61, 0.3], outline: { color: [21, 128, 61, 0.8], width: 1 } } },
    { value: 'Residence 3A', symbol: { type: 'simple-fill', color: [132, 204, 22, 0.3], outline: { color: [132, 204, 22, 0.8], width: 1 } } },
    { value: 'Residence 3B', symbol: { type: 'simple-fill', color: [163, 230, 53, 0.3], outline: { color: [163, 230, 53, 0.8], width: 1 } } },
    { value: 'Office 1', symbol: { type: 'simple-fill', color: [139, 92, 246, 0.3], outline: { color: [139, 92, 246, 0.8], width: 1 } } },
    { value: 'Office 2', symbol: { type: 'simple-fill', color: [124, 58, 237, 0.3], outline: { color: [124, 58, 237, 0.8], width: 1 } } },
    { value: 'Office 3', symbol: { type: 'simple-fill', color: [109, 40, 217, 0.3], outline: { color: [109, 40, 217, 0.8], width: 1 } } },
    { value: 'Industry A', symbol: { type: 'simple-fill', color: [115, 115, 115, 0.3], outline: { color: [115, 115, 115, 0.8], width: 1 } } },
    { value: 'Industry B', symbol: { type: 'simple-fill', color: [82, 82, 82, 0.3], outline: { color: [82, 82, 82, 0.8], width: 1 } } },
    { value: 'Industry C', symbol: { type: 'simple-fill', color: [64, 64, 64, 0.3], outline: { color: [64, 64, 64, 0.8], width: 1 } } },
    { value: 'Unrestricted', symbol: { type: 'simple-fill', color: [168, 162, 158, 0.3], outline: { color: [168, 162, 158, 0.8], width: 1 } } },
  ],
  defaultSymbol: {
    type: 'simple-fill',
    color: [168, 162, 158, 0.2],
    outline: { color: [168, 162, 158, 0.6], width: 1 },
  },
}

export default function MapViewComponent() {
  const mapDiv = useRef(null)
  const viewRef = useRef(null)
  const parcelLayerRef = useRef(null)
  const floodLayerRef = useRef(null)
  const zoningLayerRef = useRef(null)
  const selectionLayerRef = useRef(null)
  const isInitializedRef = useRef(false)

  const {
    layers,
    selectedParcels,
    selectParcel,
    setActiveProperty,
    setPropertyPanelOpen,
    toggleSidebar,
  } = useStore()

  const handleParcelClick = useCallback(async (event) => {
    if (!viewRef.current || !parcelLayerRef.current) return

    const hitTest = await viewRef.current.hitTest(event)
    const parcelHit = hitTest.results.find(r => r.graphic?.layer === parcelLayerRef.current)
    
    if (parcelHit) {
      const attributes = parcelHit.graphic.attributes
      const mapLot = attributes?.ML
      
      if (mapLot) {
        setActiveProperty(mapLot)
        setPropertyPanelOpen(true)
      }
    }
  }, [setActiveProperty, setPropertyPanelOpen])

  useEffect(() => {
    if (!mapDiv.current || viewRef.current || isInitializedRef.current) return

    isInitializedRef.current = true

    const parcelLayer = new FeatureLayer({
      url: ARCGIS_SERVICES.parcels,
      renderer: parcelRenderer,
      outFields: ['OBJECTID', 'ML', 'MAP', 'LOT', 'LOC_ID', 'POLY_TYPE'],
      popupEnabled: false,
    })
    parcelLayerRef.current = parcelLayer

    const floodLayer = new FeatureLayer({
      url: ARCGIS_SERVICES.flood,
      renderer: floodRenderer,
      visible: layers.flood,
      popupEnabled: false,
    })
    floodLayerRef.current = floodLayer

    const zoningLayer = new FeatureLayer({
      url: ARCGIS_SERVICES.zoning,
      renderer: zoningRenderer,
      visible: layers.zoning,
      popupEnabled: false,
    })
    zoningLayerRef.current = zoningLayer

    const selectionLayer = new GraphicsLayer({
      graphics: [],
    })
    selectionLayerRef.current = selectionLayer

    const map = new Map({
      basemap: undefined,
      layers: [
        new OpenStreetMapLayer(),
        parcelLayer,
        floodLayer,
        zoningLayer,
        selectionLayer,
      ],
    })

    const view = new MapView({
      container: mapDiv.current,
      map,
      extent: CAMBRIDGE_EXTENT,
      constraints: {
        rotationEnabled: false,
        minZoom: 10,
        maxZoom: 19,
        snapToZoom: true,
      },
      navigation: {
        browserTouchPanEnabled: false,
        momentumEnabled: false,
      },
      scrollWheelZoomEnabled: true,
      popup: null,
      ui: {
        components: ['zoom', 'compass'],
      },
    })

    viewRef.current = view

    view.on('click', handleParcelClick)

    view.when(() => {
      view.ui.add(
        createLocateButton(view),
        'top-leading'
      )
    })

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }
      isInitializedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (floodLayerRef.current) {
      floodLayerRef.current.visible = layers.flood
    }
  }, [layers.flood])

  useEffect(() => {
    if (zoningLayerRef.current) {
      zoningLayerRef.current.visible = layers.zoning
    }
  }, [layers.zoning])

  useEffect(() => {
    if (!selectionLayerRef.current || !viewRef.current) return

    const updateSelectionGraphics = async () => {
      selectionLayerRef.current.removeAll()
      
      if (selectedParcels.length === 0) return

      const whereClause = `ML IN ('${selectedParcels.join("','")}')`
      
      try {
        const query = parcelLayerRef.current.createQuery()
        query.where = whereClause
        query.returnGeometry = true
        query.outFields = ['ML']
        
        const results = await parcelLayerRef.current.queryFeatures(query)
        
        results.features.forEach(feature => {
          const graphic = new Graphic({
            geometry: feature.geometry,
            symbol: selectionSymbol,
            attributes: feature.attributes,
          })
          selectionLayerRef.current.add(graphic)
        })
      } catch (error) {
        console.error('Error updating selection graphics:', error)
      }
    }

    updateSelectionGraphics()
  }, [selectedParcels])

  return (
    <div className="relative w-full h-full">
      <div ref={mapDiv} className="absolute inset-0 map-container" />
      <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1.5 rounded shadow text-xs text-gray-600">
        Cambridge, MA
      </div>
    </div>
  )
}

function createLocateButton(view) {
  const btn = document.createElement('button')
  btn.className = 'arcgis-locate-btn'
  btn.title = 'Find my location'
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4"></path>
    </svg>
  `
  btn.style.cssText = `
    background: white;
    border: none;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  `
  
  btn.addEventListener('click', () => {
    view.graphics.removeAll()
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          view.goTo({
            center: [longitude, latitude],
            zoom: 15,
          })
        },
        (error) => {
          console.warn('Geolocation error:', error)
        }
      )
    }
  })
  
  return btn
}