import { useState, useRef, useEffect } from 'react'
import Topbar from '../components/Topbar'
import MapLeaflet from '../components/MapLeaflet'
import { Edit2, MapPin, Plus, RotateCw, Filter, ChevronDown, Check, Maximize2, Minimize2, TriangleAlert, Trash2, X } from '../components/icons'
import { useFleet } from '../context/FleetContext'
import { useSearchParams } from 'react-router-dom'

const FILTER_OPTIONS = [
  { key: 'all',     label: 'All Vehicles', color: null },
  { key: 'online',  label: 'Online',       color: 'bg-green' },
  { key: 'idle',    label: 'Idle',         color: 'bg-amber' },
  { key: 'alert',   label: 'Alert',        color: 'bg-red' },
  { key: 'offline', label: 'Offline',      color: 'bg-gray' },
]

export default function Geofences() {
  const {
    vehicles,
    filteredVehicles,
    geofences,
    addGeofence,
    updateGeofence,
    deleteGeofence,
    statusFilter,
    setStatusFilter,
    showToast,
    refreshTelemetry,
  } = useFleet()

  const [searchParams] = useSearchParams()
  const mapVehicleId = searchParams.get('vehicle')
  const mapVehicle = mapVehicleId ? vehicles.find((v) => v.id === mapVehicleId) : null
  const visibleVehicles = mapVehicle ? [mapVehicle] : filteredVehicles

  const [selectedFenceId, setSelectedFenceId] = useState(null)
  const [customCenter, setCustomCenter] = useState(null)
  const [customZoom, setCustomZoom] = useState(null)
  // Track which zone's 3-dot menu is open
  const [openMenuId, setOpenMenuId] = useState(null)
  const menuRef = useRef(null)

  // Delete Confirmation Warning State
  const [deletingZone, setDeletingZone] = useState(null)

  const selectedFence = geofences.find((g) => g.id === selectedFenceId) || null

  const mapCenter = customCenter || (mapVehicle?.lat && mapVehicle?.lon ? [mapVehicle.lat, mapVehicle.lon] : undefined)
  const mapZoom = customZoom || (mapVehicle ? 12 : 4.5)

  // ── Map toolbar state ────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [fullScreenMap, setFullScreenMap] = useState(false)
  const filterRef = useRef(null)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 240)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = (e) => {
    e.stopPropagation()
    setIsRefreshing(true)
    if (refreshTelemetry) refreshTelemetry()
    if (showToast) showToast('Geofence map refreshed')
    setTimeout(() => setIsRefreshing(false), 600)
  }

  // Close filter dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Escape exits full screen or closes dialogs
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setFullScreenMap(false)
        setDeletingZone(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const currentFilterObj = FILTER_OPTIONS.find((o) => o.key === statusFilter) || FILTER_OPTIONS[0]
  // ────────────────────────────────────────────────────────────────────────

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' or 'edit'
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('Depot')
  const [formLat, setFormLat] = useState(20.5937)
  const [formLon, setFormLon] = useState(78.9629)
  const [formRadius, setFormRadius] = useState(2.0)
  const [formStatus, setFormStatus] = useState('Active')
  const [formAlerts, setFormAlerts] = useState('Entry + exit')

  const getVehiclesInGeofence = (zone) => {
    if (zone.status !== 'Active') return { total: 0, online: 0, offline: 0, idle: 0 }
    const inside = vehicles.filter((v) => {
      if (!v.lat || !v.lon) return false
      const distKm = Math.sqrt(Math.pow(v.lat - zone.lat, 2) + Math.pow(v.lon - zone.lon, 2)) * 111.12
      return distKm <= zone.radius
    })
    return {
      total: inside.length,
      online: inside.filter((v) => v.status === 'online').length,
      offline: inside.filter((v) => v.status === 'offline').length,
      idle: inside.filter((v) => v.status === 'idle').length,
    }
  }

  // Close 3-dot menu on outside click
  useEffect(() => {
    if (!openMenuId) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openMenuId])

  const handleOpenAdd = () => {
    setModalMode('add')
    setFormName('')
    setFormType('Depot')
    setFormLat(20.5937)
    setFormLon(78.9629)
    setFormRadius(2.0)
    setFormStatus('Active')
    setFormAlerts('Entry + exit')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (zone) => {
    const target = zone || selectedFence
    if (!target) return
    setModalMode('edit')
    setFormName(target.name)
    setFormType(target.type)
    setFormLat(target.lat)
    setFormLon(target.lon)
    setFormRadius(target.radius)
    setFormStatus(target.status)
    setFormAlerts(target.alerts)
    setIsModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      name: formName,
      type: formType,
      lat: parseFloat(formLat),
      lon: parseFloat(formLon),
      radius: parseFloat(formRadius),
      status: formStatus,
      alerts: formAlerts,
    }
    if (modalMode === 'add') {
      addGeofence(data)
    } else {
      updateGeofence(selectedFenceId, data)
    }
    setIsModalOpen(false)
  }

  return (
    <div data-component="GeofencesPage" data-slot="page-layout" className="flex min-h-0 flex-1 flex-col md:overflow-hidden">
      <Topbar title="Geofences" subtitle="Define zones and trigger alerts on entry or exit" />
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto px-4 pb-24 py-5 sm:px-6 md:pb-5 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_300px] lg:overflow-hidden">
        <div className={
          fullScreenMap
            ? "fixed inset-0 z-[2000] flex flex-col bg-base backdrop-blur-lg"
            : "relative flex min-h-[22rem] flex-col overflow-hidden rounded-xl border border-line bg-panel lg:min-h-0 shadow-sm"
        }>

          {/* Header Bar */}
          <div className={`flex items-center justify-between border-b border-line-soft shrink-0 ${
            fullScreenMap ? 'bg-panel px-6 py-3.5 border-line' : 'px-4 py-2.5 bg-panel/40'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <div className={`font-display font-semibold text-hi ${fullScreenMap ? 'text-[15px] font-bold' : 'text-[13.5px]'}`}>
                {fullScreenMap ? 'Geofence Map — Full View' : 'Geofence map'}
              </div>
              <span className={`ml-1.5 rounded-full border border-line-soft bg-panel-2 font-mono text-dim tabular-nums ${
                fullScreenMap ? 'px-2.5 py-0.5 text-[11px] border-line' : 'px-2 py-0.5 text-[10px]'
              }`}>
                {geofences.length} zones · {visibleVehicles.length} vehicles
              </span>
            </div>

            {fullScreenMap && (
              <button
                onClick={() => setFullScreenMap(false)}
                data-action="exit-fullscreen-map" className="flex items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-[12px] font-semibold text-hi hover:bg-hover hover:border-accent/40 transition-colors cursor-pointer"
              >
                <Minimize2 className="h-4 w-4 text-accent" strokeWidth={2} />
                <span>Exit Full Screen</span>
              </button>
            )}
          </div>

          {/* Map Canvas with Floating Controls */}
          <div className="relative flex-1 h-full w-full">

            {/* Floating Controls Toolbar */}
            <div
              className={`absolute left-3 top-3 z-20 flex flex-col items-start ${fullScreenMap ? 'gap-2' : 'gap-1.5'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Full Screen */}
              <button
                onClick={() => setFullScreenMap((prev) => !prev)}
                data-action="toggle-fullscreen-map" aria-label={fullScreenMap ? "Exit full screen" : "View geofence map in full screen"}
                className="group flex h-7 items-center gap-1.5 overflow-hidden rounded-lg border border-line bg-panel/90 px-1.75 text-[11px] font-medium text-hi backdrop-blur-md shadow-md transition-all duration-300 ease-out hover:pr-2.5 hover:border-accent/40 hover:bg-hover cursor-pointer"
                title={fullScreenMap ? "Exit full screen" : "View full map"}
              >
                {fullScreenMap ? (
                  <Minimize2 className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
                )}
                <span className="max-w-0 opacity-0 whitespace-nowrap transition-all duration-300 ease-out group-hover:max-w-xs group-hover:opacity-100">
                  {fullScreenMap ? "Exit full screen" : "Full screen"}
                </span>
              </button>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                data-action="refresh-geofence-map" aria-label="Refresh geofence map"
                className="group flex h-7 items-center gap-1.5 overflow-hidden rounded-lg border border-line bg-panel/90 px-1.75 text-[11px] font-medium text-hi backdrop-blur-md shadow-md transition-all duration-300 ease-out hover:pr-2.5 hover:border-accent/40 hover:bg-hover cursor-pointer"
                title="Refresh map"
              >
                <RotateCw className={`h-3.5 w-3.5 shrink-0 text-accent ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
                <span className="max-w-0 opacity-0 whitespace-nowrap transition-all duration-300 ease-out group-hover:max-w-xs group-hover:opacity-100">
                  Refresh
                </span>
              </button>

              {/* Filter Status Dropdown */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setFilterOpen((prev) => !prev)}
                  aria-label="Filter map by vehicle status"
                  aria-expanded={filterOpen}
                  className="group flex h-7 items-center gap-1.5 overflow-hidden rounded-lg border border-line bg-panel/90 px-1.75 text-[11px] font-medium text-hi backdrop-blur-md shadow-md transition-all duration-300 ease-out hover:pr-2.5 hover:border-accent/40 hover:bg-hover cursor-pointer"
                  title="Filter vehicles"
                >
                  <Filter className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
                  <div className="flex max-w-0 overflow-hidden items-center gap-1.5 opacity-0 whitespace-nowrap transition-all duration-300 ease-out group-hover:max-w-xs group-hover:opacity-100">
                    <span>{currentFilterObj.label}</span>
                    {currentFilterObj.color && (
                      <span className={`h-1.5 w-1.5 rounded-full ${currentFilterObj.color}`} />
                    )}
                    <ChevronDown className="h-3 w-3 text-dim" strokeWidth={2} />
                  </div>
                </button>

                {filterOpen && (
                  <div className="absolute left-0 top-full mt-1 w-40 rounded-xl border border-line bg-panel-2 py-1 shadow-xl z-30 backdrop-blur">
                    <div className="px-3 py-1 font-mono text-[9.5px] uppercase tracking-wider text-dim">
                      Filter Vehicles
                    </div>
                    {FILTER_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { setStatusFilter(opt.key); setFilterOpen(false) }}
                        className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[11px] font-medium transition-colors cursor-pointer ${
                          statusFilter === opt.key
                            ? 'bg-accent/15 text-accent'
                            : 'text-lo hover:bg-hover hover:text-hi'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {opt.color
                            ? <span className={`h-1.5 w-1.5 rounded-full ${opt.color}`} />
                            : <span className="h-1.5 w-1.5 rounded-full bg-dim" />
                          }
                          <span>{opt.label}</span>
                        </div>
                        {statusFilter === opt.key && (
                          <Check className="h-3 w-3 text-accent" strokeWidth={2.5} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Leaflet Map */}
            <MapLeaflet vehicles={visibleVehicles} height="100%" zoom={mapZoom} center={mapCenter} geofences={geofences} />
          </div>
        </div>

        {/* ── Right Sidebar: Geofence Zones ─────────────────────────── */}
        <div className="flex min-h-80 flex-col overflow-hidden rounded-xl border border-line bg-panel lg:min-h-0">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-3 shrink-0">
            <div>
              <div className="font-display text-[13.5px] font-bold text-hi">Geofence Zones</div>
              <div className="mt-0.5 text-[11px] text-dim font-mono">{geofences.length} zones configured</div>
            </div>
            <button
              onClick={handleOpenAdd}
              title="Add geofence zone"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-black hover:bg-accent/85 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
            </button>
          </div>

          {/* Zone List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {isLoading ? (
              // Skeleton
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-line-soft bg-panel-2 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-3.5 w-28 rounded bg-panel" />
                    <div className="h-5 w-5 rounded-md bg-panel" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-14 rounded-full bg-panel/70" />
                    <div className="h-5 w-14 rounded-full bg-panel/70" />
                    <div className="h-5 w-14 rounded-full bg-panel/70" />
                  </div>
                </div>
              ))
            ) : geofences.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-panel-2 border border-line-soft">
                  <MapPin className="h-5 w-5 text-dim" strokeWidth={1.8} />
                </div>
                <div className="text-[12px] font-semibold text-lo">No zones yet</div>
                <div className="text-[11px] text-dim">Click + to add your first geofence</div>
              </div>
            ) : (
              geofences.map((zone) => {
                const isSelected = selectedFenceId === zone.id
                const isMenuOpen = openMenuId === zone.id
                const counts = getVehiclesInGeofence(zone)
                const isActive = zone.status === 'Active'

                return (
                  <div
                    key={zone.id}
                    onClick={() => {
                      setSelectedFenceId(zone.id)
                      setCustomCenter([zone.lat, zone.lon])
                      setCustomZoom(13)
                      setOpenMenuId(null)
                    }}
                    className={`group relative rounded-xl border p-3.5 cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-accent/50 bg-accent/5 shadow-sm'
                        : 'border-line-soft bg-panel-2 hover:border-line hover:bg-hover'
                    }`}
                  >
                    {/* Row 1: Zone name + status dot + 3-dot menu */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Active / Paused indicator dot */}
                        <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${isActive ? 'bg-green' : 'bg-amber'}`} />
                        <span className="truncate font-display text-[13px] font-semibold text-hi">
                          {zone.name}
                        </span>
                        <span className="shrink-0 font-mono text-[9.5px] text-dim">
                          {zone.type}
                        </span>
                      </div>

                      {/* 3-dot menu button */}
                      <div
                        className="relative shrink-0"
                        ref={isMenuOpen ? menuRef : null}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setOpenMenuId(isMenuOpen ? null : zone.id)}
                          title="Zone options"
                          className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors cursor-pointer ${
                            isMenuOpen
                              ? 'bg-panel text-hi border border-line'
                              : 'text-dim hover:text-hi hover:bg-panel opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 z-30 w-36 rounded-xl border border-line bg-panel shadow-xl overflow-hidden">
                            <button
                              onClick={() => { setOpenMenuId(null); setSelectedFenceId(zone.id); handleOpenEdit(zone) }}
                              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-accent" strokeWidth={2.2} />
                              Edit zone
                            </button>
                            <div className="h-px bg-line-soft mx-2" />
                            <button
                              onClick={() => {
                                setOpenMenuId(null)
                                setDeletingZone(zone)
                              }}
                              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-[12px] font-medium text-red hover:bg-red/8 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red" strokeWidth={2.2} />
                              Delete zone
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Vehicle status pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Total */}
                      <span className="flex items-center gap-1 rounded-full border border-line-soft bg-panel px-2 py-0.5 font-mono text-[10px] text-lo">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        {counts.total}
                      </span>
                      {/* Online */}
                      <span className="flex items-center gap-1 rounded-full border border-green/20 bg-green/8 px-2 py-0.5 font-mono text-[10px] text-green">
                        <span className="h-1.5 w-1.5 rounded-full bg-green" />
                        {counts.online}
                      </span>
                      {/* Idle */}
                      <span className="flex items-center gap-1 rounded-full border border-amber/20 bg-amber/8 px-2 py-0.5 font-mono text-[10px] text-amber">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                        {counts.idle}
                      </span>
                      {/* Offline */}
                      <span className="flex items-center gap-1 rounded-full border border-line-soft bg-panel px-2 py-0.5 font-mono text-[10px] text-dim">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray" />
                        {counts.offline}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
        {/* ── End Right Sidebar ──────────────────────────────────────── */}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-xl border border-line bg-panel p-5 shadow-lg">
            <h3 className="font-display text-[15px] font-semibold text-hi mb-4">
              {modalMode === 'add' ? 'Add Geofence Zone' : 'Edit Geofence Zone'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-lo">Zone Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-line focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-lo">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-line focus:outline-none"
                  >
                    <option>Depot</option>
                    <option>Service</option>
                    <option>Route</option>
                    <option>Restricted</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-lo">Radius (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formRadius}
                    onChange={(e) => setFormRadius(e.target.value)}
                    className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-line focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-lo">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-line focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-lo">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formLon}
                    onChange={(e) => setFormLon(e.target.value)}
                    className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-line focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-lo">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-line focus:outline-none"
                  >
                    <option>Active</option>
                    <option>Paused</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-lo">Alerts</label>
                  <select
                    value={formAlerts}
                    onChange={(e) => setFormAlerts(e.target.value)}
                    className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-line focus:outline-none"
                  >
                    <option>Entry + exit</option>
                    <option>Entry only</option>
                    <option>Exit only</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  data-action="cancel-geofence-modal"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-line bg-panel-2 px-4 py-2 text-[12.5px] font-medium text-lo hover:bg-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-action="submit-geofence-modal"
                  className="rounded-lg bg-accent px-4 py-2 text-[12.5px] font-medium text-white hover:bg-accent/90"
                >
                  {modalMode === 'add' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Warning Modal */}
      {deletingZone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
          onClick={() => setDeletingZone(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-line bg-panel p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red/15 text-red border border-red/25">
                <TriangleAlert className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-[15px] font-bold text-hi">
                  Delete Geofence Zone?
                </h3>
                <p className="mt-1 text-[12px] leading-relaxed text-dim">
                  Are you sure you want to delete <strong className="font-semibold text-hi font-display">"{deletingZone.name}"</strong>? This will permanently remove its boundary and trigger rules.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-line-soft">
              <button
                type="button"
                data-action="cancel-delete-zone"
                onClick={() => setDeletingZone(null)}
                className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[12px] font-medium text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                data-action="confirm-delete-zone"
                onClick={() => {
                  deleteGeofence(deletingZone.id)
                  if (selectedFenceId === deletingZone.id) setSelectedFenceId(null)
                  if (showToast) showToast(`Geofence "${deletingZone.name}" deleted`)
                  setDeletingZone(null)
                }}
                className="flex items-center gap-1.5 rounded-lg bg-red px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-red/90 transition-colors cursor-pointer shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
                Delete Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── End Geofences Page ── */}
    </div>
  )
}
