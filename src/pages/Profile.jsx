import Topbar from '../components/Topbar'
import { ShieldCheck, Power } from '../components/icons'
import { useFleet } from '../context/FleetContext'
import { ROLES } from '../data/admins'

export default function Profile() {
  const { admins, logout } = useFleet()
  const admin = admins[0]
  const roleMeta = ROLES.find((role) => role.value === admin?.role) ?? {
    label: admin?.role ?? 'Admin',
    color: 'text-lo',
    bg: 'bg-panel-2',
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col md:overflow-hidden">
      <Topbar title="Profile" subtitle="Your account details" />

      <div className="flex-1 overflow-y-auto px-4 pb-24 py-5 sm:px-6 md:pb-5">
        <div className="mx-auto max-w-5xl space-y-5">
          {/* Header Cover Card */}
          <div className="overflow-hidden rounded-xl border border-line bg-panel">
            <div className="h-32 bg-gradient-to-r from-accent/20 to-accent/5" />
            <div className="relative px-6 pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between -mt-10">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl border-4 border-panel bg-panel-2 font-display text-[24px] font-bold text-hi shadow-md">
                    {admin?.initials ?? 'RA'}
                  </div>
                  <div className="mb-1">
                    <h1 className="font-display text-[20px] font-bold text-hi">{admin?.name ?? 'Rajesh Deshmukh'}</h1>
                    <p className="text-[13px] text-dim">{admin?.email ?? 'rajesh@fleetcontrol.io'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${roleMeta.bg} ${roleMeta.color}`}>
                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.3} />
                    {roleMeta.label}
                  </span>
                  <button
                    onClick={logout}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red/10 border border-red/20 px-3 py-1.5 text-[12px] font-medium text-red hover:bg-red/20 transition-colors cursor-pointer"
                  >
                    <Power className="h-3.5 w-3.5" strokeWidth={2} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="overflow-hidden rounded-xl border border-line bg-panel">
            <div className="border-b border-line-soft px-5 py-4">
              <h2 className="font-display text-[14px] font-semibold text-hi">Account Information</h2>
            </div>
            <div className="grid grid-cols-1 divide-y divide-line-soft md:grid-cols-2 md:divide-y-0">
              {[
                ['Member ID', admin?.id ?? 'A-001'],
                ['Joined', admin?.joinedAt ?? '2024-01-15'],
                ['Organization', 'Acme Logistics Pvt. Ltd.'],
                ['Region', 'India - West & South'],
              ].map(([label, value], idx) => (
                <div
                  key={label}
                  className={`flex items-center justify-between gap-3 px-5 py-4 md:border-b md:border-line-soft md:even:border-l md:even:border-line-soft ${idx >= 2 ? 'md:border-b-0' : ''}`}
                >
                  <span className="text-[12.5px] text-lo">{label}</span>
                  <span className="text-right font-mono text-[12.5px] text-hi">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
