import { Save } from '../icons'
import { STATUS_META } from '../../data/statusMeta'

const STATUSES = ['online', 'idle', 'alert', 'offline']

const inputCls =
  'w-full rounded-md border border-line bg-panel-2 px-2.5 py-1.5 text-[12.5px] text-hi outline-none focus:border-line focus:outline-none'

export default function EditVehicleForm({
  editForm,
  setEditForm,
  selectedVehicle,
  onSave,
  onCancel,
}) {
  return (
    <div className="space-y-4 border-b border-line-soft px-5 py-4">
      <div className="flex items-center justify-between border-b border-line-soft pb-2">
        <span className="text-[12px] font-bold text-hi uppercase tracking-wide">
          Edit Vehicle Specifications
        </span>
        <span className="font-mono text-[10px] text-accent">{selectedVehicle.plate}</span>
      </div>

      {/* Section: Status & Operations */}
      <div className="space-y-2.5">
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-dim">
          Operations & Status
        </div>
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
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-dim">
          Live Telemetry Values
        </div>
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
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-dim">
          Hardware & Compliance
        </div>
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
          type="button"
          onClick={onSave}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent/15 px-3 py-2 text-[12.5px] font-medium text-accent hover:bg-accent/25 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" strokeWidth={2} />
          Save changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex flex-1 items-center justify-center rounded-lg border border-line bg-panel-2 px-3 py-2 text-[12.5px] font-medium text-lo hover:bg-hover cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
