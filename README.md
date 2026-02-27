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

![Cambridge Parcel Viewer Screenshot](parcelviewer.jpg)

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

