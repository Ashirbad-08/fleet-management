import { useState } from 'react'
import Topbar from '../components/Topbar'
import FilterChips from '../components/FilterChips'
import VehicleTable from '../components/VehicleTable'
import AddVehicleModal from '../components/AddVehicleModal'
import { Plus } from '../components/icons'
import { useFleet } from '../context/FleetContext'

export default function Vehicles() {
  const { vehicles } = useFleet()
  const [modalOpen, setModalOpen] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const exportToCSV = (data) => {
    const headers = [
      'ID', 'Name', 'Plate', 'Type', 'Model', 'Driver', 'Status', 
      'Device ID', 'Firmware', 'Battery', 'Health', 'Speed (km/h)', 
      'Range (km)', 'Location', 'Latitude', 'Longitude', 'Odometer (km)'
    ]
    const rows = data.map(v => [
      v.id,
      v.name,
      v.plate,
      v.type || '4 Wheeler',
      v.model,
      v.driver,
      v.status,
      v.deviceId,
      v.firmware,
      v.battery,
      v.health,
      v.speed,
      v.rangeKm,
      v.location,
      v.lat,
      v.lon,
      v.odometerKm
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `fleet_roster_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = (data) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2))
    const link = document.createElement("a")
    link.setAttribute("href", dataStr)
    link.setAttribute("download", `fleet_roster_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Topbar title="Vehicles" subtitle="Full fleet roster and live device status" />

      <div className="flex flex-1 flex-col overflow-hidden px-4 pb-24 py-5 sm:px-6 md:pb-5">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-line bg-panel">
          <div className="flex flex-col gap-3 border-b border-line-soft px-4 py-3.25 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-[13.5px] font-semibold">All vehicles</span>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1 rounded-lg bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent hover:bg-accent/25 transition-colors"
              >
                <Plus className="h-3 w-3" strokeWidth={2.5} />
                Add Vehicle
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-[11px] font-medium text-lo hover:bg-hover hover:text-hi transition-colors"
                >
                  Export Data
                </button>
                {showExportMenu && (
                  <div className="absolute left-0 mt-1 z-20 w-32 rounded-lg border border-line bg-panel shadow-md py-1">
                    <button
                      onClick={() => {
                        exportToCSV(vehicles)
                        setShowExportMenu(false)
                      }}
                      className="w-full px-3 py-1.5 text-left text-[11.5px] hover:bg-hover text-lo hover:text-hi"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => {
                        exportToJSON(vehicles)
                        setShowExportMenu(false)
                      }}
                      className="w-full px-3 py-1.5 text-left text-[11.5px] hover:bg-hover text-lo hover:text-hi"
                    >
                      Export JSON
                    </button>
                  </div>
                )}
              </div>
            </div>
            <FilterChips />
          </div>
          <VehicleTable />
        </div>
      </div>

      <AddVehicleModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
