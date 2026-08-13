import {
  apiRequest,
  clearApiSession,
  getAccessTokenExpiryMs,
  getStoredAccessToken,
  getStoredRefreshToken,
  persistApiSession,
} from "./client.js";

const REFRESH_MARGIN_MS = 60_000;

let refreshInFlight = null;

export async function loginAccount({ login, password }) {
  return apiRequest("/auth/login", {
    method: "POST",
    skipAuth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
}

export async function registerAccount({
  nickname,
  email,
  password,
  verification_code,
}) {
  const payload = { nickname, email, password };
  if (verification_code) {
    payload.verification_code = verification_code;
  }
  return apiRequest("/auth/register", {
    method: "POST",
    skipAuth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function refreshSession(refreshToken) {
  return apiRequest("/auth/refresh", {
    method: "POST",
    skipAuth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function logoutAccount(accessToken) {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
      accessToken,
    });
  } catch {
  }
  clearApiSession();
}

export async function fetchMe(accessToken) {
  return apiRequest("/me", { accessToken });
}

export async function loginAndPersist(credentials) {
  const data = await loginAccount(credentials);
  persistApiSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });
  return data;
}

export async function registerAndPersist(payload) {
  const data = await registerAccount(payload);
  persistApiSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });
  return data;
}

async function refreshStoredSession() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearApiSession();
    return null;
  }

  if (!refreshInFlight) {
    refreshInFlight = refreshSession(refreshToken)
      .then((data) => {
        persistApiSession({
          accessToken: data.access_token,
          refreshToken: data.refresh_token || refreshToken,
        });
        return data.access_token;
      })
      .catch(() => {
        clearApiSession();
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

export async function ensureValidAccessToken({ force = false } = {}) {
  const accessToken = getStoredAccessToken();
  if (!accessToken) return null;

  if (!force) {
    const expiryMs = getAccessTokenExpiryMs(accessToken);
    if (expiryMs && expiryMs - Date.now() > REFRESH_MARGIN_MS) {
      return accessToken;
    }
  }

  return refreshStoredSession();
}

export function mapAuthErrorMessage(raw, mode, t) {
  const errors = t?.account?.errors || {};
  const message = String(raw || "").toLowerCase();

  if (message.includes("verification") || message.includes("code")) {
    return errors.verificationRequired || errors.generic;
  }
  if (message.includes("email")) {
    return errors.invalidEmail || errors.generic;
  }
  if (message.includes("nickname") || message.includes("username")) {
    return errors.invalidNickname || errors.generic;
  }
  if (message.includes("password")) {
    return errors.invalidPassword || errors.generic;
  }
  if (message.includes("exist") || message.includes("taken")) {
    return mode === "register" ? errors.alreadyExists : errors.invalidCredentials;
  }
  if (message.includes("invalid") || message.includes("wrong") || message.includes("401")) {
    return errors.invalidCredentials || errors.generic;
  }
  if (message.includes("rate") || message.includes("429")) {
    return errors.rateLimit || errors.generic;
  }

  return errors.generic || raw || "Error";
}
