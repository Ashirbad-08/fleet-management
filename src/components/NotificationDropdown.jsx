import { useEffect, useRef } from 'react'
import { Bell, CheckCheck, X, AlertCircle, Info, TriangleAlert } from './icons'
import { useFleet } from '../context/FleetContext'
import { useNavigate } from 'react-router-dom'

const TYPE_ICON = {
  warning: TriangleAlert,
  info: Info,
  critical: AlertCircle,
}

const TYPE_CLASSES = {
  warning: 'bg-amber/15 text-amber',
  info: 'bg-accent/15 text-accent',
  critical: 'bg-red/15 text-red',
}

export default function NotificationDropdown({ open, onClose }) {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  } = useFleet()
  const navigate = useNavigate()
  const ref = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const preview = notifications.slice(0, 6)

  return (
    <div
      ref={ref}
      className={`fixed left-4 right-4 top-24 z-50 overflow-hidden rounded-xl border border-line bg-panel shadow-[0_16px_40px_rgba(0,0,0,0.45)] transition-all duration-200 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-90 sm:origin-top-right ${
        open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-3.5 w-3.5 text-lo" strokeWidth={2} />
          <span className="text-[13px] font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red px-1 text-[9.5px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-dim hover:bg-hover hover:text-hi"
              title="Mark all read"
            >
              <CheckCheck className="h-3 w-3" strokeWidth={2} />
              All read
            </button>
          )}
          <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-md text-dim hover:bg-hover hover:text-hi">
            <X className="h-3 w-3" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-80 overflow-y-auto">
        {preview.length === 0 ? (
          <div className="py-8 text-center text-[12px] text-dim">No notifications</div>
        ) : (
          preview.map((n) => {
            const Icon = TYPE_ICON[n.type] || Info
            const cls = TYPE_CLASSES[n.type] || TYPE_CLASSES.info
            return (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`relative flex cursor-pointer items-start gap-3 border-b border-line-soft px-4 py-3 hover:bg-hover transition-colors ${
                  !n.read ? 'bg-accent/5' : ''
                }`}
              >
                {!n.read && (
                  <span className="absolute right-3 top-3.5 h-1.5 w-1.5 rounded-full bg-accent" />
                )}
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${cls}`}>
                  <Icon className="h-3 w-3" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1 pr-3">
                  <div className={`text-[11.5px] leading-snug ${n.read ? 'text-lo' : 'text-hi font-medium'}`}>
                    {n.title}
                  </div>
                  <div className="mt-0.75 flex items-center gap-1.5">
                    <span className="text-[10.5px] text-lo">{n.vehicle}</span>
                    <span className="font-mono text-[10px] text-dim">{n.time}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-dim opacity-0 hover:text-red group-hover:opacity-100 hover:opacity-100"
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between border-t border-line-soft px-4 py-2.5">
          <button
            onClick={() => { onClose(); navigate('/notifications') }}
            className="text-[11.5px] font-medium text-accent hover:underline"
          >
            View all ({notifications.length})
          </button>
        </div>
      )}
    </div>
  )
}
