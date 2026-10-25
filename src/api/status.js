import { getApiBaseUrl } from "./client.js";
import { getReleaseMirrorBase } from "./releases.js";

const PROBE_TIMEOUT_MS = 8000;
export const SLOW_RESPONSE_MS = 2000;

const NEWS_INDEX_URL =
  "https://cdn.jsdelivr.net/gh/16steyy/16Launcher-Site-News@main/news/index.json";

export const STATUS = {
  ok: "operational",
  slow: "degraded",
  down: "down",
  off: "disabled",
  pending: "checking",
};

function withCacheBust(url) {
  const divider = url.includes("?") ? "&" : "?";
  return `${url}${divider}_=${Date.now()}`;
}

async function readJson(response) {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function probe(url, { verify } = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  const startedAt = performance.now();

  try {
    const response = await fetch(withCacheBust(url), {
      cache: "no-store",
      signal: controller.signal,
    });
    const latency = Math.round(performance.now() - startedAt);
    const body = await readJson(response);

    if (!response.ok) {
      return { status: STATUS.down, latency, code: response.status, error: `HTTP ${response.status}` };
    }

    const verdict = verify ? verify(body) : null;
    if (verdict) return { latency, code: response.status, ...verdict };

    return {
      status: latency > SLOW_RESPONSE_MS ? STATUS.slow : STATUS.ok,
      latency,
      code: response.status,
    };
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    return {
      status: STATUS.down,
      latency: timedOut ? PROBE_TIMEOUT_MS : null,
      code: 0,
      error: timedOut ? "timeout" : "network",
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function hostOf(url) {
  try {
    return new URL(url, window.location.origin).host;
  } catch {
    return "";
  }
}

export function getStatusServices() {
  const api = getApiBaseUrl();
  const mirror = getReleaseMirrorBase();

  const services = [
    {
      id: "api",
      group: "launcher",
      url: `${api}/health`,
      verify: (body) =>
        body && body.status !== "ok" ? { status: STATUS.down, error: "unhealthy" } : null,
    },
    { id: "auth", group: "launcher", url: `${api}/auth/email/status` },
    {
      id: "discord",
      group: "launcher",
      url: `${api}/auth/discord/status`,
      verify: (body) => (body && body.enabled === false ? { status: STATUS.off } : null),
    },
    { id: "site", group: "web", url: "/github-release.json" },
    { id: "themes", group: "web", url: "/data/themes.json" },
    { id: "news", group: "web", url: NEWS_INDEX_URL },
  ];

  if (mirror) {
    services.splice(3, 0, { id: "downloads", group: "web", url: `${mirror}/latest.json` });
  }

  return services.map((service) => ({ ...service, host: hostOf(service.url) }));
}

export function checkService(service) {
  return probe(service.url, { verify: service.verify });
}

const SERVER_STATUS_ALIASES = {
  ok: STATUS.ok,
  up: STATUS.ok,
  operational: STATUS.ok,
  healthy: STATUS.ok,
  degraded: STATUS.slow,
  slow: STATUS.slow,
  partial: STATUS.slow,
  down: STATUS.down,
  error: STATUS.down,
  fail: STATUS.down,
  outage: STATUS.down,
  disabled: STATUS.off,
  off: STATUS.off,
};

export async function fetchServerStatus() {
  const url = `${getApiBaseUrl()}/status`;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const response = await fetch(withCacheBust(url), {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const body = await readJson(response);
    const source = body?.services;
    if (!source || typeof source !== "object") return null;

    const entries = Array.isArray(source)
      ? source.map((item) => [item?.id, item])
      : Object.entries(source);

    return entries
      .filter(([id]) => typeof id === "string" && id)
      .map(([id, item]) => {
        const raw = String(item?.status ?? item ?? "").toLowerCase();
        const latency = Number(item?.latency_ms ?? item?.latency);
        return {
          id,
          status: SERVER_STATUS_ALIASES[raw] || STATUS.down,
          latency: Number.isFinite(latency) ? Math.round(latency) : null,
          error: item?.error || item?.message || "",
        };
      });
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function summarizeStatuses(statuses) {
  const relevant = statuses.filter((status) => status !== STATUS.off && status !== STATUS.pending);
  if (statuses.some((status) => status === STATUS.pending) && !relevant.length) {
    return STATUS.pending;
  }
  const down = relevant.filter((status) => status === STATUS.down).length;
  if (down && down >= Math.ceil(relevant.length / 2)) return "major";
  if (down || relevant.includes(STATUS.slow)) return STATUS.slow;
  return STATUS.ok;
}
