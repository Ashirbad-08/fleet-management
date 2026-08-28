import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, UploadCloud, Power, Lock, Unlock, TriangleAlert, Edit2, Save, Trash2, Map } from './icons'
import { useFleet } from '../context/FleetContext'
import { STATUS_META } from '../data/statusMeta'
import Gauge from './Gauge'
import Sparkline from './Sparkline'

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
  const { selectedVehicle, setSelectedVehicleId, sendDeviceCommand, updateVehicle, deleteVehicle, settings, updatingVehicles } = useFleet()
  const navigate = useNavigate()
  const open = Boolean(selectedVehicle)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  const battData = useMemo(() => {
    if (!selectedVehicle) return []
    const series = genSeries(selectedVehicle.battery, 6, 20)
    series[series.length - 1] = selectedVehicle.battery
    return series
  }, [selectedVehicle])

  const close = () => {
    setSelectedVehicleId(null)
    setEditing(false)
    setConfirmDelete(false)
  }

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

  const logs = selectedVehicle
    ? [
        { color: 'var(--color-green)', text: <><b>{selectedVehicle.deviceId}</b> sent heartbeat</>, time: selectedVehicle.lastSeen },
        { color: 'var(--color-accent)', text: `Firmware check completed - v${selectedVehicle.firmware}`, time: '6 min ago' },
        { color: 'var(--color-amber)', text: 'Battery crossed 30% threshold', time: '18 min ago' },
        { color: 'var(--color-gray)', text: 'Ignition cycle recorded', time: '41 min ago' },
      ]
    : []

  const inputCls = 'w-full rounded-md border border-line bg-panel-2 px-2.5 py-1.5 text-[12.5px] text-hi outline-none focus:border-accent'

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-label="Vehicle Details & Controls"
        className={`fixed right-0 top-0 z-50 h-dvh w-full overflow-y-auto border-l border-line bg-panel transition-transform duration-200 sm:w-105 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedVehicle && (
          <>
            <div className="sticky top-0 z-20 flex items-start justify-between border-b border-line-soft bg-panel/90 px-5 py-4.5 backdrop-blur-md">
              <div>
                <div className="font-display text-[16px] font-bold">{selectedVehicle.name}</div>
                <div className="mt-0.75 font-mono text-[11px] text-lo tabular-nums">
                  {selectedVehicle.type || '4 Wheeler'} • {selectedVehicle.plate} • {selectedVehicle.model}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={startEdit}
                  aria-label="Edit vehicle telemetry"
                  title="Edit vehicle"
                  className="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:bg-hover hover:text-accent cursor-pointer"
                >
                  <Edit2 className="h-3 w-3" strokeWidth={2} />
                </button>
                <button
                  onClick={close}
                  aria-label="Close drawer"
                  title="Close"
                  className="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi cursor-pointer"
                >
                  <X className="h-3 w-3" strokeWidth={2.2} />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center border-b border-line-soft px-5 py-5">
              <Gauge score={selectedVehicle.health} color={meta.color} />
              <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-2.5 text-[10.5px] font-semibold ${meta.pill}`}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                {meta.label}
              </span>
            </div>

            {updatingVehicles[selectedVehicle.id] !== undefined && (
              <div className="border-b border-line-soft px-5 py-3.5 bg-accent/5">
                <div className="flex justify-between text-[11.5px] font-semibold text-accent mb-1.5">
                  <span>Flashing Firmware...</span>
                  <span className="font-mono tabular-nums">{updatingVehicles[selectedVehicle.id]}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full border border-accent/20 bg-panel-2">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${updatingVehicles[selectedVehicle.id]}%` }}
                  />
                </div>
              </div>
            )}

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
                      <option key={s} value={s}>{STATUS_META[s]?.label ?? s}</option>
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
              <div className="grid grid-cols-2 gap-px border-b border-line-soft bg-line-soft">
                {[
                  ['Device ID', selectedVehicle.deviceId],
                  ['Firmware', updatingVehicles[selectedVehicle.id] !== undefined ? `Updating (${updatingVehicles[selectedVehicle.id]}%)` : `v${selectedVehicle.firmware}`],
                  ['Battery', `${selectedVehicle.battery}%`],
                  ['Est. range', selectedVehicle.rangeKm !== undefined && selectedVehicle.rangeKm !== null ? (settings?.distanceUnit === 'miles' ? `${Math.round(selectedVehicle.rangeKm * 0.621371)} mi` : `${selectedVehicle.rangeKm} km`) : '-'],
                  ['Battery temp', selectedVehicle.batteryTempC !== undefined && selectedVehicle.batteryTempC !== null ? (settings?.tempUnit === 'Fahrenheit' ? `${Math.round(selectedVehicle.batteryTempC * 9 / 5 + 32)}°F` : `${selectedVehicle.batteryTempC}°C`) : '-'],
                  ['Voltage', `${selectedVehicle.voltageV ?? '-'} V`],
                  ['Current', `${selectedVehicle.currentA ?? '-'} A`],
                  ['Odometer', settings?.distanceUnit === 'miles' ? `${Math.round((selectedVehicle.odometerKm ?? 0) * 0.621371).toLocaleString('en-IN')} mi` : `${Math.round(selectedVehicle.odometerKm ?? 0).toLocaleString('en-IN')} km`],
                  ['Lock state', selectedVehicle.locked ? 'Locked' : 'Unlocked'],
                  ['Speed', settings?.speedUnit === 'mph' ? `${Math.round(selectedVehicle.speed * 0.621371)} mph` : `${selectedVehicle.speed} km/h`],
                  ['Last seen', selectedVehicle.lastSeen],
                ].map(([label, value]) => (
                  <div key={label} className="bg-panel px-4.5 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-dim">{label}</div>
                    <div className="mt-1 font-mono text-[13px] text-hi tabular-nums">{value}</div>
                  </div>
                ))}
              </div>
            )}

            {!editing && (
              <div className="border-b border-line-soft px-5 py-4.5">
                <div className="mb-2.5 flex items-baseline justify-between">
                  <div className="text-[11.5px] font-semibold text-lo">Battery - last 24h</div>
                  <div className="font-mono text-[14px] font-semibold">{selectedVehicle.battery}%</div>
                </div>
                <Sparkline data={battData} color={meta.color} />
              </div>
            )}

            {!editing && (
              <div className="border-b border-line-soft px-5 py-4.5 bg-panel-2/10">
                <div className="mb-3 flex items-baseline justify-between">
                  <div className="text-[11.5px] font-semibold text-lo">Driver Analytics & Safety</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-dim">Eco-Score:</span>
                    <span className={`font-mono text-[14.5px] font-bold ${
                      selectedVehicle.safetyScore >= 90
                        ? 'text-green'
                        : selectedVehicle.safetyScore >= 75
                          ? 'text-amber'
                          : 'text-red'
                    }`}>
                      {selectedVehicle.safetyScore}/100
                    </span>
                  </div>
                </div>
                
                {/* Score bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-line-soft mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedVehicle.safetyScore >= 90
                        ? 'bg-green'
                        : selectedVehicle.safetyScore >= 75
                          ? 'bg-amber'
                          : 'bg-red'
                    }`}
                    style={{ width: `${selectedVehicle.safetyScore}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="rounded-lg border border-line-soft bg-panel py-2 px-1">
                    <div className="text-dim">Harsh Accel</div>
                    <div className="mt-1 font-mono text-[13.5px] font-bold text-hi">
                      {selectedVehicle.harshAccel ?? 0}
                    </div>
                  </div>
                  <div className="rounded-lg border border-line-soft bg-panel py-2 px-1">
                    <div className="text-dim">Hard Braking</div>
                    <div className="mt-1 font-mono text-[13.5px] font-bold text-hi">
                      {selectedVehicle.hardBrake ?? 0}
                    </div>
                  </div>
                  <div className="rounded-lg border border-line-soft bg-panel py-2 px-1">
                    <div className="text-dim">Idle Time</div>
                    <div className="mt-1 font-mono text-[13.5px] font-bold text-hi">
                      {Math.round(selectedVehicle.idleMin ?? 0)}m
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="px-5 pb-1 pt-3.5 text-[10.5px] font-semibold uppercase tracking-wide text-dim">
              Device actions
            </div>
            <div className="flex flex-col gap-2 px-5 py-3">
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

            <div className="px-5 pb-5 pt-3">
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
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[12px] font-medium text-dim hover:border-red/40 hover:text-red"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  Remove vehicle from fleet
                </button>
              )}
            </div>

            <div className="px-5 pb-1 pt-3.5 text-[10.5px] font-semibold uppercase tracking-wide text-dim">
              Recent events
            </div>
            <div className="px-5 pb-5 pt-1.5">
              {logs.map((l, i) => (
                <div key={i} className="flex gap-2.5 border-b border-line-soft py-2 last:border-none">
                  <span className="mt-1.25 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: l.color }} />
                  <div>
                    <div className="text-[11.5px] leading-snug text-lo">{l.text}</div>
                    <div className="mt-0.5 font-mono text-[9.5px] text-dim">{l.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </aside>
    </>
  )
}
