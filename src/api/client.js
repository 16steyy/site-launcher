export const DEFAULT_API_BASE_URL = "https://api.16-launcher.ru";

export const ACCESS_TOKEN_KEY = "site16:access_token_v1";
export const REFRESH_TOKEN_KEY = "site16:refresh_token_v1";
export const AUTH_CHANGED_EVENT = "site16:auth-changed";

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status ?? 0;
    this.code = code ?? "";
    this.details = details ?? null;
  }
}

export function getApiBaseUrl() {
  const override = import.meta.env.VITE_API_BASE_URL;
  if (override && String(override).trim()) {
    return String(override).trim().replace(/\/+$/, "");
  }
  return DEFAULT_API_BASE_URL;
}

export function getStoredAccessToken() {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function getStoredRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function persistApiSession({ accessToken, refreshToken }) {
  try {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
  } catch {
  }
}

export function clearApiSession() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
  } catch {
  }
}

function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getAccessTokenExpiryMs(token) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}

export async function apiFetch(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, options);
  return response;
}

async function parseErrorBody(response) {
  const contentType = response.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      return await response.json();
    }
    const text = await response.text();
    return text ? { message: text } : null;
  } catch {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const { accessToken, skipAuth, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});

  if (!skipAuth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await apiFetch(path, {
    ...fetchOptions,
    headers,
  });

  if (response.ok) {
    const contentType = response.headers.get("content-type") || "";
    if (response.status === 204) return null;
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  }

  const body = await parseErrorBody(response);
  const message =
    body?.message ||
    body?.error ||
    body?.detail ||
    `Request failed (${response.status})`;

  throw new ApiError(message, {
    status: response.status,
    code: body?.code || body?.error || "",
    details: body,
  });
}
