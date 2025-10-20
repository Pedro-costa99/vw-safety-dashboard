import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge conditional classNames while preserving Tailwind precedence.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
