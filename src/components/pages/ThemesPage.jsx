import { useEffect, useMemo, useState } from "react";

import { useI18n } from "../../i18n/I18nProvider";

const THEMES_CATALOG_URL = "/data/themes.json";

function ThemePreview({ theme, className = "" }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!theme.preview || imageFailed) {
    return (
      <div
        className={`flex h-full items-center justify-center bg-gradient-to-br from-accent-from/20 via-transparent to-accent-to/10 text-sm font-semibold text-fg-faint ${className}`}
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
        className="max-h-[min(800px,calc(100vh-2rem))] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-ink-1 shadow-2xl"
      >
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2
                id="theme-modal-title"
                className="text-3xl font-bold text-white"
              >
                {theme.name}
              </h2>

              <p className="mt-1 text-sm font-semibold text-fg-muted">
                {copy.author}: {theme.author || "—"}
              </p>
            </div>

            {theme.version && (
              <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-bold text-fg-muted">
                v{theme.version}
              </span>
            )}
          </div>

          {theme.description && (
            <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-fg-muted">
              {theme.description}
            </p>
          )}

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4">
            <h3 className="text-sm font-bold text-fg-muted">
              {copy.files || "Файлы темы"}
            </h3>

            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {files.map((file) => (
                <li
                  key={file}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-sm text-fg-muted"
                >
                  {file}
                </li>
              ))}
            </ul>
          </div>

          {theme.version && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4">
              <h3 className="text-sm font-bold text-fg-muted">
                {copy.versionHistory || "История версий"}
              </h3>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
                  <div>
                    <span className="font-semibold text-white">
                      v{theme.version}
                    </span>
                    {theme.changelog && (
                      <p className="mt-1 text-xs text-fg-faint">
                        {theme.changelog}
                      </p>
                    )}
                  </div>

                  <span className="text-right text-xs text-fg-faint">
                    {copy.currentVersion || "Текущая версия"}
                    {theme.updated_at ? ` · ${theme.updated_at}` : ""}
                  </span>
                </div>

                {(Array.isArray(theme.history) ? theme.history : []).map(
                  (version) => (
                    <div
                      key={`${version.version}-${version.date}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"
                    >
                      <div>
                        <span className="font-semibold text-fg-muted">
                          v{version.version}
                        </span>

                        {version.description && (
                          <p className="mt-1 text-xs text-fg-faint">
                            {version.description}
                          </p>
                        )}
                      </div>

                      <span className="whitespace-nowrap text-xs text-fg-faint">
                        {version.date}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {(theme.first_published_at || theme.published_at) && (
            <p className="mt-4 text-xs text-fg-faint">
              {copy.published || "Опубликовано"}:{" "}
              {theme.first_published_at || theme.published_at}
              {theme.updated_at &&
                theme.updated_at !==
                  (theme.first_published_at || theme.published_at) && (
                  <>
                    {" · "}
                    {copy.updated || "Обновлено"}: {theme.updated_at}
                  </>
                )}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {theme.download && (
              <a
                href={theme.download}
                download
                className="btn btn-accent"
              >
                {copy.download}
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="btn btn-soft"
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
          const raw = Array.isArray(data?.themes) ? data.themes : [];
          const byId = new Map();
          for (const theme of raw) {
            if (!theme?.id) continue;
            const prev = byId.get(theme.id);
            if (!prev) {
              byId.set(theme.id, theme);
              continue;
            }
            const prevDate = String(prev.updated_at || prev.published_at || "");
            const nextDate = String(theme.updated_at || theme.published_at || "");
            if (nextDate >= prevDate) byId.set(theme.id, theme);
          }
          setCatalog({ themes: [...byId.values()] });
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
    <main className="mx-auto w-full max-w-[1240px] px-4 pb-20 pt-12 md:px-6 md:pt-16">

      <section className="text-center">
        <h1 className="page-title">
          {copy.title}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-fg-muted">
          {copy.subtitle}
        </p>

        <a
          href="/themes/upload"
          className="btn btn-accent btn-lg mt-8"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/themes/upload");
          }}
        >
          {copy.upload}
        </a>
      </section>

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
            className="input pr-12"
          />

          {searchQuery && (
            <button
              type="button"
              aria-label={copy.clearSearch || "Очистить поиск"}
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-fg-faint transition hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </section>

      {loading && (
        <p className="mt-12 text-center text-fg-faint">
          {messages.news?.loading || "…"}
        </p>
      )}

      {!loading && themes.length === 0 && (
        <section className="panel mx-auto mt-14 max-w-xl p-8 text-center">
          <p className="text-xl font-semibold text-white/80">
            {copy.empty}
          </p>

          <p className="mt-3 text-fg-muted">{copy.emptyCta}</p>

          <a
            href="/themes/upload"
            className="btn btn-accent btn-lg mt-6"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("/themes/upload");
            }}
          >
            {copy.upload}
          </a>
        </section>
      )}

      {!loading && themes.length > 0 && filteredThemes.length === 0 && (
        <section className="panel mx-auto mt-14 max-w-xl p-8 text-center">
          <p className="text-xl font-semibold text-white/80">
            {copy.searchEmpty || "Ничего не найдено"}
          </p>

          <p className="mt-3 text-fg-muted">
            {copy.searchEmptyHint ||
              "Попробуйте изменить поисковый запрос."}
          </p>

          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="btn btn-accent btn-lg mt-6"
          >
            {copy.clearSearch || "Очистить поиск"}
          </button>
        </section>
      )}

      {!loading && filteredThemes.length > 0 && (
        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              aria-label={`${copy.open || "Открыть обзор"}: ${theme.name}`}
              className="card card-hover group flex flex-col overflow-hidden text-left"
              onClick={() => setSelectedTheme(theme)}
            >
              <div className="aspect-video w-full overflow-hidden bg-white/[0.04]">
                <ThemePreview
                  theme={theme}
                  className="transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col p-5 md:p-6">
                <h2 className="text-xl font-semibold leading-tight text-white">
                  {theme.name}
                </h2>

                <p className="mt-1 text-sm font-semibold text-fg-muted">
                  {t("themes.author", {
                    author: theme.author || "—",
                  })}
                </p>

                {theme.description && (
                  <p className="mt-3 line-clamp-3 flex-1 text-base text-fg-muted">
                    {theme.description}
                  </p>
                )}

                {theme.version && (
                  <p className="mt-3">
                    <span className="chip">v{theme.version}</span>
                  </p>
                )}

                <span className="btn btn-soft mt-5 group-hover:border-accent-to/40">
                  {copy.open || "Открыть обзор"}
                </span>
              </div>
            </button>
          ))}
        </section>
      )}

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