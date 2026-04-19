import GlassCard from '@/components/ui/GlassCard'
import Reveal from '@/components/ui/RevealWrapper'

const features = [
  { title:'Sem Detecções', desc:'Desenvolvido com foco em bypass. Nenhum ban reportado desde o lançamento.', icon:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
  { title:'Alta Performance', desc:'Código otimizado que não causa lag. Roda suave mesmo em PCs mais fracos.', icon:<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/> },
  { title:'Atualizações Rápidas', desc:'Novo patch do jogo? Em até 6 horas já está funcionando novamente.', icon:<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></> },
  { title:'Open Source', desc:'Royal Hub é open source no GitHub. Transparência total, sem surpresas.', icon:<><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></> },
  { title:'Comunidade Ativa', desc:'Discord com suporte, changelogs e acesso antecipado a novas features.', icon:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
  { title:'UI Minimalista', desc:'Interfaces limpas construídas com WindUI. Fácil de usar, difícil de esquecer.', icon:<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></> },
]

export default function Features() {
  return (
    <section id="features" className="page-section">
      <Reveal as="p" className="section-label">Por que SyncX</Reveal>
      <Reveal as="h2" delay={1} className="section-title">Feito diferente.</Reveal>
      <Reveal as="p" delay={2} className="section-desc">Cada detalhe foi pensado para entregar a melhor experiência possível.</Reveal>
      <div className="features-grid">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) as 0|1|2}>
            <GlassCard className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24">{f.icon}</svg>
              </div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
