import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value?: number
  className?: string
  indicatorClassName?: string
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, className, indicatorClassName }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
      >
        <div
          className={cn('h-full w-full flex-1 bg-primary transition-all duration-500', indicatorClassName)}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }
