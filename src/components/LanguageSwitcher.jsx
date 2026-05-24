import { useEffect, useRef, useState } from "react";

import languageIcon from "../../assets/language.svg";
import { useI18n } from "../i18n/I18nProvider";

const LOCALE_CODES = {
  ru: "RU",
  en: "EN",
  zh: "ZH",
  de: "DE",
  es: "ES",
};

export default function LanguageSwitcher() {
  const { locale, setLocale, locales, localeLabels, messages } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`language-switcher relative ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="language-switcher-trigger interactive-row"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={messages.language?.label}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="language-switcher-icon-wrap">
          <img src={languageIcon} alt="" className="language-switcher-icon" />
        </span>
        <span className="language-switcher-label hidden sm:inline">
          {localeLabels[locale]}
        </span>
        <svg
          className="language-switcher-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        className="language-switcher-menu"
        role="listbox"
        aria-label={messages.language?.label}
        aria-hidden={!open}
      >
        <p className="language-switcher-menu-title">{messages.language?.label}</p>
        <ul className="language-switcher-list">
          {locales.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`language-switcher-option ${active ? "is-active" : ""}`}
                  onClick={() => {
                    setLocale(code);
                    setOpen(false);
                  }}
                >
                  <span className="language-switcher-code">{LOCALE_CODES[code]}</span>
                  <span className="language-switcher-option-label">{localeLabels[code]}</span>
                  {active && (
                    <svg
                      className="language-switcher-check"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
