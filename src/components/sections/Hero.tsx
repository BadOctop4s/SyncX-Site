'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

const DISCORD = process.env.NEXT_PUBLIC_DISCORD_INVITE!

export default function Hero() {
  const titleRef  = useRef<HTMLHeadingElement>(null)
  const subRef    = useRef<HTMLParagraphElement>(null)
  const actsRef   = useRef<HTMLDivElement>(null)
  const badgeRef  = useRef<HTMLDivElement>(null)
  const statsRef  = useRef<HTMLDivElement>(null)
  const backTopRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let ticking = false, lastY = 0
    const backTop = backTopRef.current

    const onScroll = () => {
      lastY = window.scrollY
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = lastY
          if (backTop) backTop.classList.toggle('visible', y > 400)
          const pct   = Math.min(y / (window.innerHeight * 0.85), 1)
          const eased = pct < 0.5 ? 2*pct*pct : -1+(4-2*pct)*pct
          if (titleRef.current)  titleRef.current.style.transform  = `translateY(${eased*48}px)`
          if (subRef.current)    subRef.current.style.transform    = `translateY(${eased*30}px)`
          if (actsRef.current)   actsRef.current.style.transform   = `translateY(${eased*20}px)`
          if (badgeRef.current)  badgeRef.current.style.transform  = `translateY(${eased*16}px)`
          if (statsRef.current)  statsRef.current.style.transform  = `translateY(${eased*12}px)`
          const hero = document.querySelector('.hero') as HTMLElement
          if (hero) hero.style.opacity = String(1 - eased * 0.5)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Counter animation
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-count]')
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const el   = e.target as HTMLElement
        const end  = parseFloat(el.dataset.count!)
        const suf  = el.dataset.suffix || ''
        const dur  = 1200
        const t0   = performance.now()
        const tick = (now: number) => {
          const p    = Math.min((now - t0) / dur, 1)
          const ease = 1 - Math.pow(1 - p, 4)
          const val  = end < 10 ? (end * ease).toFixed(1) : Math.floor(end * ease)
          el.textContent = val + suf
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.unobserve(el)
      })
    }, { threshold: 0.5 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div className="hero">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div ref={badgeRef} className="hero-badge">
          Novo — SyncX Zero Hour v2.0 disponível
        </div>

        <h1 ref={titleRef} className="hero-title">
          Sync<span className="x">X</span>
        </h1>

        <p ref={subRef} className="hero-sub">
          Scripts e ferramentas de alto nível para Roblox e diversos outros jogos.
          Construído para quem não aceita menos que o melhor.
        </p>

        <div ref={actsRef} className="hero-actions">
          <Link href="/#products" className="btn btn-primary">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Ver Produtos
          </Link>
          <a href={DISCORD} target="_blank" rel="noreferrer" className="btn btn-ghost">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.03.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Comunidade
          </a>
        </div>

        <div ref={statsRef} className="hero-stats">
          {[
            { count: 5, suffix: 'K+', label: 'Usuários' },
            { count: 3, suffix: '',   label: 'Projetos' },
            { label: 'Uptime', fixed: '24/7', accent: true },
          ].map((s, i) => (
            <div key={i} className="hero-stat">
              <span className="hero-stat-num" style={s.accent ? { color:'var(--accent)' } : {}}
                data-count={s.count} data-suffix={s.suffix}>
                {s.fixed || '0'}
              </span>
              <span className="hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="scroll-hint">
          <div className="scroll-mouse" />
          <span>Scroll</span>
        </div>
      </div>

      {/* Back to top */}
      <button
        ref={backTopRef}
        id="back-top"
        aria-label="Voltar ao topo"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
      </button>
    </>
  )
}
