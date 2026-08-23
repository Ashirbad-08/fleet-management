import { useState } from 'react'
import Topbar from '../components/Topbar'
import MapLeaflet from '../components/MapLeaflet'
import { Edit2, MapPin, Plus } from '../components/icons'
import { useFleet } from '../context/FleetContext'
import { useSearchParams } from 'react-router-dom'

export default function Geofences() {
  const {
    vehicles,
    filteredVehicles,
    geofences,
    addGeofence,
    updateGeofence,
    deleteGeofence,
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Topbar title="Geofences" subtitle="Define zones and trigger alerts on entry or exit" />
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto px-4 pb-24 py-5 sm:px-6 md:pb-5 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_300px] lg:overflow-hidden">
        <div className="min-h-[22rem] overflow-hidden rounded-xl border border-line bg-panel lg:min-h-0">
          <MapLeaflet vehicles={visibleVehicles} height="100%" zoom={mapZoom} center={mapCenter} geofences={geofences} />
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
                  className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-lo">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
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
                    className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
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
                    className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
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
                    className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-lo">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
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
                    className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi focus:border-accent focus:outline-hidden"
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
    </div>
  )
}
