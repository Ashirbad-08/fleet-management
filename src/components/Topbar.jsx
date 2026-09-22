import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import {
  Search,
  Bell,
  Settings as SettingsIcon,
  X,
  Truck,
  LayoutGrid,
  Cpu,
  Leaf,
  TriangleAlert,
  MapPin,
  UploadCloud,
  Users,
  Plus,
  Download,
  Power,
  ChevronRight,
} from './icons'
import { useFleet } from '../context/FleetContext'
import NotificationDropdown from './NotificationDropdown'
import { useNavigate } from 'react-router-dom'
import { STATUS_META, SEV_META } from '../data/statusMeta'

const PAGES = [
  { id: 'page-dash', title: 'Fleet Overview & Dashboard', path: '/', icon: LayoutGrid, hint: 'Live telemetry & map' },
  { id: 'page-vehicles', title: 'Vehicles & Fleet Roster', path: '/vehicles', icon: Truck, hint: 'Manage connected fleet' },
  { id: 'page-devices', title: 'IoT Devices & Hardware', path: '/devices', icon: Cpu, hint: 'IMEI & sensor telemetry' },
  { id: 'page-esg', title: 'ESG Savings & Carbon Analytics', path: '/esg', icon: Leaf, hint: 'CO₂ reduction & fuel saved' },
  { id: 'page-alerts', title: 'Alerts & Incident Log', path: '/alerts', icon: TriangleAlert, hint: 'Active & historical alerts' },
  { id: 'page-geofences', title: 'Geofence Zones & Boundaries', path: '/geofences', icon: MapPin, hint: 'Zone rules & radius alerts' },
  { id: 'page-firmware', title: 'Firmware & OTA Updates', path: '/firmware', icon: UploadCloud, hint: 'Roll out firmware versions' },
  { id: 'page-admins', title: 'Admins & Team Management', path: '/admins', icon: Users, hint: 'Roles & security access' },
  { id: 'page-notifs', title: 'Notifications Center', path: '/notifications', icon: Bell, hint: 'System notifications' },
  { id: 'page-settings', title: 'System Settings', path: '/settings', icon: SettingsIcon, hint: 'Preferences & thresholds' },
]

