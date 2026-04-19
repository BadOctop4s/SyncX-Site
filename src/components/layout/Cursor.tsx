'use client'
import { useEffect } from 'react'

export default function Cursor() {
  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return
    const dot  = document.getElementById('x-cursor')
    const ring = document.getElementById('x-cursor-ring')
    if (!dot || !ring) return

    let mx = 0, my = 0, rx = 0, ry = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      dot.style.left = mx + 'px'; dot.style.top = my + 'px'
    }
    const animRing = () => {
      rx += (mx - rx) * 0.14; ry += (my - ry) * 0.14
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px'
      requestAnimationFrame(animRing)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'))
    document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'))

    const addHover = () => {
      document.querySelectorAll('a, button, [data-hover]').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'))
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'))
      })
    }
    addHover()
    const obs = new MutationObserver(addHover)
    obs.observe(document.body, { childList: true, subtree: true })

    animRing()
    return () => { document.removeEventListener('mousemove', onMove); obs.disconnect() }
  }, [])

  return (
    <>
      <div id="x-cursor" />
      <div id="x-cursor-ring" />
    </>
  )
}
