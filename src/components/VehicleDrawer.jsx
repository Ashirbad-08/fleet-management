import { useMemo, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  UploadCloud,
  Power,
  Lock,
  Unlock,
  TriangleAlert,
  Edit2,
  Save,
  Trash2,
  Map,
  ArrowRight,
  History,
  Navigation,
  RotateCw,
  Radio,
  Maximize2,
  Cpu,
  Zap,
} from './icons'
import { useFleet } from '../context/FleetContext'
import { STATUS_META } from '../data/statusMeta'
import { seedTrips } from '../data/tripsData'
import { fetchTimelineDetailsByIMEI } from '../services/api'
import Gauge from './Gauge'
import Sparkline from './Sparkline'
import MapLeaflet from './MapLeaflet'
import TripHistoryPanel from './TripHistoryModal'
import TimelinePanel from './TimelineModal'

function genSeries(base, spread, n) {
  let v = base
  const out = []
  for (let i = 0; i < n; i++) {
    v += (Math.random() - 0.5) * spread
    v = Math.max(0, Math.min(100, v))
    out.push(Math.round(v))
  }
  return out
}

const ACTIONS = [
  { key: 'firmware', label: 'Push firmware update', icon: UploadCloud, variant: 'primary' },
  { key: 'restart', label: 'Restart device', icon: Power, variant: 'default' },
  { key: 'deactivate', label: 'Flag for maintenance', icon: TriangleAlert, variant: 'danger' },
]

const STATUSES = ['online', 'idle', 'alert', 'offline']

