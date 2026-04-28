import type { HTMLAttributes } from 'react'
import { className } from './className'

type SkeletonProps = HTMLAttributes<HTMLDivElement>

export function Skeleton({ className: extraClassName, ...props }: SkeletonProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={className(
        'motion-safe:animate-pulse motion-reduce:animate-none rounded-(--ds-radius-sm) bg-(--ds-color-surface-muted)',
        extraClassName,
      )}
    />
  )
}

export default Skeleton
