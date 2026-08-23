// Shared status/severity → color + label lookups used across components.

export const STATUS_META = {
  online: { color: 'var(--color-green)', pill: 'bg-green/15 text-green', label: 'Online' },
  idle: { color: 'var(--color-amber)', pill: 'bg-amber/15 text-amber', label: 'Idle' },
  alert: { color: 'var(--color-red)', pill: 'bg-red/15 text-red', label: 'Alert' },
  offline: { color: 'var(--color-gray)', pill: 'bg-gray/15 text-gray', label: 'Offline' },
}

export const SEV_META = {
  critical: { color: 'var(--color-red)', classes: 'bg-red/15 text-red' },
  warning: { color: 'var(--color-amber)', classes: 'bg-amber/15 text-amber' },
  info: { color: 'var(--color-accent)', classes: 'bg-accent/15 text-accent' },
}
