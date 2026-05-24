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
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  STORAGE_KEY,
} from "./config";

const MESSAGES = { ru, en, zh, de, es };

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);

  const messages = MESSAGES[locale] || MESSAGES[DEFAULT_LOCALE];

  const setLocale = useCallback((nextLocale) => {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) return;
    setLocaleState(nextLocale);
    try {
      localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;

    const title = messages.meta?.title;
    const description = messages.meta?.description;
    if (title) document.title = title;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
    }
  }, [locale, messages]);

  const value = useMemo(
    () => ({
      locale,
      messages,
      setLocale,
      locales: SUPPORTED_LOCALES,
      localeLabels: LOCALE_LABELS,
      t: (key) => {
        const parts = key.split(".");
        let node = messages;
        for (const part of parts) {
          node = node?.[part];
          if (node === undefined) return key;
        }
        return node;
      },
    }),
    [locale, messages, setLocale]
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
