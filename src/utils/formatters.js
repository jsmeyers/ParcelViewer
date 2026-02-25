export function formatCurrency(value) {
  if (value == null || isNaN(value)) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value) {
  if (value == null || isNaN(value)) return 'N/A'
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatSquareFeet(value) {
  if (value == null || isNaN(value)) return 'N/A'
  return `${formatNumber(value)} sq ft`
}

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  try {
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
    return dateStr
  } catch {
    return dateStr
  }
}

export function formatPropertyClass(code) {
  const classes = {
    '101': 'Single Family',
    '102': 'Condominium',
    '103': 'Mobile Home',
    '104': 'Multi-Family (2-4 units)',
    '105': 'Multi-Family (5+ units)',
    '200': 'Commercial',
    '300': 'Industrial',
    '400': 'Agricultural',
    '500': 'Exempt',
  }
  return classes[String(code)] || code || 'N/A'
}

export function formatBedroomsBaths(bedrooms, fullBaths, halfBaths = 0) {
  const parts = []
  if (bedrooms != null) parts.push(`${bedrooms} bed`)
  if (fullBaths != null) {
    let baths = fullBaths
    if (halfBaths) baths += 0.5
    parts.push(`${baths} bath${baths !== 1 ? 's' : ''}`)
  }
  return parts.join(' | ') || 'N/A'
}

export function formatYearBuilt(year) {
  if (year == null || year === 0) return 'N/A'
  return year.toString()
}

export function formatMapLot(ml) {
  if (!ml) return 'N/A'
  return ml
}

export function truncateText(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}