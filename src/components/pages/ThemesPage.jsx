import { useEffect, useMemo, useState } from "react";

import SiteHeader from "../SiteHeader";
import { useI18n } from "../../i18n/I18nProvider";

const THEMES_CATALOG_URL = "/data/themes.json";

function ThemePreview({ theme, className = "" }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!theme.preview || imageFailed) {
    return (
      <div
        className={`flex h-full items-center justify-center bg-gradient-to-br from-indigo-500/15 via-transparent to-violet-500/15 text-sm font-semibold text-white/35 ${className}`}
      >
        16Launcher
      </div>
    );
  }

  return (
    <img
      src={theme.preview}
      alt={`Баннер темы ${theme.name}`}
      loading="lazy"
      className={`h-full w-full object-cover ${className}`}
      onError={() => setImageFailed(true)}
    />
  );
}

function ThemeModal({ theme, copy, onClose }) {
  const files =
    Array.isArray(theme.files) && theme.files.length > 0
      ? theme.files
      : ["theme.json", "style.css", "download.zip"];

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
        className="max-h-[min(800px,calc(100vh-2rem))] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-[#15182d] shadow-2xl"
      >
        {/* Баннер в модальном окне */}
        <div className="relative aspect-video w-full overflow-hidden bg-white/[0.04]">
          <ThemePreview theme={theme} />

          <button
            type="button"
            aria-label={copy.close || "Закрыть"}
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-2xl text-white transition hover:bg-black/70"
          >
            ×
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* Заголовок и основная информация */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2
                id="theme-modal-title"
                className="text-3xl font-extrabold text-white"
              >
                {theme.name}
              </h2>

              <p className="mt-1 text-sm font-semibold text-white/55">
                {copy.author || "Автор"}: {theme.author || "—"}
              </p>
            </div>

            {theme.version && (
              <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/60">
                v{theme.version}
              </span>
            )}
          </div>

          {/* Описание */}
          {theme.description && (
            <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-white/70">
              {theme.description}
            </p>
          )}

          {/* Список файлов */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/60">
              {copy.files || "Файлы темы"}
            </h3>

            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {files.map((file) => (
                <li
                  key={file}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-sm text-white/75"
                >
                  {file}
                </li>
              ))}
            </ul>
          </div>

          {/* История версий */}
          {Array.isArray(theme.history) && theme.history.length > 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/60">
                {copy.versionHistory || "История версий"}
              </h3>

              <div className="mt-3 space-y-2">
                {/* Текущая версия */}
                <div className="flex items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
                  <span className="font-semibold text-white">
                    v{theme.version}
                  </span>

                  <span className="text-right text-xs text-white/50">
                    {copy.currentVersion || "Текущая версия"}
                  </span>
                </div>

                {/* Предыдущие версии */}
                {theme.history.map((version) => (
                  <div
                    key={`${version.version}-${version.date}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"
                  >
                    <div>
                      <span className="font-semibold text-white/75">
                        v{version.version}
                      </span>

                      {version.description && (
                        <p className="mt-1 text-xs text-white/40">
                          {version.description}
                        </p>
                      )}
                    </div>

                    <span className="whitespace-nowrap text-xs text-white/40">
                      {version.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Дата публикации */}
          {theme.published_at && (
            <p className="mt-4 text-xs text-white/40">
              {copy.published || "Опубликовано"}: {theme.published_at}
            </p>
          )}

          {/* Кнопки */}
          <div className="mt-6 flex flex-wrap gap-3">
            {theme.download && (
              <a
                href={theme.download}
                download
                className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
              >
                {copy.download}
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white/80 transition hover:text-white"
            >
              {copy.close || "Закрыть"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ThemesPage({ onNavigate, path, user }) {
  const { messages, t } = useI18n();
  const copy = messages.themes || {};

  const [catalog, setCatalog] = useState({ themes: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setLoading(true);

      try {
        const response = await fetch(THEMES_CATALOG_URL, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("catalog_load_failed");
        }

        const data = await response.json();

        if (!cancelled) {
          setCatalog({
            themes: Array.isArray(data?.themes) ? data.themes : [],
          });
        }
      } catch {
        if (!cancelled) {
          setCatalog({ themes: [] });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  const themes = catalog.themes || [];

  const filteredThemes = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    if (!query) {
      return themes;
    }

    return themes.filter((theme) => {
      const searchableText = [
        theme.name,
        theme.author,
        theme.description,
        theme.version,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      return searchableText.includes(query);
    });
  }, [themes, searchQuery]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1240px] px-4 pb-20 pt-10 md:px-6">
      <SiteHeader path={path} onNavigate={onNavigate} user={user} />

      {/* Заголовок страницы */}
      <section className="text-center">
        <h1 className="hero-title text-5xl font-extrabold tracking-tight md:text-7xl">
          {copy.title}
        </h1>

        <p className="mx-auto mt-4 max-w-3xl text-lg text-white/70 md:text-2xl">
          {copy.subtitle}
        </p>

        <a
          href="/themes/upload"
          className="mt-8 inline-flex rounded-xl bg-accent px-6 py-3 text-base font-bold text-white transition hover:brightness-110"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/themes/upload");
          }}
        >
          {copy.upload}
        </a>
      </section>

      {/* Поиск */}
      <section className="mx-auto mt-10 max-w-3xl">
        <label htmlFor="theme-search" className="sr-only">
          {copy.searchPlaceholder || "Поиск тем"}
        </label>

        <div className="relative">
          <input
            id="theme-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={
              copy.searchPlaceholder ||
              "Поиск тем по названию, автору или описанию"
            }
            className="w-full rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-4 pr-12 text-base text-white outline-none placeholder:text-white/40 transition focus:border-accent focus:ring-2 focus:ring-accent/40"
          />

          {searchQuery && (
            <button
              type="button"
              aria-label={copy.clearSearch || "Очистить поиск"}
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-white/50 transition hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </section>

      {/* Загрузка каталога */}
      {loading && (
        <p className="mt-12 text-center text-white/50">
          {messages.news?.loading || "…"}
        </p>
      )}

      {/* В каталоге нет тем */}
      {!loading && themes.length === 0 && (
        <section className="mx-auto mt-14 max-w-xl rounded-3xl border border-white/15 bg-white/[0.04] p-8 text-center">
          <p className="text-xl font-semibold text-white/80">
            {copy.empty}
          </p>

          <p className="mt-3 text-white/60">{copy.emptyCta}</p>

          <a
            href="/themes/upload"
            className="mt-6 inline-flex rounded-xl bg-accent px-5 py-3 text-base font-bold text-white transition hover:brightness-110"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("/themes/upload");
            }}
          >
            {copy.upload}
          </a>
        </section>
      )}

      {/* Поиск не дал результатов */}
      {!loading && themes.length > 0 && filteredThemes.length === 0 && (
        <section className="mx-auto mt-14 max-w-xl rounded-3xl border border-white/15 bg-white/[0.04] p-8 text-center">
          <p className="text-xl font-semibold text-white/80">
            {copy.searchEmpty || "Ничего не найдено"}
          </p>

          <p className="mt-3 text-white/60">
            {copy.searchEmptyHint ||
              "Попробуйте изменить поисковый запрос."}
          </p>

          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-6 inline-flex rounded-xl bg-accent px-5 py-3 text-base font-bold text-white transition hover:brightness-110"
          >
            {copy.clearSearch || "Очистить поиск"}
          </button>
        </section>
      )}

      {/* Карточки тем */}
      {!loading && filteredThemes.length > 0 && (
        <section className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              aria-label={`${copy.open || "Открыть обзор"}: ${theme.name}`}
              className="glass group flex flex-col overflow-hidden rounded-3xl border border-white/10 text-left transition hover:-translate-y-1 hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/60"
              onClick={() => setSelectedTheme(theme)}
            >
              {/* Баннер */}
              <div className="aspect-video w-full overflow-hidden bg-white/[0.04]">
                <ThemePreview
                  theme={theme}
                  className="transition duration-500 group-hover:scale-105"
                />
              </div>

              {/* Информация */}
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <h2 className="text-2xl font-extrabold leading-tight">
                  {theme.name}
                </h2>

                <p className="mt-1 text-sm font-semibold text-white/55">
                  {t("themes.author", {
                    author: theme.author || "—",
                  })}
                </p>

                {theme.description && (
                  <p className="mt-3 line-clamp-3 flex-1 text-base text-white/70">
                    {theme.description}
                  </p>
                )}

                {theme.version && (
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                    v{theme.version}
                  </p>
                )}

                <span className="mt-5 inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition group-hover:brightness-110">
                  {copy.open || "Открыть обзор"}
                </span>
              </div>
            </button>
          ))}
        </section>
      )}

      {/* Модальное окно */}
      {selectedTheme && (
        <ThemeModal
          theme={selectedTheme}
          copy={copy}
          onClose={() => setSelectedTheme(null)}
        />
      )}
    </main>
  );
}