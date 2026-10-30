import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import de from "../locales/de.json";
import en from "../locales/en.json";
import es from "../locales/es.json";
import ru from "../locales/ru.json";
import zh from "../locales/zh.json";
import {
  DEFAULT_LOCALE,
  getInitialLocale,
  getLocaleFromPath,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  saveLocale,
} from "./config";
import {
  changeLocation,
  LOCATION_CHANGE_EVENT,
  localizePath,
  splitLocalePath,
} from "../routing";

const MESSAGES = { ru, en, zh, de, es };

const I18nContext = createContext(null);

export function ensureLocalizedLocation() {
  const url = new URL(window.location.href);
  const hasLegacyParam = url.searchParams.has("lang");
  if (getLocaleFromPath(url.pathname) && !hasLegacyParam) return;

  const locale = getInitialLocale();
  const { path } = splitLocalePath(url.pathname);
  url.searchParams.delete("lang");
  window.history.replaceState(
    window.history.state,
    "",
    localizePath(`${path}${url.search}${url.hash}`, locale)
  );
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);

  const messages = MESSAGES[locale] || MESSAGES[DEFAULT_LOCALE];

  const setLocale = useCallback((nextLocale) => {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) return;
    saveLocale(nextLocale);
    const { path } = splitLocalePath(window.location.pathname);
    changeLocation(
      localizePath(`${path}${window.location.search}${window.location.hash}`, nextLocale)
    );
  }, []);

  useEffect(() => {
    function syncFromLocation() {
      const fromPath = getLocaleFromPath(window.location.pathname);
      if (fromPath) setLocaleState(fromPath);
    }
    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener(LOCATION_CHANGE_EVENT, syncFromLocation);
    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener(LOCATION_CHANGE_EVENT, syncFromLocation);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const localePath = useCallback((path) => localizePath(path, locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      messages,
      setLocale,
      localePath,
      locales: SUPPORTED_LOCALES,
      localeLabels: LOCALE_LABELS,
      t: (key, params) => {
        const parts = key.split(".");
        let node = messages;
        for (const part of parts) {
          node = node?.[part];
          if (node === undefined) return key;
        }
        if (typeof node !== "string") return key;
        if (!params) return node;
        return node.replace(/\{\{(\w+)\}\}/g, (_, name) =>
          params[name] !== undefined ? String(params[name]) : `{{${name}}}`
        );
      },
    }),
    [locale, messages, setLocale, localePath]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
