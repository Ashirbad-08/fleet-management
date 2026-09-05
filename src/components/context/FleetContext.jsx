import { createContext, useContext, useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { vehicles as seedVehicles } from '../../data/vehicles'
import { alerts as seedAlerts } from '../../data/alerts'
import { admins as seedAdmins } from '../../data/admins'

const FleetContext = createContext(null)

// Convert existing alerts to notification format
const seedNotifications = seedAlerts.map((a, i) => ({
  id: `n-${a.id}`,
  type: a.sev,
  title: a.msg,
  vehicle: a.vehicle,
  time: a.time,
  read: i > 2, // first 3 are unread
}))

const seedGeofences = [
  { id: 'G-1', name: 'Pune Depot', type: 'Depot', vehicles: 3, alerts: 'Entry + exit', status: 'Active', lat: 18.5204, lon: 73.8567, radius: 1.5 },
  { id: 'G-2', name: 'Okhla Service Yard', type: 'Service', vehicles: 2, alerts: 'Exit only', status: 'Active', lat: 28.5355, lon: 77.2588, radius: 2.0 },
  { id: 'G-3', name: 'Bengaluru Ring Route', type: 'Route', vehicles: 1, alerts: 'Entry + exit', status: 'Paused', lat: 12.9716, lon: 77.5946, radius: 3.5 },
]

const DEFAULT_SETTINGS = {
  orgName: 'Acme Logistics Pvt. Ltd.',
  region: 'India - West & South',
  mapStyle: 'Dark Mode',
  speedUnit: 'km/h',
  distanceUnit: 'kilometers',
  tempUnit: 'Celsius',
  timezone: 'IST (GMT+5:30)',
  refreshInterval: '10s',
  overspeed: 80,
  lowBattery: 15,
  geofenceEntry: true,
  geofenceExit: true,
  channels: {
    email: true,
    sms: true,
    slack: false,
    push: true,
  },
  retention: '90 days',
}

export function FleetProvider({ children }) {
  // Load initial states from localStorage or use seeds
  const [vehicles, setVehicles] = useState(() => {
    const val = localStorage.getItem('fc_vehicles')
    return val ? JSON.parse(val) : seedVehicles
  })

  const [alerts, setAlerts] = useState(() => {
    const val = localStorage.getItem('fc_alerts')
    return val ? JSON.parse(val) : seedAlerts
  })
  const [notifications, setNotifications] = useState(() => {
    const val = localStorage.getItem('fc_notifications')
    return val ? JSON.parse(val) : seedNotifications
  })
  const [admins, setAdmins] = useState(() => {
    const val = localStorage.getItem('fc_admins')
    return val ? JSON.parse(val) : seedAdmins
  })
  const [geofences, setGeofences] = useState(() => {
    const val = localStorage.getItem('fc_geofences')
    return val ? JSON.parse(val) : seedGeofences
  })
  const [settings, setSettings] = useState(() => {
    const val = localStorage.getItem('fc_settings')
    return val ? JSON.parse(val) : DEFAULT_SETTINGS
  })

  // Local state for active firmware updates: { [vehicleId]: progressPercent }
  const [updatingVehicles, setUpdatingVehicles] = useState({})

  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState(null)

  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const showToast = useCallback((message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('fc_auth') === 'true'
  })

  const login = useCallback((email, password) => {
    setIsAuthenticated(true)
    localStorage.setItem('fc_auth', 'true')
    showToast('Authenticated successfully. Welcome to ElectriE!')
  }, [showToast])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    localStorage.setItem('fc_auth', 'false')
    showToast('Logged out of fleet monitor session')
  }, [showToast])

  // Persist states to localStorage
  useEffect(() => {
    localStorage.setItem('fc_vehicles', JSON.stringify(vehicles))
  }, [vehicles])

  useEffect(() => {
    localStorage.setItem('fc_alerts', JSON.stringify(alerts))
  }, [alerts])

  useEffect(() => {
    localStorage.setItem('fc_notifications', JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem('fc_admins', JSON.stringify(admins))
  }, [admins])

  useEffect(() => {
    localStorage.setItem('fc_geofences', JSON.stringify(geofences))
  }, [geofences])

  useEffect(() => {
    localStorage.setItem('fc_settings', JSON.stringify(settings))
  }, [settings])

  const filteredVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return vehicles.filter((v) => {
      const matchesFilter = statusFilter === 'all' || v.status === statusFilter
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        v.deviceId.toLowerCase().includes(q)
      return matchesFilter && matchesSearch
    })
  }, [vehicles, statusFilter, searchQuery])

  const stats = useMemo(() => {
    const total = vehicles.length
    const online = vehicles.filter((v) => v.status === 'online').length
    const idle = vehicles.filter((v) => v.status === 'idle').length
    const critical = vehicles.filter((v) => v.status === 'alert').length
    const unread = notifications.filter((n) => !n.read).length
    return { total, online, idle, critical, unread }
  }, [vehicles, notifications])

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) || null,
    [vehicles, selectedVehicleId],
  )

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  // ── Settings Updates ──────────────────────────────────────────────────────
  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  // ── Vehicle CRUD ──────────────────────────────────────────────────────────
  const addVehicle = useCallback((vehicleData) => {
    const newId = `V-${Math.floor(100 + Math.random() * 900)}`
    const newVehicle = {
      id: newId,
      deviceId: `IOT-${Math.floor(10000 + Math.random() * 90000)}`,
      firmware: '2.4.1',
      lastSeen: 'Just now',
      health: vehicleData.battery,
      totalRangeKm: vehicleData.totalRangeKm ?? vehicleData.rangeKm ?? 80,
      batteryTempC: 30,
      voltageV: 350,
      currentA: 0,
      odometerKm: 0,
      locked: false,
      signal: 4,
      speed: 0,
      lat: vehicleData.lat || 20.5937,
      lon: vehicleData.lon || 78.9629,
      ...vehicleData,
    }
    setVehicles((prev) => [newVehicle, ...prev])
    showToast(`${newVehicle.name} added to fleet`)
    return newVehicle
  }, [showToast])

  const updateVehicle = useCallback((id, updates) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    )
  }, [])

  const deleteVehicle = useCallback((id) => {
    const v = vehicles.find((v) => v.id === id)
    setVehicles((prev) => prev.filter((v) => v.id !== id))
    setSelectedVehicleId(null)
    showToast(`${v?.name || 'Vehicle'} removed from fleet`)
  }, [vehicles, showToast])

  // ── Admin CRUD ────────────────────────────────────────────────────────────
  const addAdmin = useCallback((adminData) => {
    const newAdmin = {
      id: `A-${Date.now()}`,
      initials: adminData.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      joinedAt: new Date().toISOString().split('T')[0],
      ...adminData,
    }
    setAdmins((prev) => [...prev, newAdmin])
    showToast(`${newAdmin.name} added as ${newAdmin.role}`)
  }, [showToast])

  const updateAdmin = useCallback((id, updates) => {
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    )
    showToast('Admin updated successfully')
  }, [showToast])

  const deleteAdmin = useCallback((id) => {
    const a = admins.find((a) => a.id === id)
    setAdmins((prev) => prev.filter((a) => a.id !== id))
    showToast(`${a?.name || 'Admin'} removed`)
  }, [admins, showToast])

  // ── Geofence CRUD ─────────────────────────────────────────────────────────
  const addGeofence = useCallback((fenceData) => {
    const newId = `G-${Math.floor(100 + Math.random() * 900)}`
    const newFence = {
      id: newId,
      vehicles: 0,
      alerts: 'Entry + exit',
      status: 'Active',
      radius: 2.0,
      ...fenceData,
    }
    setGeofences((prev) => [...prev, newFence])
    showToast(`${newFence.name} geofence created`)
  }, [showToast])

  const updateGeofence = useCallback((id, updates) => {
    setGeofences((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    )
    showToast('Geofence updated successfully')
  }, [showToast])

  const deleteGeofence = useCallback((id) => {
    const g = geofences.find((g) => g.id === id)
    setGeofences((prev) => prev.filter((g) => g.id !== id))
    showToast(`${g?.name || 'Geofence'} removed`)
  }, [geofences, showToast])

  // ── Notifications ─────────────────────────────────────────────────────────
  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Helper to add custom alerts/notifications dynamically
  const addLiveEvent = useCallback((sev, vehicleName, msg) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false })
    const newAlert = {
      id: Date.now(),
      sev,
      vehicle: vehicleName,
      msg,
      time,
    }
    setAlerts((prev) => [newAlert, ...prev].slice(0, 50)) // cap at 50

    const newNotification = {
      id: `n-${Date.now()}`,
      type: sev === 'critical' ? 'critical' : sev === 'warning' ? 'warning' : 'info',
      title: msg,
      vehicle: vehicleName,
      time,
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }, [])

  // ── Device Commands ───────────────────────────────────────────────────────
  const sendDeviceCommand = useCallback(
    (vehicle, action) => {
      const messages = {
        firmware: `Firmware update queued for ${vehicle.deviceId}`,
        restart: `Restart command sent to ${vehicle.deviceId}`,
        lock: `Lock command sent to ${vehicle.name}`,
        unlock: `Unlock command sent to ${vehicle.name}`,
        deactivate: `${vehicle.name} flagged for maintenance`,
      }

      if (action === 'lock' || action === 'unlock') {
        updateVehicle(vehicle.id, { locked: action === 'lock' })
      } else if (action === 'deactivate') {
        updateVehicle(vehicle.id, { status: 'alert' })
        addLiveEvent('critical', vehicle.name, 'Flagged for maintenance by operator')
      } else if (action === 'restart') {
        updateVehicle(vehicle.id, { status: 'offline', lastSeen: 'Just now' })
        setTimeout(() => {
          updateVehicle(vehicle.id, { status: 'online' })
          addLiveEvent('info', vehicle.name, 'Device restarted and connected')
        }, 3000)
      } else if (action === 'firmware') {
        // Trigger simulated progression
        setUpdatingVehicles((prev) => ({ ...prev, [vehicle.id]: 0 }))
      }

      showToast(messages[action] ?? 'Command sent')
    },
    [showToast, updateVehicle, addLiveEvent],
  )

  // ── Firmware Progress Simulation Loop ─────────────────────────────────────
  useEffect(() => {
    const activeIds = Object.keys(updatingVehicles)
    if (activeIds.length === 0) return

    const timer = setInterval(() => {
      setUpdatingVehicles((prev) => {
        const next = { ...prev }
        activeIds.forEach((id) => {
          const current = next[id]
          if (current >= 100) {
            delete next[id]
            // Complete update
            const v = vehicles.find((veh) => veh.id === id)
            if (v) {
              updateVehicle(id, { firmware: '2.4.1' })
              addLiveEvent('info', v.name, `Firmware successfully updated to v2.4.1`)
              showToast(`${v.name} firmware updated to v2.4.1`)
            }
          } else {
            next[id] = current + 20
          }
        })
        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [updatingVehicles, vehicles, updateVehicle, addLiveEvent, showToast])

  // ── Telemetry & Geofence Simulator Loop ───────────────────────────────────
  const prevPositions = useRef({}) // tracks { `${vehicleId}-${geofenceId}`: isInside }

  useEffect(() => {
    // Determine interval time based on settings.refreshInterval
    let intervalMs = 6000
    if (settings.refreshInterval === 'Real-time') intervalMs = 3000
    else if (settings.refreshInterval === '10s') intervalMs = 10000
    else if (settings.refreshInterval === '30s') intervalMs = 30000
    else if (settings.refreshInterval === '1m') intervalMs = 60000
    else if (settings.refreshInterval === 'Manual') return // no loop

    const timer = setInterval(() => {
      setVehicles((prevVehicles) => {
        return prevVehicles.map((v) => {
          if (v.status !== 'online') return v

          // 1. Move position slightly
          const dLat = (Math.random() - 0.5) * 0.002
          const dLon = (Math.random() - 0.5) * 0.002
          const nextLat = v.lat + dLat
          const nextLon = v.lon + dLon

          // 2. Adjust speed slightly
          let nextSpeed = v.speed + Math.round((Math.random() - 0.5) * 10)
          if (nextSpeed < 10) nextSpeed = 15
          if (nextSpeed > 100) nextSpeed = 95

          // 3. Decrement battery
          let nextBattery = v.battery - (Math.random() > 0.6 ? 1 : 0)
          if (nextBattery <= 0) nextBattery = 0
          const nextStatus = nextBattery === 0 ? 'offline' : v.status

          // 4. Increment odometer
          const hoursElapsed = intervalMs / 3600000
          const addedKm = nextSpeed * hoursElapsed
          const nextOdometer = parseFloat((v.odometerKm + addedKm).toFixed(2))

          // 5. Update battery temp
          let nextTemp = v.batteryTempC + (Math.random() > 0.5 ? 1 : -1)
          if (nextTemp < 20) nextTemp = 20
          if (nextTemp > 50) nextTemp = 50

          // Create updated vehicle object
          const updated = {
            ...v,
            lat: nextLat,
            lon: nextLon,
            speed: nextSpeed,
            battery: nextBattery,
            status: nextStatus,
            odometerKm: nextOdometer,
            batteryTempC: nextTemp,
            lastSeen: 'Just now',
          }

          // Trigger overspeed alerts
          if (nextSpeed > settings.overspeed && v.speed <= settings.overspeed) {
            addLiveEvent('warning', v.name, `Overspeed alert: running at ${nextSpeed} km/h (limit: ${settings.overspeed} km/h)`)
          }

          // Trigger low battery alerts
          if (nextBattery < settings.lowBattery && v.battery >= settings.lowBattery) {
            addLiveEvent('critical', v.name, `Critical battery warning: ${nextBattery}% charge remaining`)
          }

          // Geofence Intersection Check
          geofences.forEach((g) => {
            if (g.status !== 'Active') return
            // Calculate distance in km (approx 111.12 km per degree lat)
            const distKm = Math.sqrt(Math.pow(nextLat - g.lat, 2) + Math.pow(nextLon - g.lon, 2)) * 111.12
            const isInside = distKm <= g.radius
            const cacheKey = `${v.id}-${g.id}`
            const wasInside = prevPositions.current[cacheKey] ?? false

            if (isInside && !wasInside) {
              prevPositions.current[cacheKey] = true
              if (settings.geofenceEntry) {
                addLiveEvent('info', v.name, `Geofence entered: ${g.name}`)
              }
            } else if (!isInside && wasInside) {
              prevPositions.current[cacheKey] = false
              if (settings.geofenceExit) {
                addLiveEvent('info', v.name, `Geofence exited: ${g.name}`)
              }
            }
          })

          return updated
        })
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [settings, geofences, addLiveEvent])

  const value = {
    vehicles,
    alerts,
    notifications,
    admins,
    geofences,
    settings,
    updatingVehicles,
    filteredVehicles,
    stats,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    selectedVehicleId,
    setSelectedVehicleId,
    selectedVehicle,
    toast,
    showToast,
    unreadCount,
    // Vehicle CRUD
    addVehicle,
    updateVehicle,
    deleteVehicle,
    // Admin CRUD
    addAdmin,
    updateAdmin,
    deleteAdmin,
    // Geofence CRUD
    addGeofence,
    updateGeofence,
    deleteGeofence,
    // Notifications
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    // Auth
    isAuthenticated,
    login,
    logout,
    // Commands
    sendDeviceCommand,
    updateSettings,
  }

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>
}

export function useFleet() {
  const ctx = useContext(FleetContext)
  if (!ctx) throw new Error('useFleet must be used within a FleetProvider')
  return ctx
}
