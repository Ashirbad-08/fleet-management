import { Users, Phone, MessageSquare, Mail } from '../../icons'

export default function DriverContactsTab({ selectedVehicle }) {
  return (
    <div className="p-5 space-y-4">
      {/* Driver Contact Card */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/15 text-accent">
              <Users className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Assigned Pilot / Driver</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-accent border border-accent/30">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Active Shift
          </span>
        </div>

        <div className="p-4 bg-panel space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-accent font-bold font-display text-[15px] border border-accent/30">
              {selectedVehicle.driver
                ? selectedVehicle.driver
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                : 'DR'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[14px] font-bold text-hi truncate">
                {selectedVehicle.driver || 'Unassigned Driver'}
              </div>
              <div className="font-mono text-[11.5px] text-lo">
                {selectedVehicle.driverPhone || '+91 98765 43210'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-line-soft/60">
            <a
              href={`tel:${selectedVehicle.driverPhone || '+919876543210'}`}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-accent/15 py-2 text-[12px] font-semibold text-accent hover:bg-accent/25 transition-all text-center"
            >
              <Phone className="h-3.5 w-3.5" />
              Call Driver
            </a>
            <a
              href={`https://wa.me/${(selectedVehicle.driverPhone || '919876543210').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-panel-2 py-2 text-[12px] font-semibold text-hi hover:bg-hover transition-all text-center"
            >
              <MessageSquare className="h-3.5 w-3.5 text-green" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Hub Supervisor Contact Card */}
      <div className="rounded-xl border border-line-soft bg-panel-2/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between border-b border-line-soft bg-panel px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-amber/15 text-amber">
              <Users className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="font-display text-[12.5px] font-bold text-hi">Depot Hub Supervisor</span>
          </div>
          <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-[10px] text-lo border border-line-soft">
            {selectedVehicle.location}
          </span>
        </div>

        <div className="p-4 bg-panel space-y-3">
          <div className="space-y-1.5 text-[12px]">
            <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
              <span className="text-dim">Supervisor Name:</span>
              <span className="font-mono font-bold text-hi">
                {selectedVehicle.hubSupervisorName || 'Rajesh Kumar'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
              <span className="text-dim">Supervisor Phone:</span>
              <span className="font-mono font-medium text-hi">
                {selectedVehicle.hubSupervisorPhone || '+91 98111 22334'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
              <span className="text-dim">Hub Desk Email:</span>
              <span className="font-mono font-medium text-lo truncate max-w-[200px]">
                {selectedVehicle.hubSupervisorEmail || 'hub.supervisor@fleet.io'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-line-soft/60">
              <span className="text-dim">City:</span>
              <span className="font-mono font-medium text-hi">
                {selectedVehicle.city || selectedVehicle.location || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-dim">Hub ID:</span>
              <span className="font-mono font-medium text-accent">{selectedVehicle.hubId || '—'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-line-soft/60">
            <a
              href={`tel:${selectedVehicle.hubSupervisorPhone || '+919811122334'}`}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-amber/15 py-2 text-[12px] font-semibold text-amber hover:bg-amber/25 transition-all text-center"
            >
              <Phone className="h-3.5 w-3.5" />
              Call Supervisor
            </a>
            <a
              href={`mailto:${selectedVehicle.hubSupervisorEmail || 'hub.supervisor@fleet.io'}`}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-panel-2 py-2 text-[12px] font-semibold text-hi hover:bg-hover transition-all text-center"
            >
              <Mail className="h-3.5 w-3.5 text-accent" />
              Send Email
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
