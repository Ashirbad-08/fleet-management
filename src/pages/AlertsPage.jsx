import Topbar from '../components/Topbar'
import AlertsFeed from '../components/AlertsFeed'

export default function AlertsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Topbar title="Alerts" subtitle="All device and vehicle events, most recent first" />

      <div className="flex-1 overflow-hidden px-4 pb-24 py-5 sm:px-6 md:pb-5">
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-panel">
          <div className="border-b border-line-soft px-4 py-3.25">
            <div className="font-display text-[13.5px] font-semibold">Event log</div>
          </div>
          <AlertsFeed />
        </div>
      </div>
    </div>
  )
}
