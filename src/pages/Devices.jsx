import { useState, useEffect, useMemo } from 'react'
import Topbar from '../components/Topbar'
import { useFleet } from '../context/FleetContext'
import { STATUS_META } from '../data/statusMeta'
import DeviceDrawer from '../components/device-drawer/DeviceDrawer'
import {
  Cpu,
  Radio,
  Wifi,
  Search,
  RotateCw,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Truck,
  Zap,
  Clock,
  ArrowRight,
  ChevronRight,
} from '../components/icons'

const LATEST_FIRMWARE = '2.4.1'

export default function Devices() {
  const { vehicles, setSelectedVehicleId, sendDeviceCommand, updatingVehicles } = useFleet()
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState('all') // 'all' | 'online' | 'idle' | 'offline' | 'outdated'
  const [selectedDevice, setSelectedDevice] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 240)
    return () => clearTimeout(timer)
  }, [])

  // Sync selectedDevice if vehicle data updates (e.g. firmware flash completes)
  useEffect(() => {
    if (selectedDevice) {
      const updated = vehicles.find((v) => v.id === selectedDevice.id || v.deviceId === selectedDevice.deviceId)
      if (updated) setSelectedDevice(updated)
    }
  }, [vehicles, selectedDevice?.id, selectedDevice?.deviceId])

  // Counts for Metric Strips & Filters
  const counts = useMemo(() => {
    const online = vehicles.filter((v) => v.status === 'online').length
    const idle = vehicles.filter((v) => v.status === 'idle').length
    const offline = vehicles.filter((v) => v.status === 'offline' || v.status === 'alert').length
    const outdated = vehicles.filter((v) => v.firmware !== LATEST_FIRMWARE).length
    return {
      total: vehicles.length,
      online,
      idle,
      offline,
      outdated,
    }
  }, [vehicles])

  // Filter & Search logic
  const filteredDevices = useMemo(() => {
    return vehicles.filter((v) => {
      // 1. Status Filter
      if (filterTab === 'online' && v.status !== 'online') return false
      if (filterTab === 'idle' && v.status !== 'idle') return false
      if (filterTab === 'offline' && v.status !== 'offline' && v.status !== 'alert') return false
      if (filterTab === 'outdated' && v.firmware === LATEST_FIRMWARE) return false

      // 2. Search Query (matches IMEI, SIM Number, Plate, or Vehicle Name)
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        v.deviceId.toLowerCase().includes(q) ||
        (v.simNumber && v.simNumber.toLowerCase().includes(q)) ||
        v.name.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        v.firmware.toLowerCase().includes(q)
      )
    })
  }, [vehicles, filterTab, search])

  const handleUpdateAllOutdated = () => {
    const outdatedList = vehicles.filter((v) => v.firmware !== LATEST_FIRMWARE)
    outdatedList.forEach((v) => sendDeviceCommand(v, 'firmware'))
  }

  return (
    <div data-component="DevicesPage" data-slot="page-layout" className="flex min-h-0 flex-1 flex-col md:overflow-hidden">
      <Topbar
        title="Devices"
        subtitle="IoT telematics hardware, cellular connectivity & OTA firmware management"
      />

      <div className="flex-1 overflow-y-auto px-4 pb-24 py-4 sm:px-6 md:pb-6 space-y-4">
        {/* 1. Top Hardware Telemetry KPI Cards */}
        <div data-slot="kpi-grid" className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <div className="rounded-xl border border-line bg-panel p-3.5 space-y-1">
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-dim flex items-center justify-between">
              <span>Total Trackers</span>
              <Cpu className="h-3.5 w-3.5 text-lo" />
            </div>
            <div className="font-display text-2xl font-bold text-hi">{counts.total}</div>
            <div className="text-[11px] text-lo">100% Provisioned</div>
          </div>

          <div className="rounded-xl border border-line bg-panel p-3.5 space-y-1">
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-dim flex items-center justify-between">
              <span>Transmitting</span>
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            </div>
            <div className="font-display text-2xl font-bold text-accent">{counts.online}</div>
            <div className="text-[11px] text-emerald-400 font-mono">Live Heartbeats</div>
          </div>

          <div className="rounded-xl border border-line bg-panel p-3.5 space-y-1">
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-dim flex items-center justify-between">
              <span>Standby / Idle</span>
              <span className="h-2 w-2 rounded-full bg-amber" />
            </div>
            <div className="font-display text-2xl font-bold text-amber">{counts.idle}</div>
            <div className="text-[11px] text-dim font-mono">Low Power Mode</div>
          </div>

          <div className="rounded-xl border border-line bg-panel p-3.5 space-y-1">
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-dim flex items-center justify-between">
              <span>Offline / Alert</span>
              <span className="h-2 w-2 rounded-full bg-red" />
            </div>
            <div className="font-display text-2xl font-bold text-red">{counts.offline}</div>
            <div className="text-[11px] text-dim font-mono">No Packet ACK</div>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-xl border border-line bg-panel p-3.5 space-y-1">
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-dim flex items-center justify-between">
              <span>Pending OTA</span>
              <Radio className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <div className="font-display text-2xl font-bold text-hi">
                {counts.outdated}
              </div>
              {counts.outdated > 0 && (
                <button
                  data-action="flash-all-ota"
                  type="button"
                  onClick={handleUpdateAllOutdated}
                  className="rounded-lg bg-accent/15 px-2 py-1 text-[10.5px] font-bold text-accent hover:bg-accent/25 transition-colors cursor-pointer"
                >
                  Flash All
                </button>
              )}
            </div>
            <div className="text-[11px] text-dim font-mono">v{LATEST_FIRMWARE} Latest</div>
          </div>
        </div>

        {/* 2. Filter Toolbar & Search */}
        <div data-slot="filter-search-bar" className="flex flex-col gap-3 rounded-xl border border-line bg-panel p-3.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Trackers', count: counts.total },
              { id: 'online', label: 'Transmitting', count: counts.online },
              { id: 'idle', label: 'Standby', count: counts.idle },
              { id: 'offline', label: 'Offline', count: counts.offline },
              { id: 'outdated', label: 'Update Available', count: counts.outdated },
            ].map((tab) => (
              <button
                data-action="select-device-filter"
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  filterTab === tab.id
                    ? 'bg-accent/15 text-accent border border-accent/30 shadow-xs'
                    : 'text-lo hover:text-hi hover:bg-panel-2'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 font-mono text-[9.5px] tabular-nums ${
                    filterTab === tab.id ? 'bg-accent text-black font-bold' : 'bg-panel-2 text-dim'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
            <input
              type="text"
              placeholder="Search IMEI, SIM number, Plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-line bg-panel-2 pl-9 pr-3 py-1.5 text-[12px] text-hi placeholder:text-dim outline-none focus:border-accent/60 transition-colors"
            />
          </div>
        </div>

        {/* 3. Device Hardware Grid */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`skel-dev-${i}`}
                className="animate-pulse rounded-xl border border-line bg-panel p-4 space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 rounded bg-panel-2" />
                  <div className="h-4.5 w-16 rounded-full bg-panel-2" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="h-4.5 w-32 rounded bg-panel-2" />
                  <div className="h-3 w-28 rounded bg-panel-2/60" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-line-soft">
                  <div className="h-3 w-20 rounded bg-panel-2" />
                  <div className="h-3 w-16 rounded bg-panel-2" />
                </div>
              </div>
            ))
          ) : filteredDevices.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border border-line rounded-xl bg-panel">
              <Cpu className="h-10 w-10 text-dim mb-2 opacity-50" />
              <p className="text-[14px] font-bold text-hi">No matching IoT devices found</p>
              <p className="text-xs text-dim mt-1">Try modifying your search or filter selection.</p>
            </div>
          ) : (
            filteredDevices.map((v) => {
              const meta = STATUS_META[v.status] || STATUS_META.offline
              const isUpdating = updatingVehicles[v.id] !== undefined
              const updateProgress = updatingVehicles[v.id] || 0
              const isLatestFw = v.firmware === LATEST_FIRMWARE
              const signalBars = Number(v.signal) || 4

              return (
                <div
                  key={v.deviceId}
                  className="rounded-xl border border-line bg-panel p-4 flex flex-col justify-between hover:border-line-soft hover:shadow-xl transition-all group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Device IMEI & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-panel-2 text-accent border border-line">
                          <Cpu className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-mono text-[13px] font-bold text-hi group-hover:text-accent transition-colors">
                            {v.deviceId}
                          </div>
                          <div className="text-[10px] text-dim font-mono">
                            4G LTE • Cat-M1
                          </div>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full py-0.5 pl-2 pr-2.5 text-[10px] font-mono font-bold uppercase ${meta.pill}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                        {meta.label}
                      </span>
                    </div>

                    {/* Active Firmware OTA Flashing Bar */}
                    {isUpdating && (
                      <div className="rounded-lg border border-accent/30 bg-accent/5 p-2 space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-accent">
                          <span>Flashing Firmware...</span>
                          <span className="font-mono">{updateProgress}%</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-panel-2">
                          <div
                            className="h-full rounded-full bg-accent transition-all duration-300"
                            style={{ width: `${updateProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Telecom & SIM Bar */}
                    <div className="flex items-center justify-between rounded-lg border border-line-soft bg-panel-2/50 px-2.5 py-1.5 text-[11px] font-mono">
                      <span className="text-dim">SIM:</span>
                      <span className="font-bold text-accent truncate max-w-[170px]">
                        {v.simNumber || 'Not Configured'}
                      </span>
                    </div>

                    {/* Diagnostics Specs Row */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="rounded-lg border border-line-soft/60 bg-panel-2/30 p-2">
                        <div className="text-[9.5px] text-dim uppercase">Signal</div>
                        <div className="font-bold text-hi flex items-center gap-1 mt-0.5">
                          <Wifi className="h-3 w-3 text-emerald-400" />
                          <span>{signalBars}/5 Bars</span>
                        </div>
                      </div>

                      <div className="rounded-lg border border-line-soft/60 bg-panel-2/30 p-2">
                        <div className="text-[9.5px] text-dim uppercase">Firmware</div>
                        <div className="font-bold text-hi flex items-center gap-1.5 mt-0.5">
                          <span>v{v.firmware}</span>
                          {!isLatestFw && (
                            <span className="rounded bg-amber/15 px-1 text-[8.5px] font-bold text-amber">
                              Update
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location & Last Ping */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-dim pt-0.5">
                      <div className="flex items-center gap-1 truncate max-w-[180px]">
                        <Clock className="h-3 w-3 text-lo shrink-0" />
                        <span className="truncate">{v.lastSeen || 'Just now'}</span>
                      </div>
                      <span className="text-lo font-semibold">{v.voltageV || 382}V DC</span>
                    </div>
                  </div>

                  {/* Paired Vehicle Asset Footer & Actions */}
                  <div className="mt-3.5 pt-3 border-t border-line-soft/80 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[10px] text-dim font-mono">Mounted on:</div>
                      <div className="font-display text-[12px] font-bold text-hi truncate">
                        {v.name} <span className="font-mono text-lo font-normal">({v.plate})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isLatestFw && (
                        <button
                          data-action="flash-single-ota"
                          type="button"
                          disabled={isUpdating}
                          onClick={() => sendDeviceCommand(v, 'firmware')}
                          title="Push OTA Firmware update"
                          className="rounded-lg border border-accent/40 bg-accent/10 px-2 py-1 text-[10.5px] font-bold text-accent hover:bg-accent/20 transition-all cursor-pointer"
                        >
                          OTA
                        </button>
                      )}

                      <button
                        data-action="open-device-diagnostics"
                        type="button"
                        onClick={() => setSelectedDevice(v)}
                        className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-[11px] font-semibold text-lo hover:border-accent/40 hover:bg-hover hover:text-hi transition-all cursor-pointer shadow-2xs"
                      >
                        <span>Diagnostics</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Dedicated Device Telematics & Diagnostic Drawer */}
      <DeviceDrawer
        device={selectedDevice}
        open={Boolean(selectedDevice)}
        onClose={() => setSelectedDevice(null)}
        onOpenVehicleDrawer={(vehicleId) => {
          setSelectedVehicleId(vehicleId)
        }}
      />
    </div>
  )
}
