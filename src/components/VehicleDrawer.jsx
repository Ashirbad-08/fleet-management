import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFleet } from '../context/FleetContext'
import { STATUS_META } from '../data/statusMeta'
import { fetchTimelineDetailsByIMEI } from '../services/api'
import { seedTrips } from '../data/tripsData'
import TripHistoryPanel from './TripHistoryModal'
import TimelinePanel from './TimelineModal'

// Modular Vehicle Drawer subcomponents
import VehicleDrawerHeader from './vehicle-drawer/VehicleDrawerHeader'
import VehicleDrawerTabs from './vehicle-drawer/VehicleDrawerTabs'
import EditVehicleForm from './vehicle-drawer/EditVehicleForm'
import LiveTelemetryTab from './vehicle-drawer/tabs/LiveTelemetryTab'
import BatterySpecsTab from './vehicle-drawer/tabs/BatterySpecsTab'
import PassportTab from './vehicle-drawer/tabs/PassportTab'
import ChargingTab from './vehicle-drawer/tabs/ChargingTab'
import ComplianceDocsTab from './vehicle-drawer/tabs/ComplianceDocsTab'
import ParkingTab from './vehicle-drawer/tabs/ParkingTab'
import DriverContactsTab from './vehicle-drawer/tabs/DriverContactsTab'
import ManageTab from './vehicle-drawer/tabs/ManageTab'
import VehicleFullscreenMap from './vehicle-drawer/VehicleFullscreenMap'

function genMonthlySeries(vehicle, n = 30) {
  if (!vehicle) return { points: [], labels: [] }
  const currentBatt = Number(vehicle.battery) || 80
  const points = []
  const labels = []

  let seed = 53
  const str = String(vehicle.id || vehicle.plate || 'veh')
  for (let i = 0; i < str.length; i++) {
    seed = ((seed << 5) - seed + str.charCodeAt(i)) | 0
  }

  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const monthName = d.toLocaleString('en-US', { month: 'short' })
    const dayNum = d.getDate()
    const label = i === 0 ? 'Today' : `${monthName} ${dayNum}`
    labels.push(label)

    if (i === 0) {
      points.push(currentBatt)
    } else {
      const cycleWave = Math.sin((seed + i * 5.3) * 0.4) * 14 + Math.cos(i * 0.75) * 6
      const val = Math.max(18, Math.min(100, Math.round(currentBatt + cycleWave)))
      points.push(val)
    }
  }

  return { points, labels }
}

