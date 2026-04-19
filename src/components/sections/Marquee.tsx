const items = [
  'Zero Detecções','5.000+ Usuários','Open Source','Atualizado em < 6h',
  'Roblox • Free Fire • ZeroHour','Comunidade Ativa','Interface WindUI','Bypass Anti-cheat',
]

export default function Marquee() {
  const doubled = [...items, ...items]
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <div key={i} className="marquee-item">
            <span className="marquee-dot" />{item}
          </div>
        ))}
      </div>
    </div>
  )
}
