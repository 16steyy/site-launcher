import { getApiBaseUrl } from "../api/client.js";

export const DEFAULT_STEVE_UUID = "8667ba71-b85a-4004-af54-4577d119ef39";

export function buildInitialAvatarDataUrl(label) {
  const ch = (label.trim().charAt(0) || "?").toUpperCase();
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b2648"/>
      <stop offset="100%" stop-color="#102f55"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="32" fill="url(#g)"/>
  <text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="#d7e7ff" font-family="Inter,Segoe UI,Arial" font-size="28" font-weight="700">${ch}</text>
</svg>
`.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function userToProfile(user) {
  if (!user) return null;
  return {
    nickname: user.nickname || "",
    ely_username: user.ely_username ?? null,
    ely_uuid: user.ely_uuid ?? null,
    mc_uuid: user.mc_uuid ?? null,
  };
}

export function isOfflineProfile(profile) {
  return (
    !profile?.ely_username?.trim() &&
    !profile?.mc_uuid?.trim() &&
    !profile?.ely_uuid?.trim()
  );
}

function normalizeUuid(uuid) {
  return uuid.trim().replace(/-/g, "");
}

export function buildElySkinUrl(username) {
  return `https://skinsystem.ely.by/skins/${encodeURIComponent(username.trim())}.png`;
}

export function rawSkinUrlForUuid(uuid) {
  return `https://vzge.me/skin/${normalizeUuid(uuid)}`;
}

export function rawSkinUrlFallbackForUuid(uuid) {
  return `https://mc-heads.net/skin/${normalizeUuid(uuid)}`;
}

export const DEFAULT_SKIN_URL = rawSkinUrlForUuid(DEFAULT_STEVE_UUID);

export function avatarUrlForUuid(uuid, size = 64) {
  return `https://vzge.me/bust/${size}/${normalizeUuid(uuid)}.png`;
}

export function buildProxiedElySkinUrl(username) {
  const base = getApiBaseUrl();
  return `${base}/skins/ely/${encodeURIComponent(username.trim())}`;
}

export function buildProxiedMcSkinUrl(uuid) {
  const base = getApiBaseUrl();
  return `${base}/skins/mc/${normalizeUuid(uuid)}`;
}

function defaultSkinCandidates() {
  return [
    rawSkinUrlForUuid(DEFAULT_STEVE_UUID),
    rawSkinUrlFallbackForUuid(DEFAULT_STEVE_UUID),
  ];
}

export function resolveSkinUrl(profile) {
  return resolveSkinUrlCandidates(profile)[0] ?? DEFAULT_SKIN_URL;
}

export function resolveSkinUrlCandidates(profile) {
  if (!profile || isOfflineProfile(profile)) {
    return defaultSkinCandidates();
  }

  const candidates = [];

  const elyUsername = profile.ely_username?.trim();
  if (elyUsername) {
    candidates.push(buildProxiedElySkinUrl(elyUsername));
    candidates.push(buildElySkinUrl(elyUsername));
  }

  const mcUuid = profile.mc_uuid?.trim();
  if (mcUuid) {
    candidates.push(buildProxiedMcSkinUrl(mcUuid));
    candidates.push(rawSkinUrlForUuid(mcUuid));
    candidates.push(rawSkinUrlFallbackForUuid(mcUuid));
  }

  const elyUuid = profile.ely_uuid?.trim();
  if (elyUuid) {
    candidates.push(buildProxiedMcSkinUrl(elyUuid));
    candidates.push(rawSkinUrlForUuid(elyUuid));
    candidates.push(rawSkinUrlFallbackForUuid(elyUuid));
  }

  for (const url of defaultSkinCandidates()) {
    if (!candidates.includes(url)) {
      candidates.push(url);
    }
  }

  return candidates;
}

export async function fetchSkinObjectUrl(url) {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Skin request failed: ${response.status}`);
  }
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  try {
    const { width, height } = bitmap;
    if (width !== height && width !== 2 * height) {
      throw new Error(`Bad skin size: ${width}x${height}`);
    }
  } finally {
    bitmap.close();
  }
  return URL.createObjectURL(blob);
}

async function loadImageBitmap(url) {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Skin request failed: ${response.status}`);
  }
  const blob = await response.blob();
  return createImageBitmap(blob);
}

function createNearestNeighborCanvas(size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create 2D context");
  }
  ctx.imageSmoothingEnabled = false;
  return canvas;
}

export async function buildAvatarFromSkin(skinUrl, size = 64) {
  const bitmap = await loadImageBitmap(skinUrl);
  try {
    if (bitmap.width < 64 || bitmap.height < 16) {
      throw new Error(`Unexpected skin size ${bitmap.width}x${bitmap.height}`);
    }

    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = 8;
    sourceCanvas.height = 8;
    const sourceCtx = sourceCanvas.getContext("2d");
    if (!sourceCtx) {
      throw new Error("Failed to create source canvas context");
    }
    sourceCtx.imageSmoothingEnabled = false;
    sourceCtx.clearRect(0, 0, 8, 8);
    sourceCtx.drawImage(bitmap, 8, 8, 8, 8, 0, 0, 8, 8);
    sourceCtx.drawImage(bitmap, 40, 8, 8, 8, 0, 0, 8, 8);

    const outCanvas = createNearestNeighborCanvas(size);
    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) {
      throw new Error("Failed to create output canvas context");
    }
    outCtx.drawImage(sourceCanvas, 0, 0, 8, 8, 0, 0, size, size);
    return outCanvas.toDataURL("image/png");
  } finally {
    bitmap.close();
  }
}

export async function getAvatarSrc(profile, fallbackSrc, size = 64) {
  if (!profile || isOfflineProfile(profile)) {
    return avatarUrlForUuid(DEFAULT_STEVE_UUID, size);
  }

  const mcUuid = profile.mc_uuid?.trim();
  if (mcUuid) {
    return avatarUrlForUuid(mcUuid, size);
  }

  const elyUuid = profile.ely_uuid?.trim();
  if (elyUuid) {
    return avatarUrlForUuid(elyUuid, size);
  }

  const elyUsername = profile.ely_username?.trim();
  if (elyUsername) {
    try {
      return await buildAvatarFromSkin(buildProxiedElySkinUrl(elyUsername), size);
    } catch {
      try {
        return await buildAvatarFromSkin(buildElySkinUrl(elyUsername), size);
      } catch {
        return fallbackSrc;
      }
    }
  }

  return fallbackSrc;
}
