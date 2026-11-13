/**
 * Pure, zero-dependency class name merger
 * Safely filters falsy values and flattens arrays/conditionals
 * Example: cn('base-class', isActive && 'active-class', ['extra-1', 'extra-2'])
 */
export function cn(...classes) {
  return classes
    .flat(Infinity)
    .filter((c) => typeof c === 'string' && c.trim().length > 0)
    .join(' ')
}
