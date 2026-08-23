import { useEffect, useRef, useState } from 'react'
import { Search, Bell, Settings as SettingsIcon } from './icons'
import { useFleet } from '../context/FleetContext'
import NotificationDropdown from './NotificationDropdown'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ title, subtitle }) {
  const { searchQuery, setSearchQuery, unreadCount, admins } = useFleet()
  const [clock, setClock] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const bellRef = useRef(null)
  const navigate = useNavigate()
  const currentAdmin = admins[0]

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-GB'))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="flex flex-col gap-3 border-b border-line px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:gap-4">
      <div className="min-w-0">
        <div className="truncate font-display text-[16px] font-bold sm:text-[17px]">{title}</div>
        {subtitle && <div className="mt-0.5 text-[11.5px] text-dim">{subtitle}</div>}
      </div>

      <div className="flex w-full items-center gap-2 rounded-lg border border-line bg-panel px-2.5 py-1.5 lg:ml-2 lg:w-70">
        <Search className="h-3.5 w-3.5 shrink-0 text-dim" strokeWidth={2} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          type="text"
          placeholder="Search vehicle, plate or device ID…"
          className="w-full bg-transparent text-[12.5px] text-hi outline-none placeholder:text-dim"
        />
      </div>

      <div className="flex w-full items-center justify-between gap-3 lg:ml-auto lg:w-auto lg:justify-start">
        <div className="font-mono text-[11.5px] tracking-wide text-lo">{clock}</div>

        {/* Bell with dropdown */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel text-lo hover:bg-hover hover:text-hi transition-colors"
          >
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-0.5 text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            <Bell className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <NotificationDropdown open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        <button
          onClick={() => navigate('/settings')}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-panel text-lo hover:bg-hover hover:text-hi"
        >
          <SettingsIcon className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        <button
          onClick={() => navigate('/profile')}
          title="View profile"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-panel-2 font-display text-[11px] font-bold text-lo hover:bg-hover hover:text-hi"
        >
          {currentAdmin?.initials ?? 'RA'}
        </button>
      </div>
    </header>
  )
}
