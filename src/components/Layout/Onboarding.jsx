import { useState } from 'react'
import useStore from '../../store/useStore'

const STEPS = [
  {
    title: 'Welcome to Cambridge Parcels',
    description: 'Explore property data for Cambridge, MA. Search for parcels by owner name, address, parcel ID, or year built.',
    icon: (
      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    title: 'Search Properties',
    description: 'Use the search bar to find properties by owner name, street address, parcel ID (Map-Lot), or year built range.',
    icon: (
      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: 'View Details',
    description: 'Click on any parcel to see property details including owner info, assessed value, year built, and more.',
    icon: (
      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'Save & Export',
    description: 'Star properties to save them as favorites, or select multiple parcels to export their data.',
    icon: (
      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
]

export default function Onboarding() {
  const { ui: { onboardingShown }, setOnboardingShown } = useStore()
  const [step, setStep] = useState(0)

  if (onboardingShown) return null

  const handleDismiss = () => {
    setOnboardingShown(true)
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleDismiss()
    }
  }

  const handleSkip = () => {
    handleDismiss()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            {STEPS[step].icon}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{STEPS[step].title}</h2>
          <p className="text-gray-600">{STEPS[step].description}</p>
        </div>

        <div className="flex justify-center gap-1.5 py-3 bg-gray-50">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === step ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
          >
            {step === STEPS.length - 1 ? 'Get started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}