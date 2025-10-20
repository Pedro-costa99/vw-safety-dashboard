import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'outline' | 'success' | 'warning'

const badgeStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary/15 text-primary border border-primary/20',
  outline: 'border border-border text-muted-foreground',
  success: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
  warning: 'bg-amber-100 text-amber-900 border border-amber-200',
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide',
      badgeStyles[variant],
      className,
    )}
    {...props}
  />
)