export default function VehicleDrawer() {
  const {
    selectedVehicle,
    setSelectedVehicleId,
    sendDeviceCommand,
    updateVehicle,
    deleteVehicle,
    settings,
    updatingVehicles,
  } = useFleet()
  const navigate = useNavigate()
  const open = Boolean(selectedVehicle)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [timelineModalOpen, setTimelineModalOpen] = useState(false)
  const [timelineEvents, setTimelineEvents] = useState([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [timelineError, setTimelineError] = useState(null)
  const [mapKey, setMapKey] = useState(0)
  const [mapFullscreen, setMapFullscreen] = useState(false)

  const loadTimeline = useCallback(async () => {
    if (!selectedVehicle) return
    setTimelineLoading(true)
    setTimelineError(null)
    try {
      const imei = selectedVehicle.deviceId || selectedVehicle.id
      const data = await fetchTimelineDetailsByIMEI(imei, 10)
      setTimelineEvents(data || [])
    } catch (_err) {
      setTimelineError('Failed to load IMEI timeline details')
    } finally {
      setTimelineLoading(false)
    }
  }, [selectedVehicle])

  useEffect(() => {
    if (selectedVehicle) {
      loadTimeline()
    }
  }, [selectedVehicle?.id, loadTimeline])

  const close = () => {
    setSelectedVehicleId(null)
    setEditing(false)
    setConfirmDelete(false)
    setHistoryModalOpen(false)
    setTimelineModalOpen(false)
    setMapFullscreen(false)
  }

  // Handle Escape key to close drawer smoothly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        if (mapFullscreen) {
          setMapFullscreen(false)
          return
        }
        close()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mapFullscreen, open])

  const battData = useMemo(() => {
    if (!selectedVehicle) return []
    const series = genSeries(selectedVehicle.battery, 6, 20)
    series[series.length - 1] = selectedVehicle.battery
    return series
  }, [selectedVehicle])

  const startEdit = () => {
    setEditForm({
      battery: selectedVehicle.battery,
      rangeKm: selectedVehicle.rangeKm ?? '',
      totalRangeKm: selectedVehicle.totalRangeKm ?? '',
      status: selectedVehicle.status,
      location: selectedVehicle.location,
      driver: selectedVehicle.driver,
      batteryTempC: selectedVehicle.batteryTempC ?? '',
      voltageV: selectedVehicle.voltageV ?? '',
      currentA: selectedVehicle.currentA ?? '',
      odometerKm: selectedVehicle.odometerKm ?? '',
    })
    setEditing(true)
  }

  const saveEdit = () => {
    updateVehicle(selectedVehicle.id, {
      battery: Number(editForm.battery),
      rangeKm: Number(editForm.rangeKm),
      totalRangeKm: Number(editForm.totalRangeKm),
      status: editForm.status,
      location: editForm.location,
      driver: editForm.driver,
      batteryTempC: Number(editForm.batteryTempC),
      voltageV: Number(editForm.voltageV),
      currentA: Number(editForm.currentA),
      odometerKm: Number(editForm.odometerKm),
      health: Number(editForm.battery),
    })
    setEditing(false)
  }

  const openOnMap = () => {
    navigate(`/geofences?vehicle=${encodeURIComponent(selectedVehicle.id)}`)
    close()
  }

  const meta = selectedVehicle ? STATUS_META[selectedVehicle.status] : null

  const inputCls =
    'w-full rounded-md border border-line bg-panel-2 px-2.5 py-1.5 text-[12.5px] text-hi outline-none focus:border-line focus:outline-none'

  return (
    <>
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-label="Vehicle Details & Controls"
        className={`fixed right-0 top-0 z-50 h-dvh w-full overflow-y-auto border-l border-line bg-panel transition-transform duration-300 ease-in-out sm:w-[462px] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedVehicle && (
          <>
            {/* Drawer Top Header */}
            <div className="sticky top-0 z-20 flex items-start justify-between border-b border-line-soft bg-panel/90 px-5 py-4 backdrop-blur-md">
              <div>
                <div className="font-display text-[15.5px] font-bold text-hi">{selectedVehicle.name}</div>
                <div className="mt-0.5 font-mono text-[11px] text-lo tabular-nums">
                  {selectedVehicle.type || '4 Wheeler'} • {selectedVehicle.plate} • {selectedVehicle.model}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={startEdit}
                  aria-label="Edit vehicle telemetry"
                  title="Edit vehicle"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:bg-hover hover:text-accent transition-colors cursor-pointer"
                >
                  <Edit2 className="h-3 w-3" strokeWidth={2} />
                </button>
                <button
                  onClick={close}
                  aria-label="Close drawer"
                  title="Close"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.2} />
                </button>
              </div>
            </div>

            {/* SECTION 1: Health Score Gauge */}
            <div className="flex flex-col items-center bg-panel px-5 py-4 border-b border-line-soft">
              <Gauge score={selectedVehicle.health} color={meta.color} />
              <span
                className={`mt-1 inline-flex items-center gap-1.5 rounded-full py-0.5 pl-2 pr-2.5 text-[10.5px] font-semibold ${meta.pill}`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                {meta.label}
              </span>
            </div>

            {/* Firmware Updating Progress */}
            {updatingVehicles[selectedVehicle.id] !== undefined && (
              <div className="border-b border-line-soft px-5 py-3 bg-accent/5">
                <div className="flex justify-between text-[11.5px] font-semibold text-accent mb-1.5">
                  <span>Flashing Firmware...</span>
                  <span className="font-mono tabular-nums">{updatingVehicles[selectedVehicle.id]}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full border border-accent/20 bg-panel-2">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${updatingVehicles[selectedVehicle.id]}%` }}
                  />
                </div>
              </div>
            )}

            {/* Editing Form */}
            {editing ? (
              <div className="space-y-3 border-b border-line-soft px-5 py-4">
                <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-dim">Edit Vehicle</div>

                <div>
                  <label className="mb-1 block text-[10.5px] text-dim">Battery (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.battery}
                    onChange={(e) => setEditForm((f) => ({ ...f, battery: e.target.value }))}
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[10.5px] text-dim">Est. Range Left (km)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.rangeKm}
                      onChange={(e) => setEditForm((f) => ({ ...f, rangeKm: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10.5px] text-dim">Total Range (km)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.totalRangeKm}
                      onChange={(e) => setEditForm((f) => ({ ...f, totalRangeKm: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[10.5px] text-dim">Battery Temp (C)</label>
                    <input
                      type="number"
                      value={editForm.batteryTempC}
                      onChange={(e) => setEditForm((f) => ({ ...f, batteryTempC: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10.5px] text-dim">Voltage (V)</label>
                    <input
                      type="number"
                      value={editForm.voltageV}
                      onChange={(e) => setEditForm((f) => ({ ...f, voltageV: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[10.5px] text-dim">Current (A)</label>
                    <input
                      type="number"
                      value={editForm.currentA}
                      onChange={(e) => setEditForm((f) => ({ ...f, currentA: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10.5px] text-dim">Odometer (km)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.odometerKm}
                      onChange={(e) => setEditForm((f) => ({ ...f, odometerKm: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10.5px] text-dim">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                    className={`${inputCls} cursor-pointer`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_META[s]?.label ?? s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[10.5px] text-dim">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10.5px] text-dim">Driver</label>
                  <input
                    type="text"
                    value={editForm.driver}
                    onChange={(e) => setEditForm((f) => ({ ...f, driver: e.target.value }))}
                    className={inputCls}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveEdit}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent/15 px-3 py-2 text-[12.5px] font-medium text-accent hover:bg-accent/25 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" strokeWidth={2} />
                    Save changes
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex flex-1 items-center justify-center rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] font-medium text-lo hover:bg-hover cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* SECTION 2: Telemetry Sensors Grid */
              <div>
                <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-hi">
                    <span className="flex h-4 w-4 items-center justify-center rounded bg-accent/15 text-accent">
                      <Cpu className="h-2.5 w-2.5" strokeWidth={2.5} />
                    </span>
                    <span>Live Telemetry</span>
                  </div>
                  <span className="font-mono text-[9.5px] text-dim uppercase">12 Sensor Feeds</span>
                </div>
                <div className="grid grid-cols-3 gap-px border-b border-line-soft bg-line-soft">
                  {[
                    ['Device ID', selectedVehicle.deviceId],
                    [
                      'Firmware',
                      updatingVehicles[selectedVehicle.id] !== undefined
                        ? `Updating (${updatingVehicles[selectedVehicle.id]}%)`
                        : `v${selectedVehicle.firmware}`,
                    ],
                    ['Battery', `${selectedVehicle.battery}%`],
                    [
                      'Est. range',
                      selectedVehicle.rangeKm !== undefined && selectedVehicle.rangeKm !== null
                        ? settings?.distanceUnit === 'miles'
                          ? `${Math.round(selectedVehicle.rangeKm * 0.621371)} mi`
                          : `${selectedVehicle.rangeKm} km`
                        : '-',
                    ],
                    [
                      'Battery temp',
                      selectedVehicle.batteryTempC !== undefined && selectedVehicle.batteryTempC !== null
                        ? settings?.tempUnit === 'Fahrenheit'
                          ? `${Math.round((selectedVehicle.batteryTempC * 9) / 5 + 32)}°F`
                          : `${selectedVehicle.batteryTempC}°C`
                        : '-',
                    ],
                    ['Voltage', `${selectedVehicle.voltageV ?? '-'} V`],
                    ['Current', `${selectedVehicle.currentA ?? '-'} A`],
                    [
                      'Odometer',
                      settings?.distanceUnit === 'miles'
                        ? `${Math.round((selectedVehicle.odometerKm ?? 0) * 0.621371).toLocaleString('en-IN')} mi`
                        : `${Math.round(selectedVehicle.odometerKm ?? 0).toLocaleString('en-IN')} km`,
                    ],
                    ['Lock state', selectedVehicle.locked ? 'Locked' : 'Unlocked'],
                    [
                      'Speed',
                      settings?.speedUnit === 'mph'
                        ? `${Math.round(selectedVehicle.speed * 0.621371)} mph`
                        : `${selectedVehicle.speed} km/h`,
                    ],
                    ['Signal', `${selectedVehicle.signal || 4}/5 Bars`],
                    ['Last seen', selectedVehicle.lastSeen],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-panel px-3.5 py-2.5">
                      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim truncate">{label}</div>
                      <div className="mt-0.5 font-mono text-[12px] font-medium text-hi tabular-nums truncate">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: Battery 24h Trend */}
            {!editing && (
              <div>
                <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-hi">
                    <span className="flex h-4 w-4 items-center justify-center rounded bg-amber/15 text-amber">
                      <Zap className="h-2.5 w-2.5" strokeWidth={2.5} />
                    </span>
                    <span>Battery Trend</span>
                  </div>
                  <span className="font-mono text-[10.5px] font-bold text-amber tabular-nums">
                    {selectedVehicle.battery}% Last 24h
                  </span>
                </div>
                <div className="border-b border-line-soft px-5 py-3.5 bg-panel">
                  <Sparkline data={battData} color={meta.color} />
                </div>
              </div>
            )}

            {/* SECTION 4: Live Location Mini Map */}
            {!editing && (
              <div>
                <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-hi">
                    <span className="flex h-4 w-4 items-center justify-center rounded bg-accent/15 text-accent">
                      <Map className="h-2.5 w-2.5" strokeWidth={2.5} />
                    </span>
                    <span>Live Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-dim tabular-nums">
                      {selectedVehicle.lat
                        ? `${selectedVehicle.lat.toFixed(4)}, ${selectedVehicle.lon.toFixed(4)}`
                        : 'No GPS Fix'}
                    </span>
                    <button
                      onClick={() => setMapKey((k) => k + 1)}
                      title="Refresh map"
                      aria-label="Refresh mini map"
                      className="flex h-5.5 w-5.5 items-center justify-center rounded border border-line bg-panel text-lo hover:bg-hover hover:text-accent transition-colors cursor-pointer"
                    >
                      <RotateCw className="h-2.5 w-2.5" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => setMapFullscreen(true)}
                      title="Open full map"
                      aria-label="Open full screen vehicle map"
                      className="flex h-5.5 w-5.5 items-center justify-center rounded border border-line bg-panel text-lo hover:bg-hover hover:text-accent transition-colors cursor-pointer"
                    >
                      <Maximize2 className="h-2.5 w-2.5" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                <div className="border-b border-line-soft p-4 bg-panel">
                  <div className="relative h-44 w-full overflow-hidden rounded-xl border border-line-soft shadow-inner">
                    <MapLeaflet
                      key={mapKey}
                      vehicles={[selectedVehicle]}
                      center={[selectedVehicle.lat || 20.5937, selectedVehicle.lon || 78.9629]}
                      zoom={13}
                      height="100%"
                      hideLegend
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: Recent Trips & Last Ride Summary */}
            {!editing && (
              <div>
                <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-hi">
                    <span className="flex h-4 w-4 items-center justify-center rounded bg-accent/15 text-accent">
                      <History className="h-2.5 w-2.5" strokeWidth={2.5} />
                    </span>
                    <span>Recent Trips</span>
                  </div>
                  <span className="font-mono text-[9.5px] text-dim uppercase">{seedTrips.length} Total Trips</span>
                </div>

                <div className="border-b border-line-soft px-5 py-3.5 bg-panel-2/15 space-y-2.5">
                  {/* Last Ride Summary */}
                  <div className="rounded-xl border border-line-soft bg-panel p-3.5 shadow-xs">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-lo flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5 text-accent" />
                        <span>Last Ride Summary</span>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold text-accent border border-accent/30">
                        Ended 1h 15m ago
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display text-[13.5px] font-bold text-hi">Trip #842</span>
                      <span className="font-mono text-[11px] text-lo tabular-nums">Today, 14:20</span>
                    </div>

                    <div className="flex items-center gap-4 mb-2.5 text-[11.5px] font-mono text-hi">
                      <div className="flex items-center gap-1">
                        <span className="text-dim text-[10px]">Dist:</span>
                        <span className="font-bold">12.4 km</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-dim text-[10px]">Dur:</span>
                        <span className="font-bold">42 min</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11.5px] border-t border-line-soft/60 pt-2">
                      <div className="flex items-center gap-1.5 text-lo">
                        <span className="text-dim text-[10px] w-9">From:</span>
                        <span className="font-medium text-hi">Prenzlauer Berg</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-lo">
                        <span className="text-dim text-[10px] w-9">To:</span>
                        <span className="font-medium text-accent">Mitte District</span>
                      </div>
                    </div>
                  </div>

                  {/* Trip #841 */}
                  <div className="rounded-xl border border-line-soft bg-panel p-3 text-[12px] shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-display text-[12.5px] font-bold text-hi">Trip #841</span>
                      <span className="font-mono text-[10.5px] text-lo tabular-nums">Yesterday, 18:05</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-dim mb-1 font-mono">
                      <span>6.8 km • 22 min</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11.5px] text-hi">
                      <span className="text-lo">Kreuzberg</span>
                      <ArrowRight className="h-3 w-3 text-accent shrink-0" />
                      <span className="text-lo">Friedrichshain</span>
                    </div>
                  </div>

                  {/* Trip #840 */}
                  <div className="rounded-xl border border-line-soft bg-panel p-3 text-[12px] shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-display text-[12.5px] font-bold text-hi">Trip #840</span>
                      <span className="font-mono text-[10.5px] text-lo tabular-nums">Yesterday, 09:12</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-dim mb-1 font-mono">
                      <span>24.1 km • 1h 12m</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11.5px] text-hi">
                      <span className="text-lo">Charlottenburg</span>
                      <ArrowRight className="h-3 w-3 text-accent shrink-0" />
                      <span className="text-lo">Tiergarten</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setTimelineModalOpen(false)
                      setHistoryModalOpen(true)
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 py-2.5 text-[12px] font-semibold text-accent hover:bg-accent/20 transition-all cursor-pointer shadow-xs"
                  >
                    <History className="h-3.5 w-3.5" />
                    View Full History
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 6: Device Timeline (getTimelineDetailsByIMEI) */}
            <div>
              <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-hi">
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-accent/15 text-accent">
                    <Radio className="h-2.5 w-2.5 animate-pulse" strokeWidth={2.5} />
                  </span>
                  <span>Device Timeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9.5px] text-dim">
                    IMEI: <strong className="text-hi">{selectedVehicle.deviceId || selectedVehicle.id}</strong>
                  </span>
                  <button
                    onClick={loadTimeline}
                    disabled={timelineLoading}
                    title="Refresh IMEI timeline"
                    aria-label="Refresh IMEI timeline"
                    className="flex h-5.5 w-5.5 items-center justify-center rounded border border-line bg-panel text-lo hover:bg-hover hover:text-hi disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    <RotateCw
                      className={`h-2.5 w-2.5 ${timelineLoading ? 'animate-spin text-accent' : ''}`}
                      strokeWidth={2}
                    />
                  </button>
                </div>
              </div>

              <div className="border-b border-line-soft px-5 py-3.5 bg-panel-2/15">
                {timelineLoading && timelineEvents.length === 0 ? (
                  <div className="space-y-2 py-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-2.5 animate-pulse">
                        <div className="mt-1 h-2 w-2 rounded-full bg-line-soft" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3.5 w-3/4 rounded bg-line-soft" />
                          <div className="h-2.5 w-1/2 rounded bg-line-soft/60" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : timelineError ? (
                  <div className="rounded-lg border border-red/30 bg-red/10 p-3 text-[11.5px] text-red">
                    {timelineError}
                    <button onClick={loadTimeline} className="ml-2 font-semibold underline cursor-pointer">
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {timelineEvents.slice(0, 3).map((evt) => {
                      const sevColor =
                        evt.severity === 'critical'
                          ? 'var(--color-red)'
                          : evt.severity === 'warning'
                            ? 'var(--color-amber)'
                            : evt.severity === 'success'
                              ? 'var(--color-green)'
                              : 'var(--color-accent)'

                      return (
                        <div
                          key={evt.id}
                          className="group flex gap-2.5 rounded-lg border border-line-soft/60 bg-panel p-2.5 transition-colors hover:border-line shadow-xs"
                        >
                          <span
                            className="mt-1 h-2 w-2 shrink-0 rounded-full shadow-xs"
                            style={{ background: evt.color || sevColor }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="rounded bg-panel-2 px-1.5 py-0.25 font-mono text-[9px] font-bold uppercase tracking-wider text-lo border border-line-soft">
                                {evt.eventType}
                              </span>
                              <span className="font-mono text-[9.5px] text-dim tabular-nums">{evt.timestamp}</span>
                            </div>
                            <div className="text-[11.5px] font-medium leading-snug text-hi">{evt.message}</div>
                            {evt.metadata && (
                              <div className="mt-1 font-mono text-[10px] text-lo flex items-center justify-between border-t border-line-soft/40 pt-1">
                                <span>{evt.metadata}</span>
                                {evt.location && <span className="text-accent">{evt.location}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    <button
                      onClick={() => {
                        setHistoryModalOpen(false)
                        setTimelineModalOpen(true)
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 py-2.5 text-[12px] font-semibold text-accent hover:bg-accent/20 transition-all cursor-pointer shadow-xs mt-2.5"
                    >
                      <Radio className="h-3.5 w-3.5" />
                      View Full Timeline ({timelineEvents.length} Events)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 7: Device Actions */}
            <div>
              <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-hi">
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-accent/15 text-accent">
                    <Power className="h-2.5 w-2.5" strokeWidth={2.5} />
                  </span>
                  <span>Device Actions</span>
                </div>
                <span className="font-mono text-[9.5px] text-dim uppercase">Remote Control</span>
              </div>

              <div className="flex flex-col gap-2 px-5 py-3.5 bg-panel border-b border-line-soft">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={openOnMap}
                    className="flex items-center justify-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[12.5px] font-medium text-hi hover:border-[#333B47] hover:bg-hover"
                  >
                    <Map className="h-3.5 w-3.5" strokeWidth={2} />
                    Map
                  </button>
                  <button
                    onClick={() => sendDeviceCommand(selectedVehicle, selectedVehicle.locked ? 'unlock' : 'lock')}
                    className="flex items-center justify-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[12.5px] font-medium text-hi hover:border-[#333B47] hover:bg-hover"
                  >
                    {selectedVehicle.locked ? (
                      <Unlock className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                      <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                    )}
                    {selectedVehicle.locked ? 'Unlock' : 'Lock'}
                  </button>
                </div>
                {ACTIONS.map((a) => (
                  <button
                    key={a.key}
                    onClick={() => sendDeviceCommand(selectedVehicle, a.key)}
                    className={`flex items-center gap-2.25 rounded-lg border px-3.25 py-2.5 text-[12.5px] font-medium ${
                      a.variant === 'primary'
                        ? 'border-transparent bg-accent/15 text-accent'
                        : a.variant === 'danger'
                          ? 'border-line bg-panel-2 text-red hover:border-[#333B47] hover:bg-hover'
                          : 'border-line bg-panel-2 text-hi hover:border-[#333B47] hover:bg-hover'
                    }`}
                  >
                    <a.icon className="h-3.5 w-3.5" strokeWidth={2} />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 8: Remove Vehicle / Management */}
            <div className="px-5 py-4 bg-panel-2/20">
              {confirmDelete ? (
                <div className="rounded-lg border border-red/40 bg-red/10 p-3.5">
                  <div className="mb-2.5 text-[12px] font-medium text-red">Remove {selectedVehicle.name} from fleet?</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteVehicle(selectedVehicle.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red/20 px-3 py-2 text-[12.5px] font-medium text-red hover:bg-red/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex flex-1 items-center justify-center rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] font-medium text-lo hover:bg-hover"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[12px] font-medium text-dim hover:border-red/40 hover:text-red transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  Remove vehicle from fleet
                </button>
              )}
            </div>
          </>
        )}
      </aside>

      {/* Expanded Full-Screen Map Overlay */}
      {mapFullscreen && selectedVehicle && (
        <div className="fixed inset-y-0 left-0 right-0 z-[45] flex bg-base/95 p-3 backdrop-blur-md sm:right-[462px]">
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="font-display text-[14px] font-bold text-hi">Live Location Map</span>
                </div>
                <div className="mt-0.5 truncate font-mono text-[10.5px] text-lo">
                  {selectedVehicle.name} - {selectedVehicle.deviceId} -{' '}
                  {selectedVehicle.lat
                    ? `${selectedVehicle.lat.toFixed(4)}, ${selectedVehicle.lon.toFixed(4)}`
                    : 'No GPS Fix'}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMapKey((k) => k + 1)}
                  title="Refresh map"
                  aria-label="Refresh full map"
                  className="flex h-7.5 w-7.5 items-center justify-center rounded-md border border-line bg-panel text-lo hover:bg-hover hover:text-accent transition-colors cursor-pointer"
                >
                  <RotateCw className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <button
                  onClick={() => setMapFullscreen(false)}
                  title="Close full map"
                  aria-label="Close full screen vehicle map"
                  className="flex h-7.5 w-7.5 items-center justify-center rounded-md border border-line bg-panel text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.2} />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <MapLeaflet
                key={`full-${mapKey}`}
                vehicles={[selectedVehicle]}
                center={[selectedVehicle.lat || 20.5937, selectedVehicle.lon || 78.9629]}
                zoom={14}
                height="100%"
                hideLegend
              />
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Full Trip History Panel */}
      <TripHistoryPanel
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        vehicle={selectedVehicle}
        trips={seedTrips}
      />

      {/* Slide-out Full Device Timeline Panel */}
      <TimelinePanel
        open={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
        vehicle={selectedVehicle}
        events={timelineEvents}
        onRefresh={loadTimeline}
        loading={timelineLoading}
      />
    </>
  )
}