export default function Topbar({ title, subtitle }) {
  const {
    vehicles,
    geofences,
    alerts,
    searchQuery,
    setSearchQuery,
    setSelectedVehicleId,
    setStatusFilter,
    showToast,
    logout,
    setIsAddVehicleOpen,
    unreadCount,
    admins,
    formatTime,
  } = useFleet()

  const [clock, setClock] = useState('')
  const [notifOpenMobile, setNotifOpenMobile] = useState(false)
  const [notifOpenDesktop, setNotifOpenDesktop] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const navigate = useNavigate()
  const searchContainerRef = useRef(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)
  const currentAdmin = admins[0]

  // Live Clock
  useEffect(() => {
    const tick = () => {
      setClock(formatTime ? formatTime(new Date()) : new Date().toLocaleTimeString('en-GB'))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [formatTime])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Global keyboard shortcut (Cmd+K / Ctrl+K or '/') to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setDropdownOpen(true)
        inputRef.current?.focus()
        return
      }
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) &&
        !dropdownOpen
      ) {
        e.preventDefault()
        setDropdownOpen(true)
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dropdownOpen])

  // Export CSV Action
  const handleExportCSV = useCallback(() => {
    const headers = ['ID', 'Name', 'Plate', 'Type', 'Model', 'Driver', 'Status', 'Battery', 'Speed', 'Location']
    const rows = vehicles.map((v) => [
      v.id,
      v.name,
      v.plate,
      v.type || '4 Wheeler',
      v.model,
      v.driver,
      v.status,
      v.battery,
      v.speed,
      v.location,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `fleet_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    if (showToast) showToast('Fleet CSV export initiated')
  }, [vehicles, showToast])

  // Quick Actions
  const QUICK_ACTIONS = useMemo(
    () => [
      {
        id: 'action-add-vehicle',
        title: 'Add new vehicle to fleet',
        icon: Plus,
        hint: 'Open vehicle registration form',
        onSelect: () => {
          if (setIsAddVehicleOpen) setIsAddVehicleOpen(true)
          navigate('/vehicles')
        },
      },
      {
        id: 'action-export-csv',
        title: 'Export fleet roster (CSV)',
        icon: Download,
        hint: 'Download full fleet data as CSV',
        onSelect: handleExportCSV,
      },
      {
        id: 'action-filter-online',
        title: 'Show online vehicles only',
        icon: Truck,
        hint: 'Filter roster by online status',
        onSelect: () => {
          setStatusFilter('online')
          navigate('/vehicles')
        },
      },
      {
        id: 'action-filter-alerts',
        title: 'Show vehicles needing attention (Alerts)',
        icon: TriangleAlert,
        hint: 'Filter roster by critical alert status',
        onSelect: () => {
          setStatusFilter('alert')
          navigate('/vehicles')
        },
      },
      {
        id: 'action-signout',
        title: 'Sign out of admin console',
        icon: Power,
        hint: 'End current session',
        onSelect: () => {
          logout()
        },
      },
    ],
    [navigate, setStatusFilter, logout, setIsAddVehicleOpen, handleExportCSV],
  )

  // Filter Search Results
  const results = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase()

    if (!q) {
      return {
        pages: PAGES.slice(0, 3),
        actions: QUICK_ACTIONS.slice(0, 2),
        vehicles: vehicles.slice(0, 4),
        geofences: [],
        alerts: [],
      }
    }

    const matchedPages = PAGES.filter(
      (p) => p.title.toLowerCase().includes(q) || p.path.toLowerCase().includes(q) || p.hint.toLowerCase().includes(q),
    )

    const matchedActions = QUICK_ACTIONS.filter(
      (a) => a.title.toLowerCase().includes(q) || a.hint.toLowerCase().includes(q),
    )

    const matchedVehicles = vehicles.filter((v) => {
      return (
        v.name.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        (v.driver && v.driver.toLowerCase().includes(q)) ||
        v.deviceId.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.status.toLowerCase().includes(q)
      )
    })

    const matchedGeofences = geofences.filter((g) => {
      return (
        g.name.toLowerCase().includes(q) ||
        g.type.toLowerCase().includes(q) ||
        g.status.toLowerCase().includes(q)
      )
    })

    const matchedAlerts = alerts.filter((a) => {
      return a.msg.toLowerCase().includes(q) || a.vehicle.toLowerCase().includes(q) || a.sev.toLowerCase().includes(q)
    })

    return {
      pages: matchedPages,
      actions: matchedActions,
      vehicles: matchedVehicles.slice(0, 6),
      geofences: matchedGeofences.slice(0, 3),
      alerts: matchedAlerts.slice(0, 3),
    }
  }, [searchQuery, vehicles, geofences, alerts, QUICK_ACTIONS])

  // Flatten suggestions for keyboard navigation
  const flatItems = useMemo(() => {
    const items = []

    // 1. Vehicles
    results.vehicles.forEach((v) => {
      items.push({
        type: 'vehicle',
        id: `veh-${v.id}`,
        title: v.name,
        onSelect: () => {
          setSelectedVehicleId(v.id)
          setDropdownOpen(false)
        },
      })
    })

    // 2. Pages
    results.pages.forEach((p) => {
      items.push({
        type: 'page',
        id: p.id,
        title: p.title,
        onSelect: () => {
          navigate(p.path)
          setDropdownOpen(false)
        },
      })
    })

    // 3. Geofences
    results.geofences.forEach((g) => {
      items.push({
        type: 'geofence',
        id: `geo-${g.id}`,
        title: g.name,
        onSelect: () => {
          navigate('/geofences')
          setDropdownOpen(false)
        },
      })
    })

    // 4. Alerts
    results.alerts.forEach((a) => {
      items.push({
        type: 'alert',
        id: `alert-${a.id}`,
        title: a.msg,
        onSelect: () => {
          navigate('/alerts')
          setDropdownOpen(false)
        },
      })
    })

    // 5. Actions
    results.actions.forEach((a) => {
      items.push({
        type: 'action',
        id: a.id,
        title: a.title,
        onSelect: () => {
          a.onSelect()
          setDropdownOpen(false)
        },
      })
    })

    return items
  }, [results, setSelectedVehicleId, navigate])

  // Keyboard navigation within suggestions
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!dropdownOpen) return

      if (e.key === 'Escape') {
        setDropdownOpen(false)
        inputRef.current?.blur()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (flatItems.length > 0 ? (prev + 1) % flatItems.length : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (flatItems.length > 0 ? (prev - 1 + flatItems.length) % flatItems.length : 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (flatItems[activeIndex]) {
          flatItems[activeIndex].onSelect()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dropdownOpen, activeIndex, flatItems])

  // Auto-scroll active item into view
  useEffect(() => {
    if (dropdownRef.current && flatItems.length > 0) {
      const activeEl = dropdownRef.current.querySelector(`[data-index="${activeIndex}"]`)
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex, flatItems])

  const hasResults = flatItems.length > 0

  return (
    <header className="relative z-40 flex flex-col gap-2.5 border-b border-line px-4 py-2.5 sm:px-6 lg:flex-row lg:items-center lg:gap-4 lg:py-1">
        
        {/* Title & Subtitle + Mobile/Tablet Action Controls Header */}
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <div className="min-w-0">
            <div className="truncate font-display text-[15px] font-bold sm:text-[17px]">{title}</div>
            {subtitle && <div className="mt-0.5 text-[11px] text-dim sm:text-[11.5px]">{subtitle}</div>}
          </div>

          {/* Mobile/Tablet Action Icons */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="relative">
              <button
                onClick={() => setNotifOpenMobile((o) => !o)}
                aria-label="Toggle notifications menu"
                aria-expanded={notifOpenMobile}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
              >
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-0.5 font-mono text-[9px] font-bold text-white tabular-nums">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                <Bell className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <NotificationDropdown open={notifOpenMobile} onClose={() => setNotifOpenMobile(false)} />
            </div>

            <button
              onClick={() => navigate('/settings')}
              aria-label="Open settings"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
            >
              <SettingsIcon className="h-3.5 w-3.5" strokeWidth={2} />
            </button>

            <button
              onClick={() => navigate('/profile')}
              aria-label="View user profile"
              title="View profile"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-panel-2 font-display text-[11px] font-bold text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
            >
              {currentAdmin?.initials ?? 'RA'}
            </button>
          </div>
        </div>

        {/* Global Search Input & Attached Suggestions Dropdown */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-full lg:max-w-md lg:ml-2">
          <div className="flex w-full items-center gap-2 rounded-lg border border-line bg-panel px-2.5 py-1.5 focus-within:border-accent/60 focus-within:bg-panel-2 transition-all shadow-xs">
            <Search className="h-3.5 w-3.5 shrink-0 text-dim" strokeWidth={2} />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setDropdownOpen(true)
              }}
              onFocus={() => setDropdownOpen(true)}
              type="text"
              aria-label="Global search across vehicles, plates, IMEIs, pages, alerts"
              placeholder="Search vehicle, plate, IMEI, page…"
              className="w-full bg-transparent text-[12.5px] text-hi outline-none focus:outline-none focus:ring-0 placeholder:text-dim"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  inputRef.current?.focus()
                }}
                type="button"
                aria-label="Clear search"
                className="flex h-4 w-4 items-center justify-center rounded text-dim hover:text-hi transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-line-soft bg-panel-2 px-1.5 py-0.5 font-mono text-[9px] text-dim">
              <span className="text-[9.5px]">⌘</span>K
            </kbd>
          </div>

          {/* Suggestions Dropdown */}
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-0 top-full mt-2 w-full sm:w-[500px] md:w-[560px] max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-panel/95 shadow-2xl shadow-black/80 backdrop-blur-xl z-50 p-2 space-y-2.5"
            >
              {!hasResults && searchQuery && (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <Search className="h-7 w-7 text-dim/60 mb-2" strokeWidth={1.5} />
                  <div className="font-display text-[13px] font-semibold text-hi">No matching results</div>
                  <p className="mt-0.5 text-[11.5px] text-dim">
                    No vehicles, pages, or alerts found for &quot;<span className="text-hi">{searchQuery}</span>&quot;.
                  </p>
                </div>
              )}

              {/* 1. Vehicles Section */}
              {results.vehicles.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-dim flex items-center justify-between">
                    <span>Vehicles ({results.vehicles.length})</span>
                    <span className="font-mono text-[9px] text-dim">Fleet Roster</span>
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {results.vehicles.map((v) => {
                      const itemIndex = flatItems.findIndex((i) => i.id === `veh-${v.id}`)
                      const isSelected = itemIndex === activeIndex
                      const meta = STATUS_META[v.status] || STATUS_META.offline

                      return (
                        <div
                          key={v.id}
                          data-index={itemIndex}
                          onClick={() => {
                            setSelectedVehicleId(v.id)
                            setDropdownOpen(false)
                          }}
                          onMouseEnter={() => setActiveIndex(itemIndex)}
                          className={`group flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-accent/15 border border-accent/30 text-hi'
                              : 'border border-transparent hover:bg-hover text-lo'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                                isSelected ? 'bg-accent/20 text-accent' : 'bg-panel-2 border border-line text-lo'
                              }`}
                            >
                              <Truck className="h-3.5 w-3.5" strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-display text-[12.5px] font-bold text-hi truncate">{v.name}</span>
                                <span className="font-mono text-[10.5px] text-dim tabular-nums">{v.plate}</span>
                              </div>
                              <div className="text-[10.5px] text-dim truncate">
                                {v.model} • {v.driver || 'No Driver'} • {v.location}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Battery indicator */}
                            <div className="hidden sm:flex items-center gap-1 font-mono text-[10.5px] text-lo">
                              <div className="h-1.5 w-7 overflow-hidden rounded-full border border-line bg-panel-2">
                                <div
                                  className={`h-full rounded-full ${
                                    v.battery > 50 ? 'bg-green' : v.battery > 20 ? 'bg-amber' : 'bg-red'
                                  }`}
                                  style={{ width: `${v.battery}%` }}
                                />
                              </div>
                              <span>{v.battery}%</span>
                            </div>

                            {/* Status Pill */}
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${meta.pill}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                              {meta.label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 2. Navigation Pages */}
              {results.pages.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-dim flex items-center justify-between">
                    <span>Navigation & Pages</span>
                    <span className="font-mono text-[9px] text-dim">Direct Jump</span>
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {results.pages.map((p) => {
                      const itemIndex = flatItems.findIndex((i) => i.id === p.id)
                      const isSelected = itemIndex === activeIndex
                      const Icon = p.icon

                      return (
                        <div
                          key={p.id}
                          data-index={itemIndex}
                          onClick={() => {
                            navigate(p.path)
                            setDropdownOpen(false)
                          }}
                          onMouseEnter={() => setActiveIndex(itemIndex)}
                          className={`group flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-accent/15 border border-accent/30 text-hi'
                              : 'border border-transparent hover:bg-hover text-lo'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                                isSelected ? 'bg-accent/20 text-accent' : 'bg-panel-2 border border-line text-lo'
                              }`}
                            >
                              <Icon className="h-3 w-3" strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-display text-[12px] font-semibold text-hi truncate">{p.title}</div>
                              <div className="text-[10px] text-dim truncate">{p.hint}</div>
                            </div>
                          </div>

                          <span className="rounded bg-panel-2 border border-line px-1.5 py-0.25 font-mono text-[9.5px] text-dim">
                            {p.path}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 3. Geofences */}
              {results.geofences.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-dim">
                    Geofences ({results.geofences.length})
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {results.geofences.map((g) => {
                      const itemIndex = flatItems.findIndex((i) => i.id === `geo-${g.id}`)
                      const isSelected = itemIndex === activeIndex

                      return (
                        <div
                          key={g.id}
                          data-index={itemIndex}
                          onClick={() => {
                            navigate('/geofences')
                            setDropdownOpen(false)
                          }}
                          onMouseEnter={() => setActiveIndex(itemIndex)}
                          className={`group flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-accent/15 border border-accent/30 text-hi'
                              : 'border border-transparent hover:bg-hover text-lo'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                                isSelected ? 'bg-accent/20 text-accent' : 'bg-panel-2 border border-line text-accent'
                              }`}
                            >
                              <MapPin className="h-3 w-3" strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-display text-[12px] font-semibold text-hi truncate">{g.name}</div>
                              <div className="text-[10px] text-dim truncate">
                                {g.type} zone • {g.radius} km radius
                              </div>
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-1.5 py-0.25 text-[9px] font-semibold ${
                              g.status === 'Active' ? 'bg-green/15 text-green' : 'bg-amber/15 text-amber'
                            }`}
                          >
                            {g.status}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 4. Live Alerts */}
              {results.alerts.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-dim">
                    Live Alerts ({results.alerts.length})
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {results.alerts.map((a) => {
                      const itemIndex = flatItems.findIndex((i) => i.id === `alert-${a.id}`)
                      const isSelected = itemIndex === activeIndex
                      const sev = SEV_META[a.sev]

                      return (
                        <div
                          key={a.id}
                          data-index={itemIndex}
                          onClick={() => {
                            navigate('/alerts')
                            setDropdownOpen(false)
                          }}
                          onMouseEnter={() => setActiveIndex(itemIndex)}
                          className={`group flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-accent/15 border border-accent/30 text-hi'
                              : 'border border-transparent hover:bg-hover text-lo'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                                sev?.classes || 'bg-accent/15 text-accent'
                              }`}
                            >
                              <TriangleAlert className="h-3 w-3" strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11.5px] font-medium text-hi truncate">{a.msg}</div>
                              <div className="text-[10px] text-dim truncate">
                                {a.vehicle} • {a.time}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`rounded px-1.5 py-0.25 font-mono text-[8.5px] font-bold uppercase ${
                              sev?.classes || 'bg-panel-2 text-dim'
                            }`}
                          >
                            {a.sev}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 5. Quick Actions */}
              {results.actions.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-dim flex items-center justify-between">
                    <span>Quick Actions</span>
                    <span className="font-mono text-[9px] text-dim">Commands</span>
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {results.actions.map((a) => {
                      const itemIndex = flatItems.findIndex((i) => i.id === a.id)
                      const isSelected = itemIndex === activeIndex
                      const Icon = a.icon

                      return (
                        <div
                          key={a.id}
                          data-index={itemIndex}
                          onClick={() => {
                            a.onSelect()
                            setDropdownOpen(false)
                          }}
                          onMouseEnter={() => setActiveIndex(itemIndex)}
                          className={`group flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-accent/15 border border-accent/30 text-hi'
                              : 'border border-transparent hover:bg-hover text-lo'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                                isSelected ? 'bg-accent/20 text-accent' : 'bg-panel-2 border border-line text-accent'
                              }`}
                            >
                              <Icon className="h-3 w-3" strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-display text-[12px] font-semibold text-hi truncate">{a.title}</div>
                              <div className="text-[10px] text-dim truncate">{a.hint}</div>
                            </div>
                          </div>

                          <ChevronRight
                            className={`h-3.5 w-3.5 text-dim transition-transform ${
                              isSelected ? 'translate-x-0.5 text-accent' : 'opacity-40'
                            }`}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Dropdown Footer Shortcuts */}
              <div className="flex items-center justify-between border-t border-line-soft pt-2 px-2 text-[10px] text-dim">
                <div className="flex items-center gap-3">
                  <span>
                    <kbd className="rounded bg-panel-2 px-1 py-0.25 border border-line-soft">↑↓</kbd> navigate
                  </span>
                  <span>
                    <kbd className="rounded bg-panel-2 px-1 py-0.25 border border-line-soft">↵</kbd> select
                  </span>
                  <span>
                    <kbd className="rounded bg-panel-2 px-1 py-0.25 border border-line-soft">esc</kbd> close
                  </span>
                </div>
                <span className="text-[9.5px] font-mono text-dim">Global Search</span>
              </div>
            </div>
          )}
        </div>

        {/* Laptop View Controls (Clock + Bell + Settings + Profile) */}
        <div className="hidden items-center gap-3 lg:flex lg:ml-auto lg:w-auto lg:justify-start">
          <div className="font-mono text-[11.5px] tracking-wide text-lo tabular-nums">{clock}</div>

          {/* Bell with dropdown for Laptop View */}
          <div className="relative">
            <button
              onClick={() => setNotifOpenDesktop((o) => !o)}
              aria-label="Toggle notifications menu"
              aria-expanded={notifOpenDesktop}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
            >
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-0.5 font-mono text-[9px] font-bold text-white tabular-nums">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <Bell className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <NotificationDropdown open={notifOpenDesktop} onClose={() => setNotifOpenDesktop(false)} />
          </div>

          <button
            onClick={() => navigate('/settings')}
            aria-label="Open settings"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
          >
            <SettingsIcon className="h-3.5 w-3.5" strokeWidth={2} />
          </button>

          <button
            onClick={() => navigate('/profile')}
            aria-label="View user profile"
            title="View profile"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-panel-2 font-display text-[11px] font-bold text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
          >
            {currentAdmin?.initials ?? 'RA'}
          </button>
        </div>
      </header>
  )
}
