import { useState } from 'react'
import { useFleet } from '../../../context/FleetContext'
import {
  Cpu,
  Radio,
  Wifi,
  WifiOff,
  RotateCw,
  Power,
  RefreshCw,
  Clipboard,
  ClipboardCheck,
  Check,
  ShieldCheck,
  Activity,
  Zap,
  Navigation,
  Server,
  AlertCircle,
} from '../../icons'

export default function HardwareTab({ selectedVehicle }) {
  const { sendDeviceCommand, updatingVehicles = {}, showToast } = useFleet()
  const [copiedKey, setCopiedKey] = useState(null)

  if (!selectedVehicle) return null

  const isUpdating = updatingVehicles[selectedVehicle.id] !== undefined
  const updateProgress = updatingVehicles[selectedVehicle.id] || 0
  const isOnline = selectedVehicle.status === 'online'
  const isIdle = selectedVehicle.status === 'idle'
  const isOutdated = selectedVehicle.firmware && selectedVehicle.firmware !== '2.4.1'

  // Signal calculations
  const signalBars = Number(selectedVehicle.signal) || 4
  const rssiValue = -110 + signalBars * 8 // approx -78 dBm for 4 bars
  const csqValue = Math.min(31, Math.max(10, signalBars * 6 + 2))

  const handleCopy = (text, key) => {
    if (!text) return
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    showToast?.(`Copied ${key} to clipboard`)
    setTimeout(() => {
      setCopiedKey(null)
    }, 2000)
  }

  return (
    <div
      data-component="HardwareTab"
      data-slot="tab-content"
      className="p-5 space-y-4"
    >
      {/* ── CARD 1: TCU & Hardware Controller Unit ── */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
              <Cpu className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Telematics Control Unit (TCU)</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold ${
                isOnline
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : isIdle
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : isIdle ? 'bg-amber-400' : 'bg-rose-400'
                }`}
              />
              <span className="uppercase">{selectedVehicle.status || 'Offline'}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-line-soft p-px">
          <div className="bg-panel px-3.5 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Device IMEI / ID</span>
              <button
                type="button"
                data-action="copy-imei"
                onClick={() => handleCopy(selectedVehicle.deviceId || 'IOT-90231', 'IMEI')}
                className="text-lo hover:text-accent transition-colors cursor-pointer"
                title="Copy IMEI"
              >
                {copiedKey === 'IMEI' ? (
                  <ClipboardCheck className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Clipboard className="h-3 w-3" />
                )}
              </button>
            </div>
            <div className="mt-0.5 font-mono text-[12px] font-bold text-hi truncate">
              {selectedVehicle.deviceId || 'IOT-90231'}
            </div>
          </div>

          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">TCU Hardware Model</div>
            <div className="mt-0.5 font-mono text-[12px] font-bold text-hi truncate">
              Electrie TCU-X400
            </div>
          </div>

          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Ingestion Protocol</div>
            <div className="mt-0.5 font-mono text-[12px] font-medium text-hi truncate">
              GT06 / JT808 Binary
            </div>
          </div>

          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Chassis / VIN Bound</div>
            <div className="mt-0.5 font-mono text-[12px] font-medium text-hi truncate">
              {selectedVehicle.chassisNumber || 'MD9HAPXF4DR710019'}
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Cellular Connectivity & SIM Telemetry ── */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
              <Radio className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Cellular M2M & SIM Profile</span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Signal Bars Visual */}
            <div className="flex items-end gap-0.5 h-3.5">
              {[1, 2, 3, 4, 5].map((bar) => (
                <span
                  key={bar}
                  className={`w-1 rounded-2xs transition-colors ${
                    bar <= signalBars
                      ? 'bg-accent'
                      : 'bg-line-soft'
                  }`}
                  style={{ height: `${bar * 20}%` }}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] text-accent font-bold ml-1">
              {rssiValue} dBm
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-line-soft p-px">
          <div className="bg-panel px-3.5 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">SIM Phone / MSISDN</span>
              <button
                type="button"
                data-action="copy-sim"
                onClick={() => handleCopy(selectedVehicle.simNumber || '+91 98450 10317', 'SIM')}
                className="text-lo hover:text-accent transition-colors cursor-pointer"
                title="Copy SIM Number"
              >
                {copiedKey === 'SIM' ? (
                  <ClipboardCheck className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Clipboard className="h-3 w-3" />
                )}
              </button>
            </div>
            <div className="mt-0.5 font-mono text-[12px] font-bold text-hi truncate">
              {selectedVehicle.simNumber || '+91 98450 10317'}
            </div>
          </div>

          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">M2M Carrier & Band</div>
            <div className="mt-0.5 font-mono text-[12px] font-bold text-hi truncate">
              Airtel IoT 4G (Band 3/40)
            </div>
          </div>

          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Access Point (APN)</div>
            <div className="mt-0.5 font-mono text-[12px] font-medium text-hi truncate">
              airtel-iot.m2m
            </div>
          </div>

          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Signal Quality (CSQ)</div>
            <div className="mt-0.5 font-mono text-[12px] font-medium text-hi truncate">
              CSQ {csqValue} / 31 (Excellent)
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 3: GNSS / GPS Satellite Navigation ── */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
              <Navigation className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">GNSS Satellite Positioning</span>
          </div>
          <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[9.5px] font-bold text-emerald-400">
            3D Fix Locked
          </span>
        </div>

        <div className="grid grid-cols-2 gap-px bg-line-soft p-px">
          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Constellations</div>
            <div className="mt-0.5 font-mono text-[12px] font-bold text-hi truncate">
              GPS + GLONASS + NavIC
            </div>
          </div>

          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Tracked Satellites</div>
            <div className="mt-0.5 font-mono text-[12px] font-bold text-emerald-400">
              16 In-View / 12 Active
            </div>
          </div>

          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Horizontal Dilution (HDOP)</div>
            <div className="mt-0.5 font-mono text-[12px] font-medium text-hi truncate">
              0.78 (High Precision)
            </div>
          </div>

          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Current Fix Coordinates</div>
            <div className="mt-0.5 font-mono text-[12px] font-medium text-hi truncate">
              {Number(selectedVehicle.lat || 18.5204).toFixed(4)}°, {Number(selectedVehicle.lon || 73.8567).toFixed(4)}°
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 4: Firmware & Over-The-Air (OTA) Management ── */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
              <Server className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Modem Firmware & OTA Updates</span>
          </div>
          <span
            className={`rounded px-2 py-0.5 font-mono text-[9.5px] font-bold ${
              isOutdated
                ? 'bg-rose-500/15 text-rose-400'
                : 'bg-emerald-500/15 text-emerald-400'
            }`}
          >
            {isOutdated ? 'Update Recommended' : 'v2.4.1 (Latest LTS)'}
          </span>
        </div>

        <div className="p-4 space-y-3.5">
          <div className="flex items-center justify-between text-[11.5px]">
            <div>
              <div className="text-[10px] uppercase font-semibold text-dim">Installed Version</div>
              <div className="font-mono text-[13px] font-bold text-hi">
                v{selectedVehicle.firmware || '2.4.1'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold text-dim">Target Fleet Baseline</div>
              <div className="font-mono text-[13px] font-bold text-accent">
                v2.4.1 (Stable)
              </div>
            </div>
          </div>

          {/* Active OTA Flashing Progress Bar */}
          {isUpdating && (
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-accent font-semibold">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Flashing Modem Firmware OTA...</span>
                </span>
                <span className="font-mono font-bold text-accent">{updateProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-panel">
                <div
                  className="h-full bg-accent transition-all duration-300 rounded-full"
                  style={{ width: `${updateProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Device Remote Commands Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-line-soft">
            <button
              type="button"
              disabled={isUpdating}
              data-action="flash-firmware"
              onClick={() => sendDeviceCommand?.(selectedVehicle, 'firmware')}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11.5px] font-semibold transition-all cursor-pointer ${
                isUpdating
                  ? 'bg-panel-2 text-dim cursor-not-allowed opacity-60'
                  : 'bg-accent text-base hover:bg-accent/90 shadow-xs'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Flashing...' : 'Flash OTA v2.4.1'}</span>
            </button>

            <button
              type="button"
              data-action="reboot-tcu"
              onClick={() => sendDeviceCommand?.(selectedVehicle, 'reboot')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-line-soft bg-panel-2 px-3 py-2 text-[11.5px] font-semibold text-hi hover:border-amber/50 hover:text-amber transition-all cursor-pointer shadow-xs"
            >
              <Power className="h-3.5 w-3.5" />
              <span>Reboot TCU</span>
            </button>

            <button
              type="button"
              data-action="ping-tcu"
              onClick={() => sendDeviceCommand?.(selectedVehicle, 'ping')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-line-soft bg-panel-2 px-3 py-2 text-[11.5px] font-semibold text-hi hover:border-accent hover:text-accent transition-all cursor-pointer shadow-xs"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Diagnostic Ping</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CARD 5: Electrical & Sensor Telemetry ── */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
              <Zap className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Hardware Electrical Bus & Power</span>
          </div>
          <span className="font-mono text-[10px] text-dim">
            Synced: {selectedVehicle.lastSeen || 'Just now'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-px bg-line-soft p-px">
          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Main Supply Voltage</div>
            <div className="mt-0.5 font-mono text-[12px] font-bold text-hi truncate">
              {selectedVehicle.voltageV || 48} V DC
            </div>
          </div>

          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">Backup Battery</div>
            <div className="mt-0.5 font-mono text-[12px] font-bold text-emerald-400 truncate">
              3.7V Li-ion (98% Normal)
            </div>
          </div>

          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">CAN-Bus Interface</div>
            <div className="mt-0.5 font-mono text-[12px] font-medium text-hi truncate">
              J1939 @ 250 kbps
            </div>
          </div>

          <div className="bg-panel px-3.5 py-2.5">
            <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">ACC Ignition Line</div>
            <div className="mt-0.5 font-mono text-[12px] font-medium text-hi truncate">
              {isOnline ? 'Active (12V High)' : 'Standby (0V Low)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
