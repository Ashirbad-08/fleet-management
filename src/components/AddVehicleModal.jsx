import { useState } from 'react'
import { X, Plus, Save } from './icons'
import { useFleet } from '../context/FleetContext'

export default function AddVehicleModal({ open, onClose }) {
  const { addVehicle } = useFleet()
  const [formData, setFormData] = useState({
    name: '',
    plate: '',
    model: '',
    driver: '',
    status: 'online',
    battery: 100,
    rangeKm: 80,
    location: '',
    lat: 12.9716,
    lon: 77.5946,
  })

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.plate || !formData.model) return
    addVehicle({
      ...formData,
      battery: Number(formData.battery),
      rangeKm: Number(formData.rangeKm),
      lat: Number(formData.lat) || 12.9716,
      lon: Number(formData.lon) || 77.5946,
    })
    // Reset form
    setFormData({
      name: '',
      plate: '',
      model: '',
      driver: '',
      status: 'online',
      battery: 100,
      rangeKm: 80,
      location: '',
      lat: 12.9716,
      lon: 77.5946,
    })
    onClose()
  }

  const inputCls = 'w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi outline-none focus:border-accent'

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity"
      />
      <div className="fixed left-1/2 top-1/2 z-50 max-h-[92dvh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-line bg-panel shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-accent" strokeWidth={2.5} />
            <span className="font-display text-[15px] font-bold">Add New Vehicle</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi"
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
                placeholder="e.g. Courier 21"
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
                placeholder="e.g. DL3C AY 9982"
                value={formData.plate}
                onChange={(e) => setFormData((f) => ({ ...f, plate: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Model</label>
              <input
                required
                type="text"
                placeholder="e.g. Mahindra eSupro"
                value={formData.model}
                onChange={(e) => setFormData((f) => ({ ...f, model: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Driver</label>
              <input
                type="text"
                placeholder="e.g. Amit Sen"
                value={formData.driver}
                onChange={(e) => setFormData((f) => ({ ...f, driver: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Range (km)</label>
              <input
                type="number"
                min="0"
                value={formData.rangeKm}
                onChange={(e) => setFormData((f) => ({ ...f, rangeKm: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Initial Location</label>
            <input
              type="text"
              placeholder="e.g. Depot 3, Sector 5"
              value={formData.location}
              onChange={(e) => setFormData((f) => ({ ...f, location: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Latitude</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 12.9716"
                value={formData.lat}
                onChange={(e) => setFormData((f) => ({ ...f, lat: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">Longitude</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 77.5946"
                value={formData.lon}
                onChange={(e) => setFormData((f) => ({ ...f, lon: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-line-soft pt-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-line bg-panel-2 py-2 text-[12.5px] font-medium text-lo hover:bg-hover hover:text-hi"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent/20 py-2 text-[12.5px] font-medium text-accent hover:bg-accent/30"
            >
              <Save className="h-4 w-4" strokeWidth={2} />
              Register Vehicle
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
