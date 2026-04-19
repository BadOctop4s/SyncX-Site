export const CONFIG = {
  discord:  process.env.NEXT_PUBLIC_DISCORD_INVITE!,
  github:   process.env.NEXT_PUBLIC_GITHUB_ORG!,
  zerohour: process.env.NEXT_PUBLIC_ZEROHOUR_DOWNLOAD!,
  loadstring: process.env.NEXT_PUBLIC_ROYALHUB_LOADSTRING!,
} as const
