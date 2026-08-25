import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import VehicleDrawer from './components/VehicleDrawer'
import Toast from './components/Toast'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Devices from './pages/Devices'
import AlertsPage from './pages/AlertsPage'
import Geofences from './pages/Geofences'
import Firmware from './pages/Firmware'
import Settings from './pages/Settings'
import Admins from './pages/Admins'
import NotificationsPage from './pages/NotificationsPage'
import Profile from './pages/Profile'
import EsgPage from './pages/EsgPage'

export default function App() {
  return (
    <div className="flex h-dvh overflow-hidden bg-base text-hi md:h-screen">
      <Sidebar />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/esg" element={<EsgPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/geofences" element={<Geofences />} />
        <Route path="/firmware" element={<Firmware />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admins" element={<Admins />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

      <VehicleDrawer />
      <Toast />
    </div>
  )
}
