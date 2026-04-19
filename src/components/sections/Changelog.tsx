import Reveal from '@/components/ui/RevealWrapper'

const entries = [
  { version:'SyncX Zero Hour v2.0', date:'Abr 2026', badge:'Latest', badgeClass:'tl-latest', live:true, title:'Major update — Rewrite completo', desc:'Engine de aimbot reescrita do zero com predição de trajetória aprimorada. ESP redesenhado, novo bypass anti-cheat, interface mais leve.', tags:['Aimbot','ESP','Bypass','UI'] },
  { version:'SyncX Zero Hour v1.4', date:'Mar 2026', badge:'Stable', badgeClass:'tl-stable', live:false, title:'Hotfix — Patch pós-update do jogo', desc:'Correção de offset após update do ZeroHour. Suporte a múltiplas instâncias adicionado. Melhoria de performance geral.', tags:['Hotfix','Multi-instance','Performance'] },
  { version:'Royal Hub v3.2', date:'Fev 2026', badge:'Stable', badgeClass:'tl-stable', live:false, title:'Novos jogos + Kill Aura rework', desc:'Suporte a 8 novos jogos adicionado. Kill Aura completamente refeito, Auto Parry melhorado. Radar 2D introduzido.', tags:['Royal Hub','Kill Aura','Radar 2D'] },
]

export default function Changelog() {
  return (
    <section id="changelog" className="page-section">
      <Reveal as="p" className="section-label">Histórico</Reveal>
      <Reveal as="h2" delay={1} className="section-title">Changelog.</Reveal>
      <Reveal as="p" delay={2} className="section-desc">Últimas atualizações dos produtos SyncX. Sempre em evolução.</Reveal>
      <div className="timeline">
        {entries.map((e, i) => (
          <Reveal key={e.version} delay={(i as 0|1|2)} className="tl-item">
            <div className={`tl-dot${e.live ? ' dot-live' : ''}`}/>
            <div className="tl-meta">
              <span className="tl-version">{e.version}</span>
              <span className="tl-date">{e.date}</span>
              <span className={`tl-badge ${e.badgeClass}`}>{e.badge}</span>
            </div>
            <div className="tl-title">{e.title}</div>
            <div className="tl-desc">{e.desc}</div>
            <div className="tl-tags">{e.tags.map(t => <span key={t} className="tl-tag">{t}</span>)}</div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
