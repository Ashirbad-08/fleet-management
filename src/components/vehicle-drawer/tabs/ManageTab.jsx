import { useState } from 'react'
import {
  FileDown,
  Edit2,
  Trash2,
  CheckCheck,
  ClipboardCheck,
  ShieldCheck,
  Settings2,
  AlertCircle,
} from '../../icons'

// ── Utility helpers ──────────────────────────────────────────────────────────
function generateVehicleReportCSV(vehicle) {
  const rows = [
    ['Field', 'Value'],
    ['Vehicle Name', vehicle.name ?? '—'],
    ['Plate', vehicle.plate ?? '—'],
    ['Model', vehicle.model ?? '—'],
    ['Type', vehicle.type ?? '—'],
    ['Device ID', vehicle.deviceId ?? '—'],
    ['Firmware', vehicle.firmware ?? '—'],
    ['Status', vehicle.status ?? '—'],
    ['Battery (%)', vehicle.battery ?? '—'],
    ['Battery Temp (°C)', vehicle.batteryTempC ?? '—'],
    ['Voltage (V)', vehicle.voltageV ?? '—'],
    ['Current (A)', vehicle.currentA ?? '—'],
    ['Odometer (km)', vehicle.odometerKm ?? '—'],
    ['Speed (km/h)', vehicle.speed ?? '—'],
    ['Estimated Range (km)', vehicle.rangeKm ?? '—'],
    ['Total Range (km)', vehicle.totalRangeKm ?? '—'],
    ['Battery Serial', vehicle.batterySerial ?? '—'],
    ['Battery Capacity (kWh)', vehicle.batteryCapacityKwh ?? '—'],
    ['Battery Chemistry', vehicle.batteryChemistry ?? '—'],
    ['Battery Type', vehicle.batteryType ?? '—'],
    ['Chassis Number', vehicle.chassisNumber ?? '—'],
    ['Driver', vehicle.driver ?? '—'],
    ['Driver Phone', vehicle.driverPhone ?? '—'],
    ['Location', vehicle.location ?? '—'],
    ['Last Seen', vehicle.lastSeen ?? '—'],
    ['Insurance Expiry', vehicle.insuranceExpiry ?? '—'],
    ['Fitness Expiry', vehicle.fitnessExpiry ?? '—'],
    ['Warranty Expiry', vehicle.warrantyExpiry ?? '—'],
    ['Hub Supervisor', vehicle.hubSupervisorName ?? '—'],
    ['Hub Supervisor Phone', vehicle.hubSupervisorPhone ?? '—'],
    ['Client', vehicle.clientName ?? '—'],
    ['Report Generated', new Date().toLocaleString('en-IN')],
  ]
  return rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, badge }) {
  return (
    <div className="flex items-center justify-between border-b border-line-soft bg-panel-2/60 px-5 py-2">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-hi">
        <span className="flex h-4 w-4 items-center justify-center rounded bg-accent/15 text-accent">
          <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
        </span>
        <span>{title}</span>
      </div>
      {badge && (
        <span className="font-mono text-[9.5px] text-dim uppercase">{badge}</span>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ManageTab({
  selectedVehicle,
  onStartEdit,
  onDeleteVehicle,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [reportDownloaded, setReportDownloaded] = useState(false)

  // ── Download CSV Report ───────────────────────────────────────────────────
  const handleDownloadReport = () => {
    const csv = generateVehicleReportCSV(selectedVehicle)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vehicle-report-${selectedVehicle.plate?.replace(/\s+/g, '-') ?? selectedVehicle.id}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setReportDownloaded(true)
    setTimeout(() => setReportDownloaded(false), 3000)
  }

  return (
    <>
      {/* ── 1. Reports Section ──────────────────────────────────────────── */}
      <div>
        <SectionHeader icon={FileDown} title="Reports" badge="Export" />
        <div className="px-5 py-4 bg-panel border-b border-line-soft space-y-2.5">
          {/* Vehicle info summary card */}
          <div className="rounded-xl border border-line-soft bg-panel-2/40 p-3.5 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
              <ShieldCheck className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <div className="font-display text-[12.5px] font-bold text-hi truncate">{selectedVehicle.name}</div>
              <div className="font-mono text-[10.5px] text-dim">
                {selectedVehicle.plate} · {selectedVehicle.deviceId}
              </div>
            </div>
          </div>

          {/* Download CSV */}
          <button
            type="button"
            onClick={handleDownloadReport}
            className={`w-full flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[12.5px] font-semibold transition-all cursor-pointer ${
              reportDownloaded
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-accent/30 bg-accent/10 text-accent hover:bg-accent/20'
            }`}
          >
            {reportDownloaded ? (
              <>
                <CheckCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                Report Downloaded!
              </>
            ) : (
              <>
                <FileDown className="h-3.5 w-3.5" strokeWidth={2} />
                Download Vehicle Report (.csv)
              </>
            )}
          </button>

          <p className="text-[10px] text-dim text-center">
            Includes telemetry, battery, compliance & driver details
          </p>
        </div>
      </div>

      {/* ── 2. Edit Details Section ─────────────────────────────────────── */}
      <div>
        <SectionHeader icon={Settings2} title="Vehicle Details" badge="Edit" />
        <div className="px-5 py-4 bg-panel border-b border-line-soft space-y-3">
          {/* Quick info grid */}
          <div className="grid grid-cols-2 gap-px rounded-xl overflow-hidden border border-line-soft bg-line-soft/80">
            {[
              { label: 'Driver', value: selectedVehicle.driver ?? '—' },
              { label: 'Status', value: selectedVehicle.status ?? '—' },
              { label: 'Location', value: selectedVehicle.location ?? '—' },
              { label: 'Firmware', value: selectedVehicle.firmware ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-panel p-3">
                <div className="text-[9.5px] font-semibold uppercase tracking-wider text-dim">{label}</div>
                <div className="mt-0.5 font-mono text-[11.5px] font-bold text-hi truncate">{value}</div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onStartEdit}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[12.5px] font-semibold text-hi hover:border-accent/40 hover:text-accent hover:bg-accent/5 transition-all cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5" strokeWidth={2} />
            Edit Vehicle Details
          </button>
        </div>
      </div>

      {/* ── 3. Danger Zone ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between border-b border-line-soft bg-red/5 px-5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-red/15 text-red">
              <AlertCircle className="h-2.5 w-2.5" strokeWidth={2.5} />
            </span>
            <span>Danger Zone</span>
          </div>
          <span className="font-mono text-[9.5px] text-red/60 uppercase">Irreversible</span>
        </div>

        <div className="px-5 py-4 bg-panel-2/20 space-y-3">
          <p className="text-[11px] text-dim leading-relaxed">
            Removing a vehicle permanently deletes all its data from the fleet. This action cannot be undone.
          </p>

          {confirmDelete ? (
            <div className="rounded-xl border border-red/40 bg-red/8 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-red shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <div className="text-[12px] font-bold text-red">Confirm removal</div>
                  <div className="text-[11px] text-dim mt-0.5">
                    <span className="font-semibold text-hi">{selectedVehicle.name}</span> ({selectedVehicle.plate}) will be permanently removed from the fleet.
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onDeleteVehicle(selectedVehicle.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red/20 border border-red/30 px-3 py-2 text-[12px] font-semibold text-red hover:bg-red/30 cursor-pointer transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  Yes, Remove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex flex-1 items-center justify-center rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12px] font-medium text-lo hover:bg-hover cursor-pointer transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-red/20 bg-red/5 px-3 py-2.5 text-[12px] font-semibold text-red/70 hover:border-red/50 hover:bg-red/10 hover:text-red transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Remove {selectedVehicle.name} from Fleet
            </button>
          )}
        </div>
      </div>
    </>
  )
}
