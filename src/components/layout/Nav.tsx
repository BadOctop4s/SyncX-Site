'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useScrolled } from '@/hooks/useScrolled'

const NAV_LINKS = [
  { href: '/#products',   label: 'Produtos'   },
  { href: '/proximos',    label: 'Próximos'   },
  { href: '/#features',   label: 'Features'   },
  { href: '/#community',  label: 'Comunidade' },
  { href: '/#howto',      label: 'Como Usar'  },
]

export default function Nav() {
  const scrolled = useScrolled(80)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) })
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.1 })
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  const navStyle: React.CSSProperties = scrolled ? {
    position: 'fixed',
    top: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 48px)',
    maxWidth: '1120px',
    height: '50px',
    borderRadius: '100px',
    background: 'rgba(8,8,14,0.72)',
    backdropFilter: 'blur(40px) saturate(200%) brightness(1.08)',
    WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(1.08)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.25)',
    display: 'flex',
    alignItems: 'center',
    zIndex: 900,
    transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1)',
  } : {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '66px',
    background: 'transparent',
    border: '1px solid transparent',
    display: 'flex',
    alignItems: 'center',
    zIndex: 900,
    transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1)',
  }

  return (
    <>
      <nav style={navStyle}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding: scrolled ? '0 20px' : '0 40px', transition:'padding 0.6s cubic-bezier(0.22,1,0.36,1)' }}>
          {/* Logo */}
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:'8px', color:'var(--text)', fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:800, letterSpacing:'-0.5px', flexShrink:0 }}>
            <Image src="/logo.png" alt="SyncX" width={26} height={26} style={{ borderRadius:'7px', objectFit:'cover' }} />
            Sync<span style={{ color:'var(--accent)' }}>X</span>
          </Link>

          {/* Desktop links */}
          <ul style={{ display:'flex', alignItems:'center', gap:'2px', listStyle:'none' }} className="nav-links">
            {NAV_LINKS.map(l => {
              const sectionId = l.href.replace('/#', '')
              const isActive = activeSection === sectionId
              return (
                <li key={l.href}>
                  <Link href={l.href} style={{ display:'flex', flexDirection:'column', alignItems:'center', fontSize:'12.5px', padding:'6px 10px', whiteSpace:'nowrap', lineHeight:1.1, color: isActive ? 'var(--text)' : 'var(--text-3)', transition:'color 0.25s', fontFamily:'var(--font-display)', fontWeight:600, letterSpacing:'0.2px' }}
                    className={isActive ? 'spy-active' : ''}>
                    {l.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Actions */}
          <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
            <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ display:'none' }}>
              Discord
            </a>
            <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Entrar</Link>
          </div>

          {/* Mobile burger */}
          <button onClick={() => setMenuOpen(true)} className="nav-mobile-btn" aria-label="Menu" style={{ background:'none', border:'none', color:'var(--text-2)', padding:'6px', display:'none' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:800, background:'rgba(5,5,7,0.97)', backdropFilter:'blur(20px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'32px' }}>
          <button onClick={() => setMenuOpen(false)} style={{ position:'absolute', top:'24px', right:'24px', background:'none', border:'none', color:'var(--text-2)', fontSize:'28px' }}>×</button>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ fontFamily:'var(--font-display)', fontSize:'32px', fontWeight:800, color:'var(--text-2)', letterSpacing:'-1px' }}>
              {l.label}
            </Link>
          ))}
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ fontFamily:'var(--font-display)', fontSize:'32px', fontWeight:800, color:'var(--text-2)' }}>Dashboard</Link>
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontFamily:'var(--font-display)', fontSize:'32px', fontWeight:800, color:'var(--accent)' }}>Entrar</Link>
        </div>
      )}
    </>
  )
}
