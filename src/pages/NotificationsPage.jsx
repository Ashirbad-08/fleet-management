import { useState, useMemo } from 'react'
import Topbar from '../components/Topbar'
import { useFleet } from '../context/FleetContext'
import { Bell, CheckCheck, Trash2, X, AlertCircle, Info, TriangleAlert, Check } from '../components/icons'
import { useNavigate } from 'react-router-dom'

const TYPE_ICON = {
  warning: TriangleAlert,
  info: Info,
  critical: AlertCircle,
}

const TYPE_CLASSES = {
  warning: 'bg-amber/15 text-amber border border-amber/20',
  info: 'bg-accent/15 text-accent border border-accent/20',
  critical: 'bg-red/15 text-red border border-red/20',
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    vehicles,
    setSelectedVehicleId,
  } = useFleet()
  const navigate = useNavigate()

  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'unread') return !n.read
      if (filter === 'read') return n.read
      return true
    })
  }, [notifications, filter])

  const handleNotificationClick = (n) => {
    markNotificationRead(n.id)
    const targetVehicle = vehicles?.find(
      (v) => v.name === n.vehicle || v.id === n.vehicle || v.name.toLowerCase().includes(n.vehicle?.toLowerCase() || '')
    )
    if (targetVehicle) {
      setSelectedVehicleId(targetVehicle.id)
    }
    navigate('/vehicles')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col md:overflow-hidden">
      <Topbar title="Notifications Center" subtitle="Review live event feeds, device diagnostics, and policy warnings" />

      <div className="flex flex-1 flex-col overflow-hidden px-4 pb-24 py-5 sm:px-6 md:pb-5">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-line bg-panel">
          {/* Header Actions */}
          <div className="flex flex-col gap-3 border-b border-line-soft px-5 py-3.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-[13.5px] font-semibold">Feed History</span>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red px-1.5 text-[10px] font-bold text-white">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter Tabs */}
              <div className="flex rounded-lg border border-line bg-panel-2 p-0.75">
                {['all', 'unread', 'read'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`rounded-md px-3 py-1 text-[11px] font-medium capitalize transition-colors ${
                      filter === tab ? 'bg-panel text-hi shadow-sm' : 'text-dim hover:text-lo'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-[11.5px] text-lo hover:bg-hover hover:text-hi transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
                  Mark all read
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-[11.5px] text-red hover:bg-red/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  Clear feed
                </button>
              )}
            </div>
          </div>

          {/* List content */}
          <div className="flex-1 overflow-y-auto divide-y divide-line-soft">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-panel-2 border border-line-soft text-dim mb-3">
                  <Bell className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <div className="text-[13px] font-medium text-lo">No notifications found</div>
                <div className="text-[11px] text-dim mt-0.5">There are no matching items in your feed log.</div>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const Icon = TYPE_ICON[n.type] || Info
                const cls = TYPE_CLASSES[n.type] || TYPE_CLASSES.info
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className="group flex cursor-pointer items-start justify-between gap-3 px-4 py-4.5 transition-colors hover:bg-hover sm:gap-4 sm:px-6"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className={`mt-0.5 flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg ${cls}`}>
                        <Icon className="h-4 w-4" strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-[13px] leading-relaxed ${n.read ? 'text-lo' : 'text-hi font-medium'}`}>
                          {n.title}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-1 text-[11.5px] text-accent hover:underline font-medium">
                            <span className="h-1 w-1 rounded-full bg-accent" />
                            {n.vehicle}
                          </span>
                          <span className="font-mono text-[10.5px] text-dim">{n.time}</span>
                          {!n.read && (
                            <span className="inline-flex items-center gap-1 rounded bg-panel-2 border border-line-soft px-1.5 py-0.5 text-[9.5px] font-semibold text-hi uppercase tracking-wider">
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      {!n.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id) }}
                          className="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-line bg-panel-2 text-dim hover:text-green hover:border-green/30 cursor-pointer"
                          title="Mark read"
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                        className="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-line bg-panel-2 text-dim hover:text-red hover:border-red/30 cursor-pointer"
                        title="Delete notification"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
