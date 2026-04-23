import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `RH-${seg()}-${seg()}-${seg()}`;
}

export default async function handler(req, res) {
  const { click_id, unique_id } = req.query;
  if (!unique_id) return res.status(400).end();

  // Evita duplicata pelo unique_id
  const { data: existing } = await sb
    .from('keys')
    .select('key')
    .eq('lootlabs_token', unique_id)
    .maybeSingle();

  if (existing) return res.status(200).json({ ok: true });

  // Gera e salva
  const newKey = generateKey();
  await sb.from('keys').insert({
    key:             newKey,
    lootlabs_token:  unique_id,
    lootlabs_puid:   click_id || null,
    expires_at:      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });

  return res.status(200).json({ ok: true });
}