import type { PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

type HeadingProps = PropsWithChildren<{
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  className?: string
}>

const baseStyles: Record<NonNullable<HeadingProps['as']>, string> = {
  h1: 'text-3xl font-semibold tracking-tight',
  h2: 'text-2xl font-semibold tracking-tight',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-semibold',
}

export const Heading = ({ as = 'h2', className, children }: HeadingProps) => {
  const Component = as
  return <Component className={cn(baseStyles[as], className)}>{children}</Component>
}
