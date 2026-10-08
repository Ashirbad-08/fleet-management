import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/Topbar'
import {
  ShieldCheck,
  Power,
  Phone,
  Briefcase,
  MapPin,
  Mail,
  Settings as SettingsIcon,
  Edit2,
  X,
  Save,
  Check,
  Building,
  Globe,
  Calendar,
  Hash,
} from '../components/icons'
import { useFleet } from '../context/FleetContext'
import { ROLES, DEPOT_OPTIONS } from '../data/admins'

export default function Profile() {
  const navigate = useNavigate()
  const { admins, updateAdmin, logout, showToast } = useFleet()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const admin = admins[0] || {
    id: 'A-001',
    name: 'Rajesh Deshmukh',
    email: 'rajesh@fleetcontrol.io',
    phone: '+91 98765 43210',
    jobTitle: 'Fleet Operations Director',
    depot: 'Pune Central Depot',
    role: 'superadmin',
    initials: 'RD',
    joinedAt: '2024-01-15',
  }

  // Edit form states
  const [formName, setFormName] = useState(admin.name || 'Rajesh Deshmukh')
  const [formEmail, setFormEmail] = useState(admin.email || 'rajesh@fleetcontrol.io')
  const [formPhone, setFormPhone] = useState(admin.phone || '+91 98765 43210')
  const [formJobTitle, setFormJobTitle] = useState(admin.jobTitle || 'Fleet Operations Director')
  const [formDepot, setFormDepot] = useState(admin.depot || 'Pune Central Depot')

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (admin) {
      setFormName(admin.name || 'Rajesh Deshmukh')
      setFormEmail(admin.email || 'rajesh@fleetcontrol.io')
      setFormPhone(admin.phone || '+91 98765 43210')
      setFormJobTitle(admin.jobTitle || 'Fleet Operations Director')
      setFormDepot(admin.depot || 'Pune Central Depot')
    }
  }, [admin])

  const roleMeta = ROLES.find((role) => role.value === admin?.role) ?? ROLES[0]

  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!formName || !formEmail) return

    updateAdmin(admin.id, {
      name: formName,
      email: formEmail,
      phone: formPhone,
      jobTitle: formJobTitle,
      depot: formDepot,
      initials: formName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    })

    setIsEditModalOpen(false)
    if (showToast) showToast('Profile details updated successfully')
  }

  const inputCls =
    'w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-[12.5px] text-hi outline-none focus:border-accent transition-colors'

  return (
    <div className="flex min-h-0 flex-1 flex-col md:overflow-hidden">
      <Topbar title="Admin Profile" subtitle="Manage your personal contact details, role permissions, and organization profile" />

      <div className="flex-1 overflow-y-auto px-4 pb-24 py-5 sm:px-6 md:pb-5">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* 1. Header Profile Cover Card */}
          {isLoading ? (
            <div className="animate-pulse overflow-hidden rounded-xl border border-line bg-panel">
              <div className="h-32 bg-panel-2/60" />
              <div className="relative px-6 pb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between -mt-10">
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                    <div className="h-20 w-20 rounded-xl border-4 border-panel bg-panel-2" />
                    <div className="mb-1 space-y-2">
                      <div className="h-5 w-40 rounded-xs bg-panel-2" />
                      <div className="h-3.5 w-48 rounded-xs bg-panel-2/60" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-24 rounded-full bg-panel-2" />
                    <div className="h-8 w-24 rounded-lg bg-panel-2" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-xs">
              <div className="h-32 bg-gradient-to-r from-accent/25 via-emerald-500/10 to-accent/5 relative">
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <button
                    onClick={() => navigate('/settings')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line/60 bg-panel/80 backdrop-blur px-3 py-1.5 text-[11.5px] font-medium text-hi hover:bg-hover transition-colors cursor-pointer shadow-xs"
                  >
                    <SettingsIcon className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
                    <span>System Settings</span>
                  </button>
                </div>
              </div>

              <div className="relative px-6 pb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between -mt-10">
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border-4 border-panel bg-panel-2 font-display text-[24px] font-bold text-accent shadow-md">
                      {admin?.initials ?? 'RD'}
                    </div>
                    <div className="mb-1">
                      <div className="flex items-center gap-2">
                        <h1 className="font-display text-[20px] font-bold text-hi">{admin?.name ?? 'Rajesh Deshmukh'}</h1>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${roleMeta.bg} ${roleMeta.color}`}>
                          <ShieldCheck className="h-3 w-3" strokeWidth={2.4} />
                          {roleMeta.label}
                        </span>
                      </div>
                      <p className="text-[12.5px] font-medium text-accent mt-0.5">{admin?.jobTitle || 'Fleet Operations Director'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent/15 border border-accent/30 px-3 py-1.5 text-[12px] font-medium text-accent hover:bg-accent/25 transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Edit Profile
                    </button>
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
          )}

          {/* 2. Contact & Organization Details Card */}
          <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-xs">
            <div className="border-b border-line-soft px-5 py-3.5 flex items-center justify-between bg-panel-2/30">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/15 text-accent">
                  <Briefcase className="h-3 w-3" strokeWidth={2.2} />
                </span>
                <h2 className="font-display text-[13.5px] font-bold text-hi">Contact & Organization Details</h2>
              </div>
              <span className="font-mono text-[10.5px] text-dim uppercase">Active Identity</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line-soft">
              {/* Left Column: Direct Contact Details */}
              <div className="p-5 space-y-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-dim">Contact Information</div>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-panel-2 text-accent">
                      <Phone className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[11px] text-dim">Direct Phone Number</div>
                      <div className="font-mono text-[13px] font-semibold text-hi">
                        {admin?.phone || '+91 98765 43210'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-panel-2 text-accent">
                      <Mail className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[11px] text-dim">Email Address</div>
                      <div className="font-mono text-[13px] font-semibold text-hi">
                        {admin?.email || 'rajesh@fleetcontrol.io'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-panel-2 text-accent">
                      <Briefcase className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[11px] text-dim">Official Job Title</div>
                      <div className="text-[13px] font-semibold text-hi">
                        {admin?.jobTitle || 'Fleet Operations Director'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Organization & Jurisdiction */}
              <div className="p-5 space-y-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-dim">Organization & Scope</div>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-panel-2 text-accent">
                      <MapPin className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[11px] text-dim">Assigned Primary Depot / Hub</div>
                      <div className="text-[13px] font-semibold text-hi">
                        {admin?.depot || 'Pune Central Depot'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-panel-2 text-accent">
                      <Building className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[11px] text-dim">Organization</div>
                      <div className="text-[13px] font-semibold text-hi">Acme Logistics Pvt. Ltd.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-panel-2 text-accent">
                      <Globe className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[11px] text-dim">Operating Region</div>
                      <div className="text-[13px] font-semibold text-hi">India - West & South (Pan-India)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Meta Footer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-line-soft bg-panel-2/40 px-5 py-3 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-dim">Member ID: </span>
                <strong className="text-hi">{admin?.id ?? 'A-001'}</strong>
              </div>
              <div>
                <span className="text-dim">Joined: </span>
                <strong className="text-hi">{admin?.joinedAt ?? '2024-01-15'}</strong>
              </div>
              <div>
                <span className="text-dim">Status: </span>
                <strong className="text-emerald-400">● Active</strong>
              </div>
              <div>
                <span className="text-dim">Access Scope: </span>
                <strong className="text-accent">{roleMeta.scope}</strong>
              </div>
            </div>
          </div>

          {/* 3. Role Privileges & Policies Card */}
          <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-xs">
            <div className="border-b border-line-soft px-5 py-3.5 flex items-center justify-between bg-panel-2/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={2.2} />
                <h2 className="font-display text-[13.5px] font-bold text-hi">Role Privileges & Permissions</h2>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${roleMeta.bg} ${roleMeta.color}`}>
                {roleMeta.scope}
              </span>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-[12px] text-lo leading-relaxed">
                {roleMeta.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-line-soft">
                {roleMeta.permissionsList.map((permText, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[12px] text-hi">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </div>
                    <span className="leading-tight">{permText}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-line bg-panel shadow-2xl">
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-3.5 bg-panel-2/60">
              <div className="flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-accent" strokeWidth={2} />
                <span className="font-display text-[14px] font-bold text-hi">Edit Personal & Contact Profile</span>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi cursor-pointer"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-dim">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-dim">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-dim">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-dim">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    placeholder="Fleet Operations Director"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-dim">
                  Assigned Depot / Hub
                </label>
                <select
                  value={formDepot}
                  onChange={(e) => setFormDepot(e.target.value)}
                  className={inputCls + ' cursor-pointer'}
                >
                  {DEPOT_OPTIONS.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-lg border border-line bg-panel-2 py-2 text-[12.5px] font-medium text-lo hover:bg-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent/20 border border-accent/30 py-2 text-[12.5px] font-medium text-accent hover:bg-accent/30 cursor-pointer"
                >
                  <Save className="h-4 w-4" strokeWidth={2} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
