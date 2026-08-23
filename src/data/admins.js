// Mock admin data — in production fetch from your auth/permissions service.
export const admins = [
  {
    id: 'A-001',
    name: 'Rajesh Deshmukh',
    email: 'rajesh@fleetcontrol.io',
    role: 'superadmin',
    initials: 'RD',
    joinedAt: '2024-01-15',
    permissions: {
      vehicles: { view: true, edit: true, delete: true, add: true },
      firmware: { view: true, push: true },
      alerts: { view: true, dismiss: true },
      admins: { view: true, add: true, edit: true, delete: true },
      settings: { view: true, edit: true },
    },
  },
  {
    id: 'A-002',
    name: 'Priya Nair',
    email: 'priya@fleetcontrol.io',
    role: 'admin',
    initials: 'PN',
    joinedAt: '2024-03-20',
    permissions: {
      vehicles: { view: true, edit: true, delete: false, add: true },
      firmware: { view: true, push: false },
      alerts: { view: true, dismiss: true },
      admins: { view: true, add: false, edit: false, delete: false },
      settings: { view: true, edit: false },
    },
  },
  {
    id: 'A-003',
    name: 'Arjun Mehta',
    email: 'arjun@fleetcontrol.io',
    role: 'operator',
    initials: 'AM',
    joinedAt: '2024-06-10',
    permissions: {
      vehicles: { view: true, edit: false, delete: false, add: false },
      firmware: { view: true, push: false },
      alerts: { view: true, dismiss: false },
      admins: { view: false, add: false, edit: false, delete: false },
      settings: { view: false, edit: false },
    },
  },
  {
    id: 'A-004',
    name: 'Sneha Kapoor',
    email: 'sneha@fleetcontrol.io',
    role: 'operator',
    initials: 'SK',
    joinedAt: '2024-08-05',
    permissions: {
      vehicles: { view: true, edit: true, delete: false, add: false },
      firmware: { view: false, push: false },
      alerts: { view: true, dismiss: true },
      admins: { view: false, add: false, edit: false, delete: false },
      settings: { view: false, edit: false },
    },
  },
]

export const ROLES = [
  { value: 'superadmin', label: 'Super Admin', color: 'text-accent', bg: 'bg-accent/15' },
  { value: 'admin', label: 'Admin', color: 'text-green', bg: 'bg-green/15' },
  { value: 'operator', label: 'Operator', color: 'text-amber', bg: 'bg-amber/15' },
]

export const PERMISSION_GROUPS = [
  {
    key: 'vehicles',
    label: 'Vehicles',
    perms: [
      { key: 'view', label: 'View all vehicles' },
      { key: 'add', label: 'Add new vehicles' },
      { key: 'edit', label: 'Edit vehicle data' },
      { key: 'delete', label: 'Delete vehicles' },
    ],
  },
  {
    key: 'firmware',
    label: 'Firmware',
    perms: [
      { key: 'view', label: 'View firmware versions' },
      { key: 'push', label: 'Push firmware updates' },
    ],
  },
  {
    key: 'alerts',
    label: 'Alerts',
    perms: [
      { key: 'view', label: 'View alerts' },
      { key: 'dismiss', label: 'Dismiss alerts' },
    ],
  },
  {
    key: 'admins',
    label: 'Admin Management',
    perms: [
      { key: 'view', label: 'View admin list' },
      { key: 'add', label: 'Add new admins' },
      { key: 'edit', label: 'Edit admin roles' },
      { key: 'delete', label: 'Delete admins' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    perms: [
      { key: 'view', label: 'View settings' },
      { key: 'edit', label: 'Edit settings' },
    ],
  },
]
