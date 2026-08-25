import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../components/Topbar'
import StatsRow from '../components/StatsRow'
import MapLeaflet from '../components/MapLeaflet'
import AlertsFeed from '../components/AlertsFeed'
import { RotateCw, Filter, ChevronDown, Check, ChevronRight, Maximize2, Minimize2, X } from '../components/icons'
import { useFleet } from '../context/FleetContext'

const FILTER_OPTIONS = [
  { key: 'all', label: 'All Vehicles', color: null },
  { key: 'online', label: 'Online', color: 'bg-green' },
  { key: 'idle', label: 'Idle', color: 'bg-amber' },
  { key: 'alert', label: 'Alert', color: 'bg-red' },
  { key: 'offline', label: 'Offline', color: 'bg-gray' },
]

export default function Dashboard() {
  const { filteredVehicles, vehicles, statusFilter, setStatusFilter, showToast } = useFleet()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [fullScreenMap, setFullScreenMap] = useState(false)
  const filterRef = useRef(null)

  const handleRefresh = (e) => {
    e.stopPropagation()
    setIsRefreshing(true)
    setRefreshKey((k) => k + 1)
    if (showToast) showToast('Map telemetry refreshed')
    setTimeout(() => setIsRefreshing(false), 600)
  }

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close full screen on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setFullScreenMap(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const currentFilterObj = FILTER_OPTIONS.find((o) => o.key === statusFilter) || FILTER_OPTIONS[0]

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Topbar title="Fleet overview" subtitle="Connected vehicle telemetry & live location tracking" />

      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-24 pt-5 sm:px-6 md:overflow-hidden md:pb-0">
        <StatsRow />

        <div className="grid flex-1 grid-cols-1 gap-4 pb-5 md:min-h-0 xl:grid-cols-[minmax(0,1fr)_320px] xl:overflow-hidden">
          
          {/* Aesthetic Fleet Tracking Map Container */}
          <div className="flex min-h-[36rem] flex-col overflow-hidden rounded-xl border border-line bg-panel xl:min-h-0 relative shadow-sm">
            
            {/* Professional Header Bar */}
            <div className="flex items-center justify-between border-b border-line-soft px-4 py-2.5 shrink-0 bg-panel/40">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <div className="font-display text-[13.5px] font-semibold text-hi">Fleet tracking map</div>
                <span className="ml-1.5 rounded-full border border-line-soft bg-panel-2 px-2 py-0.5 font-mono text-[10px] text-dim">
                  {filteredVehicles.length} / {vehicles.length} Active
                </span>
              </div>

              <Link
                to="/vehicles"
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-[11px] font-medium text-lo transition-colors hover:bg-hover hover:text-hi"
              >
                <span>View roster</span>
                <ChevronRight className="h-3 w-3" strokeWidth={2.4} />
              </Link>
            </div>

            {/* Map Canvas with Floating Controls & Legend */}
            <div className="relative flex-1 h-full w-full">
              
              {/* Top-Left Floating Controls Toolbar (Icon only by default, expands on hover) */}
              <div
                className="absolute left-3 top-3 z-[1000] flex flex-col items-start gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1. View Full Map Button */}
                <button
                  onClick={() => setFullScreenMap(true)}
                  className="group flex h-7 items-center gap-1.5 overflow-hidden rounded-lg border border-line bg-panel/90 px-1.75 text-[11px] font-medium text-hi backdrop-blur-md shadow-md transition-all duration-300 ease-out hover:pr-2.5 hover:border-accent/40 hover:bg-hover cursor-pointer"
                  title="View full map"
                >
                  <Maximize2 className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
                  <span className="max-w-0 opacity-0 whitespace-nowrap transition-all duration-300 ease-out group-hover:max-w-xs group-hover:opacity-100">
                    View full map
                  </span>
                </button>

                {/* 2. Refresh Button */}
                <button
                  onClick={handleRefresh}
                  className="group flex h-7 items-center gap-1.5 overflow-hidden rounded-lg border border-line bg-panel/90 px-1.75 text-[11px] font-medium text-hi backdrop-blur-md shadow-md transition-all duration-300 ease-out hover:pr-2.5 hover:border-accent/40 hover:bg-hover cursor-pointer"
                  title="Refresh map telemetry"
                >
                  <RotateCw className={`h-3.5 w-3.5 shrink-0 text-accent ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
                  <span className="max-w-0 opacity-0 whitespace-nowrap transition-all duration-300 ease-out group-hover:max-w-xs group-hover:opacity-100">
                    Refresh
                  </span>
                </button>

                {/* 3. Filter Status Dropdown Button */}
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setFilterOpen((prev) => !prev)}
                    className="group flex h-7 items-center gap-1.5 overflow-hidden rounded-lg border border-line bg-panel/90 px-1.75 text-[11px] font-medium text-hi backdrop-blur-md shadow-md transition-all duration-300 ease-out hover:pr-2.5 hover:border-accent/40 hover:bg-hover cursor-pointer"
                    title="Filter status"
                  >
                    <Filter className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
                    <div className="flex max-w-0 items-center gap-1.5 opacity-0 whitespace-nowrap transition-all duration-300 ease-out group-hover:max-w-xs group-hover:opacity-100">
                      <span>{currentFilterObj.label}</span>
                      {currentFilterObj.color && (
                        <span className={`h-1.5 w-1.5 rounded-full ${currentFilterObj.color}`} />
                      )}
                      <ChevronDown className="h-3 w-3 text-dim" strokeWidth={2} />
                    </div>
                  </button>

                  {filterOpen && (
                    <div className="absolute left-0 top-full mt-1 w-40 rounded-xl border border-line bg-panel-2 py-1 shadow-xl z-[1001] backdrop-blur">
                      <div className="px-3 py-1 font-mono text-[9.5px] uppercase tracking-wider text-dim">
                        Filter Status
                      </div>
                      {FILTER_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => {
                            setStatusFilter(opt.key)
                            setFilterOpen(false)
                          }}
                          className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[11px] font-medium transition-colors cursor-pointer ${
                            statusFilter === opt.key
                              ? 'bg-accent/15 text-accent'
                              : 'text-lo hover:bg-hover hover:text-hi'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {opt.color ? (
                              <span className={`h-1.5 w-1.5 rounded-full ${opt.color}`} />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-dim" />
                            )}
                            <span>{opt.label}</span>
                          </div>
                          {statusFilter === opt.key && (
                            <Check className="h-3 w-3 text-accent" strokeWidth={2.5} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Leaflet Map */}
              <MapLeaflet key={refreshKey} vehicles={filteredVehicles} height="100%" />
            </div>
          </div>

          {/* Aesthetic Live Event Feed Widget */}
          <div className="flex min-h-[36rem] flex-col overflow-hidden rounded-xl border border-line bg-panel xl:min-h-0">
            <div className="flex items-center gap-2 border-b border-line-soft px-4 py-3 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
              <div className="font-display text-[13.5px] font-semibold text-hi">Live event feed</div>
            </div>
            <AlertsFeed limit={7} showSearchFilter={false} showSeeAll={true} />
          </div>
        </div>
      </div>

      {/* Full Screen Map Modal Overlay */}
      {fullScreenMap && (
        <div className="fixed inset-0 z-[2000] flex flex-col bg-base backdrop-blur-lg">
          <div className="flex items-center justify-between border-b border-line bg-panel px-6 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="font-display text-[15px] font-bold text-hi">Fleet Tracking Map — Full View</span>
              <span className="rounded-full border border-line bg-panel-2 px-2.5 py-0.5 font-mono text-[11px] text-dim">
                {filteredVehicles.length} Vehicles Displayed
              </span>
            </div>
            <button
              onClick={() => setFullScreenMap(false)}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-[12px] font-semibold text-hi hover:bg-hover hover:border-accent/40 transition-colors cursor-pointer"
            >
              <Minimize2 className="h-4 w-4 text-accent" strokeWidth={2} />
              <span>Exit Full Screen</span>
            </button>
          </div>
          <div className="relative flex-1 w-full h-full">
            <MapLeaflet vehicles={filteredVehicles} height="100%" />
          </div>
        </div>
      )}
    </div>
  )
}
