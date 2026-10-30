# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # uses package-lock.json (CI uses npm ci on Node 20)
npm run dev          # Vite dev server
npm run build        # prebuild (fetch GitHub release meta + sitemap) → vite build → dist/
npm run preview      # serve dist/ locally
npm run generate:sitemap
npm run generate:rss
npm run fetch:github-release
```

- There is no test runner, and no lint script. The ESLint config lives only in `_tmp/` (gitignored) and ESLint is not a dependency, so there is nothing to run for lint or tests. Verify changes with `npm run build` and in the browser via `npm run dev`.
- `npm run build` runs `prebuild` first (GitHub release meta, sitemap, RSS), which calls the GitHub API. Set `GH_STATS_TOKEN` or `GITHUB_TOKEN` if you hit rate limits. The script falls back gracefully if the API call fails.
- Env vars go in `.env.local` (see `.env.example`): `VITE_API_BASE_URL` (defaults to `https://api.16-launcher.ru`), `VITE_DOWNLOAD_MIRROR_BASE`, `VITE_NEWS_ADMIN_NICKNAMES`.
- Do not edit `dist/`. It is build output and is gitignored. Edit `public/` for static assets and `src/` for everything else.

## Architecture

**Not a router-based app.** It is a single Vite + React 19 SPA with no router library. `src/routing.js` maps a locale-less path to a route kind string, and `src/App.jsx` switches on it. Adding a page means updating `getRouteKind` and `STATIC_ROUTES` in `routing.js`, `App.jsx`, `src/seo/seoConfig.js`, and adding a page under `src/components/pages/` (lazy-loaded in `App.jsx`).

**URLs carry the locale: `/<locale>/<route>/`** (trailing slash, see below). `ensureLocalizedLocation()` in `src/i18n/I18nProvider.jsx` rewrites unprefixed and legacy `?lang=` URLs before the first render. Components and `onNavigate()` work with locale-less paths (`"/news"`); `App` adds the prefix. For `href` attributes use `localePath()` from `useI18n()`. Switching language (`setLocale`) navigates to the same page under the new prefix.

**Deployed to GitHub Pages at the root domain.** There is no server-side fallback, and a directory index only answers 200 with a trailing slash (otherwise 301). The `prerender-pages` plugin in `vite.config.js` runs `scripts/prerender-pages.js` after the build: it writes `<locale>/<route>/index.html` for every `STATIC_ROUTES` entry and news post, unprefixed legacy copies (Russian head, canonical to `/ru/`), and `404.html`. Each file gets its own `<head>` (title, description, canonical, hreflang, OG, JSON-LD) from `buildSeoConfig`, which replaces the `<!-- seo:start -->…<!-- seo:end -->` block in `index.html`. Keep that block intact.

**Status page** (`/status`) probes services from the browser (`src/api/status.js`, polled by `src/hooks/useServiceStatus.js`). The API's `GET /status` (format in `fetchServerStatus`) reports Postgres, Redis and TURN: database/Redis failures are folded into the API and sign-in rows, TURN is shown as "multiplayer" (`useServiceStatus.js`). CORS for the API is set in nginx on the VPS and allows `http://localhost:5173`, so run the dev server on the default port when testing API calls.

**Content comes from three places:**
- Static bundled content: `src/content/documentation/*.md`, `src/content/privacy/*.md` (one file per locale), `src/content/documentation.js` and `privacy.js` which wire them up.
- Remote news: `src/App.jsx` fetches the index and posts from the `16Launcher-Site-News` GitHub repo via jsDelivr/raw, refreshing every minute. `src/content/news.json` is only the empty fallback.
- Discord: `src/api/community.js` reads member/online counts from the public invite endpoint (CORS-enabled) for the home page community block.
- Backend API (`src/api/*.js`, base URL from `VITE_API_BASE_URL`): auth, release mirror, theme submission, news admin. `src/api/client.js` has the shared `apiRequest` wrapper and throws `ApiError`.

**Auth** is JWT access and refresh tokens stored in `localStorage` under `site16:*` keys. `src/api/client.js` owns storage and dispatches `AUTH_CHANGED_EVENT`. `src/hooks/useAuth.js` is the consumer hook. Admin status comes from the API (`is_admin` / `role` / `roles`), with `VITE_NEWS_ADMIN_NICKNAMES` as a build-time fallback allowlist (`src/lib/newsAdmin.js`).

**i18n** is a custom provider (`src/i18n/I18nProvider.jsx`), not a library. Five locales (`ru`, `en`, `zh`, `de`, `es`) live in `src/locales/*.json`. `t("a.b.c")` does dotted lookup and falls back to the key. The active locale comes from the URL prefix; an explicit switch is also saved to `localStorage` and used to pick the prefix for unprefixed URLs (`src/i18n/config.js`). Anything user-visible needs a key in all five JSON files.

**Theme store.** Published themes are static files under `public/themes/<id>/` (`theme.json`, `style.css`, `download.zip`, optional `preview.png` and assets). The catalog is `public/data/themes.json`, read at runtime by `src/api/themes.js`. To publish a theme, add its folder and run:

```bash
node scripts/update-themes-json.js --id <id> --meta public/themes/<id>/theme.json
```

The script rebuilds that entry, keeps version `history`, and re-sorts the catalog. User uploads go to the API, which opens a PR against the private `theme-submissions` repo (spec in `docs/THEMES_API_SETUP.md`; template in `templates/theme-submissions/`).

**Build-time generated files.** `prebuild` writes `public/github-release.json` (release links, download counts), `public/sitemap.xml` (one entry per locale with hreflang) and `public/rss.xml` (news feed, links to `/ru/`). They are committed in `public/` as well, so treat them as generated rather than hand-edited. `scripts/lib/news.js` is the shared news loader for these scripts.

**Styling.** Tailwind 3 with `src/index.css` for global tokens. The palette mirrors the launcher (`mc16launcher/src/index.css`): `--ink-0…4` surfaces, `--seam` borders, accent gradient `--accent-from` `#582ec0` → `--accent-to` `#975ade`, font Onest (`@fontsource-variable/onest`), icons are inline SVGs in lucide style (`lucide-react` is not a dependency). The same tokens exist as Tailwind colors (`ink-*`, `accent`, `fg-*`). Reusable classes (`btn`, `card`, `panel`, `chip`, `seg`, `input`) live in `@layer components`. The home page borrows Minecraft UI idioms (title-screen splash, hotbar, item tooltip, advancement toast) — keep that direction instead of generic landing-page sections.

**SEO.** `src/seo/seoConfig.js` (`buildSeoConfig`), `urls.js` and `jsonLd.js` are plain JS shared by the browser (`AppSeo` → `applyPageSeo`) and the Node build scripts, so keep them free of JSX, DOM access and extensionless imports. `x-default` hreflang points at `/en/`. `SITE_URL` in `src/seo/config.js` is the production origin.

**Analytics.** Yandex Metrika is initialised in `index.html`; SPA transitions are sent from `App.jsx` via `src/lib/metrika.js`.

**Deploy.** `.github/workflows/deploy.yml` builds on push to `main`, on a 2-hour cron, and on manual dispatch, then publishes `dist/` to GitHub Pages. The build needs the `GH_STATS_TOKEN` secret and the `DOWNLOAD_MIRROR_BASE` repo variable.

**Language note.** Some comments, docs (`docs/THEMES_STORE.ru.md`), and in-repo strings are in Russian. Match the language of the surrounding file.


ТЫ можешь взаимодейстовать с GitHub, но не делай коммиты и пуши. 