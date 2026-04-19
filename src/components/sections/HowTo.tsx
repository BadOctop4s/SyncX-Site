'use client'
import GlassCard from '@/components/ui/GlassCard'
import Reveal from '@/components/ui/RevealWrapper'
import { useToast } from '@/components/ui/Toast'

const LOADSTRING = process.env.NEXT_PUBLIC_ROYALHUB_LOADSTRING!

export default function HowTo() {
  const toast = useToast()
  const copy = () => navigator.clipboard.writeText(LOADSTRING).then(() => toast('Loadstring copiado!'))

  return (
    <section id="howto" className="page-section">
      <Reveal as="p" className="section-label">Como Usar</Reveal>
      <Reveal as="h2" delay={1} className="section-title">Em 3 passos.</Reveal>
      <Reveal as="p" delay={2} className="section-desc">Pronto para usar em menos de um minuto.</Reveal>
      <div className="steps-row">
        {[
          { n:'01', t:'Abra seu executor', d:'Use qualquer executor compatível com Roblox: Synapse, KRNL, Fluxus, Wave ou similar.', arrow:true },
          { n:'02', t:'Cole o loadstring', d:'Copie o loadstring do produto desejado e cole no campo de script do executor.', arrow:true },
          { n:'03', t:'Execute e aproveite', d:'Clique em Execute dentro do jogo. A interface carrega automaticamente.', arrow:false },
        ].map((s, i) => (
          <Reveal key={s.n} delay={i as 0|1|2}>
            <GlassCard className="step">
              <div className="step-num">{s.n}</div>
              <div className="step-title">{s.t}</div>
              <div className="step-desc">{s.d}</div>
              {s.arrow && <div className="step-arrow"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>}
            </GlassCard>
          </Reveal>
        ))}
      </div>
      <Reveal className="code-block" style={{marginTop:'28px'}}>
        <div className="code-header">
          <div className="code-dots"><span className="code-dot d1"/><span className="code-dot d2"/><span className="code-dot d3"/></div>
          <span className="code-lang">LUAU — Royal Hub</span>
          <button className="code-copy-btn" onClick={copy}>Copiar</button>
        </div>
        <div className="code-body">
          <span className="c-fn">loadstring</span>(<span className="c-fn">game</span>:<span className="c-fn">HttpGet</span>(<span className="c-str">&quot;https://raw.githubusercontent.com/BadOctop4s/RoyalHub/main/Source.lua&quot;</span>))()
        </div>
      </Reveal>
    </section>
  )
}
