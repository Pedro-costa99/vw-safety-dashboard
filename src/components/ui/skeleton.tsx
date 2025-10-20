import { cn } from '@/lib/utils'

type SkeletonProps = {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

const roundedMap: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

export const Skeleton = ({ className, rounded = 'md' }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted/70',
        roundedMap[rounded],
        className,
      )}
    />
  )
}
