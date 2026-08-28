import { Routes, Route, useLocation } from 'react-router-dom'
import { useFleet } from './context/FleetContext'
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
import Login from './pages/Login'

export default function App() {
  const { isAuthenticated } = useFleet()
  const location = useLocation()
  const isLoginPage = location.pathname.toLowerCase().includes('login')

  // Require authentication: Show Login page if user is not authenticated or explicitly visits /login
  if (!isAuthenticated || isLoginPage) {
    return (
      <div className="min-h-screen w-full bg-base text-hi">
        <Login />
        <Toast />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-base text-hi md:flex-row xl:h-screen xl:overflow-hidden">
      <Sidebar />

      <div className="min-w-0 flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
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
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>

      <VehicleDrawer />
      <Toast />
    </div>
  )
}
