import { useState, useEffect } from 'react'
import Topbar from '../components/Topbar'
import { useFleet } from '../context/FleetContext'
import { ROLES, DEPOT_OPTIONS } from '../data/admins'
import { Plus, Edit2, Trash2, ShieldCheck, X, Save, Users, Check, Info, MapPin, Mail, Phone } from '../components/icons'

export default function Admins() {
  const { admins, addAdmin, updateAdmin, deleteAdmin } = useFleet()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 240)
    return () => clearTimeout(timer)
  }, [])

  // Form states matching requested schema
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formJobTitle, setFormJobTitle] = useState('')
  const [formRole, setFormRole] = useState('operator')
  const [formDepot, setFormDepot] = useState('All Depots (Global)')
  const [formSendInvite, setFormSendInvite] = useState(true)

  const startAdd = () => {
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormJobTitle('')
    setFormRole('operator')
    setFormDepot('All Depots (Global)')
    setFormSendInvite(true)
    setIsAdding(true)
    setIsEditing(false)
    setSelectedAdmin(null)
  }

  const startEdit = (admin) => {
    setSelectedAdmin(admin)
    setFormName(admin.name || '')
    setFormEmail(admin.email || '')
    setFormPhone(admin.phone || '')
    setFormJobTitle(admin.jobTitle || '')
    setFormRole(admin.role || 'operator')
    setFormDepot(admin.depot || 'All Depots (Global)')
    setFormSendInvite(false)
    setIsEditing(true)
    setIsAdding(false)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!formName || !formEmail) return

    const roleObj = ROLES.find((r) => r.value === formRole) || ROLES[2]

    const data = {
      name: formName,
      email: formEmail,
      phone: formPhone || '—',
      jobTitle: formJobTitle || '—',
      role: formRole,
      depot: formDepot,
      sendInvite: formSendInvite,
      permissions: roleObj.permissions,
    }

    if (isAdding) {
      addAdmin(data)
      setIsAdding(false)
    } else if (isEditing && selectedAdmin) {
      updateAdmin(selectedAdmin.id, data)
      setIsEditing(false)
      setSelectedAdmin(null)
    }
  }

  const getRoleMeta = (r) => {
    const matched = ROLES.find((role) => role.value === r)
    return matched || { label: r, color: 'text-lo', bg: 'bg-panel-2', scope: 'Standard Access' }
  }

  const inputCls =
    'w-full rounded-md border border-line bg-panel-2 px-3 py-1.75 text-[12.5px] text-hi outline-none focus:border-line focus:outline-none transition-colors'

  return (
    <div className="flex min-h-0 flex-1 flex-col md:overflow-hidden">
      <Topbar title="Admin Management" subtitle="Manage organization members, roles, and resource access policies" />

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-24 py-5 sm:px-6 md:pb-5 xl:flex-row xl:overflow-hidden">
        {/* Left Side: Admins List */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-line bg-panel">
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-3.25">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" strokeWidth={2} />
              <span className="font-display text-[13.5px] font-semibold">Active Members</span>
            </div>
            <button
              onClick={startAdd}
              className="flex items-center gap-1 rounded-lg bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent hover:bg-accent/25 transition-colors cursor-pointer"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
              Add Member
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full min-w-[780px] border-collapse">
              <thead>
                <tr>
                  {['Member & Details', 'Role', 'Assigned Depot / Hub', 'Joined', ''].map((h) => (
                    <th
                      key={h}
                      className="sticky top-0 z-10 border-b border-line-soft bg-panel px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-dim"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="border-b border-line-soft px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8.5 w-8.5 rounded-lg bg-panel-2" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-28 rounded-xs bg-panel-2" />
                            <div className="h-2.5 w-36 rounded-xs bg-panel-2/60" />
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-line-soft px-4 py-3">
                        <div className="h-5 w-20 rounded-full bg-panel-2" />
                      </td>
                      <td className="border-b border-line-soft px-4 py-3">
                        <div className="h-3.5 w-24 rounded-xs bg-panel-2" />
                      </td>
                      <td className="border-b border-line-soft px-4 py-3">
                        <div className="h-3.5 w-20 rounded-xs bg-panel-2" />
                      </td>
                      <td className="border-b border-line-soft px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <div className="h-6 w-6 rounded-md bg-panel-2" />
                          <div className="h-6 w-6 rounded-md bg-panel-2" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  admins.map((admin) => {
                    const roleMeta = getRoleMeta(admin.role)
                    const isPendingDelete = confirmDeleteId === admin.id

                    return (
                      <tr key={admin.id} className="hover:bg-hover group transition-colors">
                        <td className="border-b border-line-soft px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-line bg-panel-2 font-display text-[11px] font-bold text-lo shrink-0">
                              {admin.initials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[12.5px] font-semibold text-hi truncate">{admin.name}</span>
                                {admin.jobTitle && admin.jobTitle !== '—' && (
                                  <span className="text-[10.5px] font-medium text-dim">• {admin.jobTitle}</span>
                                )}
                              </div>
                              <div className="mt-0.5 flex items-center gap-2 text-[10.5px] text-dim">
                                <span>{admin.email}</span>
                                {admin.phone && admin.phone !== '—' && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono">{admin.phone}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-line-soft px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${roleMeta.bg} ${roleMeta.color}`}>
                            {roleMeta.label}
                          </span>
                        </td>
                        <td className="border-b border-line-soft px-4 py-2.5 font-mono text-[11.5px] text-lo">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-dim shrink-0" />
                            <span className="truncate">{admin.depot || 'All Depots (Global)'}</span>
                          </div>
                        </td>
                        <td className="border-b border-line-soft px-4 py-2.5 font-mono text-[11.5px] text-dim">
                          {admin.joinedAt}
                        </td>
                        <td className="border-b border-line-soft px-4 py-2.5 text-right">
                          {isPendingDelete ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-[10px] font-medium text-red">Confirm?</span>
                              <button
                                onClick={() => {
                                  deleteAdmin(admin.id)
                                  setConfirmDeleteId(null)
                                }}
                                className="rounded bg-red/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-red hover:bg-red/20 cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded border border-line bg-panel-2 px-1.5 py-0.5 text-[10.5px] text-lo hover:bg-hover cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                              <button
                                onClick={() => startEdit(admin)}
                                className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-panel-2 text-dim hover:text-accent hover:border-accent/30 cursor-pointer"
                                title="Edit Member"
                              >
                                <Edit2 className="h-3 w-3" strokeWidth={2} />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(admin.id)}
                                className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-panel-2 text-dim hover:text-red hover:border-red/30 cursor-pointer"
                                title="Delete Admin"
                              >
                                <Trash2 className="h-3 w-3" strokeWidth={2} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Add/Edit Panel */}
        {(isAdding || isEditing) && (
          <aside className="flex max-h-[85vh] w-full flex-col overflow-y-auto rounded-xl border border-line bg-panel xl:max-h-none xl:w-110">
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={2} />
                <span className="font-display text-[13.5px] font-bold">
                  {isAdding ? 'Add Team Member' : 'Edit Member'}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setIsEditing(false)
                  setSelectedAdmin(null)
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-panel-2 text-lo hover:bg-hover hover:text-hi cursor-pointer"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* 1. Full Name * */}
              <div>
                <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Rajesh Deshmukh"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* 2. Email Address * */}
              <div>
                <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="email"
                  placeholder="e.g. rajesh@fleetcontrol.io"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* 3. Phone Number (Optional) */}
              <div>
                <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">
                  Phone Number <span className="font-normal normal-case text-dim">(Optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* 4. Job Title (Optional) */}
              <div>
                <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">
                  Job Title <span className="font-normal normal-case text-dim">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shift Operations Lead"
                  value={formJobTitle}
                  onChange={(e) => setFormJobTitle(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* 5. System Role * */}
              <div>
                <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">
                  System Role <span className="text-red-400">*</span>
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className={inputCls + ' cursor-pointer'}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} ({r.scope})
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Assigned Depot / Hub * */}
              <div>
                <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-dim">
                  Assigned Depot / Hub <span className="text-red-400">*</span>
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

              {/* 7. Send email invitation with magic login link */}
              <div className="rounded-lg border border-line-soft bg-panel-2/40 p-3">
                <label className="flex items-start gap-2.5 text-[12px] text-hi cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formSendInvite}
                    onChange={(e) => setFormSendInvite(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-line bg-panel-2 text-accent accent-accent focus:ring-0 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-hi">Send email invitation with magic login link</span>
                    <span className="text-[10.5px] text-dim">An onboarding email with password setup instructions will be dispatched.</span>
                  </div>
                </label>
              </div>

              {/* Role Access Privileges Summary Card */}
              {(() => {
                const currentRoleMeta = ROLES.find((r) => r.value === formRole) || ROLES[2]
                return (
                  <div className="rounded-xl border border-line bg-panel-2/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-dim">
                        Included Privileges
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${currentRoleMeta.bg} ${currentRoleMeta.color}`}>
                        {currentRoleMeta.scope}
                      </span>
                    </div>

                    <p className="text-[11.5px] text-lo leading-relaxed">
                      {currentRoleMeta.description}
                    </p>

                    <div className="space-y-2 border-t border-line-soft pt-3">
                      {currentRoleMeta.permissionsList.map((permText, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11.5px] text-hi">
                          <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </div>
                          <span className="leading-tight">{permText}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-line-soft bg-panel p-2.5 text-[10.5px] text-dim">
                      <Info className="h-3.5 w-3.5 shrink-0 text-accent" />
                      <span>Role policies are predefined to maintain strict organization security.</span>
                    </div>
                  </div>
                )
              })()}

              <div className="flex gap-3 pt-3 border-t border-line-soft sticky bottom-0 bg-panel">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false)
                    setIsEditing(false)
                    setSelectedAdmin(null)
                  }}
                  className="flex-1 rounded-lg border border-line bg-panel-2 py-2 text-[12.5px] font-medium text-lo hover:bg-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent/20 py-2 text-[12.5px] font-medium text-accent hover:bg-accent/30 cursor-pointer"
                >
                  <Save className="h-4 w-4" strokeWidth={2} />
                  Save Member
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>
    </div>
  )
}
