import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFleet } from '../context/FleetContext'
import { STATUS_META } from '../data/statusMeta'
import { fetchTimelineDetailsByIMEI } from '../services/api'
import { seedTrips } from '../data/tripsData'
import { Map, FileText } from './icons'

// Modular Vehicle Drawer subcomponents
import VehicleDrawerHeader from './vehicle-drawer/VehicleDrawerHeader'
import VehicleDrawerTabs from './vehicle-drawer/VehicleDrawerTabs'
import EditVehicleForm from './vehicle-drawer/EditVehicleForm'
import VehicleLeftMap from './vehicle-drawer/VehicleLeftMap'
import LiveTelemetryTab from './vehicle-drawer/tabs/LiveTelemetryTab'
import TripsTab from './vehicle-drawer/tabs/TripsTab'
import TimelineTab from './vehicle-drawer/tabs/TimelineTab'
import BatterySpecsTab from './vehicle-drawer/tabs/BatterySpecsTab'
import PassportTab from './vehicle-drawer/tabs/PassportTab'
import ChargingTab from './vehicle-drawer/tabs/ChargingTab'
import ComplianceDocsTab from './vehicle-drawer/tabs/ComplianceDocsTab'
import ParkingTab from './vehicle-drawer/tabs/ParkingTab'
import DriverContactsTab from './vehicle-drawer/tabs/DriverContactsTab'
import ManageTab from './vehicle-drawer/tabs/ManageTab'

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
    refreshTelemetry,
  } = useFleet()
  const navigate = useNavigate()
  const open = Boolean(selectedVehicle)

  // Drawer Tabs: 'telemetry' | 'trips' | 'timeline' | 'specs' | 'passport' | 'charging' | 'compliance' | 'contacts' | 'parking' | 'manage'
  const [drawerTab, setDrawerTab] = useState('telemetry')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Mobile View Toggle: 'drawer' | 'map'
  const [mobileTab, setMobileTab] = useState('drawer')
  // Left Map Pane toggle: user can close map and keep drawer open
  const [showMap, setShowMap] = useState(true)
  // Active Route Playback trip object
  const [activePlaybackTrip, setActivePlaybackTrip] = useState(null)

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
      setMobileTab('drawer')
      setShowMap(true)
      setActivePlaybackTrip(null)
      loadTimeline()
    }
  }, [selectedVehicle?.id, loadTimeline])

  const close = () => {
    setSelectedVehicleId(null)
    setEditing(false)
    setConfirmDelete(false)
    setChargingFilter('today')
    setChargingCustomDate('')
    setExpandedSessionId(null)
    setDrawerTab('telemetry')
    setMobileTab('drawer')
    setShowMap(true)
    setActivePlaybackTrip(null)
  }

  const handleCloseMap = () => {
    setShowMap(false)
    setMobileTab('drawer')
  }

  const handleToggleMap = () => {
    setShowMap((prev) => {
      const next = !prev
      if (next && typeof window !== 'undefined' && window.innerWidth < 640) {
        setMobileTab('map')
      }
      return next
    })
  }

  const handleStartPlayback = (trip) => {
    setActivePlaybackTrip(trip)
    setShowMap(true)
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setMobileTab('map')
    }
  }

  const handleStopPlayback = () => {
    setActivePlaybackTrip(null)
  }

  // Handle Escape key to close smoothly
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        e.stopPropagation()
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [open])

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
      simNumber: selectedVehicle.simNumber ?? '',
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
      simNumber: editForm.simNumber,
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
      {/* 1. Fullscreen Live Map on the Left Side of the Vehicle Drawer */}
      {open && selectedVehicle && showMap && (
        <div
          style={{
            position: 'fixed',
            top: '10px',
            bottom: '10px',
            left: '10px',
            right: 'calc(462px + 10px)',
            zIndex: 110,
          }}
          className="hidden sm:flex flex-col bg-base overflow-hidden border border-line rounded-xl shadow-2xl"
        >
          <VehicleLeftMap
            selectedVehicle={selectedVehicle}
            onClose={handleCloseMap}
            onRefresh={refreshTelemetry}
            activePlaybackTrip={activePlaybackTrip}
            onStopPlayback={handleStopPlayback}
          />
        </div>
      )}

      {/* Backdrop overlay behind drawer and map */}
      {open && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={close}
          className={`hidden sm:block fixed inset-0 transition-opacity cursor-pointer ${
            showMap ? 'z-[105] bg-black/60 backdrop-blur-xs' : 'z-[115] bg-black/40 backdrop-blur-[2px]'
          }`}
        />
      )}

      {/* Mobile Map View when mobileTab === 'map' */}
      {open && selectedVehicle && mobileTab === 'map' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 125,
          }}
          className="flex sm:hidden flex-col bg-base overflow-hidden"
        >
          <VehicleLeftMap
            selectedVehicle={selectedVehicle}
            onClose={handleCloseMap}
            onRefresh={refreshTelemetry}
            activePlaybackTrip={activePlaybackTrip}
            onStopPlayback={handleStopPlayback}
          />
        </div>
      )}

      {/* 2. Main Vehicle Drawer on the Right */}
      <aside
        role="dialog"
        aria-label="Vehicle Details & Controls"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '462px',
          position: 'fixed',
          top: 0,
          bottom: 0,
          right: 0,
          zIndex: 120,
        }}
        className={`h-dvh max-w-full overflow-y-auto bg-panel sm:border-l sm:border-line sm:shadow-2xl pb-12 sm:pb-6 transition-all duration-300 ease-in-out ${
          open
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : 'translate-x-full opacity-0 pointer-events-none'
        } ${mobileTab === 'map' ? 'hidden sm:block' : 'block'}`}
      >
        {selectedVehicle && (
          <>
            {/* Drawer Top Header */}
            <VehicleDrawerHeader
              selectedVehicle={selectedVehicle}
              editing={editing}
              showMap={showMap}
              onToggleMap={handleToggleMap}
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
              tripsCount={seedTrips.length}
              timelineCount={timelineEvents.length || 10}
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
            ) : (
              <>
                <div style={{ display: drawerTab === 'telemetry' ? 'block' : 'none' }}>
                  <LiveTelemetryTab
                    selectedVehicle={selectedVehicle}
                    meta={meta}
                    telemetryLoading={telemetryLoading}
                    updatingVehicles={updatingVehicles}
                    settings={settings}
                    battData={battData}
                    onSelectTab={setDrawerTab}
                    timelineEvents={timelineEvents}
                    timelineLoading={timelineLoading}
                    timelineError={timelineError}
                    onRefreshTimeline={loadTimeline}
                    openOnMap={openOnMap}
                    confirmDelete={confirmDelete}
                    setConfirmDelete={setConfirmDelete}
                    onDeleteVehicle={deleteVehicle}
                    activePlaybackTrip={activePlaybackTrip}
                    onStartPlayback={handleStartPlayback}
                    onStopPlayback={handleStopPlayback}
                  />
                </div>

                {drawerTab === 'trips' && (
                  <TripsTab
                    vehicle={selectedVehicle}
                    trips={seedTrips}
                    activePlaybackTrip={activePlaybackTrip}
                    onStartPlayback={handleStartPlayback}
                    onStopPlayback={handleStopPlayback}
                  />
                )}

                {drawerTab === 'timeline' && (
                  <TimelineTab
                    vehicle={selectedVehicle}
                    events={timelineEvents}
                    onRefresh={loadTimeline}
                    loading={timelineLoading}
                    error={timelineError}
                  />
                )}

                {drawerTab === 'specs' && (
                  <BatterySpecsTab selectedVehicle={selectedVehicle} onStartEdit={startEdit} />
                )}
                {drawerTab === 'charging' && (
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
                )}
                {drawerTab === 'parking' && (
                  <ParkingTab selectedVehicle={selectedVehicle} />
                )}
                {drawerTab === 'compliance' && (
                  <ComplianceDocsTab selectedVehicle={selectedVehicle} />
                )}
                {drawerTab === 'passport' && (
                  <PassportTab selectedVehicle={selectedVehicle} />
                )}
                {drawerTab === 'contacts' && (
                  <DriverContactsTab selectedVehicle={selectedVehicle} />
                )}
                {drawerTab === 'manage' && (
                  <ManageTab
                    selectedVehicle={selectedVehicle}
                    onStartEdit={startEdit}
                    onDeleteVehicle={deleteVehicle}
                  />
                )}
              </>
            )}
          </>
        )}
      </aside>

      {/* Mobile Floating View Switcher: Quick toggle between Map & Details on small viewports */}
      {open && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[130] flex sm:hidden items-center rounded-full border border-line bg-panel-2/95 p-1 backdrop-blur-md shadow-2xl">
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              mobileTab === 'map'
                ? 'bg-accent text-black shadow-xs font-bold'
                : 'text-lo hover:text-hi'
            }`}
          >
            <Map className="h-3.5 w-3.5" />
            <span>Live Map</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('drawer')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              mobileTab === 'drawer'
                ? 'bg-accent text-black shadow-xs font-bold'
                : 'text-lo hover:text-hi'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Vehicle Info</span>
          </button>
        </div>
      )}
    </>
  )
}
