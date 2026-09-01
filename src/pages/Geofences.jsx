import { useState, useRef, useEffect } from 'react'
import Topbar from '../components/Topbar'
import MapLeaflet from '../components/MapLeaflet'
import { Edit2, MapPin, Plus, RotateCw, Filter, ChevronDown, Check, Maximize2, Minimize2 } from '../components/icons'
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
  } = useFleet()

  const [searchParams] = useSearchParams()
  const mapVehicleId = searchParams.get('vehicle')
  const mapVehicle = mapVehicleId ? vehicles.find((v) => v.id === mapVehicleId) : null
  const visibleVehicles = mapVehicle ? [mapVehicle] : filteredVehicles

  const [selectedFenceId, setSelectedFenceId] = useState(null)
  const [customCenter, setCustomCenter] = useState(null)
  const [customZoom, setCustomZoom] = useState(null)

  const selectedFence = geofences.find((g) => g.id === selectedFenceId) || null

  const mapCenter = customCenter || (mapVehicle?.lat && mapVehicle?.lon ? [mapVehicle.lat, mapVehicle.lon] : undefined)
  const mapZoom = customZoom || (mapVehicle ? 12 : 4.5)

  // ── Map toolbar state ────────────────────────────────────────────────────
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [fullScreenMap, setFullScreenMap] = useState(false)
  const [fullScreenFilterOpen, setFullScreenFilterOpen] = useState(false)
  const filterRef = useRef(null)
  const fullScreenFilterRef = useRef(null)

  const handleRefresh = (e) => {
    e.stopPropagation()
    setIsRefreshing(true)
    setRefreshKey((k) => k + 1)
    if (showToast) showToast('Geofence map refreshed')
    setTimeout(() => setIsRefreshing(false), 600)
  }

  // Close filter dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
      if (fullScreenFilterRef.current && !fullScreenFilterRef.current.contains(e.target)) setFullScreenFilterOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Escape exits full screen
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') setFullScreenMap(false) }
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
    if (zone.status !== 'Active') return 0
    return vehicles.filter((v) => {
      if (!v.lat || !v.lon) return false
      const distKm = Math.sqrt(Math.pow(v.lat - zone.lat, 2) + Math.pow(v.lon - zone.lon, 2)) * 111.12
      return distKm <= zone.radius
    }).length
  }

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

  const handleOpenEdit = () => {
    if (!selectedFence) return
    setModalMode('edit')
    setFormName(selectedFence.name)
    setFormType(selectedFence.type)
    setFormLat(selectedFence.lat)
    setFormLon(selectedFence.lon)
    setFormRadius(selectedFence.radius)
    setFormStatus(selectedFence.status)
    setFormAlerts(selectedFence.alerts)
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
    <div className="flex min-h-0 flex-1 flex-col md:overflow-hidden">
      <Topbar title="Geofences" subtitle="Define zones and trigger alerts on entry or exit" />
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto px-4 pb-24 py-5 sm:px-6 md:pb-5 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_300px] lg:overflow-hidden">
        <div className="relative flex min-h-[22rem] flex-col overflow-hidden rounded-xl border border-line bg-panel lg:min-h-0 shadow-sm">

          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-2.5 shrink-0 bg-panel/40">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <div className="font-display text-[13.5px] font-semibold text-hi">Geofence map</div>
              <span className="ml-1.5 rounded-full border border-line-soft bg-panel-2 px-2 py-0.5 font-mono text-[10px] text-dim tabular-nums">
                {geofences.length} zones · {visibleVehicles.length} vehicles
              </span>
            </div>
          </div>

          {/* Map Canvas with Floating Controls */}
          <div className="relative flex-1 h-full w-full">

            {/* Floating Controls Toolbar */}
            <div
              className="absolute left-3 top-3 z-20 flex flex-col items-start gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Full Screen */}
              <button
                onClick={() => setFullScreenMap(true)}
                aria-label="View geofence map in full screen"
                className="group flex h-7 items-center gap-1.5 overflow-hidden rounded-lg border border-line bg-panel/90 px-1.75 text-[11px] font-medium text-hi backdrop-blur-md shadow-md transition-all duration-300 ease-out hover:pr-2.5 hover:border-accent/40 hover:bg-hover cursor-pointer"
                title="View full map"
              >
                <Maximize2 className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
                <span className="max-w-0 opacity-0 whitespace-nowrap transition-all duration-300 ease-out group-hover:max-w-xs group-hover:opacity-100">
                  Full screen
                </span>
              </button>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                aria-label="Refresh geofence map"
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
            <MapLeaflet key={refreshKey} vehicles={visibleVehicles} height="100%" zoom={mapZoom} center={mapCenter} geofences={geofences} />
          </div>
        </div>

        <div className="flex min-h-80 flex-col overflow-hidden rounded-xl border border-line bg-panel lg:min-h-0">
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-3.25">
            <div>
              <div className="font-display text-[13.5px] font-semibold">Geofence zones</div>
              <div className="mt-1 text-[11.5px] text-dim">{visibleVehicles.length} vehicles visible on map</div>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white transition-colors hover:bg-accent/90"
              title="Add geofence"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {geofences.map((zone) => {
                const isSelected = selectedFenceId === zone.id
                const vehicleCount = getVehiclesInGeofence(zone)
                return (
                  <button
                    key={zone.id}
                    onClick={() => {
                      setSelectedFenceId(zone.id)
                      setCustomCenter([zone.lat, zone.lon])
                      setCustomZoom(13)
                    }}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      isSelected
                        ? 'border-accent bg-accent/5'
                        : 'border-line-soft bg-panel-2 hover:border-line hover:bg-hover'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                          <MapPin className="h-4 w-4" strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-display text-[13px] font-semibold">{zone.name}</div>
                          <div className="mt-1 text-[11.5px] text-dim">{zone.type} zone</div>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        zone.status === 'Active' ? 'bg-green/15 text-green' : 'bg-amber/15 text-amber'
                      }`}>
                        {zone.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
                      <div className="rounded-md border border-line-soft bg-panel px-2 py-1.5">
                        <div className="text-dim">Vehicles</div>
                        <div className="mt-0.5 font-mono text-lo">{vehicleCount}</div>
                      </div>
                      <div className="rounded-md border border-line-soft bg-panel px-2 py-1.5">
                        <div className="text-dim">Alerts</div>
                        <div className="mt-0.5 text-lo">{zone.alerts}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-line-soft p-3 space-y-2">
            <button
              onClick={handleOpenEdit}
              disabled={!selectedFence}
              className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                selectedFence
                  ? 'border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi cursor-pointer'
                  : 'border-line-soft bg-panel-2/50 text-dim cursor-not-allowed'
              }`}
            >
              <Edit2 className="h-3.5 w-3.5" strokeWidth={2.2} />
              Edit selected zone
            </button>
            {selectedFence && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    updateGeofence(selectedFence.id, {
                      status: selectedFence.status === 'Active' ? 'Paused' : 'Active',
                    })
                  }}
                  className="rounded-lg border border-line bg-panel-2 py-2 text-[12px] font-medium text-lo hover:bg-hover"
                >
                  {selectedFence.status === 'Active' ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => {
                    deleteGeofence(selectedFence.id)
                    setSelectedFenceId(null)
                  }}
                  className="rounded-lg border border-red/40 bg-red/10 py-2 text-[12px] font-medium text-red hover:bg-red/20"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
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
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-line bg-panel-2 px-4 py-2 text-[12.5px] font-medium text-lo hover:bg-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-4 py-2 text-[12.5px] font-medium text-white hover:bg-accent/90"
                >
                  {modalMode === 'add' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Full Screen Map Modal ─────────────────────────────────────── */}
      {fullScreenMap && (
        <div className="fixed inset-0 z-[2000] flex flex-col bg-base backdrop-blur-lg">
          <div className="flex items-center justify-between border-b border-line bg-panel px-6 py-3.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="font-display text-[15px] font-bold text-hi">Geofence Map — Full View</span>
              <span className="rounded-full border border-line bg-panel-2 px-2.5 py-0.5 font-mono text-[11px] text-dim">
                {geofences.length} zones · {visibleVehicles.length} vehicles
              </span>
            </div>
            <button
              onClick={() => setFullScreenMap(false)}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-[12px] font-semibold text-hi hover:bg-hover hover:border-accent/40 transition-colors cursor-pointer"
            >
              <Minimize2 className="h-4 w-4 text-accent" strokeWidth={2} />
              <span>Exit Full Screen</span>
            </button>
          </div>
          <div className="relative flex-1 w-full h-full">
            {/* Floating Controls for Full Screen */}
            <div
              className="absolute left-4 top-4 z-[1000] flex flex-col items-start gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Refresh */}
              <button
                onClick={handleRefresh}
                className="group flex h-8 items-center gap-1.5 overflow-hidden rounded-lg border border-line bg-panel/90 px-2 text-[11.5px] font-medium text-hi backdrop-blur-md shadow-lg transition-all duration-300 ease-out hover:pr-3 hover:border-accent/40 hover:bg-hover cursor-pointer"
                title="Refresh map"
              >
                <RotateCw className={`h-4 w-4 shrink-0 text-accent ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
                <span className="max-w-0 opacity-0 whitespace-nowrap transition-all duration-300 ease-out group-hover:max-w-xs group-hover:opacity-100">
                  Refresh
                </span>
              </button>

              {/* Filter */}
              <div className="relative" ref={fullScreenFilterRef}>
                <button
                  onClick={() => setFullScreenFilterOpen((prev) => !prev)}
                  className="group flex h-8 items-center gap-1.5 overflow-hidden rounded-lg border border-line bg-panel/90 px-2 text-[11.5px] font-medium text-hi backdrop-blur-md shadow-lg transition-all duration-300 ease-out hover:pr-3 hover:border-accent/40 hover:bg-hover cursor-pointer"
                  title="Filter vehicles"
                >
                  <Filter className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                  <div className="flex max-w-0 overflow-hidden items-center gap-1.5 opacity-0 whitespace-nowrap transition-all duration-300 ease-out group-hover:max-w-xs group-hover:opacity-100">
                    <span>{currentFilterObj.label}</span>
                    {currentFilterObj.color && (
                      <span className={`h-1.5 w-1.5 rounded-full ${currentFilterObj.color}`} />
                    )}
                    <ChevronDown className="h-3.5 w-3.5 text-dim" strokeWidth={2} />
                  </div>
                </button>

                {fullScreenFilterOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl border border-line bg-panel-2 py-1 shadow-2xl z-[1001] backdrop-blur">
                    <div className="px-3 py-1 font-mono text-[9.5px] uppercase tracking-wider text-dim">
                      Filter Vehicles
                    </div>
                    {FILTER_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { setStatusFilter(opt.key); setFullScreenFilterOpen(false) }}
                        className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[11.5px] font-medium transition-colors cursor-pointer ${
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
                          <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <MapLeaflet key={`fs-${refreshKey}`} vehicles={visibleVehicles} height="100%" zoom={mapZoom} center={mapCenter} geofences={geofences} />
          </div>
        </div>
      )}
    </div>
  )
}
