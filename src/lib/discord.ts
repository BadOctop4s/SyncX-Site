export const GUILD_ID = '1441668291918561424'

export const ROLE_DEFINITIONS = [
  { id: '1447093178007162983', label: 'Creator/Programmer', badgeClass: 'badge-purple', tier: 100 },
  { id: '1443034423829467269', label: 'ADMIN',              badgeClass: 'badge-red',    tier: 80  },
  { id: '1443329537927544872', label: 'DEVELOPER',          badgeClass: 'badge-blue',   tier: 70  },
  { id: '1449539967444582412', label: 'STAFF',              badgeClass: 'badge-green',  tier: 50  },
  { id: '1450894744669655325', label: 'Server Booster',     badgeClass: 'badge-pink',   tier: 30  },
  { id: '1443339614835179672', label: 'Membros',            badgeClass: 'badge-gray',   tier: 10  },
] as const

export type DiscordRole = {
  label: string
  badgeClass: string
  tier: number
}

export const DEFAULT_ROLE: DiscordRole = { label: 'Membro', badgeClass: 'badge-gray', tier: 0 }

export async function fetchDiscordRoles(providerToken: string): Promise<string[]> {
  if (!providerToken || !GUILD_ID) return []
  try {
    const res = await fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {
      headers: { Authorization: `Bearer ${providerToken}` },
    })
    const body = await res.json()
    if (!res.ok) return []
    return body.roles || []
  } catch {
    return []
  }
}

export function resolveTopRole(roleIds: string[]): DiscordRole {
  let best: DiscordRole = DEFAULT_ROLE
  for (const def of ROLE_DEFINITIONS) {
    if (roleIds.includes(def.id) && def.tier > best.tier) best = def
  }
  return best
}

export async function detectDiscordRole(session: { user: { id: string }; provider_token?: string }): Promise<DiscordRole> {
  const storageKey = `syncx_role_${session.user.id}`

  if (session.provider_token) {
    const roleIds = await fetchDiscordRoles(session.provider_token)
    if (roleIds.length > 0) {
      const role = resolveTopRole(roleIds)
      try { localStorage.setItem(storageKey, JSON.stringify(role)) } catch {}
      return role
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null')
    if (saved?.label) return saved
  } catch {}

  return DEFAULT_ROLE
}
