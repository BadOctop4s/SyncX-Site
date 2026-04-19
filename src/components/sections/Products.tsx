'use client'
import GlassCard from '@/components/ui/GlassCard'
import Reveal from '@/components/ui/RevealWrapper'
import { useToast } from '@/components/ui/Toast'

const ZEROHOUR_URL = process.env.NEXT_PUBLIC_ZEROHOUR_DOWNLOAD!
const LOADSTRING   = process.env.NEXT_PUBLIC_ROYALHUB_LOADSTRING!
const GITHUB_ORG   = process.env.NEXT_PUBLIC_GITHUB_ORG!

export default function Products() {
  const toast = useToast()

  const copyLoadstring = () => {
    navigator.clipboard.writeText(LOADSTRING).then(() => toast('Loadstring copiado!'))
  }

  return (
    <section id="products" className="page-section">
      <Reveal as="p" className="section-label">Nossos Produtos</Reveal>
      <Reveal as="h2" delay={1} className="section-title">
        Tudo que você precisa,<br/>em um só lugar.
      </Reveal>
      <Reveal as="p" delay={2} className="section-desc">
        Scripts, cheats e ferramentas desenvolvidos com foco em performance e segurança.
      </Reveal>

      <div className="products-grid">
        {/* Zero Hour */}
        <Reveal>
          <GlassCard className="product-card">
            <div className="product-status"><span className="status-dot status-live"/>Live</div>
            <span className="product-tag tag-red">Destaque</span>
            <div className="product-name">SyncX Zero Hour</div>
            <div className="product-desc">Cheat externo de alta performance para ZeroHour. Zero detecções, atualizações rápidas e interface limpa.</div>
            <ul className="product-features">
              {['Aimbot com predição de hit','ESP de jogadores e itens','Bypass anti-cheat integrado','Suporte a múltiplas instâncias','Atualizações em até 6h pós-patch'].map(f => <li key={f}>{f}</li>)}
            </ul>
            <div className="product-actions">
              <a href={ZEROHOUR_URL} className="btn btn-primary">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </a>
              <a href={GITHUB_ORG} target="_blank" rel="noreferrer" className="btn btn-ghost">GitHub</a>
            </div>
          </GlassCard>
        </Reveal>

        {/* Royal Hub */}
        <Reveal delay={1}>
          <GlassCard className="product-card">
            <div className="product-status"><span className="status-dot status-live"/>Live</div>
            <span className="product-tag tag-blue">Script Hub</span>
            <div className="product-name">Royal Hub</div>
            <div className="product-desc">O hub de scripts mais completo para Roblox. Interface WindUI com dezenas de funcionalidades prontas.</div>
            <ul className="product-features">
              {['Aimbot suave e rage','Fly, NoClip, ESP, Radar 2D','Kill Aura, Auto Parry, Hitbox','Freecam, Fullbright, Xray','Server Hop, Loop TP e mais'].map(f => <li key={f}>{f}</li>)}
            </ul>
            <div className="product-actions">
              <button onClick={copyLoadstring} className="btn btn-primary" style={{border:'none'}}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                Copiar Loadstring
              </button>
              <a href="https://github.com/BadOctop4s/RoyalHub" target="_blank" rel="noreferrer" className="btn btn-ghost">GitHub</a>
            </div>
          </GlassCard>
        </Reveal>

        {/* Loader */}
        <Reveal delay={2}>
          <GlassCard className="product-card">
            <div className="product-status"><span className="status-dot status-soon"/>Em breve</div>
            <span className="product-tag tag-gray">Próximo</span>
            <div className="product-name">SyncX Loader</div>
            <div className="product-desc">Loader universal para todos os produtos SyncX. Um executável, todos os scripts. Auto-update integrado.</div>
            <ul className="product-features">
              {['Interface unificada','Sistema de keys e licenças','Auto-update silencioso','Suporte a múltiplos jogos','Dashboard web integrado'].map(f => <li key={f}>{f}</li>)}
            </ul>
            <div className="product-actions">
              <a href="/#community" className="btn btn-ghost">Notificar no Discord</a>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  )
}
