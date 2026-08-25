import { useState, useRef, useEffect } from 'react'
import Topbar from '../components/Topbar'
import StatsRow from '../components/StatsRow'
import MapLeaflet from '../components/MapLeaflet'
import AlertsFeed from '../components/AlertsFeed'
import { RotateCw, Filter, ChevronDown, Check } from '../components/icons'
import { useFleet } from '../context/FleetContext'

const FILTER_OPTIONS = [
  { key: 'all', label: 'All Vehicles', color: null },
  { key: 'online', label: 'Online', color: 'bg-green' },
  { key: 'idle', label: 'Idle', color: 'bg-amber' },
  { key: 'alert', label: 'Alert', color: 'bg-red' },
  { key: 'offline', label: 'Offline', color: 'bg-gray' },
]

export default function Dashboard() {
  const { filteredVehicles, statusFilter, setStatusFilter, showToast } = useFleet()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
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

  const currentFilterObj = FILTER_OPTIONS.find((o) => o.key === statusFilter) || FILTER_OPTIONS[0]

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Topbar title="Fleet overview" subtitle="Connected vehicle telemetry & live location tracking" />

      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-24 pt-5 sm:px-6 md:overflow-hidden md:pb-0">
        <StatsRow />

        <div className="grid flex-1 grid-cols-1 gap-4 pb-5 md:min-h-0 xl:grid-cols-[minmax(0,1fr)_320px] xl:overflow-hidden">
          <div className="flex min-h-[36rem] flex-col overflow-hidden rounded-xl border border-line bg-panel xl:min-h-0 relative">
            
            {/* Top-Left Floating Overlay (2 Small Buttons Stacked Vertically) */}
            <div
              className="absolute left-3 top-3 z-[1000] flex flex-col gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 1. Small Refresh Button (Top) */}
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-panel/90 px-2.5 py-1 text-[11px] font-medium text-hi backdrop-blur-md shadow-md transition-colors hover:border-accent/40 hover:bg-hover cursor-pointer"
                title="Refresh map telemetry"
              >
                <RotateCw className={`h-3 w-3 text-accent ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
                <span>Refresh</span>
              </button>

              {/* 2. Small Filter Button (Bottom) */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setFilterOpen((prev) => !prev)}
                  className="flex items-center justify-between gap-1.5 rounded-lg border border-line bg-panel/90 px-2.5 py-1 text-[11px] font-medium text-hi backdrop-blur-md shadow-md transition-colors hover:border-accent/40 hover:bg-hover cursor-pointer w-full"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Filter className="h-3 w-3 shrink-0 text-accent" strokeWidth={2} />
                    <span className="truncate">{currentFilterObj.label}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
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
            <div className="relative flex-1 h-full w-full">
              <MapLeaflet key={refreshKey} vehicles={filteredVehicles} height="100%" />
            </div>
          </div>

          {/* Aesthetic Live Event Feed Widget */}
          <div className="flex min-h-[36rem] flex-col overflow-hidden rounded-xl border border-line bg-panel xl:min-h-0">
            <div className="flex items-center gap-2 border-b border-line-soft px-4 py-3">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
              <div className="font-display text-[13.5px] font-semibold text-hi">Live event feed</div>
            </div>
            <AlertsFeed limit={7} showSearchFilter={false} showSeeAll={true} />
          </div>
        </div>
      </div>
    </div>
  )
}
