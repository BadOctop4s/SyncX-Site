'use client'
import { useReveal } from '@/hooks/useReveal'
import clsx from 'clsx'
import { ReactNode, ElementType } from 'react'

interface Props {
  children: ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3
  as?: ElementType
}

export default function Reveal({ children, className, delay = 0, as: Tag = 'div' }: Props) {
  const { ref, visible } = useReveal()
  return (
    <Tag
      ref={ref}
      className={clsx('reveal', delay > 0 && `reveal-delay-${delay}`, visible && 'visible', className)}
    >
      {children}
    </Tag>
  )
}
