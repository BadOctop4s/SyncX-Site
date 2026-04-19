import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import EvilEye from '@/components/canvas/EvilEye'
import Cursor from '@/components/layout/Cursor'
import GlassCard from '@/components/ui/GlassCard'
import Reveal from '@/components/ui/RevealWrapper'
import { ToastProvider } from '@/components/ui/Toast'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Próximos Projetos — SyncX' }

const upcoming = [
  { name:'SyncX Loader', tag:'Em Breve', tagClass:'badge-red', desc:'Loader universal para todos os produtos SyncX. Um executável, todos os scripts.', features:['Interface unificada','Auto-update silencioso','Sistema de keys e licenças','Suporte a múltiplos jogos'] },
  { name:'Free Fire Panel', tag:'Em Dev', tagClass:'badge-blue', desc:'Painel externo e interno para Free Fire. Alta performance, baixa latência.', features:['Aimbot com predição','ESP e Radar','Bypass Anti-cheat','Suporte ao último patch'] },
  { name:'FiveM Panel', tag:'Planejado', tagClass:'badge-gray', desc:'Painel para GTA V multiplayer via FiveM. Em fase de pesquisa e desenvolvimento.', features:['ESP de jogadores','God Mode','Speed Hack','Interface customizável'] },
]

export default function ProximosPage() {
  return (
    <ToastProvider>
      <Cursor />
      <EvilEye />
      <Nav />
      <div style={{paddingTop:'120px',minHeight:'100vh',position:'relative',zIndex:2}}>
        <div className="page-section">
          <Reveal as="p" className="section-label">Próximos Lançamentos</Reveal>
          <Reveal as="h1" delay={1} className="section-title">O que vem por aí.</Reveal>
          <Reveal as="p" delay={2} className="section-desc">Produtos em desenvolvimento ativo. Acompanhe o Discord para novidades em primeira mão.</Reveal>
          <div className="products-grid" style={{marginTop:'56px'}}>
            {upcoming.map((p, i) => (
              <Reveal key={p.name} delay={(i % 3) as 0|1|2}>
                <GlassCard className="product-card">
                  <div className="product-status"><span className="status-dot status-soon"/>Em breve</div>
                  <span className={`badge ${p.tagClass}`} style={{marginBottom:'20px',display:'inline-block'}}>{p.tag}</span>
                  <div className="product-name">{p.name}</div>
                  <div className="product-desc">{p.desc}</div>
                  <ul className="product-features">{p.features.map(f => <li key={f}>{f}</li>)}</ul>
                  <div className="product-actions">
                    <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE} target="_blank" rel="noreferrer" className="btn btn-ghost">Notificar no Discord</a>
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </ToastProvider>
  )
}
