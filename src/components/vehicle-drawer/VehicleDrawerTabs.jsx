import { Cpu, Zap, BookOpen, Plug, ShieldCheck, Users, MapPin, Settings2, History, Radio } from '../icons'

const TABS = [
  { id: 'telemetry', label: 'Live', icon: Cpu },
  { id: 'trips', label: 'Trips', icon: History, countKey: 'trips' },
  { id: 'timeline', label: 'Timeline', icon: Radio, countKey: 'timeline' },
  { id: 'specs', label: 'Battery', icon: Zap },
  { id: 'charging', label: 'Charging', icon: Plug },
  { id: 'parking', label: 'Parking', icon: MapPin },
  { id: 'compliance', label: 'Docs', icon: ShieldCheck },
  { id: 'passport', label: 'Passport', icon: BookOpen },
  { id: 'contacts', label: 'Driver', icon: Users },
  { id: 'manage', label: 'Manage', icon: Settings2 },
]

export default function VehicleDrawerTabs({ activeTab, onSelectTab, tripsCount = 50, timelineCount = 10 }) {
  return (
    <div
      className="sticky top-0 z-10 flex overflow-x-auto scroll-smooth border-b border-line bg-panel-2/90 text-[11px] font-semibold text-lo backdrop-blur-md scrollbar-none no-scrollbar"
      role="tablist"
      aria-label="Vehicle Drawer Navigation Tabs"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        const badgeCount = tab.countKey === 'trips' ? tripsCount : tab.countKey === 'timeline' ? timelineCount : null

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectTab(tab.id)}
            className={`flex shrink-0 min-w-[70px] items-center justify-center gap-1.5 px-3 py-2.5 border-b-2 transition-all cursor-pointer snap-start ${
              isActive
                ? 'border-accent text-accent bg-accent/10 font-bold'
                : 'border-transparent text-lo hover:text-hi hover:bg-hover'
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-[10.5px]">{tab.label}</span>
            {badgeCount !== null && (
              <span
                className={`rounded-full px-1.5 py-0.2 font-mono text-[9px] tabular-nums ${
                  isActive
                    ? 'bg-accent text-black font-bold'
                    : 'bg-panel border border-line-soft text-dim'
                }`}
              >
                {badgeCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
