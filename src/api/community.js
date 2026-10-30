export const DISCORD_INVITE_CODE = "55Y95EfsHM";
export const DISCORD_INVITE_URL = `https://discord.gg/${DISCORD_INVITE_CODE}`;
export const TELEGRAM_URL = "https://t.me/of16launcher";
export const GITHUB_ORG_URL = "https://github.com/launcherdev11";
export const GITHUB_REPO_URL = "https://github.com/launcherdev11/rust-launcher";
export const BOOSTY_URL = "https://boosty.to/16steyy";

const DISCORD_INVITE_API = `https://discord.com/api/v10/invites/${DISCORD_INVITE_CODE}?with_counts=true`;

export async function fetchDiscordCounts({ signal } = {}) {
  const response = await fetch(DISCORD_INVITE_API, { signal });
  if (!response.ok) throw new Error("discord_invite_unavailable");
  const data = await response.json();
  return {
    members: Number(data?.approximate_member_count) || 0,
    online: Number(data?.approximate_presence_count) || 0,
  };
}
