import { ApiError, apiRequest, getApiBaseUrl } from "./client.js";

export const THEMES_CATALOG_URL = "/data/themes.json";

export async function fetchThemesCatalog() {
  const response = await fetch(THEMES_CATALOG_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("catalog_load_failed");
  const data = await response.json();
  return Array.isArray(data?.themes) ? data.themes : [];
}

export async function fetchMySubmissions(accessToken) {
  try {
    const data = await apiRequest("/themes/my-submissions", { accessToken });
    if (Array.isArray(data?.submissions)) return data.submissions;
    if (Array.isArray(data)) return data;
    return [];
  } catch (error) {
    if (error?.status === 404 || error?.status === 501) return [];
    return [];
  }
}

export const THEME_MAX_ZIP_BYTES = 15 * 1024 * 1024;

export async function submitTheme({ name, file, accessToken }) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/themes/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const contentType = response.headers.get("content-type") || "";
  let body = null;
  if (contentType.includes("application/json")) {
    body = await response.json();
  } else {
    const text = await response.text();
    body = text ? { message: text } : null;
  }

  if (!response.ok) {
    throw new ApiError(body?.message || body?.error || "Submit failed", {
      status: response.status,
      code: body?.code || "",
      details: body,
    });
  }

  return body;
}

export function mapThemeSubmitError(error, t) {
  const errors = t?.themes?.errors || {};
  const status = error?.status || 0;
  const message = String(error?.message || "").toLowerCase();

  if (status === 413 || message.includes("large") || message.includes("size")) {
    return errors.tooLarge;
  }
  if (status === 409 || message.includes("duplicate") || message.includes("moderation")) {
    return errors.duplicate;
  }
  if (status === 429 || message.includes("rate")) {
    return errors.rateLimit;
  }
  if (status === 400 || message.includes("theme.json") || message.includes("style.css") || message.includes("zip")) {
    return errors.invalidZip;
  }

  return errors.generic;
}
