'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div className="footer-brand">
          <h3>Sync<span>X</span></h3>
          <p>Scripts e ferramentas de alta performance para Roblox. Construído com precisão, distribuído com responsabilidade.</p>
        </div>
        <div className="footer-col">
          <h4>Produtos</h4>
          <ul>
            <li><Link href="/#products">SyncX Zero Hour</Link></li>
            <li><Link href="/#products">Royal Hub</Link></li>
            <li><Link href="/#products">SyncX Loader</Link></li>
            <li><Link href="/proximos">Próximos Produtos</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Recursos</h4>
          <ul>
            <li><a href="https://github.com/BadOctop4s/RoyalHub" target="_blank" rel="noreferrer">GitHub</a></li>
            <li><Link href="/#howto">Documentação</Link></li>
            <li><Link href="/#howto">Como Usar</Link></li>
            <li><Link href="/dashboard">Dashboard</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Comunidade</h4>
          <ul>
            <li><a href={process.env.NEXT_PUBLIC_DISCORD_INVITE} target="_blank" rel="noreferrer">Discord</a></li>
            <li><Link href="/#community">Suporte</Link></li>
            <li><Link href="/#changelog">Changelogs</Link></li>
            <li><Link href="/login">Entrar</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>SyncX © 2026 — Não afiliado à Roblox Corporation.</span>
        <div className="footer-bottom-links">
          <a href="#">Termos</a>
          <a href="#">Privacidade</a>
        </div>
      </div>
    </footer>
  )
}
