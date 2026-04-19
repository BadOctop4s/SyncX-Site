import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SyncX — Script Hub',
  description: 'Scripts e ferramentas de alto nível para Roblox e outros jogos. Construído para quem não aceita menos que o melhor.',
  icons: { icon: '/logo.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
