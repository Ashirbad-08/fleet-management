import { Radio, Cpu, Zap, BookOpen, Plug, ShieldCheck, Users, MapPin, Settings2, History } from '../icons'

const TABS = [
  { id: 'telemetry', label: 'Live', icon: Radio },
  { id: 'trips', label: 'Trips', icon: History, countKey: 'trips' },
  { id: 'hardware', label: 'Hardware', icon: Cpu },
  { id: 'specs', label: 'Battery', icon: Zap },
  { id: 'charging', label: 'Charging', icon: Plug },
  { id: 'parking', label: 'Parking', icon: MapPin },
  { id: 'compliance', label: 'Docs', icon: ShieldCheck },
  { id: 'passport', label: 'Passport', icon: BookOpen },
  { id: 'contacts', label: 'Driver', icon: Users },
  { id: 'manage', label: 'Manage', icon: Settings2 },
]

export default function VehicleDrawerTabs({ activeTab, onSelectTab, tripsCount = 50 }) {
  return (
    <div
      className="flex overflow-x-auto scroll-smooth border-b border-line bg-panel-2 text-[11px] font-semibold text-lo backdrop-blur-md scrollbar-none no-scrollbar"
      data-component="VehicleDrawerTabs" data-slot="tabs-container" role="tablist"
      aria-label="Vehicle Drawer Navigation Tabs"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        const badgeCount = tab.countKey === 'trips' ? tripsCount : null

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-action="select-drawer-tab" onClick={() => onSelectTab(tab.id)}
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
