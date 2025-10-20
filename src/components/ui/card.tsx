import type { PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

type CardProps = PropsWithChildren<{
  className?: string
  heading?: string
  description?: string
}>

export const Card = ({ className, heading, description, children }: CardProps) => (
  <section
    className={cn(
      'rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm',
      className,
    )}
  >
    {(heading || description) && (
      <header className="mb-4 space-y-1">
        {heading ? <h3 className="text-lg font-semibold">{heading}</h3> : null}
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </header>
    )}
    {children}
  </section>
)
