import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import EvilEye from '@/components/canvas/EvilEye'
import Cursor from '@/components/layout/Cursor'
import GlassCard from '@/components/ui/GlassCard'
import Reveal from '@/components/ui/RevealWrapper'
import { ToastProvider } from '@/components/ui/Toast'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Outros Projetos — SyncX' }

export default function OutrosPage() {
  return (
    <ToastProvider>
      <Cursor />
      <EvilEye />
      <Nav />
      <div style={{paddingTop:'120px',minHeight:'100vh',position:'relative',zIndex:2}}>
        <div className="page-section">
          <Reveal as="p" className="section-label">Outros Projetos</Reveal>
          <Reveal as="h1" delay={1} className="section-title">Mais da BadOctop4s.</Reveal>
          <Reveal as="p" delay={2} className="section-desc">Projetos paralelos e experimentos open source do time SyncX.</Reveal>
          <div style={{marginTop:'56px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'16px'}}>
            <Reveal>
              <GlassCard style={{padding:'32px'}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:800,marginBottom:'8px'}}>BadOctop4s Org</div>
                <p style={{fontSize:'14px',color:'var(--text-2)',lineHeight:1.6,marginBottom:'20px'}}>Organização no GitHub com todos os projetos open source. Contribuições são bem-vindas.</p>
                <a href={process.env.NEXT_PUBLIC_GITHUB_ORG} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Ver no GitHub</a>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </div>
      <Footer />
    </ToastProvider>
  )
}
