'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EvilEye from '@/components/canvas/EvilEye'
import Cursor from '@/components/layout/Cursor'
import { supabase, signInWithDiscord, signInWithEmail, signUpWithEmail, getSession } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login'|'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getSession().then(s => { if (s) router.replace('/dashboard') })
  }, [router])

  const showErr = (msg: string) => { setError(msg); setTimeout(() => setError(''), 5000) }

  const handleEmailLogin = async () => {
    if (!email || !password) { showErr('Preencha email e senha.'); return }
    setLoading(true)
    try { await signInWithEmail(email, password); router.replace('/dashboard') }
    catch (e: unknown) { showErr(e instanceof Error ? e.message : 'Erro ao fazer login.') }
    finally { setLoading(false) }
  }

  const handleSignup = async () => {
    if (!email || !password) { showErr('Preencha todos os campos.'); return }
    if (password.length < 6) { showErr('Senha deve ter no mínimo 6 caracteres.'); return }
    setLoading(true)
    try {
      await signUpWithEmail(email, password)
      setSuccess('✓ Conta criada! Verifique seu email para confirmar.')
    }
    catch (e: unknown) { showErr(e instanceof Error ? e.message : 'Erro ao criar conta.') }
    finally { setLoading(false) }
  }

  return (
    <>
      <Cursor />
      <EvilEye />
      <nav id="nav" style={{ position:'fixed', top:0, left:0, right:0, height:'66px', display:'flex', alignItems:'center', zIndex:900, background:'transparent' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'0 40px' }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:'8px', fontFamily:'var(--font-display)', fontSize:'20px', fontWeight:800, color:'var(--text)' }}>
            Sync<span style={{color:'var(--accent)'}}>X</span>
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">← Voltar</Link>
        </div>
      </nav>

      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">Sync<span>X</span></div>
          <div className="login-sub">Acesse sua conta para gerenciar licenças e downloads.</div>

          <button onClick={() => signInWithDiscord()} className="btn btn-discord" style={{width:'100%',justifyContent:'center',fontSize:'14px',padding:'12px'}}>
            <svg width="18" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.03.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
            Entrar com Discord
          </button>

          <div className="login-divider"><span>ou email</span></div>

          <div className="tab-row">
            <button className={`tab-btn${tab==='login'?' active':''}`} onClick={() => { setTab('login'); setError(''); setSuccess('') }}>Entrar</button>
            <button className={`tab-btn${tab==='signup'?' active':''}`} onClick={() => { setTab('signup'); setError(''); setSuccess('') }}>Criar conta</button>
          </div>

          {error   && <div style={{background:'rgba(224,32,32,.08)',border:'1px solid rgba(224,32,32,.2)',borderRadius:'var(--radius-sm)',padding:'10px 14px',fontSize:'12px',color:'var(--accent-2)',marginBottom:'16px'}}>{error}</div>}
          {success && <div style={{background:'rgba(34,197,94,.06)',border:'1px solid rgba(34,197,94,.3)',borderRadius:'var(--radius-sm)',padding:'10px 14px',fontSize:'12px',color:'#4ade80',marginBottom:'16px'}}>{success}</div>}

          {tab === 'signup' && (
            <div className="form-group">
              <label className="form-label">Nome de usuário</label>
              <input type="text" className="form-input" placeholder="SeuNome" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input type="password" className="form-input" placeholder={tab==='signup'?'Mínimo 6 caracteres':'••••••••'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && (tab==='login'?handleEmailLogin():handleSignup())} />
          </div>

          <button onClick={tab==='login'?handleEmailLogin:handleSignup} disabled={loading} className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:'8px',opacity:loading?.6:1}}>
            {loading ? 'Aguarde...' : tab==='login' ? 'Entrar' : 'Criar conta'}
          </button>

          <div style={{textAlign:'center',marginTop:'20px',fontSize:'12px',color:'var(--text-3)'}}>
            <Link href="/" style={{color:'var(--accent)'}}>← Voltar para o início</Link>
          </div>
        </div>
      </div>
    </>
  )
}
