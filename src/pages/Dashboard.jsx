import { Link } from 'react-router-dom'
import Topbar from '../components/Topbar'
import StatsRow from '../components/StatsRow'
import FilterChips from '../components/FilterChips'
import VehicleTable from '../components/VehicleTable'
import AlertsFeed from '../components/AlertsFeed'
import { ChevronRight } from '../components/icons'

export default function Dashboard() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Topbar title="Fleet overview" subtitle="Connected vehicle telemetry & device management" />

      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-24 pt-5 sm:px-6 md:overflow-hidden md:pb-0">
        <StatsRow />

        <div className="grid flex-1 grid-cols-1 gap-4 pb-5 md:min-h-0 xl:grid-cols-[minmax(0,1fr)_300px] xl:overflow-hidden">
          <div className="flex min-h-[26rem] flex-col overflow-hidden rounded-xl border border-line bg-panel xl:min-h-0">
            <div className="flex flex-col gap-3 border-b border-line-soft px-4 py-3.25 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-display text-[13.5px] font-semibold">All vehicle details</div>
              <div className="flex flex-wrap items-center gap-2">
                <FilterChips />
                <Link
                  to="/vehicles"
                  className="inline-flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-[11px] font-medium text-lo transition-colors hover:bg-hover hover:text-hi"
                >
                  See all details
                  <ChevronRight className="h-3 w-3" strokeWidth={2.4} />
                </Link>
              </div>
            </div>
            <VehicleTable limit={5} />
          </div>

          <div className="flex min-h-80 flex-col overflow-hidden rounded-xl border border-line bg-panel xl:min-h-0">
            <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3.25">
              <div className="font-display text-[13.5px] font-semibold">Live event feed</div>
              <Link
                to="/alerts"
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-[11px] font-medium text-lo transition-colors hover:bg-hover hover:text-hi"
              >
                See all events
                <ChevronRight className="h-3 w-3" strokeWidth={2.4} />
              </Link>
            </div>
            <AlertsFeed limit={6} />
          </div>
        </div>
      </div>
    </div>
  )
}
