export const ARCGIS_SERVICES = {
  parcels: 'https://services1.arcgis.com/WnzC35krSYGuYov4/ArcGIS/rest/services/FY2025_Parcels/FeatureServer/0',
  property: {
    FY2022: 'https://services1.arcgis.com/WnzC35krSYGuYov4/ArcGIS/rest/services/FY2022_Property_Database/FeatureServer/0',
    FY2023: 'https://services1.arcgis.com/WnzC35krSYGuYov4/ArcGIS/rest/services/FY2023_Property_Database/FeatureServer/0',
    FY2024: 'https://services1.arcgis.com/WnzC35krSYGuYov4/ArcGIS/rest/services/FY2024_Property_Database/FeatureServer/0',
  },
  flood: 'https://services1.arcgis.com/WnzC35krSYGuYov4/ArcGIS/rest/services/FEMA_FloodPlains100Year/FeatureServer/0',
  zoning: 'https://services1.arcgis.com/WnzC35krSYGuYov4/ArcGIS/rest/services/1924_Zoning/FeatureServer/3',
}

export const CAMBRIDGE_EXTENT = {
  xmin: -7921530.919812507,
  ymin: 5213978.5184923317,
  xmax: -7910805.458142627,
  ymax: 5221703.7054271614,
  spatialReference: { wkid: 102100, latestWkid: 3857 },
}

export const MAX_SELECTION = 20

export const FISCAL_YEARS = ['FY2024', 'FY2023', 'FY2022']

export async function queryPropertyByMapLot(mapLot, fiscalYear = 'FY2024') {
  const url = `${ARCGIS_SERVICES.property[fiscalYear]}/query`
  const params = new URLSearchParams({
    where: `MapLot = '${mapLot}'`,
    outFields: '*',
    f: 'json',
  })
  
  try {
    const response = await fetch(`${url}?${params}`)
    const data = await response.json()
    return data.features?.map(f => f.attributes) || []
  } catch (error) {
    console.error('Error querying property data:', error)
    return []
  }
}

export async function searchProperties(query, type, fiscalYear = 'FY2024', limit = 50) {
  const url = `${ARCGIS_SERVICES.property[fiscalYear]}/query`
  
  let whereClause = ''
  switch (type) {
    case 'owner':
      whereClause = `Owner_Name LIKE '%${query.replace(/'/g, "''")}%'`
      break
    case 'address':
      whereClause = `Address LIKE '%${query.replace(/'/g, "''")}%'`
      break
    case 'parcel':
      whereClause = `MapLot = '${query.replace(/'/g, "''")}'`
      break
    case 'yearBuilt':
      const [minYear, maxYear] = query.split('-').map(Number)
      whereClause = `Condition_YearBuilt >= ${minYear} AND Condition_YearBuilt <= ${maxYear}`
      break
    default:
      whereClause = `Owner_Name LIKE '%${query.replace(/'/g, "''")}%'`
  }
  
  const params = new URLSearchParams({
    where: whereClause,
    outFields: 'PID,MapLot,Address,Owner_Name,AssessedValue,Condition_YearBuilt,PropertyClass',
    resultRecordCount: limit,
    resultOffset: 0,
    f: 'json',
  })
  
  try {
    const response = await fetch(`${url}?${params}`)
    const data = await response.json()
    return data.features?.map(f => f.attributes) || []
  } catch (error) {
    console.error('Error searching properties:', error)
    return []
  }
}

export async function getPropertyByPID(pid, fiscalYear = 'FY2024') {
  const url = `${ARCGIS_SERVICES.property[fiscalYear]}/query`
  const params = new URLSearchParams({
    where: `PID = ${pid}`,
    outFields: '*',
    f: 'json',
  })
  
  try {
    const response = await fetch(`${url}?${params}`)
    const data = await response.json()
    return data.features?.[0]?.attributes || null
  } catch (error) {
    console.error('Error getting property by PID:', error)
    return null
  }
}

export async function queryParcelsByMapLots(mapLots) {
  if (!mapLots || mapLots.length === 0) return []
  
  const url = `${ARCGIS_SERVICES.parcels}/query`
  const whereClause = `ML IN ('${mapLots.join("','")}')`
  
  const params = new URLSearchParams({
    where: whereClause,
    outFields: 'OBJECTID,ML,MAP,LOT,LOC_ID,POLY_TYPE',
    returnGeometry: 'true',
    outSR: '102100',
    f: 'json',
  })
  
  try {
    const response = await fetch(`${url}?${params}`)
    const data = await response.json()
    return data.features || []
  } catch (error) {
    console.error('Error querying parcels:', error)
    return []
  }
}