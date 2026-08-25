import { NavLink } from 'react-router-dom'
import { LayoutGrid, Truck, Cpu, TriangleAlert, MapPin, UploadCloud, Settings, Users, Bell, Leaf } from './icons'
import { useFleet } from '../context/FleetContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/vehicles', label: 'Vehicles', icon: Truck, countKey: 'total' },
  { to: '/devices', label: 'Devices', icon: Cpu },
  { to: '/esg', label: 'ESG Savings', icon: Leaf },
  { to: '/alerts', label: 'Alerts', icon: TriangleAlert, countKey: 'critical' },
  { to: '/geofences', label: 'Geofences', icon: MapPin },
  { to: '/firmware', label: 'Firmware', icon: UploadCloud },
  { to: '/admins', label: 'Admins', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Bell, countKey: 'unread' },
]

export default function Sidebar() {
  const { stats } = useFleet()

  return (
    <>
      <aside className="hidden h-screen w-54 shrink-0 flex-col border-r border-line bg-panel p-3 md:flex">
        <div className="px-2 pb-5 pt-1">
          <div className="font-display text-[25px] font-bold leading-none tracking-tight">
            Electri<span className="text-accent">E</span>
          </div>
          <div className="mt-1.5 font-mono text-[12px] uppercase tracking-wider text-dim">Fleet Monitor</div>
        </div>

        <nav className="mt-2 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, countKey }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                  isActive ? 'bg-accent/15 text-accent' : 'text-lo hover:bg-hover hover:text-hi'
                }`
              }
            >
              <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={2} />
              <span>{label}</span>
              {countKey && (
                <span className="ml-auto rounded-full bg-panel-2 px-1.5 py-0.5 font-mono text-[10.5px] text-dim">
                  {stats[countKey]}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 border-t border-line-soft pt-3">
          <div className="nav-label px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-dim">
            System
          </div>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                isActive ? 'bg-accent/15 text-accent' : 'text-lo hover:bg-hover hover:text-hi'
              }`
            }
          >
            <Settings className="h-[15px] w-[15px]" strokeWidth={2} />
            Settings
          </NavLink>
        </div>

        <div className="mt-auto pt-3.5">
          <div className="flex items-center gap-2 rounded-lg border border-line-soft bg-panel-2 px-2.5 py-2.5">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse-dot rounded-full bg-green shadow-[0_0_0_3px_rgba(61,220,132,0.13)]" />
            <p className="text-[11px] leading-snug text-lo">
              <b className="font-semibold text-hi">{stats.online}</b> devices reporting live
            </p>
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto border-t border-line bg-panel/95 px-2 py-2 backdrop-blur md:hidden">
        {[...NAV_ITEMS, { to: '/settings', label: 'Settings', icon: Settings }].map(({ to, label, icon: Icon, end, countKey }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex min-w-17 flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors ${
                isActive ? 'bg-accent/15 text-accent' : 'text-lo'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="max-w-full truncate">{label}</span>
            {countKey && stats[countKey] > 0 && (
              <span className="absolute right-1 top-0 rounded-full bg-panel-2 px-1 font-mono text-[9px] text-dim">
                {stats[countKey]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
