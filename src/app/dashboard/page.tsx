'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import EvilEye from '@/components/canvas/EvilEye'
import Cursor from '@/components/layout/Cursor'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { supabase, getSession, getUserLicense, signOut } from '@/lib/supabase'
import { detectDiscordRole, type DiscordRole } from '@/lib/discord'

// ── Types ──
interface License {
  id: string; key: string; username?: string; active: boolean
  expires_at?: string; duration_days: number; user_id?: string; created_at: string
}
interface Session { user: { id: string; email?: string; created_at: string; email_confirmed_at?: string; user_metadata: Record<string, string>; }; provider_token?: string }

type Page = 'overview'|'license'|'activate'|'downloads'|'staff'|'developer'|'admin'|'creator'

const PAGE_TITLES: Record<Page,string> = {
  overview:'Overview', license:'Licença', activate:'Ativar Licença',
  downloads:'Downloads', staff:'Staff', developer:'Dev Tools', admin:'Admin', creator:'Creator'
}

function generateKey() {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const seg = () => Array.from({length:6}, () => c[Math.floor(Math.random()*c.length)]).join('')
  return `SYNCX-${seg()}-${seg()}-${seg()}`
}

// ── Dashboard inner (needs Toast context) ──
function DashInner() {
  const router  = useRouter()
  const toast   = useToast()
  const [session,  setSession]  = useState<Session|null>(null)
  const [role,     setRole]     = useState<DiscordRole>({ label:'Membro', badgeClass:'badge-gray', tier:0 })
  const [license,  setLicense]  = useState<License|null>(null)
  const [page,     setPage]     = useState<Page>('overview')
  const [sideOpen, setSideOpen] = useState(false)
  // Admin state
  const [adminStats,  setAdminStats]  = useState({ total:0, active:0, users:0 })
  const [adminLics,   setAdminLics]   = useState<License[]>([])
  const [genDuration, setGenDuration] = useState(30)
  const [genAmount,   setGenAmount]   = useState(1)
  const [genKeys,     setGenKeys]     = useState<string[]>([])
  // Activate state
  const [actKey,  setActKey]  = useState('')
  const [actUser, setActUser] = useState('')
  const [actPass, setActPass] = useState('')
  const [actErr,  setActErr]  = useState('')
  const [actOk,   setActOk]   = useState('')

  const load = useCallback(async () => {
    const s = await getSession()
    if (!s) { router.replace('/login'); return }
    setSession(s as Session)
    const r = await detectDiscordRole(s as Session)
    setRole(r)
    const lic = await getUserLicense(s.user.id)
    setLicense(lic)
  }, [router])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(ev => {
      if (ev === 'SIGNED_OUT') router.replace('/login')
    })
    return () => subscription.unsubscribe()
  }, [router])

  const adminLoadStats = async () => {
    const [{ count: t }, { count: a }, { count: u }] = await Promise.all([
      supabase.from('licenses').select('*',{count:'exact',head:true}),
      supabase.from('licenses').select('*',{count:'exact',head:true}).eq('active',true).not('user_id','is',null),
      supabase.from('profiles').select('*',{count:'exact',head:true}),
    ])
    setAdminStats({ total:t??0, active:a??0, users:u??0 })
  }
  const adminLoadLicenses = async () => {
    const { data } = await supabase.from('licenses').select('*').order('created_at',{ascending:false}).limit(100)
    setAdminLics(data || [])
  }
  const adminGenerateKeys = async () => {
    if (!session) return
    const keys = Array.from({length:Math.min(genAmount,50)}, () => {
      const key = generateKey()
      const expiresAt = genDuration >= 36500 ? null : new Date(Date.now()+genDuration*86400000).toISOString()
      return { key, duration_days:genDuration, expires_at:expiresAt, active:true, created_by:session.user.id }
    })
    const { error } = await supabase.from('licenses').insert(keys)
    if (error) { toast('Erro: '+error.message, 'error'); return }
    setGenKeys(keys.map(k => k.key))
    toast(`${keys.length} key(s) gerada(s)!`)
    adminLoadStats(); adminLoadLicenses()
  }
  const adminRevoke = async (id: string) => {
    if (!confirm('Revogar esta key?')) return
    const { error } = await supabase.from('licenses').update({active:false}).eq('id',id)
    if (error) { toast('Erro ao revogar','error'); return }
    toast('Key revogada.'); adminLoadLicenses(); adminLoadStats()
  }

  const activateLicense = async () => {
    setActErr(''); setActOk('')
    if (!actKey||!actUser||!actPass) { setActErr('Preencha todos os campos.'); return }
    if (actPass.length < 6) { setActErr('Senha mínimo 6 caracteres.'); return }
    if (actUser.length < 3) { setActErr('Username mínimo 3 caracteres.'); return }
    if (!session) return
    const { data: lic, error: licErr } = await supabase.from('licenses').select('*').eq('key',actKey.trim().toUpperCase()).eq('active',true).is('user_id',null).single()
    if (licErr||!lic) { setActErr('Key inválida, já utilizada ou inexistente.'); return }
    if (lic.expires_at && new Date(lic.expires_at) < new Date()) { setActErr('Key expirada.'); return }
    const { data: existUsr } = await supabase.from('licenses').select('id').eq('username',actUser).single()
    if (existUsr) { setActErr('Username já em uso.'); return }
    const { data: existLic } = await supabase.from('licenses').select('id').eq('user_id',session.user.id).single()
    if (existLic) { setActErr('Conta já possui licença ativa.'); return }
    const enc = new TextEncoder()
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(actPass+session.user.id))
    const hash = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')
    const { error: upErr } = await supabase.from('licenses').update({ user_id:session.user.id, username:actUser, password_hash:hash, used_at:new Date().toISOString() }).eq('id',lic.id)
    if (upErr) { setActErr('Erro: '+upErr.message); return }
    setActOk(`✓ Licença ativada! Username: ${actUser}`)
    setActKey(''); setActUser(''); setActPass('')
    setTimeout(load, 1000)
  }

  if (!session) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',fontFamily:'var(--font-mono)',color:'var(--text-3)'}}>Carregando...</div>

  const user = session.user
  const name   = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'
  const avatar = user.user_metadata?.avatar_url
  const since  = new Date(user.created_at).toLocaleDateString('pt-BR',{year:'numeric',month:'short',day:'numeric'})
  const licActive = license?.active && (!license.expires_at || new Date(license.expires_at) > new Date())

  const navTo = (p: Page) => { setPage(p); setSideOpen(false) }

  const SideLink = ({ p, icon, label, minTier=0 }: { p:Page; icon:React.ReactNode; label:string; minTier?:number }) => {
    if (minTier > 0 && role.tier < minTier) return null
    return (
      <a className={`sidebar-link${page===p?' active':''}`} onClick={() => navTo(p)} style={{cursor:'pointer'}}>
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{width:16,height:16,flexShrink:0}}>{icon}</svg>
        {label}
      </a>
    )
  }

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className={`sidebar${sideOpen?' open':''}`}>
        <div className="sidebar-header">
          <Link href="/" style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:800}}>Sync<span style={{color:'var(--accent)'}}>X</span></Link>
          <span className="badge badge-red" style={{marginLeft:'auto',fontSize:'9px'}}>Dashboard</span>
        </div>
        <nav className="sidebar-nav">
          <SideLink p="overview" icon={<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>} label="Overview"/>
          <SideLink p="license" icon={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>} label="Licença"/>
          <SideLink p="downloads" icon={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>} label="Downloads"/>
          <SideLink p="activate" icon={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>} label="Ativar Licença"/>
          <SideLink p="staff" minTier={50} icon={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>} label="Staff"/>
          <SideLink p="developer" minTier={70} icon={<><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>} label="Dev Tools"/>
          <SideLink p="admin" minTier={80} icon={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>} label="Admin"/>
          <SideLink p="creator" minTier={100} icon={<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>} label="Creator"/>
          <div className="sidebar-section-label">Links</div>
          <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE} target="_blank" rel="noreferrer" className="sidebar-link"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{width:16,height:16}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Discord</a>
          <a href={process.env.NEXT_PUBLIC_GITHUB_ORG} target="_blank" rel="noreferrer" className="sidebar-link"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{width:16,height:16}}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>GitHub</a>
          <Link href="/" className="sidebar-link"><svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{width:16,height:16}}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Início</Link>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {avatar ? <Image src={avatar} alt="avatar" width={32} height={32} style={{borderRadius:'50%',objectFit:'cover'}}/> : name[0].toUpperCase()}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div className="sidebar-user-name">{name}</div>
              <div className="sidebar-user-role">{role.label}</div>
            </div>
            <button onClick={async () => { await signOut(); router.replace('/') }} title="Sair" style={{background:'none',border:'none',color:'var(--text-3)',padding:'4px',borderRadius:'4px',flexShrink:0}}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <div className="dash-topbar">
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <button onClick={() => setSideOpen(!sideOpen)} style={{background:'none',border:'none',color:'var(--text-2)',padding:'4px',display:'none'}} className="mobile-menu-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="dash-topbar-title">{PAGE_TITLES[page]}</div>
          </div>
          <span className="badge badge-green"><span className="dot dot-pulse"/>Online</span>
        </div>

        <div className="dash-content">

          {/* ── OVERVIEW ── */}
          {page === 'overview' && (
            <>
              <div className="stat-grid">
                <div className="stat-card"><div className="stat-label">Status da Conta</div><div className="stat-value" style={{fontSize:'18px'}}>{licActive ? <span className="badge badge-green"><span className="dot"/>Ativo</span> : <span className="badge badge-gray">Sem licença</span>}</div></div>
                <div className="stat-card"><div className="stat-label">Cargo Discord</div><div className="stat-value" style={{fontSize:'15px',marginTop:'4px'}}><span className={`badge ${role.badgeClass}`}>{role.label}</span></div></div>
                <div className="stat-card"><div className="stat-label">Produtos Ativos</div><div className="stat-value">{licActive?'1':'0'}</div><div className="stat-sub">licenças ativas</div></div>
                <div className="stat-card"><div className="stat-label">Membro desde</div><div className="stat-value" style={{fontSize:'16px'}}>{since}</div></div>
                <div className="stat-card"><div className="stat-label">Email</div><div className="stat-value" style={{fontSize:'13px',letterSpacing:0}}>{user.email||'—'}</div><div className="stat-sub">{user.email_confirmed_at?'✓ Verificado':'Não verificado'}</div></div>
              </div>
              <div style={{marginTop:'8px'}}><div style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:800,marginBottom:'16px'}}>Acesso Rápido</div>
                <div className="download-grid">
                  {[
                    { title:'SyncX Zero Hour', desc:'Versão mais recente do cheat externo.', icon:<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>, btn:<a href={process.env.NEXT_PUBLIC_ZEROHOUR_DOWNLOAD} className="btn btn-primary btn-sm">Baixar .exe</a> },
                    { title:'Royal Hub', desc:'Loadstring pronto para executar.', icon:<><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>, btn:<button onClick={() => navigator.clipboard.writeText(process.env.NEXT_PUBLIC_ROYALHUB_LOADSTRING!).then(()=>toast('Copiado!'))} className="btn btn-primary btn-sm" style={{border:'none'}}>Copiar Loadstring</button> },
                    { title:'Suporte', desc:'Precisa de ajuda? Acesse o Discord.', icon:<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>, btn:<a href={process.env.NEXT_PUBLIC_DISCORD_INVITE} target="_blank" rel="noreferrer" className="btn btn-discord btn-sm">Abrir Discord</a> },
                  ].map(c => (
                    <div key={c.title} className="download-card">
                      <div className="download-card-icon"><svg viewBox="0 0 24 24">{c.icon}</svg></div>
                      <h3>{c.title}</h3><p>{c.desc}</p>{c.btn}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── LICENSE ── */}
          {page === 'license' && (
            <>
              <div style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:800,marginBottom:'20px'}}>Sua Licença</div>
              <div className="license-card">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
                  <div><div style={{fontFamily:'var(--font-mono)',fontSize:'10px',color:'var(--text-3)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'4px'}}>SyncX Zero Hour</div><div style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:800}}>Chave de Produto</div></div>
                  <span className={`license-status ${licActive?'status-active':'status-inactive'}`}>{licActive?'Ativo':'Sem licença'}</span>
                </div>
                <div className="license-key-wrap">
                  <div className="license-key">{license?.key||'Nenhuma chave encontrada'}</div>
                  {license && <button onClick={() => navigator.clipboard.writeText(license.key).then(()=>toast('Chave copiada!'))} className="btn btn-ghost btn-sm">Copiar</button>}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginTop:'16px'}}>
                  {[['Válida até', license?.expires_at ? new Date(license.expires_at).toLocaleDateString('pt-BR') : 'Vitalício'],['Username', license?.username||'—'],['Duração', license ? (license.duration_days >= 36500 ? 'Vitalício' : license.duration_days+' dias') : '—']].map(([l,v]) => (
                    <div key={l}><div style={{fontFamily:'var(--font-mono)',fontSize:'10px',color:'var(--text-3)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'4px'}}>{l}</div><div style={{fontSize:'13px',color:'var(--text-2)'}}>{v}</div></div>
                  ))}
                </div>
              </div>
              {!license && <div className="notice" style={{marginTop:'16px'}}><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Não tem uma chave? <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE} target="_blank" rel="noreferrer">Discord</a> ou <a onClick={() => navTo('activate')} style={{cursor:'pointer',color:'var(--accent)'}}>ative sua licença</a>.</div>}
            </>
          )}

          {/* ── ACTIVATE ── */}
          {page === 'activate' && (
            <div style={{maxWidth:'480px'}}>
              <p style={{fontSize:'13px',color:'var(--text-3)',marginBottom:'24px'}}>Insira a key que você recebeu para ativar o SyncX Zero Hour na sua conta.</p>
              {actErr && <div style={{background:'rgba(224,32,32,.08)',border:'1px solid rgba(224,32,32,.2)',borderRadius:'var(--radius)',padding:'12px 16px',fontSize:'13px',color:'var(--accent-2)',marginBottom:'16px'}}>{actErr}</div>}
              {actOk  && <div style={{background:'rgba(34,197,94,.08)',border:'1px solid rgba(34,197,94,.2)',borderRadius:'var(--radius)',padding:'12px 16px',fontSize:'13px',color:'#4ade80',marginBottom:'16px'}}>{actOk}</div>}
              {[['KEY DO ZEROHOUR','text',actKey,setActKey,'SYNCX-XXXX-XXXX-XXXX'],['USERNAME','text',actUser,setActUser,'SeuNome'],['SENHA','password',actPass,setActPass,'Mínimo 6 caracteres']].map(([l,t,v,set,ph]) => (
                <div key={String(l)} className="form-group"><label className="form-label">{String(l)}</label><input type={String(t)} className="form-input" placeholder={String(ph)} value={String(v)} onChange={e => (set as (v:string)=>void)(e.target.value)}/></div>
              ))}
              <button onClick={activateLicense} className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'13px'}}>Ativar Licença</button>
              <p style={{fontSize:'12px',color:'var(--text-3)',marginTop:'12px',textAlign:'center'}}>Recebeu sua key no Discord após a compra. Problemas? <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE} target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>Suporte</a></p>
            </div>
          )}

          {/* ── DOWNLOADS ── */}
          {page === 'downloads' && (
            <>
              <div style={{marginBottom:'16px'}}>
                <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'24px',marginBottom:'16px'}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'16px',flexWrap:'wrap'}}>
                    <div><div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}><div style={{fontFamily:'var(--font-display)',fontSize:'16px',fontWeight:800}}>SyncX Zero Hour</div><span className="badge badge-red">v2.0</span></div><div style={{fontSize:'13px',color:'var(--text-3)'}}>Cheat externo para Zero Hour. Windows 10/11.</div></div>
                    <a href={process.env.NEXT_PUBLIC_ZEROHOUR_DOWNLOAD} className="btn btn-primary">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download .exe
                    </a>
                  </div>
                </div>
                <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'24px'}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'16px',flexWrap:'wrap'}}>
                    <div><div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}><div style={{fontFamily:'var(--font-display)',fontSize:'16px',fontWeight:800}}>Royal Hub</div><span className="badge badge-blue">Free</span></div><div style={{fontSize:'13px',color:'var(--text-3)'}}>Script Lua para Roblox. Execute via executor.</div></div>
                    <button onClick={() => navigator.clipboard.writeText(process.env.NEXT_PUBLIC_ROYALHUB_LOADSTRING!).then(()=>toast('Copiado!'))} className="btn btn-primary" style={{border:'none'}}>Copiar Loadstring</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── ADMIN ── */}
          {page === 'admin' && role.tier >= 80 && (
            <>
              <p style={{fontSize:'13px',color:'var(--text-3)',marginBottom:'24px'}}>Controle administrativo. Acesso restrito a ADMIN e superior.</p>
              <div className="stat-grid" style={{marginBottom:'24px'}}>
                <div className="stat-card"><div className="stat-label">Total licenças</div><div className="stat-value">{adminStats.total}</div></div>
                <div className="stat-card"><div className="stat-label">Licenças ativas</div><div className="stat-value">{adminStats.active}</div></div>
                <div className="stat-card"><div className="stat-label">Usuários</div><div className="stat-value">{adminStats.users}</div></div>
                <div className="stat-card"><div className="stat-label">Nível de acesso</div><div className="stat-value" style={{fontSize:'15px'}}><span className={`badge ${role.badgeClass}`}>{role.label}</span></div></div>
              </div>
              {/* Gerar keys */}
              <div style={{background:'var(--surface)',border:'1px solid rgba(224,32,32,.15)',borderRadius:'var(--radius-lg)',padding:'24px',marginBottom:'16px'}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'15px',fontWeight:800,marginBottom:'16px'}}>Gerar Nova Key</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'12px',alignItems:'end'}}>
                  <div><label className="form-label" style={{marginBottom:'6px'}}>Duração</label>
                    <select value={genDuration} onChange={e=>setGenDuration(Number(e.target.value))} style={{width:'100%',padding:'10px 12px',background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',color:'var(--text)',fontFamily:'var(--font-body)',fontSize:'13px',outline:'none'}}>
                      {[[7,'7 dias'],[30,'30 dias'],[90,'90 dias'],[180,'180 dias'],[365,'1 ano'],[36500,'Vitalício']].map(([v,l]) => <option key={v} value={v}>{String(l)}</option>)}
                    </select>
                  </div>
                  <div><label className="form-label" style={{marginBottom:'6px'}}>Quantidade</label><input type="number" value={genAmount} min={1} max={50} onChange={e=>setGenAmount(Number(e.target.value))} style={{width:'100%',padding:'10px 12px',background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',color:'var(--text)',fontSize:'13px',outline:'none'}}/></div>
                  <button onClick={adminGenerateKeys} className="btn btn-primary">Gerar</button>
                </div>
                {genKeys.length > 0 && (
                  <div style={{marginTop:'16px'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:'11px',color:'var(--text-3)',letterSpacing:'1px',textTransform:'uppercase'}}>Keys Geradas</span>
                      <button onClick={() => navigator.clipboard.writeText(genKeys.join('\n')).then(()=>toast('Todas copiadas!'))} className="btn btn-ghost btn-sm">Copiar todas</button>
                    </div>
                    <div style={{background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'14px',display:'flex',flexDirection:'column',gap:'6px',maxHeight:'200px',overflowY:'auto'}}>
                      {genKeys.map(k => (
                        <div key={k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>
                          <span style={{fontFamily:'var(--font-mono)',fontSize:'12px',color:'var(--text-2)'}}>{k}</span>
                          <button onClick={() => navigator.clipboard.writeText(k).then(()=>toast('Copiado!'))} className="btn btn-ghost btn-sm" style={{flexShrink:0,fontSize:'11px',padding:'4px 8px'}}>Copiar</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Lista licenças */}
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'24px',marginBottom:'16px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
                  <div style={{fontFamily:'var(--font-display)',fontSize:'15px',fontWeight:800}}>Licenças Cadastradas</div>
                  <button onClick={() => { adminLoadLicenses(); adminLoadStats() }} className="btn btn-ghost btn-sm">Atualizar</button>
                </div>
                <div style={{overflowX:'auto'}}>
                  <table className="dash-table">
                    <thead><tr><th>Key</th><th>Username</th><th>Status</th><th>Expira</th><th>Criada</th><th>Ação</th></tr></thead>
                    <tbody>
                      {adminLics.length === 0
                        ? <tr><td colSpan={6} style={{textAlign:'center',color:'var(--text-3)',padding:'24px'}}>Clique em Atualizar para carregar</td></tr>
                        : adminLics.map(l => {
                          const isAct = l.active && (!l.expires_at || new Date(l.expires_at) > new Date())
                          return (
                            <tr key={l.id}>
                              <td style={{fontFamily:'var(--font-mono)',fontSize:'11px'}} title={l.key}>{l.key.substring(0,20)}...</td>
                              <td style={{fontSize:'12px'}}>{l.username||'—'}</td>
                              <td><span className={`badge ${isAct?'badge-green':'badge-gray'}`}>{isAct?'Ativa':l.active?'Expirada':'Revogada'}</span></td>
                              <td style={{fontSize:'12px',color:'var(--text-2)'}}>{l.expires_at?new Date(l.expires_at).toLocaleDateString('pt-BR'):'Vitalício'}</td>
                              <td style={{fontSize:'12px',color:'var(--text-2)'}}>{new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
                              <td><button onClick={() => adminRevoke(l.id)} className="btn btn-ghost btn-sm" style={{fontSize:'11px',padding:'4px 8px',color:'var(--accent)'}}>Revogar</button></td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                <button onClick={() => { adminLoadStats(); adminLoadLicenses() }} className="btn btn-ghost btn-sm">Atualizar Stats</button>
                <a href="https://supabase.com/dashboard/project/gdaiirmnqdypikeugdij" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Abrir Supabase</a>
              </div>
            </>
          )}

          {/* ── CREATOR ── */}
          {page === 'creator' && role.tier >= 100 && (
            <>
              <p style={{fontSize:'13px',color:'var(--text-3)',marginBottom:'24px'}}>Controle total do projeto. Acesso máximo.</p>
              <div className="stat-grid" style={{marginBottom:'24px'}}>
                <div className="stat-card" style={{borderColor:'rgba(224,32,32,.2)'}}><div className="stat-label">Nível de acesso</div><div className="stat-value" style={{fontSize:'15px'}}><span className="badge badge-red">Creator</span></div></div>
                <div className="stat-card"><div className="stat-label">Licenças totais</div><div className="stat-value">{adminStats.total||'—'}</div></div>
                <div className="stat-card"><div className="stat-label">Usuários totais</div><div className="stat-value">{adminStats.users||'—'}</div></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                {[['Controles do Projeto',[['Repositório do Site','https://github.com/BadOctop4s'],['Vercel Deploy','https://vercel.com'],['Supabase DB','https://supabase.com/dashboard/project/gdaiirmnqdypikeugdij']]],['Produtos',[['SyncX Zero Hour','https://github.com/BadOctop4s/SyncX---ZeroHour'],['Royal Hub','https://github.com/BadOctop4s/RoyalHub']]]].map(([title, links]) => (
                  <div key={String(title)} style={{background:'var(--bg-2)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'24px'}}>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'13px',fontWeight:800,marginBottom:'12px'}}>{String(title)}</div>
                    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                      {(links as [string,string][]).map(([l,h]) => <a key={l} href={h} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">{l}</a>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </main>
      <div id="toast-container"/>
    </div>
  )
}

export default function DashboardPage() {
  return <ToastProvider><DashInner /></ToastProvider>
}
