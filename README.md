# Cambridge Parcel Viewer

A GIS parcel viewing web application for exploring property data in Cambridge, MA using ArcGIS services.

## Features

- **Interactive Map**: View parcel boundaries, zoning districts, and flood zones
- **Property Search**: Search by owner name, address, parcel ID (Map-Lot), or year built
- **Property Details**: View assessed values, ownership info, building characteristics, and sales history
- **Multi-Year Data**: Switch between FY2022, FY2023, and FY2024 assessment data
- **Selection & Favorites**: Select up to 20 parcels and save favorites to localStorage
- **Export**: Download selected/favorited properties as CSV or JSON
- **Shareable URLs**: Share searches and selections via URL parameters
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** + **Vite** for fast development
- **ArcGIS JS API 4.x** for mapping
- **Tailwind CSS** for styling
- **Zustand** for state management

## Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Data Sources

All data comes from the City of Cambridge's public ArcGIS services:

- **Parcels**: FY2025 parcel boundaries
- **Property Database**: FY2022-FY2024 assessment data
- **Flood Zones**: FEMA 100-year floodplain
- **Zoning**: 1924 historic zoning districts

## Project Structure

```
src/
├── components/
│   ├── Map/           # MapView and map layers
│   ├── Search/        # Search bar and autocomplete
│   ├── Sidebar/       # Navigation and controls
│   ├── Property/      # Property detail panel
│   ├── Export/        # Export modal
│   └── Layout/        # Toast, Onboarding
├── hooks/             # Custom React hooks
├── services/          # ArcGIS API services
├── store/             # Zustand state management
├── utils/             # Formatting utilities
└── App.jsx            # Main application
```

## License

MIT