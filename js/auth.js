/* ═══════════════════════════════════════════════
   SyncX — auth.js
   Supabase Auth · Session · Route Guard
═══════════════════════════════════════════════ */

'use strict';

// Load Supabase client (CDN)
const { createClient } = supabase;
const sb = createClient(SYNCX_CONFIG.supabase.url, SYNCX_CONFIG.supabase.anonKey);

/* ── SESSION ── */
async function getSession() {
  const { data: { session } } = await sb.auth.getSession();
  return session;
}

async function getUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

/* ── SIGN IN ── */
async function signInWithDiscord() {
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: window.location.origin + '/dashboard.html',
      scopes: 'identify email guilds',
    },
  });
  if (error) console.error('[Auth] Discord OAuth error:', error.message);
}

async function signInWithEmail(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signUpWithEmail(email, password) {
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { emailRedirectTo: window.location.origin + '/dashboard.html' },
  });
  if (error) throw error;
  return data;
}

/* ── SIGN OUT ── */
async function signOut() {
  await sb.auth.signOut();
  window.location.href = 'index.html';
}

/* ── ROUTE GUARD (dashboard use) ── */
async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

/* ── USER LICENSE (from Supabase table) ── */
async function getUserLicense(userId) {
  const { data, error } = await sb
    .from('licenses')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
}

/* ── USER PROFILE ── */
async function getUserProfile(userId) {
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

/* ── AUTH STATE LISTENER ── */
function onAuthChange(callback) {
  return sb.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
