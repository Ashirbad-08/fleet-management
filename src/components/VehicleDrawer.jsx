import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
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
  ShieldCheck,
  Users,
  Mail,
  Phone,
  MessageSquare,
  FileSpreadsheet,
  FileText,
  Calendar,
  Activity,
  BatteryCharging,
  BookOpen,
  Plug,
  Hash,
  CreditCard,
  MapPin,
  TrendingDown,
  ChevronDown,
  ChevronUp,
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
  const [drawerTab, setDrawerTab] = useState('telemetry') // 'telemetry' | 'specs' | 'compliance' | 'contacts'
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [timelineModalOpen, setTimelineModalOpen] = useState(false)
  const [timelineEvents, setTimelineEvents] = useState([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [timelineError, setTimelineError] = useState(null)
  const [telemetryLoading, setTelemetryLoading] = useState(true)
  const [mapKey, setMapKey] = useState(0)
  const [mapFullscreen, setMapFullscreen] = useState(false)
  const [chargingFilter, setChargingFilter] = useState('today') // 'today' | 'yesterday' | 'calendar'
  const [chargingCustomDate, setChargingCustomDate] = useState('')
  const [expandedSessionId, setExpandedSessionId] = useState(null)
  const dateInputRef = useRef(null)

  // Trigger smooth skeleton loading state when switching vehicles
  useEffect(() => {
    if (selectedVehicle?.id) {
      setTelemetryLoading(true)
      const timer = setTimeout(() => setTelemetryLoading(false), 240)
      return () => clearTimeout(timer)
    }
  }, [selectedVehicle?.id])

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
      setDrawerTab('telemetry')
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
    setChargingFilter('today')
    setChargingCustomDate('')
    setExpandedSessionId(null)
    setDrawerTab('telemetry')
  }

  // Handle Escape key to close overlays smoothly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        if (mapFullscreen) {
          setMapFullscreen(false)
          return
        }
        if (historyModalOpen) {
          setHistoryModalOpen(false)
          return
        }
        if (timelineModalOpen) {
          setTimelineModalOpen(false)
          return
        }
        close()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mapFullscreen, historyModalOpen, timelineModalOpen, open])

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
      location: selectedVehicle.location ?? '',
      driver: selectedVehicle.driver ?? '',
      driverPhone: selectedVehicle.driverPhone ?? '',
      batterySerial: selectedVehicle.batterySerial ?? '',
      batteryCapacityKwh: selectedVehicle.batteryCapacityKwh ?? '',
      batteryChemistry: selectedVehicle.batteryChemistry ?? 'LFP',
      insuranceExpiry: selectedVehicle.insuranceExpiry ?? '',
      hubSupervisorName: selectedVehicle.hubSupervisorName ?? '',
      hubSupervisorPhone: selectedVehicle.hubSupervisorPhone ?? '',
      chassisNumber: selectedVehicle.chassisNumber ?? '',
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
      driverPhone: editForm.driverPhone,
      batterySerial: editForm.batterySerial,
      batteryCapacityKwh: Number(editForm.batteryCapacityKwh) || selectedVehicle.batteryCapacityKwh,
      batteryChemistry: editForm.batteryChemistry,
      insuranceExpiry: editForm.insuranceExpiry,
      hubSupervisorName: editForm.hubSupervisorName,
      hubSupervisorPhone: editForm.hubSupervisorPhone,
      chassisNumber: editForm.chassisNumber,
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
        onClick={() => {
          // If a sub-panel is open, don't close the whole drawer —
          // the sub-panel's own backdrop handles its close.
          if (historyModalOpen || timelineModalOpen) return
          close()
        }}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-label="Vehicle Details & Controls"
        onClick={(e) => e.stopPropagation()}
        className={`fixed right-0 top-0 z-50 h-dvh w-full overflow-y-auto border-l border-line bg-panel transition-transform duration-300 ease-in-out sm:w-[462px] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedVehicle && (
          <>
            {/* Drawer Top Header */}
            <div className="flex items-start justify-between border-b border-line-soft bg-panel px-5 py-4">
              <div>
                <div className="font-display text-[15.5px] font-bold text-hi">{selectedVehicle.name}</div>
                {(() => {
                  const locLabel =
                    selectedVehicle.location || selectedVehicle.city || null
                  const mapsUrl =
                    selectedVehicle.lat && selectedVehicle.lon
                      ? `https://www.google.com/maps/search/?api=1&query=${selectedVehicle.lat},${selectedVehicle.lon}`
                      : locLabel
                        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locLabel)}`
                        : null
                  return mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-dim hover:text-green transition-colors group w-fit"
                      title="Open in Google Maps"
                    >
                      <MapPin className="h-2.5 w-2.5 shrink-0 group-hover:text-green" strokeWidth={2.5} />
                      <span className="truncate max-w-[180px]">
                        {locLabel ||
                          `${selectedVehicle.lat.toFixed(4)}, ${selectedVehicle.lon.toFixed(4)}`}
                      </span>
                    </a>
                  ) : null
                })()}
                <div className="mt-0.5 font-mono text-[11px] text-lo tabular-nums">
                  {selectedVehicle.type || '4 Wheeler'} • {selectedVehicle.plate} • {selectedVehicle.model}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (editing) {
                      setEditing(false)
                    } else {
                      startEdit()
                    }
                  }}
                  aria-label={editing ? 'Close edit form' : 'Edit vehicle telemetry and specs'}
                  title={editing ? 'Cancel editing' : 'Edit vehicle'}
                  className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors cursor-pointer ${
                    editing
                      ? 'border-accent bg-accent/20 text-accent'
                      : 'border-line bg-panel-2 text-lo hover:bg-hover hover:text-accent'
                  }`}
                >
                  <Edit2 className="h-3 w-3" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close drawer"
                  title="Close"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.2} />
                </button>
              </div>
            </div>

            {/* Sub-Tabs Selector */}
            <div className="sticky top-0 z-10 flex overflow-x-auto border-b border-line bg-panel-2/80 text-[11px] font-semibold text-lo scrollbar-none backdrop-blur-sm" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={drawerTab === 'telemetry'}
                onClick={() => {
                  setDrawerTab('telemetry')
                  setEditing(false)
                }}
                className={`flex shrink-0 w-[17%] items-center justify-center gap-1 py-2.5 border-b-2 transition-all cursor-pointer ${
                  drawerTab === 'telemetry'
                    ? 'border-accent text-accent bg-accent/10 font-bold'
                    : 'border-transparent text-lo hover:text-hi hover:bg-hover'
                }`}
              >
                <Cpu className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate text-[10px]">Live</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={drawerTab === 'specs'}
                onClick={() => {
                  setDrawerTab('specs')
                  setEditing(false)
                }}
                className={`flex shrink-0 w-[17%] items-center justify-center gap-1 py-2.5 border-b-2 transition-all cursor-pointer ${
                  drawerTab === 'specs'
                    ? 'border-accent text-accent bg-accent/10 font-bold'
                    : 'border-transparent text-lo hover:text-hi hover:bg-hover'
                }`}
              >
                <Zap className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate text-[10px]">Battery</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={drawerTab === 'passport'}
                onClick={() => {
                  setDrawerTab('passport')
                  setEditing(false)
                }}
                className={`flex shrink-0 w-[17%] items-center justify-center gap-1 py-2.5 border-b-2 transition-all cursor-pointer ${
                  drawerTab === 'passport'
                    ? 'border-accent text-accent bg-accent/10 font-bold'
                    : 'border-transparent text-lo hover:text-hi hover:bg-hover'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate text-[10px]">Passport</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={drawerTab === 'charging'}
                onClick={() => {
                  setDrawerTab('charging')
                  setEditing(false)
                }}
                className={`flex shrink-0 w-[17%] items-center justify-center gap-1 py-2.5 border-b-2 transition-all cursor-pointer ${
                  drawerTab === 'charging'
                    ? 'border-accent text-accent bg-accent/10 font-bold'
                    : 'border-transparent text-lo hover:text-hi hover:bg-hover'
                }`}
              >
                <Plug className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate text-[10px]">Charging</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={drawerTab === 'compliance'}
                onClick={() => {
                  setDrawerTab('compliance')
                  setEditing(false)
                }}
                className={`flex shrink-0 w-[17%] items-center justify-center gap-1 py-2.5 border-b-2 transition-all cursor-pointer ${
                  drawerTab === 'compliance'
                    ? 'border-accent text-accent bg-accent/10 font-bold'
                    : 'border-transparent text-lo hover:text-hi hover:bg-hover'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate text-[10px]">Docs</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={drawerTab === 'contacts'}
                onClick={() => {
                  setDrawerTab('contacts')
                  setEditing(false)
                }}
                className={`flex shrink-0 w-[17%] items-center justify-center gap-1 py-2.5 border-b-2 transition-all cursor-pointer ${
                  drawerTab === 'contacts'
                    ? 'border-accent text-accent bg-accent/10 font-bold'
                    : 'border-transparent text-lo hover:text-hi hover:bg-hover'
                }`}
              >
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate text-[10px]">Driver</span>
              </button>
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
              <div className="space-y-4 border-b border-line-soft px-5 py-4">
                <div className="flex items-center justify-between border-b border-line-soft pb-2">
                  <span className="text-[12px] font-bold text-hi uppercase tracking-wide">Edit Vehicle Specifications</span>
                  <span className="font-mono text-[10px] text-accent">{selectedVehicle.plate}</span>
                </div>

                {/* Section: Status & Operations */}
                <div className="space-y-2.5">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wider text-dim">Operations & Status</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Vehicle Status</label>
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
                      <label className="mb-1 block text-[10px] text-dim">Hub / Location</label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Driver Name</label>
                      <input
                        type="text"
                        value={editForm.driver}
                        onChange={(e) => setEditForm((f) => ({ ...f, driver: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Driver Phone</label>
                      <input
                        type="text"
                        value={editForm.driverPhone}
                        onChange={(e) => setEditForm((f) => ({ ...f, driverPhone: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Hub Supervisor</label>
                      <input
                        type="text"
                        value={editForm.hubSupervisorName}
                        onChange={(e) => setEditForm((f) => ({ ...f, hubSupervisorName: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Supervisor Phone</label>
                      <input
                        type="text"
                        value={editForm.hubSupervisorPhone}
                        onChange={(e) => setEditForm((f) => ({ ...f, hubSupervisorPhone: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Telemetry & Battery Live */}
                <div className="space-y-2.5 border-t border-line-soft pt-3">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wider text-dim">Live Telemetry Values</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Battery (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.battery}
                        onChange={(e) => setEditForm((f) => ({ ...f, battery: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Est. Range (km)</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.rangeKm}
                        onChange={(e) => setEditForm((f) => ({ ...f, rangeKm: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Total Range (km)</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.totalRangeKm}
                        onChange={(e) => setEditForm((f) => ({ ...f, totalRangeKm: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Temp (°C)</label>
                      <input
                        type="number"
                        value={editForm.batteryTempC}
                        onChange={(e) => setEditForm((f) => ({ ...f, batteryTempC: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Voltage (V)</label>
                      <input
                        type="number"
                        value={editForm.voltageV}
                        onChange={(e) => setEditForm((f) => ({ ...f, voltageV: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Current (A)</label>
                      <input
                        type="number"
                        value={editForm.currentA}
                        onChange={(e) => setEditForm((f) => ({ ...f, currentA: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] text-dim">Odometer (km)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.odometerKm}
                      onChange={(e) => setEditForm((f) => ({ ...f, odometerKm: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Section: Battery Hardware & Compliance */}
                <div className="space-y-2.5 border-t border-line-soft pt-3">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wider text-dim">Hardware & Compliance</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Battery Serial No.</label>
                      <input
                        type="text"
                        value={editForm.batterySerial}
                        onChange={(e) => setEditForm((f) => ({ ...f, batterySerial: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Capacity (kWh)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.batteryCapacityKwh}
                        onChange={(e) => setEditForm((f) => ({ ...f, batteryCapacityKwh: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Battery Chemistry</label>
                      <select
                        value={editForm.batteryChemistry}
                        onChange={(e) => setEditForm((f) => ({ ...f, batteryChemistry: e.target.value }))}
                        className={`${inputCls} cursor-pointer`}
                      >
                        <option value="LFP">LFP (Lithium Iron Phosphate)</option>
                        <option value="NMC">NMC (Nickel Manganese Cobalt)</option>
                        <option value="Solid State">Solid State</option>
                        <option value="LTO">LTO (Lithium Titanate)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] text-dim">Chassis / VIN</label>
                      <input
                        type="text"
                        value={editForm.chassisNumber}
                        onChange={(e) => setEditForm((f) => ({ ...f, chassisNumber: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] text-dim">Insurance Expiry Date (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      value={editForm.insuranceExpiry}
                      onChange={(e) => setEditForm((f) => ({ ...f, insuranceExpiry: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
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
            ) : drawerTab === 'telemetry' ? (
              /* TAB 1: LIVE TELEMETRY */
              <>
                {/* Health Score Gauge */}
                {telemetryLoading ? (
                  <div className="flex flex-col items-center bg-panel px-5 py-6 border-b border-line-soft animate-pulse">
                    <div className="h-28 w-28 rounded-full border-4 border-panel-2 bg-panel-2/60 flex items-center justify-center">
                      <div className="h-8 w-12 rounded bg-panel-2" />
                    </div>
                    <div className="mt-3 h-4.5 w-20 rounded-full bg-panel-2" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center bg-panel px-5 py-4 border-b border-line-soft">
                    <Gauge score={selectedVehicle.health} color={meta.color} />
                    <span
                      className={`mt-1 inline-flex items-center gap-1.5 rounded-full py-0.5 pl-2 pr-2.5 text-[10.5px] font-semibold ${meta.pill}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                      {meta.label}
                    </span>
                  </div>
                )}

                {/* Telemetry Sensors Grid */}
                {telemetryLoading ? (
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
                      <div className="h-3.5 w-24 rounded bg-panel-2" />
                      <div className="h-3 w-16 rounded bg-panel-2/60" />
                    </div>
                    <div className="grid grid-cols-3 gap-px border-b border-line-soft bg-line-soft">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={`skel-sens-${i}`} className="bg-panel px-3.5 py-3 space-y-1.5">
                          <div className="h-2.5 w-14 rounded bg-panel-2" />
                          <div className="h-3.5 w-20 rounded bg-panel-2/70" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
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

                {/* Battery 24h Trend */}
                {telemetryLoading ? (
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
                      <div className="h-3.5 w-24 rounded bg-panel-2" />
                      <div className="h-3 w-16 rounded bg-panel-2/60" />
                    </div>
                    <div className="border-b border-line-soft px-5 py-5 bg-panel">
                      <div className="h-8 w-full rounded bg-panel-2/50" />
                    </div>
                  </div>
                ) : (
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

                {/* Live Location Mini Map */}
                {telemetryLoading ? (
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
                      <div className="h-3.5 w-24 rounded bg-panel-2" />
                      <div className="h-3 w-20 rounded bg-panel-2/60" />
                    </div>
                    <div className="border-b border-line-soft p-4 bg-panel">
                      <div className="h-44 w-full rounded-xl bg-panel-2/50 flex items-center justify-center">
                        <div className="h-6 w-24 rounded bg-panel-2" />
                      </div>
                    </div>
                  </div>
                ) : (
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
                          onClick={() => {
                            setHistoryModalOpen(false)
                            setTimelineModalOpen(false)
                            setMapFullscreen(true)
                          }}
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

                {/* Recent Trips */}
                {telemetryLoading ? (
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
                      <div className="h-3.5 w-24 rounded bg-panel-2" />
                      <div className="h-3 w-16 rounded bg-panel-2/60" />
                    </div>
                    <div className="border-b border-line-soft px-5 py-3.5 bg-panel-2/15 space-y-2.5">
                      <div className="rounded-xl border border-line-soft bg-panel p-3.5 space-y-2">
                        <div className="flex justify-between">
                          <div className="h-3.5 w-24 rounded bg-panel-2" />
                          <div className="h-4 w-18 rounded-full bg-panel-2" />
                        </div>
                        <div className="h-4 w-20 rounded bg-panel-2" />
                        <div className="h-3 w-32 rounded bg-panel-2/60" />
                      </div>
                    </div>
                  </div>
                ) : (
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

                      <button
                        onClick={() => {
                          setMapFullscreen(false)
                          setTimelineModalOpen(false)
                          setHistoryModalOpen(true)
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 py-2 text-[12px] font-semibold text-accent hover:bg-accent/20 transition-all cursor-pointer shadow-xs"
                      >
                        <History className="h-3.5 w-3.5" />
                        View Full History
                      </button>
                    </div>
                  </div>
                )}

                {/* Device Timeline */}
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

                  <div className="border-b border-line-soft px-5 py-3 bg-panel-2/15">
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
                        {timelineEvents.slice(0, 2).map((evt) => {
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
                              </div>
                            </div>
                          )
                        })}

                        <button
                          onClick={() => {
                            setMapFullscreen(false)
                            setHistoryModalOpen(false)
                            setTimelineModalOpen(true)
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 py-2 text-[12px] font-semibold text-accent hover:bg-accent/20 transition-all cursor-pointer shadow-xs mt-2"
                        >
                          <Radio className="h-3.5 w-3.5" />
                          View Full Timeline ({timelineEvents.length} Events)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Device Actions */}
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
                        className="flex items-center justify-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] font-medium text-hi hover:border-[#333B47] hover:bg-hover cursor-pointer"
                      >
                        <Map className="h-3.5 w-3.5" strokeWidth={2} />
                        Map
                      </button>
                      <button
                        onClick={() => sendDeviceCommand(selectedVehicle, selectedVehicle.locked ? 'unlock' : 'lock')}
                        className="flex items-center justify-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] font-medium text-hi hover:border-[#333B47] hover:bg-hover cursor-pointer"
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
                        className={`flex items-center gap-2.25 rounded-lg border px-3.25 py-2 text-[12.5px] font-medium cursor-pointer ${
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

                {/* Remove Vehicle / Management */}
                <div className="px-5 py-4 bg-panel-2/20">
                  {confirmDelete ? (
                    <div className="rounded-lg border border-red/40 bg-red/10 p-3.5">
                      <div className="mb-2.5 text-[12px] font-medium text-red">Remove {selectedVehicle.name} from fleet?</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteVehicle(selectedVehicle.id)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red/20 px-3 py-2 text-[12.5px] font-medium text-red hover:bg-red/30 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex flex-1 items-center justify-center rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] font-medium text-lo hover:bg-hover cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[12px] font-medium text-dim hover:border-red/40 hover:text-red transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Remove vehicle from fleet
                    </button>
                  )}
                </div>
              </>
            ) : drawerTab === 'specs' ? (
              /* TAB 2: BATTERY & CHARGER SPECS */
              <div className="p-5 space-y-4">
                {/* Battery Pack Specs Card */}
                <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
                        <Zap className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="font-display text-[12.5px] font-bold text-hi">Battery Pack Hardware</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
                        {selectedVehicle.batteryCapacityKwh || '12.8'} kWh
                      </span>
                      <button
                        type="button"
                        onClick={startEdit}
                        title="Edit battery specifications"
                        className="flex items-center gap-1 rounded border border-line bg-panel-2 px-2 py-0.5 text-[10px] font-medium text-lo hover:border-accent/40 hover:text-accent transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-2.5 w-2.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-px bg-line-soft p-px">
                    <div className="bg-panel px-3.5 py-2.5">
                      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Battery Serial No.</div>
                      <div className="mt-0.5 font-mono text-[12px] font-bold text-hi truncate">
                        {selectedVehicle.batterySerial || 'BAT-2026-X01'}
                      </div>
                    </div>
                    <div className="bg-panel px-3.5 py-2.5">
                      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Chemistry</div>
                      <div className="mt-0.5 font-mono text-[12px] font-bold text-hi">
                        {selectedVehicle.batteryChemistry || 'LFP'}
                      </div>
                    </div>
                    <div className="bg-panel px-3.5 py-2.5">
                      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Capacity (Ah)</div>
                      <div className="mt-0.5 font-mono text-[12px] font-bold text-hi">
                        {selectedVehicle.batteryCapacityAh || '200'} Ah
                      </div>
                    </div>
                    <div className="bg-panel px-3.5 py-2.5">
                      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Mount Architecture</div>
                      <div className="mt-0.5 font-mono text-[12px] font-medium text-hi truncate">
                        {selectedVehicle.batteryType || 'Swappable Dual-Pack'}
                      </div>
                    </div>
                    <div className="bg-panel px-3.5 py-2.5">
                      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Nominal Voltage</div>
                      <div className="mt-0.5 font-mono text-[12px] font-medium text-hi">
                        {selectedVehicle.voltageV || 48} V
                      </div>
                    </div>
                    <div className="bg-panel px-3.5 py-2.5">
                      <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Operating Temp</div>
                      <div className="mt-0.5 font-mono text-[12px] font-medium text-hi">
                        {selectedVehicle.batteryTempC || 28}°C (Nominal)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charger & Inverter Card */}
                <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-amber/15 text-amber">
                        <BatteryCharging className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="font-display text-[12.5px] font-bold text-hi">Charger & Power Equipment</span>
                    </div>
                    <span className="rounded bg-amber/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber">
                      {selectedVehicle.chargerCapacity || '3.3 kW'}
                    </span>
                  </div>

                  <div className="space-y-2 p-3.5 text-[12px] bg-panel">
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Charger Variant:</span>
                      <span className="font-mono font-medium text-hi">{selectedVehicle.chargerVariant || 'Off Board'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Charger Serial No.:</span>
                      <span className="font-mono font-medium text-hi">{selectedVehicle.chargerSerialNo || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-dim">Charger Capacity:</span>
                      <span className="font-mono font-medium text-hi">{selectedVehicle.chargerCapacity || '35 Amps'}</span>
                    </div>
                  </div>
                </div>

                {/* Telematics & IoT Unit Card */}
                <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
                        <Cpu className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="font-display text-[12.5px] font-bold text-hi">IoT Telematics Unit</span>
                    </div>
                    <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-[10px] text-lo border border-line-soft">
                      v{selectedVehicle.firmware || '1.0'}
                    </span>
                  </div>

                  <div className="space-y-2 p-3.5 text-[12px] bg-panel">
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Device IMEI / Serial:</span>
                      <span className="font-mono font-bold text-accent">{selectedVehicle.deviceId || selectedVehicle.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Device SIM Card Number:</span>
                      <span className="font-mono font-medium text-hi">{selectedVehicle.simCardNumber || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Chassis Number:</span>
                      <span className="font-mono font-medium text-hi">{selectedVehicle.chassisNumber || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Make / Model:</span>
                      <span className="font-mono font-medium text-hi">{selectedVehicle.oem || 'Electrie'} {selectedVehicle.model || 'S-14'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-dim">Data Source Platform:</span>
                      <span className="font-mono font-medium text-accent">{selectedVehicle.dataSourcePlatform || 'Intellicar'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : drawerTab === 'compliance' ? (
              /* TAB 3: COMPLIANCE & WARRANTY */
              <div className="p-5 space-y-4">
                {/* Insurance Status Card */}
                <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-green/15 text-green">
                        <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="font-display text-[12.5px] font-bold text-hi">Insurance</span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green/15 px-2.5 py-0.5 text-[10px] font-bold text-green border border-green/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-green" />
                      {selectedVehicle.insuranceExpiry ? 'Active' : 'Not Set'}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2 text-[12px] bg-panel">
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Insurer:</span>
                      <span className="font-mono font-bold text-hi">{selectedVehicle.insurerName || selectedVehicle.insurer || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Insurance Expiry Date:</span>
                      <span className="font-mono font-bold text-hi">{selectedVehicle.insuranceExpiry || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-dim">Insurance Attachment:</span>
                      <span className="font-mono font-medium text-lo">{selectedVehicle.insuranceAttachment || 'NA'}</span>
                    </div>
                  </div>
                </div>

                {/* Warranty & AMC Card */}
                <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
                        <FileText className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="font-display text-[12.5px] font-bold text-hi">Warranty & AMC Coverage</span>
                    </div>
                    <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
                      {selectedVehicle.amcCoverage || 'YES'}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2 text-[12px] bg-panel">
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Battery Warranty Start:</span>
                      <span className="font-mono font-medium text-hi">{selectedVehicle.warrantyStartDate || selectedVehicle.batteryWarrantyStartDate || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Warranty Duration:</span>
                      <span className="font-mono font-medium text-hi">{selectedVehicle.warrantyDuration || '3 Years'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Warranty Cycles:</span>
                      <span className="font-mono font-medium text-hi">{selectedVehicle.warrantyCycles || '2500'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">AMC Period:</span>
                      <span className="font-mono font-medium text-hi">{selectedVehicle.amcStartDate || '—'} to {selectedVehicle.amcEndDate || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">AMC Coverage:</span>
                      <span className="font-mono font-medium text-green">{selectedVehicle.amcCoverage || 'YES'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-dim">Fitness Expiry Date:</span>
                      <span className="font-mono font-medium text-hi">{selectedVehicle.fitnessExpiry || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Client & Deployment Card */}
                <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-panel-2 text-lo border border-line-soft">
                        <Users className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="font-display text-[12.5px] font-bold text-hi">Deployment & Client Context</span>
                    </div>
                    <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-[10px] text-lo border border-line-soft">
                      {selectedVehicle.vehicleStatus || selectedVehicle.status || 'Active'}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2 text-[12px] bg-panel">
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Client / Customer Name:</span>
                      <span className="font-mono font-bold text-accent">{selectedVehicle.clientName || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Customer Hub Name:</span>
                      <span className="font-mono font-medium text-hi">{selectedVehicle.customerHubName || selectedVehicle.location || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                      <span className="text-dim">Customer Hub Lat/Long:</span>
                      <span className="font-mono font-medium text-lo truncate max-w-[200px]">{selectedVehicle.customerHubLatLong || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-dim">Deployment Location:</span>
                      <span className="font-mono font-medium text-hi">{selectedVehicle.location || selectedVehicle.deploymentLocation || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : drawerTab === 'passport' ? (
              /* TAB 5: VEHICLE PASSPORT */
              <div className="p-5 space-y-4">

                {/* ── Vehicle ── */}
                <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
                        <CreditCard className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="font-display text-[12.5px] font-bold text-hi">Vehicle</span>
                    </div>
                    <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
                      {selectedVehicle.plate || 'Buggy 51'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-line-soft p-px">
                    {[
                      ['OEM', selectedVehicle.oem || selectedVehicle.manufacturer || 'Electrie'],
                      ['Model', selectedVehicle.model || 'S-14'],
                      ['Variant', selectedVehicle.variant || '—'],
                      ['Colour', selectedVehicle.color || selectedVehicle.colour || 'White'],
                      ['Perm. Reg Num', selectedVehicle.plate || 'Buggy 51'],
                      ['Perm. Reg Date', selectedVehicle.registrationDate || '—'],
                      ['Reg Type', selectedVehicle.regType || '—'],
                      ['Fit Cert Exp Dt', selectedVehicle.fitnessExpiry || '—'],
                      ['Temp Reg Number', selectedVehicle.tempRegNumber || '—'],
                      ['Temp Reg Date', selectedVehicle.tempRegDate || '—'],
                      ['Temp Reg Expiry', selectedVehicle.tempRegExpiry || '—'],
                      ['Asset Type', selectedVehicle.type || selectedVehicle.assetType || 'Golf Cart'],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-panel px-3.5 py-2.5">
                        <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">{label}</div>
                        <div className="mt-0.5 font-mono text-[11.5px] font-bold text-hi truncate">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Insurance ── */}
                <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-green/15 text-green">
                        <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="font-display text-[12.5px] font-bold text-hi">Insurance</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      selectedVehicle.insuranceExpiry
                        ? 'bg-green/15 text-green border-green/30'
                        : 'bg-panel-2 text-dim border-line-soft'
                    }`}>
                      {selectedVehicle.insuranceExpiry ? 'Active' : 'Not Set'}
                    </span>
                  </div>
                  <div className="space-y-0 text-[12px] bg-panel">
                    {[
                      ['Insurer Name', selectedVehicle.insurerName || selectedVehicle.insurer || '—'],
                      ['Insurance Expiry Date', selectedVehicle.insuranceExpiry || '—'],
                      ['Insurance Attachment', selectedVehicle.insuranceAttachment || 'NA'],
                    ].map(([label, value], i, arr) => (
                      <div key={label} className={`flex justify-between items-center px-3.5 py-2 ${i < arr.length - 1 ? 'border-b border-line-soft/60' : ''}`}>
                        <span className="text-dim shrink-0">{label}:</span>
                        <span className={`font-mono font-medium text-right max-w-[58%] truncate ${value === '—' ? 'text-dim' : 'text-hi'}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Finance / Lease ── */}
                <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                  <div className="flex items-center gap-2 border-b border-line-soft bg-panel px-4 py-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-amber/15 text-amber">
                      <CreditCard className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    <span className="font-display text-[12.5px] font-bold text-hi">Finance / Lease</span>
                  </div>
                  <div className="space-y-0 text-[12px] bg-panel">
                    {[
                      ['Financing Type', selectedVehicle.financingType || '—'],
                      ['Asset Ownership', selectedVehicle.ownerName || selectedVehicle.ownership || 'GZRRC'],
                      ['Hypothecation', selectedVehicle.hypothecation || 'No'],
                      ['Hypothecated To', selectedVehicle.hypothecatedTo || '—'],
                      ['Sale Tax Invoice No.', selectedVehicle.invoiceNumber || '—'],
                      ['Invoice Date', selectedVehicle.invoiceDate || '—'],
                      ['Invoice Value / Price', selectedVehicle.invoiceValue ? `₹${selectedVehicle.invoiceValue}` : '—'],
                    ].map(([label, value], i, arr) => (
                      <div key={label} className={`flex justify-between items-center px-3.5 py-2 ${i < arr.length - 1 ? 'border-b border-line-soft/60' : ''}`}>
                        <span className="text-dim shrink-0">{label}:</span>
                        <span className={`font-mono font-medium text-right max-w-[58%] truncate ${value === '—' ? 'text-dim' : 'text-hi'}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Parties ── */}
                <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-panel-2 text-lo border border-line-soft">
                        <Users className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="font-display text-[12.5px] font-bold text-hi">Parties</span>
                    </div>
                    <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-[9.5px] text-dim border border-line-soft">
                      Role intervals
                    </span>
                  </div>
                  {/* Header row */}
                  <div className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr] gap-px bg-line-soft px-0">
                    {['Role', 'Organisation', 'From', 'To'].map((h) => (
                      <div key={h} className="bg-panel-2/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-dim">{h}</div>
                    ))}
                  </div>
                  {/* Party rows — from vehicle data or default onboarding entry */}
                  {(selectedVehicle.parties || [
                    {
                      role: 'Owner · Current',
                      organisation: selectedVehicle.ownerName || 'GZRRC',
                      contact: '—',
                      from: selectedVehicle.commissionDate || '2026-09-15',
                      to: '—',
                    },
                  ]).map((party, i, arr) => (
                    <div key={i} className={`grid grid-cols-[2fr_2fr_1.5fr_1.5fr] gap-px bg-line-soft ${i < arr.length - 1 ? '' : ''}`}>
                      <div className="bg-panel px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.5 text-[9.5px] font-bold text-accent">
                          {party.role}
                        </span>
                      </div>
                      <div className="bg-panel px-3 py-2.5 font-mono text-[10.5px] font-bold text-hi truncate flex items-center">
                        {party.organisation}
                      </div>
                      <div className="bg-panel px-3 py-2.5 font-mono text-[10px] text-lo flex items-center">
                        {party.from}
                      </div>
                      <div className="bg-panel px-3 py-2.5 font-mono text-[10px] text-dim flex items-center">
                        {party.to}
                      </div>
                    </div>
                  ))}
                  <div className="bg-panel px-3 py-2 text-[9.5px] text-dim italic">
                    Roles are intervals — a change of operator is a new row, so "who ran this in June" stays answerable.
                  </div>
                </div>

              </div>
            ) : drawerTab === 'charging' ? (
              /* TAB 6: CHARGING SESSIONS */
              (() => {
                const sessionsDataset = {
                  today: {
                    periodLabel: 'Today (24 Sep 2026)',
                    sessions: [
                      {
                        id: 'CS-20240924-002',
                        title: 'Afternoon Fast Charge',
                        date: 'Today, 02:45 PM',
                        duration: '42m',
                        durationMin: 42,
                        kwh: 5.8,
                        startSoc: 40,
                        endSoc: 88,
                        station: 'Hub A — Fast Bay 2',
                        connector: 'GB/T DC',
                        peak: '3.3 kW',
                        isRecent: true,
                      },
                      {
                        id: 'CS-20240924-001',
                        title: 'Morning Top-Up',
                        date: 'Today, 06:12 AM',
                        duration: '1h 14m',
                        durationMin: 74,
                        kwh: 9.4,
                        startSoc: 18,
                        endSoc: 92,
                        station: 'Hub A — Charger 3',
                        connector: 'GB/T DC',
                        peak: '3.3 kW',
                        isRecent: false,
                      },
                    ],
                  },
                  yesterday: {
                    periodLabel: 'Yesterday (23 Sep 2026)',
                    sessions: [
                      {
                        id: 'CS-20240923-004',
                        title: 'Night Shift Recharge',
                        date: 'Yesterday, 11:45 PM',
                        duration: '58m',
                        durationMin: 58,
                        kwh: 7.1,
                        startSoc: 31,
                        endSoc: 86,
                        station: 'Hub A — Charger 1',
                        connector: 'GB/T DC',
                        peak: '3.1 kW',
                        isRecent: true,
                      },
                      {
                        id: 'CS-20240923-003',
                        title: 'Mid-Day Boost',
                        date: 'Yesterday, 01:15 PM',
                        duration: '48m',
                        durationMin: 48,
                        kwh: 6.2,
                        startSoc: 25,
                        endSoc: 75,
                        station: 'Hub B — Charger 2',
                        connector: 'Type 2 AC',
                        peak: '3.2 kW',
                        isRecent: false,
                      },
                    ],
                  },
                }

                // Selected period sessions
                let activePeriodSessions = []
                let activePeriodLabel = 'Today'

                if (chargingFilter === 'today') {
                  activePeriodSessions = sessionsDataset.today.sessions
                  activePeriodLabel = sessionsDataset.today.periodLabel
                } else if (chargingFilter === 'yesterday') {
                  activePeriodSessions = sessionsDataset.yesterday.sessions
                  activePeriodLabel = sessionsDataset.yesterday.periodLabel
                } else if (chargingFilter === 'calendar') {
                  if (chargingCustomDate) {
                    const formattedDate = new Date(chargingCustomDate + 'T00:00:00').toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                    activePeriodLabel = formattedDate
                    activePeriodSessions = [
                      {
                        id: `CS-${chargingCustomDate.replace(/-/g, '')}-001`,
                        title: 'Depot Charging Session',
                        date: `${formattedDate}, 08:30 AM`,
                        duration: '1h 02m',
                        durationMin: 62,
                        kwh: 8.2,
                        startSoc: 22,
                        endSoc: 88,
                        station: 'Hub B — Charger 2',
                        connector: 'Type 2 AC',
                        peak: '2.8 kW',
                        isRecent: true,
                      },
                    ]
                  } else {
                    activePeriodLabel = 'Calendar Date'
                    activePeriodSessions = []
                  }
                }

                const totalKwh = activePeriodSessions.reduce((s, r) => s + r.kwh, 0).toFixed(1)
                const totalMinutes = activePeriodSessions.reduce((s, r) => s + (r.durationMin || 0), 0)
                const totalDurationStr =
                  totalMinutes > 0
                    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                    : '0m'
                const peakPowerStr =
                  activePeriodSessions.length > 0
                    ? activePeriodSessions[0].peak
                    : '—'

                return (
                  <div className="p-5 space-y-4">

                    {/* 1. LIGHT GREEN & AESTHETIC DATE FILTER BAR */}
                    <div className="flex items-center gap-1 rounded-xl border border-line-soft bg-panel-2/40 p-1 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setChargingFilter('today')}
                        className={`flex-1 rounded-lg py-1.5 px-3 text-[11px] font-medium transition-all cursor-pointer text-center ${
                          chargingFilter === 'today'
                            ? 'bg-green/15 text-green border border-green/30 shadow-xs font-semibold'
                            : 'text-lo hover:text-hi hover:bg-hover/60 border border-transparent'
                        }`}
                      >
                        Today
                      </button>

                      <button
                        type="button"
                        onClick={() => setChargingFilter('yesterday')}
                        className={`flex-1 rounded-lg py-1.5 px-3 text-[11px] font-medium transition-all cursor-pointer text-center ${
                          chargingFilter === 'yesterday'
                            ? 'bg-green/15 text-green border border-green/30 shadow-xs font-semibold'
                            : 'text-lo hover:text-hi hover:bg-hover/60 border border-transparent'
                        }`}
                      >
                        Yesterday
                      </button>

                      {/* Calendar Date Picker Button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            if (dateInputRef.current) {
                              if (typeof dateInputRef.current.showPicker === 'function') {
                                dateInputRef.current.showPicker()
                              } else {
                                dateInputRef.current.focus()
                                dateInputRef.current.click()
                              }
                            }
                          }}
                          className={`flex items-center gap-1.5 rounded-lg py-1.5 px-3 text-[11px] font-medium transition-all cursor-pointer ${
                            chargingFilter === 'calendar'
                              ? 'bg-green/15 text-green border border-green/30 shadow-xs font-semibold'
                              : 'text-lo hover:text-hi hover:bg-hover/60 border border-transparent'
                          }`}
                        >
                          <Calendar className={`h-3.5 w-3.5 ${chargingFilter === 'calendar' ? 'text-green' : 'text-lo'}`} />
                          <span>
                            {chargingFilter === 'calendar' && chargingCustomDate
                              ? new Date(chargingCustomDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                              : 'Calendar'}
                          </span>
                        </button>

                        <input
                          ref={dateInputRef}
                          type="date"
                          value={chargingCustomDate}
                          onChange={(e) => {
                            if (e.target.value) {
                              setChargingCustomDate(e.target.value)
                              setChargingFilter('calendar')
                            }
                          }}
                          className="sr-only"
                        />
                      </div>
                    </div>

                    {/* 2. TOP METRICS CARDS */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Energy Delivered', value: `${totalKwh} kWh`, sub: `${activePeriodSessions.length} session${activePeriodSessions.length === 1 ? '' : 's'}` },
                        { label: 'Charge Duration', value: totalDurationStr, sub: 'total plug-in time' },
                        { label: 'Peak Power', value: peakPowerStr, sub: 'max DC input rate' },
                      ].map(({ label, value, sub }) => (
                        <div key={label} className="rounded-xl border border-line-soft bg-panel-2/50 px-3 py-2.5 text-center shadow-xs">
                          <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">{label}</div>
                          <div className="mt-1 font-display text-[15px] font-bold text-hi">{value}</div>
                          <div className="text-[9px] text-dim">{sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* 3. MERGED CHARGING SESSIONS SECTION */}
                    <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                      <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
                            <Plug className="h-3 w-3" strokeWidth={2.5} />
                          </span>
                          <span className="font-display text-[12.5px] font-bold text-hi">Charging Sessions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">
                            {activePeriodSessions.length} Session{activePeriodSessions.length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>

                      {activePeriodSessions.length === 0 ? (
                        <div className="p-8 text-center bg-panel space-y-2">
                          <div className="flex justify-center text-dim">
                            <Calendar className="h-8 w-8 stroke-1 opacity-50" />
                          </div>
                          <div className="text-[12.5px] font-semibold text-hi">No Charging Sessions Found</div>
                          <div className="text-[11px] text-dim">No charging activity recorded for {activePeriodLabel}.</div>
                          <button
                            type="button"
                            onClick={() => setChargingFilter('today')}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-[11px] font-medium text-accent hover:bg-hover cursor-pointer"
                          >
                            Return to Today's Sessions
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-line-soft/60 bg-panel">
                          {activePeriodSessions.map((session, idx) => {
                            const isExpanded = expandedSessionId === session.id
                            return (
                              <div
                                key={session.id}
                                className={`transition-colors ${
                                  isExpanded ? 'bg-accent/5' : 'hover:bg-panel-2/40'
                                }`}
                              >
                                {/* Clickable Row for Short Information */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExpandedSessionId((prev) => (prev === session.id ? null : session.id))
                                  }}
                                  className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer select-none transition-colors"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      {session.isRecent && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green/15 px-2 py-0.2 text-[9.5px] font-bold text-green border border-green/30">
                                          <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                                          Recent
                                        </span>
                                      )}
                                      <span className="font-display text-[13px] font-bold text-hi truncate">
                                        {session.title}
                                      </span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-[10.5px] text-dim font-mono">
                                      <span>{session.date}</span>
                                      <span>•</span>
                                      <span className="truncate">{session.station.split('—')[0].trim()}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-right">
                                      <div className="font-display text-[15px] font-bold text-accent">
                                        {session.kwh}{' '}
                                        <span className="text-[10px] text-lo font-normal">kWh</span>
                                      </div>
                                      <div className="text-[10px] text-dim font-mono">
                                        {session.duration} • {session.startSoc}%→{session.endSoc}%
                                      </div>
                                    </div>
                                    <div className="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:text-hi transition-colors">
                                      {isExpanded ? (
                                        <ChevronUp className="h-3.5 w-3.5" />
                                      ) : (
                                        <ChevronDown className="h-3.5 w-3.5" />
                                      )}
                                    </div>
                                  </div>
                                </button>

                                {/* Detailed Information (Shown when clicked) */}
                                {isExpanded && (
                                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-line-soft/60 animate-in fade-in-50 duration-150">
                                    {/* SoC Progress Bar */}
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-[10px] text-dim">
                                        <span>
                                          SoC: {session.startSoc}% → {session.endSoc}%
                                        </span>
                                        <span className="text-accent font-semibold">
                                          +{session.endSoc - session.startSoc}% charged
                                        </span>
                                      </div>
                                      <div className="relative h-1.5 w-full rounded-full bg-panel-2 overflow-hidden border border-line-soft">
                                        <div
                                          className="absolute left-0 top-0 h-full rounded-full bg-line-soft"
                                          style={{ width: `${session.startSoc}%` }}
                                        />
                                        <div
                                          className="absolute top-0 h-full rounded-full bg-accent transition-all duration-300"
                                          style={{
                                            left: `${session.startSoc}%`,
                                            width: `${session.endSoc - session.startSoc}%`,
                                          }}
                                        />
                                      </div>
                                    </div>

                                    {/* Session Details Hardware Grid */}
                                    <div className="grid grid-cols-3 gap-px bg-line-soft rounded-lg overflow-hidden border border-line-soft">
                                      {[
                                        ['Station', session.station],
                                        ['Connector', session.connector],
                                        ['Peak Rate', session.peak],
                                      ].map(([l, v]) => (
                                        <div key={l} className="bg-panel px-2.5 py-2 text-center">
                                          <div className="text-[9px] uppercase tracking-wider text-dim font-semibold">{l}</div>
                                          <div className="mt-0.5 font-mono text-[11px] font-bold text-hi truncate">{v}</div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Telematics Info */}
                                    <div className="flex items-center justify-between text-[10.5px] pt-1 text-dim font-mono">
                                      <span>Session ID: <strong className="text-hi">{session.id}</strong></span>
                                      <span className="inline-flex items-center gap-1 text-green font-semibold">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green" />
                                        Completed
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* 4. CHARGER CONFIGURATION */}
                    <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                      <div className="flex items-center gap-2 border-b border-line-soft bg-panel px-4 py-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-amber/15 text-amber">
                          <BatteryCharging className="h-3 w-3" strokeWidth={2.5} />
                        </span>
                        <span className="font-display text-[12.5px] font-bold text-hi">Charger Configuration</span>
                      </div>
                      <div className="space-y-0 text-[12px] bg-panel">
                        {[
                          ['Preferred Station', 'Hub A — Bay 3 (Reserved)'],
                          ['Charging Schedule', 'Auto — Off-peak (10PM–6AM)'],
                          ['Max Charge Rate', selectedVehicle.chargerCapacity || '35 Amps / 3.3 kW'],
                          ['Connector Type', selectedVehicle.chargerVariant || 'Off Board DC Charger'],
                          ['Smart Charging', 'Enabled — Grid-optimized'],
                          ['Charge Limit', '95% (Battery-safe threshold)'],
                        ].map(([label, value], i, arr) => (
                          <div key={label} className={`flex justify-between items-center px-3.5 py-2 ${i < arr.length - 1 ? 'border-b border-line-soft/60' : ''}`}>
                            <span className="text-dim shrink-0">{label}:</span>
                            <span className="font-mono font-medium text-hi text-right max-w-[58%] truncate">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )
              })()
            ) : (
              /* TAB 4: DRIVER & DEPOT SUPERVISOR CONTACTS */

              <div className="p-5 space-y-4">
                {/* Driver Contact Card */}
                <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
                        <Users className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="font-display text-[12.5px] font-bold text-hi">Assigned Pilot / Driver</span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-accent border border-accent/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                      Active Shift
                    </span>
                  </div>

                  <div className="p-4 bg-panel space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-accent font-bold font-display text-[15px] border border-accent/30">
                        {selectedVehicle.driver ? selectedVehicle.driver.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'DR'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-[14px] font-bold text-hi truncate">
                          {selectedVehicle.driver || 'Unassigned Driver'}
                        </div>
                        <div className="font-mono text-[11.5px] text-lo">
                          {selectedVehicle.driverPhone || '+91 98765 43210'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-line-soft/60">
                      <a
                        href={`tel:${selectedVehicle.driverPhone || '+919876543210'}`}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-accent/15 py-2 text-[12px] font-semibold text-accent hover:bg-accent/25 transition-all text-center"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call Driver
                      </a>
                      <a
                        href={`https://wa.me/${(selectedVehicle.driverPhone || '919876543210').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-panel-2 py-2 text-[12px] font-semibold text-hi hover:bg-hover transition-all text-center"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-green" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                {/* Hub Supervisor Contact Card */}
                <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-amber/15 text-amber">
                        <Users className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      <span className="font-display text-[12.5px] font-bold text-hi">Depot Hub Supervisor</span>
                    </div>
                    <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-[10px] text-lo border border-line-soft">
                      {selectedVehicle.location}
                    </span>
                  </div>

                  <div className="p-4 bg-panel space-y-3">
                    <div className="space-y-1.5 text-[12px]">
                      <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                        <span className="text-dim">Supervisor Name:</span>
                        <span className="font-mono font-bold text-hi">{selectedVehicle.hubSupervisorName || 'Rajesh Kumar'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                        <span className="text-dim">Supervisor Phone:</span>
                        <span className="font-mono font-medium text-hi">{selectedVehicle.hubSupervisorPhone || '+91 98111 22334'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                        <span className="text-dim">Hub Desk Email:</span>
                        <span className="font-mono font-medium text-lo truncate max-w-[200px]">
                          {selectedVehicle.hubSupervisorEmail || 'hub.supervisor@fleet.io'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
                        <span className="text-dim">City:</span>
                        <span className="font-mono font-medium text-hi">{selectedVehicle.city || selectedVehicle.location || '—'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-dim">Hub ID:</span>
                        <span className="font-mono font-medium text-accent">{selectedVehicle.hubId || '—'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-line-soft/60">
                      <a
                        href={`tel:${selectedVehicle.hubSupervisorPhone || '+919811122334'}`}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-amber/15 py-2 text-[12px] font-semibold text-amber hover:bg-amber/25 transition-all text-center"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call Supervisor
                      </a>
                      <a
                        href={`mailto:${selectedVehicle.hubSupervisorEmail || 'hub.supervisor@fleet.io'}`}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-panel-2 py-2 text-[12px] font-semibold text-hi hover:bg-hover transition-all text-center"
                      >
                        <Mail className="h-3.5 w-3.5 text-accent" />
                        Send Email
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </aside>

      {/* Expanded Full-Screen Map Overlay */}
      {mapFullscreen && selectedVehicle && (
        <div className="fixed inset-0 z-[60] flex bg-base/95 p-2 sm:p-4 backdrop-blur-md xl:inset-y-0 xl:left-0 xl:right-[462px] xl:z-[45]">
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
