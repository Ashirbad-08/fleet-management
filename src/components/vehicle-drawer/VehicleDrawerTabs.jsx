import { Cpu, Zap, BookOpen, Plug, ShieldCheck, Users, MapPin, Settings2 } from '../icons'

const TABS = [
  { id: 'telemetry', label: 'Live', icon: Cpu },
  { id: 'specs', label: 'Battery', icon: Zap },
  { id: 'passport', label: 'Passport', icon: BookOpen },
  { id: 'charging', label: 'Charging', icon: Plug },
  { id: 'parking', label: 'Parking', icon: MapPin },
  { id: 'compliance', label: 'Docs', icon: ShieldCheck },
  { id: 'contacts', label: 'Driver', icon: Users },
  { id: 'manage', label: 'Manage', icon: Settings2 },
]

export default function VehicleDrawerTabs({ activeTab, onSelectTab }) {
  return (
    <div
      className="sticky top-0 z-10 flex overflow-x-auto scroll-smooth border-b border-line bg-panel-2/80 text-[11px] font-semibold text-lo backdrop-blur-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectTab(tab.id)}
            className={`flex shrink-0 min-w-[68px] items-center justify-center gap-1 px-2 py-2.5 border-b-2 transition-all cursor-pointer snap-start ${
              isActive
                ? 'border-accent text-accent bg-accent/10 font-bold'
                : 'border-transparent text-lo hover:text-hi hover:bg-hover'
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-[10px] sm:text-[10.5px]">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
