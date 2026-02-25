import { createPortal } from 'react-dom'
import MapViewComponent from './components/Map/MapView'
import Sidebar from './components/Sidebar/Sidebar'
import PropertyPanel from './components/Property/PropertyPanel'
import Toast from './components/Layout/Toast'
import Onboarding from './components/Layout/Onboarding'
import { useUrlState } from './hooks/useUrlState'

function App() {
  useUrlState()

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-full relative">
        <MapViewComponent />
      </main>
      {createPortal(<PropertyPanel />, document.body)}
      <Toast />
      <Onboarding />
    </div>
  )
}

export default App