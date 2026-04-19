'use client'
import { useEffect, useRef } from 'react'

export default function EvilEye() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W: number, H: number, animId: number

    const orbs = [
      { x: 0.5, y: 0.5, vx: 0.00008, vy: 0.00005, r: 0.32, color: 'rgba(200,15,15,' },
      { x: 0.2, y: 0.3, vx:-0.00006, vy: 0.00007, r: 0.22, color: 'rgba(160,8,8,' },
      { x: 0.8, y: 0.6, vx: 0.00007, vy:-0.00006, r: 0.18, color: 'rgba(220,25,10,' },
    ]

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random()-0.5)*0.00018,
      vy: (Math.random()-0.5)*0.00018,
      r:  Math.random()*1.2+0.3,
      a:  Math.random()*0.35+0.1,
    }))

    function resize() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }

    let t = 0
    function draw() {
      t++
      ctx.clearRect(0, 0, W, H)

      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      for (const o of orbs) {
        o.x += o.vx; o.y += o.vy
        if (o.x < -0.1 || o.x > 1.1) o.vx *= -1
        if (o.y < -0.1 || o.y > 1.1) o.vy *= -1
        const cx = o.x*W, cy = o.y*H
        const rad = o.r * Math.min(W,H) * (1 + Math.sin(t*0.008)*0.07)
        const g = ctx.createRadialGradient(cx,cy,0,cx,cy,rad)
        g.addColorStop(0,   o.color+'0.17)')
        g.addColorStop(0.4, o.color+'0.06)')
        g.addColorStop(1,   o.color+'0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
      }
      ctx.restore()

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0
        if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x*W, p.y*H, p.r, 0, Math.PI*2)
        ctx.fillStyle = `rgba(224,32,32,${p.a})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    const onVis = () => { if (document.hidden) cancelAnimationFrame(animId); else animId = requestAnimationFrame(draw) }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('resize', resize)
    resize(); draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="x-canvas"
      style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', opacity:0.9 }}
    />
  )
}
