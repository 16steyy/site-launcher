import { useEffect, useState } from "react";

import SiteHeader from "../SiteHeader";
import { useI18n } from "../../i18n/I18nProvider";

const THEMES_CATALOG_URL = "/data/themes.json";

export default function ThemesPage({ onNavigate, path, user }) {
  const { messages, t } = useI18n();
  const copy = messages.themes || {};
  const [catalog, setCatalog] = useState({ themes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setLoading(true);
      try {
        const response = await fetch(THEMES_CATALOG_URL, { cache: "no-store" });
        if (!response.ok) throw new Error("catalog_load_failed");
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
        if (!cancelled) setLoading(false);
      }
    }

    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  const themes = catalog.themes || [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1240px] px-4 pb-20 pt-10 md:px-6">
      <SiteHeader path={path} onNavigate={onNavigate} user={user} />

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

      {loading && (
        <p className="mt-12 text-center text-white/50">{messages.news?.loading || "…"}</p>
      )}

      {!loading && themes.length === 0 && (
        <section className="mx-auto mt-14 max-w-xl rounded-3xl border border-white/15 bg-white/[0.04] p-8 text-center">
          <p className="text-xl font-semibold text-white/80">{copy.empty}</p>
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

      {!loading && themes.length > 0 && (
        <section className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <article
              key={theme.id}
              className="glass flex flex-col overflow-hidden rounded-3xl border border-white/10"
            >
              <div className="aspect-video w-full bg-white/[0.04]">
                {theme.preview ? (
                  <img
                    src={theme.preview}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-semibold text-white/35">
                    16Launcher
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <h2 className="text-2xl font-extrabold leading-tight">{theme.name}</h2>
                <p className="mt-1 text-sm font-semibold text-white/55">
                  {t("themes.author", { author: theme.author })}
                </p>
                {theme.description && (
                  <p className="mt-3 flex-1 text-base text-white/70">{theme.description}</p>
                )}
                {theme.version && (
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                    v{theme.version}
                  </p>
                )}
                {theme.download && (
                  <a
                    href={theme.download}
                    download
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
                  >
                    {copy.download}
                  </a>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