export default function VehicleDrawer() {
  const {
    selectedVehicle,
    setSelectedVehicleId,
    updateVehicle,
    deleteVehicle,
    settings,
    updatingVehicles,
  } = useFleet()
  const navigate = useNavigate()
  const open = Boolean(selectedVehicle)

  // Drawer Tabs: 'telemetry' | 'specs' | 'passport' | 'charging' | 'compliance' | 'contacts'
  const [drawerTab, setDrawerTab] = useState('telemetry')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Modal / Overlay States
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [timelineModalOpen, setTimelineModalOpen] = useState(false)
  const [mapFullscreen, setMapFullscreen] = useState(false)
  const [mapKey, setMapKey] = useState(0)

  // Live Telemetry & Timeline States
  const [timelineEvents, setTimelineEvents] = useState([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [timelineError, setTimelineError] = useState(null)
  const [telemetryLoading, setTelemetryLoading] = useState(true)

  // Charging Tab States
  const [chargingFilter, setChargingFilter] = useState('today') // 'today' | 'yesterday' | 'calendar'
  const [chargingCustomDate, setChargingCustomDate] = useState('')
  const [expandedSessionId, setExpandedSessionId] = useState(null)
  const dateInputRef = useRef(null)

  // Trigger skeleton loading state when switching vehicles
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

  // Handle Escape key to close overlays smoothly with capture phase
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        e.stopPropagation()
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
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [mapFullscreen, historyModalOpen, timelineModalOpen, open])

  const battData = useMemo(() => {
    if (!selectedVehicle) return { points: [], labels: [] }
    return genMonthlySeries(selectedVehicle, 30)
  }, [selectedVehicle?.id, selectedVehicle?.battery, selectedVehicle?.plate])

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

  return (
    <>
      {/* Backdrop — only on desktop (drawer mode) */}
      <div
        onClick={() => {
          if (historyModalOpen || timelineModalOpen) return
          close()
        }}
        aria-hidden="true"
        className={`fixed inset-0 z-[115] bg-black/60 backdrop-blur-xs transition-opacity duration-300 hidden sm:block ${
          open ? 'opacity-100 pointer-events-auto' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Main Container: Full page on mobile, right drawer on desktop */}
      <aside
        role="dialog"
        aria-label="Vehicle Details & Controls"
        onClick={(e) => e.stopPropagation()}
        className={`fixed inset-0 sm:inset-y-0 sm:left-auto sm:right-0 z-[120] h-dvh w-full sm:w-[462px] overflow-y-auto bg-panel sm:border-l sm:border-line sm:shadow-2xl pb-12 sm:pb-6 transition-all duration-300 ease-in-out ${
          open
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {selectedVehicle && (
          <>
            {/* Drawer Top Header */}
            <VehicleDrawerHeader
              selectedVehicle={selectedVehicle}
              editing={editing}
              onToggleEdit={() => {
                if (editing) {
                  setEditing(false)
                } else {
                  startEdit()
                }
              }}
              onClose={close}
            />

            {/* Sub-Tabs Selector */}
            <VehicleDrawerTabs
              activeTab={drawerTab}
              onSelectTab={(tabId) => {
                setDrawerTab(tabId)
                setEditing(false)
              }}
            />

            {/* Firmware Updating Progress Banner */}
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

            {/* Editing Form OR Active Tab Content */}
            {editing ? (
              <EditVehicleForm
                editForm={editForm}
                setEditForm={setEditForm}
                selectedVehicle={selectedVehicle}
                onSave={saveEdit}
                onCancel={() => setEditing(false)}
              />
            ) : drawerTab === 'telemetry' ? (
              <LiveTelemetryTab
                selectedVehicle={selectedVehicle}
                meta={meta}
                telemetryLoading={telemetryLoading}
                updatingVehicles={updatingVehicles}
                settings={settings}
                battData={battData}
                mapKey={mapKey}
                setMapKey={setMapKey}
                onOpenFullscreenMap={() => {
                  setHistoryModalOpen(false)
                  setTimelineModalOpen(false)
                  setMapFullscreen(true)
                }}
                onOpenHistoryModal={() => {
                  setMapFullscreen(false)
                  setTimelineModalOpen(false)
                  setHistoryModalOpen(true)
                }}
                onOpenTimelineModal={() => {
                  setMapFullscreen(false)
                  setHistoryModalOpen(false)
                  setTimelineModalOpen(true)
                }}
                timelineEvents={timelineEvents}
                timelineLoading={timelineLoading}
                timelineError={timelineError}
                onRefreshTimeline={loadTimeline}
                openOnMap={openOnMap}
                confirmDelete={confirmDelete}
                setConfirmDelete={setConfirmDelete}
                onDeleteVehicle={deleteVehicle}
              />
            ) : drawerTab === 'specs' ? (
              <BatterySpecsTab selectedVehicle={selectedVehicle} onStartEdit={startEdit} />
            ) : drawerTab === 'compliance' ? (
              <ComplianceDocsTab selectedVehicle={selectedVehicle} />
            ) : drawerTab === 'parking' ? (
              <ParkingTab selectedVehicle={selectedVehicle} />
            ) : drawerTab === 'passport' ? (
              <PassportTab selectedVehicle={selectedVehicle} />
            ) : drawerTab === 'charging' ? (
              <ChargingTab
                selectedVehicle={selectedVehicle}
                chargingFilter={chargingFilter}
                setChargingFilter={setChargingFilter}
                chargingCustomDate={chargingCustomDate}
                setChargingCustomDate={setChargingCustomDate}
                expandedSessionId={expandedSessionId}
                setExpandedSessionId={setExpandedSessionId}
                dateInputRef={dateInputRef}
              />
            ) : drawerTab === 'manage' ? (
              <ManageTab
                selectedVehicle={selectedVehicle}
                onStartEdit={startEdit}
                onDeleteVehicle={deleteVehicle}
              />
            ) : (
              <DriverContactsTab selectedVehicle={selectedVehicle} />
            )}
          </>
        )}
      </aside>

      {/* Expanded Full-Screen Map Overlay */}
      <VehicleFullscreenMap
        open={mapFullscreen}
        selectedVehicle={selectedVehicle}
        mapKey={mapKey}
        onRefreshMap={() => setMapKey((k) => k + 1)}
        onClose={() => setMapFullscreen(false)}
      />

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
