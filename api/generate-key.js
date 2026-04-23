// api/generate-key.js — Vercel Serverless Function
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // ← service_role key, só no servidor!
);

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `RH-${seg()}-${seg()}-${seg()}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token ausente' });

  // 1. Valida o token com a Lootlabs
  try {
    const llRes = await fetch(`https://lootlabs.gg/api/validate?token=${token}`, {
      headers: { 'Authorization': `Bearer ${process.env.LOOTLABS_API_KEY}` }
    });
    const llData = await llRes.json();
    if (!llData.valid) return res.status(403).json({ error: 'Token Lootlabs inválido' });
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao validar Lootlabs' });
  }

  // 2. Verifica se esse token já gerou uma key (evita duplicatas)
  const { data: existing } = await sb
    .from('keys')
    .select('key')
    .eq('lootlabs_token', token)
    .single();

  if (existing) {
    return res.status(200).json({ key: existing.key, cached: true });
  }

  // 3. Gera e salva a key nova
  const newKey = generateKey();
  const { error } = await sb.from('keys').insert({
    key: newKey,
    lootlabs_token: token,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });

  if (error) return res.status(500).json({ error: 'Erro ao salvar key' });

  return res.status(200).json({ key: newKey });
}