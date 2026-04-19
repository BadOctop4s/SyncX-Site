'use client'
import { useRef, ReactNode } from 'react'
import clsx from 'clsx'

interface Props {
  children: ReactNode
  className?: string
  tilt?: boolean
}

export default function GlassCard({ children, className, tilt = true }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt) return
    const card = ref.current!
    const r = card.getBoundingClientRect()
    const x = e.clientX - r.left, y = e.clientY - r.top
    const cx = r.width/2, cy = r.height/2
    const rotY = (x-cx)/cx * 8, rotX = -(y-cy)/cy * 8
    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`
    card.style.setProperty('--mx', x+'px')
    card.style.setProperty('--my', y+'px')
    card.style.setProperty('--spotlight', '1')
  }

  const onLeave = () => {
    if (!tilt) return
    const card = ref.current!
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)'
    card.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1),border-color 0.3s,box-shadow 0.3s'
    card.style.setProperty('--spotlight', '0')
    setTimeout(() => { card.style.transition = '' }, 500)
  }

  const onEnter = () => {
    if (!tilt) return
    ref.current!.style.transition = 'border-color 0.3s,box-shadow 0.3s'
  }

  return (
    <div
      ref={ref}
      className={clsx('glass-card', className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={onEnter}
    >
      {children}
    </div>
  )
}
