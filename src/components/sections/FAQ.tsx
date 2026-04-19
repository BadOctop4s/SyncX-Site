'use client'
import { useState } from 'react'
import Reveal from '@/components/ui/RevealWrapper'

const faqs = [
  { q:'Os produtos SyncX são gratuitos?', a:'Sim! Royal Hub é completamente gratuito e open source. SyncX Zero Hour também é free. Produtos futuros podem ter versões premium, mas sempre haverá uma opção gratuita disponível.' },
  { q:'É seguro usar? Posso ser banido?', a:'Nenhum ban foi reportado desde o lançamento. Todos os produtos SyncX são desenvolvidos com foco em bypass e detecção. Mesmo assim, use com responsabilidade — nenhum cheat tem garantia absoluta.' },
  { q:'Com que frequência são atualizados?', a:'Sempre que o jogo recebe um update, trabalhamos para ter uma atualização compatível em até 6 horas. Changelogs são publicados no Discord em tempo real.' },
  { q:'Quais executores são compatíveis com o Royal Hub?', a:'Royal Hub é compatível com a maioria dos executores: Synapse X, KRNL, Fluxus, Wave, Hydrogen e similares. Se o executor suporta loadstring via HttpGet, funciona.' },
  { q:'Como recebo notificações de novas versões?', a:'Entre no nosso Discord e ative as notificações do canal #changelogs. Você receberá um ping toda vez que uma nova versão for lançada, com notas detalhadas de cada mudança.' },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section id="faq" className="page-section">
      <Reveal as="p" className="section-label">FAQ</Reveal>
      <Reveal as="h2" delay={1} className="section-title">Perguntas frequentes.</Reveal>
      <Reveal as="p" delay={2} className="section-desc">Tudo que você precisa saber antes de começar.</Reveal>
      <div className="faq-list">
        {faqs.map((f, i) => (
          <Reveal key={i} delay={(i % 3) as 0|1|2} className={`faq-item${open === i ? ' open' : ''}`}>
            <div className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
              {f.q}
              <div className="faq-icon">
                <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
            </div>
            <div className="faq-answer">{f.a}</div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
