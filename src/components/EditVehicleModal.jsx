import { useState, useEffect } from 'react'
import { X, Edit2, Save } from './icons'
import { useFleet } from '../context/FleetContext'

export default function EditVehicleModal({ vehicle, open, onClose }) {
  const { updateVehicle, showToast } = useFleet()
  const [formData, setFormData] = useState({
    name: '',
    plate: '',
    model: '',
    type: '4 Wheeler',
    driver: '',
    driverPhone: '',
    status: 'online',
    battery: 100,
    speed: 0,
    batterySerial: '',
    batteryCapacityKwh: 12.8,
    batteryChemistry: 'LFP',
    insuranceExpiry: '2026-12-31',
    chassisNumber: '',
    hubSupervisorName: '',
    hubSupervisorPhone: '',
    location: '',
  })

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name || '',
        plate: vehicle.plate || '',
        model: vehicle.model || '',
        type: vehicle.type || '4 Wheeler',
        driver: vehicle.driver || '',
        driverPhone: vehicle.driverPhone || '',
        status: vehicle.status || 'online',
        battery: vehicle.battery ?? 100,
        speed: vehicle.speed ?? 0,
        batterySerial: vehicle.batterySerial || '',
        batteryCapacityKwh: vehicle.batteryCapacityKwh ?? 12.8,
        batteryChemistry: vehicle.batteryChemistry || 'LFP',
        insuranceExpiry: vehicle.insuranceExpiry || '',
        chassisNumber: vehicle.chassisNumber || '',
        hubSupervisorName: vehicle.hubSupervisorName || '',
        hubSupervisorPhone: vehicle.hubSupervisorPhone || '',
        location: vehicle.location || '',
      })
    }
  }, [vehicle])

  if (!open || !vehicle) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.plate || !formData.model) return

    updateVehicle(vehicle.id, {
      name: formData.name,
      plate: formData.plate,
      model: formData.model,
      type: formData.type,
      driver: formData.driver,
      driverPhone: formData.driverPhone,
      status: formData.status,
      battery: Number(formData.battery),
      speed: Number(formData.speed),
      batterySerial: formData.batterySerial,
      batteryCapacityKwh: Number(formData.batteryCapacityKwh) || vehicle.batteryCapacityKwh,
      batteryChemistry: formData.batteryChemistry,
      insuranceExpiry: formData.insuranceExpiry,
      chassisNumber: formData.chassisNumber,
      hubSupervisorName: formData.hubSupervisorName,
      hubSupervisorPhone: formData.hubSupervisorPhone,
      location: formData.location,
      health: Number(formData.battery),
    })

    if (showToast) {
      showToast(`${formData.name} updated successfully`)
    }

    onClose()
  }

  const inputCls = 'w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi outline-none focus:border-line focus:outline-none'

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity"
      />
      <div className="fixed left-1/2 top-1/2 z-50 max-h-[92dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-line bg-panel shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
          <div className="flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-accent" strokeWidth={2.5} />
            <span className="font-display text-[15px] font-bold">Edit Vehicle</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi cursor-pointer"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(92dvh-4.5rem)] space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">License Plate</label>
              <input
                required
                type="text"
                value={formData.plate}
                onChange={(e) => setFormData((f) => ({ ...f, plate: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Vehicle Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value }))}
                className={inputCls + ' cursor-pointer'}
              >
                <option value="2 Wheeler">2 Wheeler</option>
                <option value="3 Wheeler">3 Wheeler</option>
                <option value="4 Wheeler">4 Wheeler</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Model</label>
              <input
                required
                type="text"
                value={formData.model}
                onChange={(e) => setFormData((f) => ({ ...f, model: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Driver Name</label>
              <input
                type="text"
                value={formData.driver}
                onChange={(e) => setFormData((f) => ({ ...f, driver: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Driver Phone</label>
              <input
                type="text"
                value={formData.driverPhone}
                onChange={(e) => setFormData((f) => ({ ...f, driverPhone: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value }))}
                className={inputCls + ' cursor-pointer'}
              >
                <option value="online">Online</option>
                <option value="idle">Idle</option>
                <option value="alert">Alert</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Battery Hardware Section */}
          <div className="rounded-lg border border-line-soft bg-panel-2/30 p-3 space-y-2.5">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-accent">
              Battery & Compliance Specs
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[10px] text-dim">Battery Serial</label>
                <input
                  type="text"
                  value={formData.batterySerial}
                  onChange={(e) => setFormData((f) => ({ ...f, batterySerial: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-dim">Capacity (kWh)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.batteryCapacityKwh}
                  onChange={(e) => setFormData((f) => ({ ...f, batteryCapacityKwh: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-dim">Chemistry</label>
                <select
                  value={formData.batteryChemistry}
                  onChange={(e) => setFormData((f) => ({ ...f, batteryChemistry: e.target.value }))}
                  className={inputCls + ' cursor-pointer'}
                >
                  <option value="LFP">LFP</option>
                  <option value="NMC">NMC</option>
                  <option value="Solid State">Solid State</option>
                  <option value="LTO">LTO</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] text-dim">Chassis / VIN</label>
                <input
                  type="text"
                  value={formData.chassisNumber}
                  onChange={(e) => setFormData((f) => ({ ...f, chassisNumber: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-dim">Insurance Expiry</label>
                <input
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={(e) => setFormData((f) => ({ ...f, insuranceExpiry: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Hub Supervisor Name</label>
              <input
                type="text"
                value={formData.hubSupervisorName}
                onChange={(e) => setFormData((f) => ({ ...f, hubSupervisorName: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Hub Supervisor Phone</label>
              <input
                type="text"
                value={formData.hubSupervisorPhone}
                onChange={(e) => setFormData((f) => ({ ...f, hubSupervisorPhone: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Battery %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.battery}
                onChange={(e) => setFormData((f) => ({ ...f, battery: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Speed (km/h)</label>
              <input
                type="number"
                min="0"
                value={formData.speed}
                onChange={(e) => setFormData((f) => ({ ...f, speed: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((f) => ({ ...f, location: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-line-soft pt-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-line bg-panel-2 py-2 text-[12.5px] font-medium text-lo hover:bg-hover hover:text-hi cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent/20 py-2 text-[12.5px] font-medium text-accent hover:bg-accent/30 cursor-pointer"
            >
              <Save className="h-4 w-4" strokeWidth={2} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
