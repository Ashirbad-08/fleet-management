import { useState } from 'react'
import {
  Cpu,
  Zap,
  RotateCw,
  X,
  History,
  Navigation,
  Radio,
  Lock,
  Unlock,
  Activity,
  Thermometer,
  Wifi,
  ArrowRight,
  Clock,
  Share2,
  Clipboard,
  ClipboardCheck,
  Check,
  MapPin,
  ExternalLink,
  TrendingUp,
  Play,
  Pause,
} from '../../icons'
import Gauge from '../../Gauge'
import Sparkline from '../../Sparkline'
import BatterySohCurve from '../BatterySohCurve'
import { seedTrips } from '../../../data/tripsData'
import { useFleet } from '../../../context/FleetContext'

export default function LiveTelemetryTab({
  selectedVehicle,
  meta,
  telemetryLoading,
  updatingVehicles,
  settings,
  battData,
  onSelectTab,
  openOnMap,
  activePlaybackTrip = null,
  onStartPlayback,
  onStopPlayback,
  timelineEvents = [],
  timelineLoading = false,
  timelineError = null,
  onRefreshTimeline,
}) {
  const { refreshTelemetry } = useFleet()
  const [copiedId, setCopiedId] = useState(false)
  const [sharedLocation, setSharedLocation] = useState(false)
  const [showAllTrips, setShowAllTrips] = useState(false)

  const recentEvents = (timelineEvents && timelineEvents.length > 0
    ? timelineEvents
    : [
        {
          id: `evt-1-${selectedVehicle?.id || 'v'}`,
          timestamp: 'Just now',
          eventType: 'HEARTBEAT',
          message: `${selectedVehicle?.deviceId || selectedVehicle?.plate || 'Device'} sent heartbeat telemetry ping via Cellular 4G LTE`,
          severity: 'info',
          color: 'var(--color-green)',
          location: selectedVehicle?.location || 'Pune Depot - Bay 4',
          metadata: `Signal: 94%, Voltage: ${selectedVehicle?.voltageV || 382}V, Temp: ${selectedVehicle?.batteryTempC || 28}°C`,
        },
        {
          id: `evt-2-${selectedVehicle?.id || 'v'}`,
          timestamp: '6 min ago',
          eventType: 'FIRMWARE_CHECK',
          message: 'OTA Firmware integrity verification completed (v2.4.1)',
          severity: 'success',
          color: 'var(--color-accent)',
          location: 'System Gateway',
          metadata: 'Checksum matched (SHA256 verified)',
        },
        {
          id: `evt-3-${selectedVehicle?.id || 'v'}`,
          timestamp: '18 min ago',
          eventType: 'BATTERY_ALERT',
          message: `Battery level report: ${selectedVehicle?.battery || 82}% SoC recorded`,
          severity: Number(selectedVehicle?.battery || 82) < 30 ? 'warning' : 'info',
          color: Number(selectedVehicle?.battery || 82) < 30 ? 'var(--color-amber)' : 'var(--color-accent)',
          location: selectedVehicle?.location || 'In Transit - Sector 12',
          metadata: `Battery temp: ${selectedVehicle?.batteryTempC || 32}°C, Health: ${selectedVehicle?.health || 92}%`,
        },
        {
          id: `evt-4-${selectedVehicle?.id || 'v'}`,
          timestamp: '41 min ago',
          eventType: 'IGNITION_CYCLE',
          message: 'Ignition start cycle recorded by ECU power management',
          severity: 'info',
          color: 'var(--color-gray)',
          location: 'Okhla Yard Charging Bay',
          metadata: `Odometer: ${(selectedVehicle?.odometerKm || 14820).toLocaleString()} km`,
        },
        {
          id: `evt-5-${selectedVehicle?.id || 'v'}`,
          timestamp: '1h 10m ago',
          eventType: 'GEOFENCE_EXIT',
          message: 'Exited designated geofence zone: Okhla Service Yard',
          severity: 'info',
          color: 'var(--color-accent)',
          location: 'Outer Ring Road North',
          metadata: `Speed: ${selectedVehicle?.speedKmh || 42} km/h, Heading: North-West`,
        },
      ]
  ).slice(0, 5)
  const handleOpenGoogleMaps = () => {
    const lat = selectedVehicle.lat
    const lon = selectedVehicle.lon
    const url = lat && lon
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedVehicle.location || selectedVehicle.name)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleCopyId = () => {
    const idText = selectedVehicle.deviceId || selectedVehicle.id
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(idText)
    }
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleShareLocation = async () => {
    const lat = selectedVehicle.lat
    const lon = selectedVehicle.lon
    const mapUrl = lat && lon
      ? `https://www.google.com/maps?q=${lat},${lon}`
      : `${window.location.origin}/geofences?vehicle=${encodeURIComponent(selectedVehicle.id)}`
    
    const shareData = {
      title: `${selectedVehicle.name} (${selectedVehicle.plate}) Live Location`,
      text: `Tracking ${selectedVehicle.name} (${selectedVehicle.plate}) - Speed: ${selectedVehicle.speed || 0} km/h, SoC: ${selectedVehicle.battery}%. Location: ${selectedVehicle.location || 'In Transit'}.`,
      url: mapUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setSharedLocation(true)
        setTimeout(() => setSharedLocation(false), 2000)
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }

    // Fallback: Copy tracking text and link to clipboard
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(`${shareData.text}\n${mapUrl}`)
    }
    setSharedLocation(true)
    setTimeout(() => setSharedLocation(false), 2000)
  }
  return (
    <>
      {/* Battery SoC Gauge Header */}
      {telemetryLoading ? (
        <div className="flex flex-col items-center justify-center border-b border-line-soft bg-panel px-5 py-7 min-h-[14rem] animate-pulse">
          <div className="h-28 w-28 rounded-full border-4 border-panel-2 bg-panel-2/60 flex items-center justify-center">
            <div className="h-7 w-12 rounded bg-panel-2" />
          </div>
          <div className="mt-3 h-5 w-24 rounded-full bg-panel-2" />
          <div className="mt-4 flex w-full max-w-[360px] gap-2">
            <div className="flex-1 h-8 rounded-full bg-panel-2/80" />
            <div className="flex-1 h-8 rounded-full bg-panel-2/80" />
          </div>
        </div>
      ) : (() => {
        const socValue = selectedVehicle.battery ?? 82
        const socColor = socValue > 50 ? 'var(--color-green)' : socValue > 20 ? 'var(--color-amber)' : 'var(--color-red)'
        const rangeDisplay =
          selectedVehicle.rangeKm !== undefined && selectedVehicle.rangeKm !== null
            ? settings?.distanceUnit === 'miles'
              ? `${Math.round(selectedVehicle.rangeKm * 0.621371)} mi`
              : `${selectedVehicle.rangeKm} km`
            : '62 km'

        const healthValue = selectedVehicle.health !== undefined && selectedVehicle.health !== null
          ? Number(selectedVehicle.health)
          : (socValue > 50 ? 91 : 88)
        const healthColor = healthValue >= 80 ? 'text-emerald-400' : healthValue >= 60 ? 'text-amber-400' : 'text-rose-400'

        return (
          <div className="flex flex-col items-center justify-center border-b border-line-soft bg-panel px-5 py-6 min-h-[14rem]">
            {/* Center: Gauge */}
            <Gauge
              score={socValue}
              color={socColor}
              label="STATE OF CHARGE"
              unit="%"
            />

            {/* Vehicle Status Pill */}
            {meta && (
              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full py-0.5 pl-2.5 pr-3 text-[11px] font-semibold ${meta.pill}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                  {meta.label}
                </span>
              </div>
            )}

            {/* Bottom Row: Est Range & Battery Health */}
            <div className="mt-3.5 flex w-full max-w-[360px] items-center justify-center gap-2">
              {/* Left: Est. Range */}
              <div className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-line-soft bg-panel-2 px-3 py-1.5 font-mono text-[11.5px] text-lo shadow-xs">
                <Zap className="h-3.5 w-3.5 text-accent shrink-0" strokeWidth={2.5} />
                <span className="font-bold text-hi tabular-nums">{rangeDisplay}</span>
                <span className="text-dim text-[10.5px]">est range</span>
              </div>

              {/* Right: Battery Health */}
              <div className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-line-soft bg-panel-2 px-3 py-1.5 font-mono text-[11.5px] text-lo shadow-xs">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" strokeWidth={2.5} />
                <span className={`font-bold tabular-nums ${healthColor}`}>{healthValue}%</span>
                <span className="text-dim text-[10.5px]">battery health</span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Categorized Diagnostic Cards (Option 1) */}
      {telemetryLoading ? (
        <div className="space-y-3 p-4 bg-panel-2/20 border-b border-line-soft animate-pulse">
          {Array.from({ length: 3 }).map((_, c) => (
            <div key={`skel-card-${c}`} className="rounded-xl border border-line-soft bg-panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-4 py-2">
                <div className="h-3.5 w-32 rounded bg-panel-2" />
                <div className="h-3 w-16 rounded bg-panel-2/60" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line-soft">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`skel-cell-${c}-${i}`} className="bg-panel p-3 space-y-1.5">
                    <div className="h-2.5 w-14 rounded bg-panel-2" />
                    <div className="h-4 w-20 rounded bg-panel-2/70" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (() => {
        const volts = Number(selectedVehicle.voltageV) || 356
        const amps = Number(selectedVehicle.currentA) || 48
        const powerKw = ((volts * amps) / 1000).toFixed(1)

        const tempC = selectedVehicle.batteryTempC ?? 31
        const tempDisplay =
          settings?.tempUnit === 'Fahrenheit'
            ? `${Math.round((tempC * 9) / 5 + 32)}°F`
            : `${tempC}°C`
        const tempStatus = tempC > 45 ? 'High' : tempC > 38 ? 'Warm' : 'Optimal'
        const tempColor = tempC > 45 ? 'text-rose-400 bg-rose-500/15' : 'text-emerald-400 bg-emerald-500/15'

        const speedDisplay =
          settings?.speedUnit === 'mph'
            ? `${Math.round((selectedVehicle.speed || 0) * 0.621371)} mph`
            : `${selectedVehicle.speed || 0} km/h`

        const odoDisplay =
          settings?.distanceUnit === 'miles'
            ? `${Math.round((selectedVehicle.odometerKm ?? 0) * 0.621371).toLocaleString('en-IN')} mi`
            : `${Math.round(selectedVehicle.odometerKm ?? 0).toLocaleString('en-IN')} km`

        const rangeDisplay =
          selectedVehicle.rangeKm !== undefined && selectedVehicle.rangeKm !== null
            ? settings?.distanceUnit === 'miles'
              ? `${Math.round(selectedVehicle.rangeKm * 0.621371)} mi`
              : `${selectedVehicle.rangeKm} km`
            : '45 km'

        const signalBars = Number(selectedVehicle.signal) || 4

        return (
          <div className="space-y-3 p-4 bg-panel-2/20 border-b border-line-soft">
            {/* 1. Powertrain & Electrical Card */}
            <div className="rounded-xl border border-line-soft bg-panel overflow-hidden shadow-xs">
              <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/40 px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-xs">
                    <Zap className="h-3 w-3" strokeWidth={2.4} />
                  </span>
                  <span className="font-display text-[11.5px] font-bold text-hi">
                    Powertrain & Electrical
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-amber-300">
                  ⚡ {powerKw} kW Live
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line-soft/80">
                <div className="bg-panel p-3 hover:bg-panel-2/30 transition-colors">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">Pack Voltage</div>
                  <div className="mt-1 font-mono text-[13px] font-bold text-hi tabular-nums">{volts} V</div>
                </div>
                <div className="bg-panel p-3 hover:bg-panel-2/30 transition-colors">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">Live Current</div>
                  <div className="mt-1 font-mono text-[13px] font-bold text-hi tabular-nums">{amps} A</div>
                </div>
                <div className="bg-panel p-3 hover:bg-panel-2/30 transition-colors">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">Power Output</div>
                  <div className="mt-1 font-mono text-[13px] font-bold text-amber-400 tabular-nums">{powerKw} kW</div>
                </div>
                <div className="bg-panel p-3 hover:bg-panel-2/30 transition-colors">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">Pack Temp</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-[13px] font-bold text-hi tabular-nums">{tempDisplay}</span>
                    <span className={`rounded px-1.5 py-0.25 font-mono text-[9px] font-semibold ${tempColor}`}>
                      {tempStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Vehicle Dynamics & Motion Card */}
            <div className="rounded-xl border border-line-soft bg-panel overflow-hidden shadow-xs">
              <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/40 px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-accent shadow-xs">
                    <Activity className="h-3 w-3" strokeWidth={2.4} />
                  </span>
                  <span className="font-display text-[11.5px] font-bold text-hi">
                    Dynamics & Kinematics
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium ${
                  (selectedVehicle.speed || 0) > 0
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-line-soft bg-panel-2 text-dim'
                }`}>
                  {(selectedVehicle.speed || 0) > 0 ? '🟢 In Transit' : '🅿️ Stationary'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line-soft/80">
                <div className="bg-panel p-3 hover:bg-panel-2/30 transition-colors">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">Live Speed</div>
                  <div className="mt-1 font-mono text-[13px] font-bold text-hi tabular-nums">{speedDisplay}</div>
                </div>
                <div className="bg-panel p-3 hover:bg-panel-2/30 transition-colors">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">Odometer</div>
                  <div className="mt-1 font-mono text-[13px] font-bold text-hi tabular-nums">{odoDisplay}</div>
                </div>
                <div className="bg-panel p-3 hover:bg-panel-2/30 transition-colors">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">Est. Range</div>
                  <div className="mt-1 font-mono text-[13px] font-bold text-accent tabular-nums">{rangeDisplay}</div>
                </div>
                <div className="bg-panel p-3 hover:bg-panel-2/30 transition-colors">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">Lock Security</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    {selectedVehicle.locked ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[12px] font-bold text-emerald-400">
                        <Lock className="h-3 w-3" strokeWidth={2.5} /> Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[12px] font-bold text-amber-400">
                        <Unlock className="h-3 w-3" strokeWidth={2.5} /> Unlocked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Telematics & Hardware Link Card */}
            <div className="rounded-xl border border-line-soft bg-panel overflow-hidden shadow-xs">
              <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/40 px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-xs">
                    <Radio className="h-3 w-3" strokeWidth={2.4} />
                  </span>
                  <span className="font-display text-[11.5px] font-bold text-hi">
                    Telematics & Device Link
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Stream
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line-soft/80">
                <div className="bg-panel p-3 hover:bg-panel-2/30 transition-colors">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">Device ID</div>
                  <div className="mt-1 font-mono text-[12.5px] font-bold text-hi truncate" title={selectedVehicle.deviceId}>
                    {selectedVehicle.deviceId || '—'}
                  </div>
                </div>
                <div className="bg-panel p-3 hover:bg-panel-2/30 transition-colors">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">Firmware</div>
                  <div className="mt-1 font-mono text-[12.5px] font-bold text-hi truncate">
                    {updatingVehicles[selectedVehicle.id] !== undefined
                      ? `Updating (${updatingVehicles[selectedVehicle.id]}%)`
                      : `v${selectedVehicle.firmware || '2.4.0'}`}
                  </div>
                </div>
                <div className="bg-panel p-3 hover:bg-panel-2/30 transition-colors">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">Cellular Signal</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="flex items-end gap-0.5 h-3">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div
                          key={bar}
                          style={{ height: `${bar * 20}%` }}
                          className={`w-1 rounded-xs ${
                            bar <= signalBars ? 'bg-emerald-400' : 'bg-line-soft'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[11.5px] font-bold text-hi">{signalBars}/5</span>
                  </div>
                </div>
                <div className="bg-panel p-3 hover:bg-panel-2/30 transition-colors">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">Last Telemetry</div>
                  <div className="mt-1 font-mono text-[12px] font-medium text-lo truncate">
                    {selectedVehicle.lastSeen || 'Just now'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 24 Hours Battery Trend */}
      {telemetryLoading ? (
        <div className="animate-pulse">
          <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
            <div className="h-3.5 w-32 rounded bg-panel-2" />
            <div className="h-3 w-20 rounded bg-panel-2/60" />
          </div>
          <div className="border-b border-line-soft px-5 py-5 bg-panel">
            <div className="h-12 w-full rounded bg-panel-2/50" />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-hi">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-amber/15 text-amber">
                <Zap className="h-2.5 w-2.5" strokeWidth={2.5} />
              </span>
              <span>24 Hours Battery Trend</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
              <span className="rounded bg-panel px-1.5 py-0.5 text-dim border border-line-soft text-[10.5px]">
                24 Hours
              </span>
              <span className="font-bold text-amber tabular-nums">
                {selectedVehicle.battery}% Current
              </span>
            </div>
          </div>
          <div className="border-b border-line-soft px-5 py-3.5 bg-panel">
            <Sparkline data={battData} color={meta?.color || 'var(--color-amber)'} />
          </div>
        </div>
      )}

      {/* Battery SoH & Degradation Curve (Card A) */}
      <BatterySohCurve selectedVehicle={selectedVehicle} />

     

      {/* Trips Section (Inline & Expandable) */}
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
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-hi">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-accent/15 text-accent">
                <History className="h-2.5 w-2.5" strokeWidth={2.5} />
              </span>
              <span>Trips History</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9.5px] text-dim uppercase">{seedTrips.length} Total Trips</span>
              <button
                type="button"
                onClick={() => onSelectTab?.('trips')}
                className="text-[10px] text-accent font-semibold hover:underline cursor-pointer"
              >
                Open Tab →
              </button>
            </div>
          </div>

          <div className="border-b border-line-soft px-5 py-3 bg-panel-2/15 space-y-2">
            {/* Trips List - Top 3 or Full Expanded */}
            <div className="space-y-2">
              {(showAllTrips ? seedTrips : seedTrips.slice(0, 3)).map((trip, idx) => (
                <div
                  key={trip.id || idx}
                  className="rounded-lg border border-line-soft/70 bg-panel p-2.5 transition-all hover:border-line hover:bg-panel-2/40 shadow-2xs"
                >
                  {/* Row 1: Trip ID, Badge, Timestamp & Battery Delta */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-[12.5px] font-bold text-hi">
                        {trip.tripNumber}
                      </span>
                      {idx === 0 && (
                        <span className="rounded bg-accent/15 px-1.5 py-0.25 font-mono text-[9px] font-bold text-accent border border-accent/25">
                          Latest
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px] tabular-nums">
                      <span className="text-dim">{trip.time}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const isThisTripPlaying = Boolean(
                            activePlaybackTrip &&
                              (activePlaybackTrip.id === trip.id || activePlaybackTrip.tripNumber === trip.tripNumber)
                          )
                          if (isThisTripPlaying) {
                            onStopPlayback?.()
                          } else {
                            onStartPlayback?.(trip)
                          }
                        }}
                        title="Route Playback on Map"
                        aria-label="Route Playback on Map"
                        className={`flex h-5 w-5 items-center justify-center rounded border transition-all cursor-pointer ${
                          activePlaybackTrip &&
                          (activePlaybackTrip.id === trip.id || activePlaybackTrip.tripNumber === trip.tripNumber)
                            ? 'border-accent bg-accent text-black font-bold shadow-xs'
                            : 'border-line-soft bg-panel-2 text-lo hover:border-accent/40 hover:bg-accent/15 hover:text-accent'
                        }`}
                      >
                        {activePlaybackTrip &&
                        (activePlaybackTrip.id === trip.id || activePlaybackTrip.tripNumber === trip.tripNumber) ? (
                          <Pause className="h-2.5 w-2.5 fill-current" />
                        ) : (
                          <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                        )}
                      </button>
                      {trip.batteryUsed && (
                        <span className="text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.25 rounded border border-emerald-500/20">
                          {trip.batteryUsed}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Route Origin -> Destination */}
                  <div className="flex items-center gap-1.5 text-[11px] text-lo mb-1.5 truncate">
                    <span className="text-hi font-medium truncate">{trip.from}</span>
                    <ArrowRight className="h-2.5 w-2.5 text-accent shrink-0" strokeWidth={2} />
                    <span className="text-accent font-medium truncate">{trip.to}</span>
                  </div>

                  {/* Row 3: Minimalist Metrics Line */}
                  <div className="flex items-center gap-2 font-mono text-[9.5px] text-dim border-t border-line-soft/40 pt-1.5">
                    <span className="text-hi font-semibold">{trip.distance}</span>
                    <span className="text-line-soft">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {trip.duration}
                    </span>
                    {trip.avgSpeed && (
                      <>
                        <span className="text-line-soft">·</span>
                        <span>Avg {trip.avgSpeed}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-1">
              {/* <button
                type="button"
                onClick={() => setShowAllTrips((prev) => !prev)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-line bg-panel py-2 text-[11.5px] font-semibold text-lo hover:text-hi hover:bg-hover transition-all cursor-pointer shadow-2xs"
              >
                <span>{showAllTrips ? 'Show Less (3 Trips)' : `Show All ${seedTrips.length} Trips Inline`}</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab?.('trips')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-[11.5px] font-semibold text-accent hover:bg-accent/20 transition-all cursor-pointer shadow-xs"
              >
                <History className="h-3 w-3" />
                <span>Full Trips Tab</span>
              </button> */}
            </div>
          </div>
        </div>
      )}
       {/* 5 Recent Timeline Events */}
      <div data-component="RecentTimelineSection" data-slot="recent-timeline">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-hi">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-accent/15 text-accent">
              <Radio className="h-2.5 w-2.5" strokeWidth={2.5} />
            </span>
            <span>Recent Timeline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9.5px] text-dim uppercase">5 Recent Events</span>
            {onRefreshTimeline && (
              <button
                type="button"
                data-action="refresh-timeline"
                onClick={onRefreshTimeline}
                disabled={timelineLoading}
                title="Refresh timeline events"
                className="flex h-5 w-5 items-center justify-center rounded border border-line-soft bg-panel text-dim hover:text-accent hover:border-accent/40 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`h-2.5 w-2.5 ${timelineLoading ? 'animate-spin text-accent' : ''}`} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        <div className="border-b border-line-soft px-5 py-3 bg-panel-2/15 space-y-2">
          {timelineLoading && (!timelineEvents || timelineEvents.length === 0) ? (
            <div className="space-y-2 py-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2.5 animate-pulse p-2.5 rounded-lg bg-panel border border-line-soft">
                  <div className="mt-1 h-2 w-2 rounded-full bg-line-soft" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-1/3 rounded bg-line-soft" />
                    <div className="h-2.5 w-2/3 rounded bg-line-soft/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            recentEvents.map((evt, idx) => {
              const sevBadge =
                evt.severity === 'critical'
                  ? 'bg-red/15 text-red border-red/30'
                  : evt.severity === 'warning'
                    ? 'bg-amber/15 text-amber border-amber/30'
                    : evt.severity === 'success'
                      ? 'bg-green/15 text-green border-green/30'
                      : 'bg-accent/15 text-accent border-accent/30'

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
                  key={evt.id || idx}
                  className="rounded-lg border border-line-soft/80 bg-panel p-2.5 transition-all hover:border-line hover:bg-panel-2/40 shadow-2xs"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full shadow-xs"
                      style={{ background: evt.color || sevColor }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider border ${sevBadge}`}>
                          {evt.eventType}
                        </span>
                        <span className="font-mono text-[10px] text-dim tabular-nums">
                          {evt.timestamp}
                        </span>
                      </div>
                      <div className="text-[11.5px] font-medium leading-snug text-hi">
                        {evt.message}
                      </div>
                      {(evt.location || evt.metadata) && (
                        <div className="mt-1 font-mono text-[10px] text-dim flex flex-wrap items-center justify-between gap-1 border-t border-line-soft/40 pt-1">
                          <span className="truncate max-w-[240px]">{evt.metadata}</span>
                          {evt.location && (
                            <span className="text-accent font-medium shrink-0 flex items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5" />
                              {evt.location}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-hi">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-accent/15 text-accent">
              <Zap className="h-2.5 w-2.5" strokeWidth={2.5} />
            </span>
            <span>Quick Actions</span>
          </div>
          <span className="font-mono text-[9.5px] text-dim uppercase">Utilities</span>
        </div>

        <div className="p-4 bg-panel border-b border-line-soft">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleOpenGoogleMaps}
              title="Open location in Google Maps"
              className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-line bg-panel-2 p-3 text-[11px] font-semibold text-hi hover:border-emerald-500/40 hover:bg-hover hover:text-emerald-400 transition-all cursor-pointer text-center"
            >
              <MapPin className="h-4 w-4 text-emerald-400" strokeWidth={2} />
              <span className="flex items-center gap-0.5">
                Google Maps
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </span>
            </button>

            <button
              type="button"
              onClick={handleCopyId}
              title="Copy Device ID to clipboard"
              className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-[11px] font-semibold transition-all cursor-pointer text-center ${
                copiedId
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-line bg-panel-2 text-hi hover:border-accent/40 hover:bg-hover hover:text-accent'
              }`}
            >
              {copiedId ? (
                <ClipboardCheck className="h-4 w-4 text-emerald-400" strokeWidth={2} />
              ) : (
                <Clipboard className="h-4 w-4 text-lo" strokeWidth={2} />
              )}
              <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareLocation}
              title="Share live vehicle link and stats"
              className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-[11px] font-semibold transition-all cursor-pointer text-center ${
                sharedLocation
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-line bg-panel-2 text-hi hover:border-accent/40 hover:bg-hover hover:text-accent'
              }`}
            >
              {sharedLocation ? (
                <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} />
              ) : (
                <Share2 className="h-4 w-4 text-accent" strokeWidth={2} />
              )}
              <span>{sharedLocation ? 'Shared!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
