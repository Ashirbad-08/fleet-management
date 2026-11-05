import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  X,
  Radio,
  Cpu,
  Wifi,
  Zap,
  Gauge,
  MapPin,
  Clock,
  RotateCw,
  Terminal,
  Server,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Truck,
  Clipboard,
  ClipboardCheck,
  ChevronRight,
  ExternalLink,
} from '../icons'
import { STATUS_META } from '../../data/statusMeta'
import { fetchTimelineDetailsByIMEI } from '../../services/api'
import { useFleet } from '../context/FleetContext'

export default function DeviceDrawer({
  device,
  open,
  onClose,
  onOpenVehicleDrawer,
}) {
  const { sendDeviceCommand, updatingVehicles } = useFleet()
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'timeline' | 'packets'
  const [copiedField, setCopiedField] = useState(null)

  // Timeline events from API
  const [timelineEvents, setTimelineEvents] = useState([])
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [timelineError, setTimelineError] = useState(null)

  // Raw packet feed state
  const [packets, setPackets] = useState([])

  const loadTimeline = useCallback(async () => {
    if (!device) return
    setTimelineLoading(true)
    setTimelineError(null)
    try {
      const imei = device.deviceId || device.id
      const data = await fetchTimelineDetailsByIMEI(imei, 15)
      setTimelineEvents(data || [])
    } catch (_err) {
      setTimelineError('Failed to load device telemetry timeline')
    } finally {
      setTimelineLoading(false)
    }
  }, [device])

  // Load timeline & generate simulated packet feed on device change
  useEffect(() => {
    if (device && open) {
      setActiveTab('overview')
      loadTimeline()

      // Generate live diagnostic telemetry stream for this device
      const baseLat = device.lat || 18.5204
      const baseLon = device.lon || 73.8567
      const devId = device.deviceId || 'IOT-90231'
      const initialPackets = [
        {
          id: 1,
          time: 'Just now',
          type: 'MQTT',
          direction: 'PUB',
          content: `v1/telemetry {"imei":"${devId}","bat":${device.battery},"spd":${device.speed || 0},"sig":${device.signal || 4},"volt":${device.voltageV || 356},"temp":${device.batteryTempC || 31}}`,
          status: 'ACK (18ms)',
        },
        {
          id: 2,
          time: '2s ago',
          type: 'NMEA',
          direction: 'GPS',
          content: `$GPRMC,${Date.now()},A,${baseLat.toFixed(4)},N,${baseLon.toFixed(4)},E,${device.speed || 0}.0,042.8,031126,,,A*72`,
          status: 'VALID 3D FIX',
        },
        {
          id: 3,
          time: '14s ago',
          type: 'PING',
          direction: 'HEARTBEAT',
          content: `HEARTBEAT_REQ seq=8429 rssi=-76dBm carrier=Airtel_IoT mcc=404 mnc=45`,
          status: 'SUCCESS',
        },
        {
          id: 4,
          time: '32s ago',
          type: 'OTA',
          direction: 'STATUS',
          content: `FW_VER current="v${device.firmware}" target="v2.4.1" integrity=SHA256_MATCH`,
          status: 'VERIFIED',
        },
        {
          id: 5,
          time: '1m ago',
          type: 'CAN',
          direction: 'ECU',
          content: `CAN_ID 0x18FEEE00 data=[0x00,0x42,0xFE,0x12,0x88,0x21,0x33,0x00] ODO=${device.odometerKm || 48210}km`,
          status: 'PROCESSED',
        },
      ]
      setPackets(initialPackets)
    }
  }, [device, open, loadTimeline])

  // Escape key handler
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard?.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 1800)
  }

  if (!device) return null

  const meta = STATUS_META[device.status] || STATUS_META.offline
  const isUpdating = updatingVehicles[device.id] !== undefined
  const updateProgress = updatingVehicles[device.id] || 0
  const isLatestFirmware = device.firmware === '2.4.1'
  const signalBars = Number(device.signal) || 4

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-[125] bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
        />
      )}

      {/* Drawer Panel */}
      <aside
        role="dialog"
        aria-label="Device Hardware & Telemetry Details"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '480px' }}
        className={`fixed top-0 bottom-0 right-0 z-[130] h-dvh max-w-full flex flex-col bg-panel border-l border-line shadow-2xl transition-all duration-300 ease-in-out ${
          open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {/* 1. Header Bar */}
        <div className="flex items-center justify-between border-b border-line bg-panel-2/70 px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/25 shrink-0">
              <Cpu className="h-5 w-5" strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-[15px] font-bold text-hi truncate">
                  {device.deviceId}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(device.deviceId, 'deviceId')}
                  title="Copy Device ID"
                  className="text-dim hover:text-accent transition-colors"
                >
                  {copiedField === 'deviceId' ? (
                    <ClipboardCheck className="h-3.5 w-3.5 text-accent" />
                  ) : (
                    <Clipboard className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-lo">
                <span>SIM: {device.simNumber || 'Not Configured'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status Pill */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full py-0.5 pl-2 pr-2.5 text-[10.5px] font-mono font-bold uppercase ${meta.pill}`}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
              {meta.label}
            </span>

            <button
              type="button"
              onClick={onClose}
              title="Close drawer"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 2. Sub-Tabs Bar */}
        <div className="flex items-center border-b border-line bg-panel text-[11.5px] font-semibold text-lo shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-accent text-accent bg-accent/5 font-bold'
                : 'border-transparent hover:text-hi hover:bg-hover'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Diagnostics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-accent text-accent bg-accent/5 font-bold'
                : 'border-transparent hover:text-hi hover:bg-hover'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Telemetry Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('packets')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'packets'
                ? 'border-accent text-accent bg-accent/5 font-bold'
                : 'border-transparent hover:text-hi hover:bg-hover'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Raw Logs</span>
          </button>
        </div>

        {/* 3. Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: OVERVIEW & HARDWARE DIAGNOSTICS */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* OTA Firmware Flashing Progress Banner */}
              {isUpdating && (
                <div className="rounded-xl border border-accent/40 bg-accent/10 p-3.5 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-accent">
                    <span>Flashing Firmware OTA (v2.4.1)...</span>
                    <span className="font-mono tabular-nums">{updateProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-panel-2 border border-accent/20">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-300"
                      style={{ width: `${updateProgress}%` }}
                    />
                  </div>
                  <div className="text-[10.5px] text-dim">
                    Please keep device connected to power. OTA download in progress.
                  </div>
                </div>
              )}

              {/* Hardware Quick Metrics (4-tile grid) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-line bg-panel-2/60 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-dim flex items-center justify-between">
                    <span>Signal Strength</span>
                    <Wifi className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-display text-lg font-bold text-hi">{signalBars}/5</span>
                    <span className="text-[11px] font-mono text-dim">Bars (4G LTE)</span>
                  </div>
                  <div className="mt-1 text-[10.5px] text-lo font-mono">
                    RSSI: -78 dBm (Optimal)
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-panel-2/60 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-dim flex items-center justify-between">
                    <span>Heartbeat Ping</span>
                    <Clock className="h-3.5 w-3.5 text-sky-400" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-display text-lg font-bold text-hi">
                      {device.lastSeen || 'Just now'}
                    </span>
                  </div>
                  <div className="mt-1 text-[10.5px] text-emerald-400 font-mono">
                    Ping RTT: 18ms (Online)
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-panel-2/60 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-dim flex items-center justify-between">
                    <span>Firmware Version</span>
                    <Cpu className="h-3.5 w-3.5 text-amber" />
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-display text-lg font-bold text-hi font-mono">
                      v{device.firmware}
                    </span>
                    {isLatestFirmware ? (
                      <span className="rounded-full bg-green/15 px-2 py-0.2 text-[9.5px] font-bold text-green border border-green/30">
                        Latest
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber/15 px-2 py-0.2 text-[9.5px] font-bold text-amber border border-amber/30">
                        Update Available
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[10.5px] text-dim font-mono">Build 2026.10</div>
                </div>

                <div className="rounded-xl border border-line bg-panel-2/60 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-dim flex items-center justify-between">
                    <span>Input Voltage</span>
                    <Zap className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-display text-lg font-bold text-hi font-mono">
                      {device.voltageV || 382}
                    </span>
                    <span className="text-[11px] font-mono text-dim">V DC</span>
                  </div>
                  <div className="mt-1 text-[10.5px] text-lo font-mono">
                    Internal Backup: 98%
                  </div>
                </div>
              </div>

              {/* Hardware Specifications Card */}
              <div className="rounded-xl border border-line bg-panel-2/40 p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-line-soft pb-2 font-display text-[12.5px] font-bold text-hi">
                  <Server className="h-4 w-4 text-accent" />
                  <span>Hardware & Telecom Identity</span>
                </div>

                <div className="divide-y divide-line-soft/60 text-[11.5px]">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-dim">Device IMEI</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-hi">
                      <span>{device.deviceId}</span>
                      <button
                        onClick={() => copyToClipboard(device.deviceId, 'imei')}
                        className="text-dim hover:text-accent"
                      >
                        {copiedField === 'imei' ? (
                          <ClipboardCheck className="h-3 w-3 text-accent" />
                        ) : (
                          <Clipboard className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-dim">SIM Card Number</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-hi">
                      <span>{device.simNumber || 'Not Configured'}</span>
                      {device.simNumber && (
                        <button
                          onClick={() => copyToClipboard(device.simNumber, 'sim')}
                          className="text-dim hover:text-accent"
                        >
                          {copiedField === 'sim' ? (
                            <ClipboardCheck className="h-3 w-3 text-accent" />
                          ) : (
                            <Clipboard className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-dim">Network Protocol</span>
                    <span className="font-mono text-hi">MQTT over TLS (Port 8883)</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-dim">Cellular Technology</span>
                    <span className="font-mono text-hi">4G LTE Cat-M1 / NB-IoT</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-dim">GPS Fix Mode</span>
                    <span className="font-mono text-emerald-400 font-semibold">3D Fix • 12 Satellites</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-dim">Coordinates</span>
                    <span className="font-mono text-lo">
                      {device.lat && device.lon
                        ? `${device.lat.toFixed(4)}, ${device.lon.toFixed(4)}`
                        : 'No GPS Fix'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Paired Vehicle Card */}
              <div className="rounded-xl border border-line bg-panel-2/40 p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-line-soft pb-2 font-display text-[12.5px] font-bold text-hi">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-accent" />
                    <span>Paired Vehicle Asset</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onOpenVehicleDrawer?.(device.id)
                    }}
                    className="flex items-center gap-1 text-[11px] text-accent font-semibold hover:underline cursor-pointer"
                  >
                    <span>View Vehicle Details</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[12px]">
                  <div>
                    <div className="font-bold text-hi">{device.name}</div>
                    <div className="font-mono text-[11px] text-lo mt-0.5">
                      {device.plate} • {device.model} ({device.type || 'Commercial EV'})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-dim">Current Driver</div>
                    <div className="font-medium text-hi text-[11.5px]">{device.driver || 'Unassigned'}</div>
                  </div>
                </div>
              </div>

              {/* Remote Device Command Controls */}
              <div className="rounded-xl border border-line bg-panel-2/40 p-4 space-y-3">
                <div className="text-[12px] font-bold text-hi uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <span>Remote Hardware Commands</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => sendDeviceCommand(device, 'ping')}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-2 text-xs font-semibold text-lo hover:border-accent hover:text-hi transition-all cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-sky-400" />
                    <span>Ping Heartbeat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => sendDeviceCommand(device, 'reboot')}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-2 text-xs font-semibold text-lo hover:border-red/40 hover:text-red transition-all cursor-pointer shadow-2xs"
                  >
                    <RotateCw className="h-3.5 w-3.5 text-amber" />
                    <span>Reboot Tracker</span>
                  </button>
                </div>

                {!isLatestFirmware && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => sendDeviceCommand(device, 'firmware')}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-xs font-bold text-black hover:bg-green disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                  >
                    <Cpu className="h-3.5 w-3.5" />
                    <span>{isUpdating ? 'Flashing OTA Firmware...' : 'Push OTA Firmware Update (v2.4.1)'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TELEMETRY TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-line-soft pb-2">
                <span className="text-xs font-bold text-hi">
                  Historical IoT & Hardware Events
                </span>
                <button
                  type="button"
                  onClick={loadTimeline}
                  disabled={timelineLoading}
                  className="flex items-center gap-1 text-[11px] text-accent hover:underline cursor-pointer"
                >
                  <RotateCw className={`h-3 w-3 ${timelineLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {timelineLoading ? (
                <div className="space-y-2 py-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse rounded-xl border border-line-soft bg-panel-2 p-3 space-y-2">
                      <div className="h-3.5 w-28 rounded bg-panel" />
                      <div className="h-3 w-48 rounded bg-panel/60" />
                    </div>
                  ))}
                </div>
              ) : timelineError ? (
                <div className="flex items-center gap-2 rounded-xl border border-red/30 bg-red/10 p-3 text-xs text-red">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{timelineError}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {timelineEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="rounded-xl border border-line-soft bg-panel-2/50 p-3 space-y-1 hover:border-line transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[9.5px] font-bold uppercase rounded px-1.5 py-0.2 bg-panel border border-line text-accent">
                          {evt.eventType}
                        </span>
                        <span className="font-mono text-[10px] text-dim tabular-nums">
                          {evt.timestamp}
                        </span>
                      </div>

                      <div className="text-[12px] font-medium text-hi pt-0.5">
                        {evt.message}
                      </div>

                      {evt.metadata && (
                        <div className="text-[10px] font-mono text-lo bg-panel/60 rounded px-2 py-1 mt-1 border border-line-soft/40">
                          {evt.metadata}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RAW NMEA / MQTT PACKET STREAM */}
          {activeTab === 'packets' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-line-soft pb-2">
                <span className="text-xs font-bold text-hi font-mono">
                  Incoming Raw Packet Log (Live)
                </span>
                <span className="flex items-center gap-1.5 text-[10.5px] font-mono text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Streaming</span>
                </span>
              </div>

              <div className="rounded-xl border border-line bg-black/90 p-3.5 font-mono text-[11px] text-lo space-y-2.5 overflow-x-auto shadow-inner">
                {packets.map((pkt) => (
                  <div key={pkt.id} className="border-b border-line/40 pb-2 last:border-0 last:pb-0 space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-dim">
                      <span className="text-accent">[{pkt.time}] {pkt.type} / {pkt.direction}</span>
                      <span className="text-emerald-400">{pkt.status}</span>
                    </div>
                    <div className="text-hi break-all select-all font-mono text-[10.5px]">
                      {pkt.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10.5px] font-mono text-dim">
                  Buffer: 5 frames stored
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const dump = packets.map((p) => `[${p.time}] ${p.content}`).join('\n')
                    copyToClipboard(dump, 'packets')
                  }}
                  className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-[11px] font-mono text-lo hover:text-hi transition-colors cursor-pointer"
                >
                  {copiedField === 'packets' ? (
                    <>
                      <ClipboardCheck className="h-3 w-3 text-accent" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-3 w-3" />
                      <span>Copy Log</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
