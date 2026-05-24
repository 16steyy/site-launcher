export const STORAGE_KEY = "16launcher-locale";

export const SUPPORTED_LOCALES = ["ru", "en", "zh", "de", "es"];

export const DEFAULT_LOCALE = "en";

export const LOCALE_LABELS = {
  ru: "Русский",
  en: "English",
  zh: "中文",
  de: "Deutsch",
  es: "Español",
};

const LOCALE_ALIASES = {
  ru: "ru",
  en: "en",
  zh: "zh",
  "zh-cn": "zh",
  "zh-tw": "zh",
  "zh-hk": "zh",
  "zh-sg": "zh",
  de: "de",
  es: "es",
  "es-es": "es",
  "es-mx": "es",
  "es-ar": "es",
};

function normalizeLanguageTag(tag) {
  return (tag || "").toLowerCase().replace(/_/g, "-");
}

function resolveLocale(tag) {
  const normalized = normalizeLanguageTag(tag);
  if (!normalized) return null;
  if (LOCALE_ALIASES[normalized]) return LOCALE_ALIASES[normalized];
  const base = normalized.split("-")[0];
  return LOCALE_ALIASES[base] || null;
}

export function detectSystemLocale() {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;

  const candidates = [
    ...(navigator.languages || []),
    navigator.language,
  ].filter(Boolean);

  for (const tag of candidates) {
    const resolved = resolveLocale(tag);
    if (resolved) return resolved;
  }

  return DEFAULT_LOCALE;
}

export function getInitialLocale() {
  if (typeof localStorage === "undefined") return detectSystemLocale();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;
  } catch {
    /* ignore */
  }

  return detectSystemLocale();
}
