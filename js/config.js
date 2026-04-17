// SyncX — Config
// Anon key is safe to expose on frontend (Supabase design)
// NEVER expose your service_role key here

const SYNCX_CONFIG = {
  supabase: {
    url: 'https://gdaiirmnqdypikeugdij.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkYWlpcm1ucWR5cGlrZXVnZGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NDI1MjksImV4cCI6MjA5MjAxODUyOX0.ZRWJKeQfMKuWyISNSKcAYf9ZucSBWWpn_MZ57fcNztA',
  },
  discord: {
    invite: 'https://discord.gg/faUyqCdd3P',
  },
  github: {
    org: 'https://github.com/BadOctop4s',
    royalhub: 'https://github.com/BadOctop4s/RoyalHub',
    zerohour: 'https://github.com/BadOctop4s/SyncX---ZeroHour',
  },
  downloads: {
    zerohour: 'https://github.com/BadOctop4s/SyncX---ZeroHour/releases/download/SyncX/SyncX-ZeroHour.exe',
    royalhub_loadstring: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/BadOctop4s/RoyalHub/main/Source.lua"))()',
  },
};
