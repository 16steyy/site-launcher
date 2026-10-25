import { useEffect, useMemo, useState } from "react";

import rocketIcon from "../assets/rocket.png";
import modsIcon from "../assets/mods.png";
import shieldIcon from "../assets/shield.png";
import modpacksShot from "../assets/modpacks.png";
import modsShot from "../assets/mods_tab.png";
import javaShot from "../assets/java_settings.png";
import settingsShot from "../assets/settings.png";
import roomsShot from "../assets/rooms.png";
import armCharacter from "../assets/arm.png";
import coolCharacter from "../assets/cool.png";
import runCharacter from "../assets/run.png";
import styleCharacter from "../assets/style.png";
import windowsIcon from "../assets/windows.png";
import macosIcon from "../assets/macos.png";
import linuxIcon from "../assets/linux.png";
import newsData from "./content/news.json";
import HeroPreview from "./components/HeroPreview";
import HeroStats from "./components/HeroStats";
import HeroTagline from "./components/HeroTagline";
import HeroTitle from "./components/HeroTitle";
import LatestNewsSection from "./components/LatestNewsSection";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import ImageLightbox, { useImageLightbox } from "./components/ImageLightbox";
import NewsMarkdown from "./components/NewsMarkdown";
import NewsShareQr from "./components/NewsShareQr";
import NotFoundPage from "./components/NotFoundPage";
import AccountPage from "./components/pages/AccountPage";
import PrivacyPage from "./components/pages/PrivacyPage";
import DocumentationPage from "./components/pages/DocumentationPage";
import ThemeUploadPage from "./components/pages/ThemeUploadPage";
import ThemesPage from "./components/pages/ThemesPage";
import NewsAdminPage from "./components/pages/NewsAdminPage";
import StatusPage from "./components/pages/StatusPage";
import AppSeo from "./seo/AppSeo";
import { useRevealScroll } from "./hooks/useRevealScroll";
import { useAuth } from "./hooks/useAuth";
import { usePointerEffects } from "./hooks/usePointerEffects";
import { useI18n } from "./i18n/I18nProvider";
import { getRouteKind } from "./routing";
import {
  extractFilenameFromDownloadUrl,
  normalizeReleaseData,
  pickMainDownloadLink,
  RELEASE_LINK_KEYS,
} from "./lib/releaseDownloads";
import {
  fetchReleaseDataFromApi,
  getReleaseMirrorBase,
  mergeReleaseData,
} from "./api/releases";

const FALLBACK_RELEASES_URL =
  "https://github.com/launcherdev11/rust-launcher/releases";
const GITHUB_RELEASE_DATA_URL = "/github-release.json";
const DOWNLOAD_MIRROR_BASE = getReleaseMirrorBase();
const NEWS_CDN_BASE =
  "https://cdn.jsdelivr.net/gh/16steyy/16Launcher-Site-News@main";
const NEWS_RAW_BASE =
  "https://raw.githubusercontent.com/16steyy/16Launcher-Site-News/main";
const NEWS_INDEX_PATH = "news/index.json";
const NEWS_REFRESH_INTERVAL_MS = 1 * 60 * 1000;

const HOME_ANCHOR_SECTIONS = ["features", "screenshots", "faq", "download"];

const OS_NAMES = { windows: "Windows", macos: "macOS", linux: "Linux" };

const FEATURE_ICONS = [rocketIcon, modsIcon, shieldIcon];

const SHOT_LAYOUT = [
  { id: "mods", image: modsShot, character: coolCharacter },
  { id: "settings", image: settingsShot, character: styleCharacter },
  { id: "modpacks", image: modpacksShot, character: armCharacter },
  { id: "java", image: javaShot, character: runCharacter },
  { id: "rooms", image: roomsShot, character: runCharacter },
];

function DownloadIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <g className="download-arrow">
        <path d="M12 4v11" />
        <path d="m7 10 5 5 5-5" />
      </g>
      <path d="M5 20h14" />
    </svg>
  );
}

function ChevronIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function detectOS() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "unknown";
}

function emptyReleaseData() {
  const fallbackLinks = Object.fromEntries(
    RELEASE_LINK_KEYS.map((key) => [key, FALLBACK_RELEASES_URL])
  );
  return normalizeReleaseData(
    { stars: 0, downloads: 0, version: "", links: fallbackLinks },
    { fallbackLinks, runtimeMirrorBase: DOWNLOAD_MIRROR_BASE }
  );
}

async function fetchGithubReleaseData() {
  const fallback = emptyReleaseData();

  try {
    const response = await fetch(GITHUB_RELEASE_DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("failed_release_data_load");
    const primary = normalizeReleaseData(await response.json(), {
      fallbackLinks: fallback.githubLinks,
      runtimeMirrorBase: DOWNLOAD_MIRROR_BASE,
    });

    try {
      const apiData = await fetchReleaseDataFromApi({
        fallbackLinks: fallback.githubLinks,
        runtimeMirrorBase: DOWNLOAD_MIRROR_BASE,
      });
      return mergeReleaseData(primary, apiData);
    } catch {
      return primary;
    }
  } catch {
    return fetchReleaseDataFromApi({
      fallbackLinks: fallback.githubLinks,
      runtimeMirrorBase: DOWNLOAD_MIRROR_BASE,
    });
  }
}

function toAbsoluteUrl(baseUrl, path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.replace(/^\/+/, "");
  return `${baseUrl}/${normalizedPath}`;
}

function withCacheBust(url) {
  if (!url) return url;
  const divider = url.includes("?") ? "&" : "?";
  return `${url}${divider}t=${Date.now()}`;
}

const NEWS_FETCH_TIMEOUT_MS = 5000;

async function fetchWithTimeout(url, options = {}, timeoutMs = NEWS_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function newsSourceCandidates(relativePath) {
  return [
    toAbsoluteUrl(NEWS_CDN_BASE, relativePath),
    toAbsoluteUrl(NEWS_RAW_BASE, relativePath),
  ];
}

async function fetchJsonWithFallback(relativePath) {
  const isAbsolute = /^https?:\/\//i.test(relativePath || "");
  const candidates = isAbsolute ? [relativePath] : newsSourceCandidates(relativePath);

  for (const candidate of candidates) {
    try {
      const url = withCacheBust(candidate);
      const response = await fetchWithTimeout(url, { cache: "no-store" });
      if (!response.ok) continue;
      const data = await response.json();
      return { data, url };
    } catch {
      continue;
    }
  }

  throw new Error("news_json_load_failed");
}

async function fetchTextWithFallback(relativePathOrAbsolute) {
  const isAbsolute = /^https?:\/\//i.test(relativePathOrAbsolute || "");
  const candidates = isAbsolute
    ? [relativePathOrAbsolute]
    : newsSourceCandidates(relativePathOrAbsolute);

  for (const candidate of candidates) {
    try {
      const url = withCacheBust(candidate);
      const response = await fetchWithTimeout(url, { cache: "no-store" });
      if (!response.ok) continue;
      const text = await response.text();
      return { text, url };
    } catch {
      continue;
    }
  }

  throw new Error("news_text_load_failed");
}

function resolveRelativeUrl(path, baseUrl) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (!baseUrl) return path;
  try {
    return new URL(path, `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}`).toString();
  } catch {
    return path;
  }
}

function normalizeNewsData(input, sourceUrl = "") {
  const sourceBaseUrl = sourceUrl
    ? sourceUrl.substring(0, sourceUrl.lastIndexOf("/") + 1)
    : "";
  const page = input?.page || {
    title: input?.title || "",
    subtitle: input?.subtitle || "",
  };
  const sourceItems = Array.isArray(input?.posts)
    ? input.posts
    : Array.isArray(input?.items)
      ? input.items
      : [];

  const posts = sourceItems
    .map((item, index) => {
      const slug = item?.slug || item?.version || `update-${index + 1}`;
      return {
        slug,
        title: item?.title || slug,
        excerpt: item?.excerpt || "",
        date: item?.date || "",
        version: item?.version || "",
        description: Array.isArray(item?.description) ? item.description : [],
        changelog: Array.isArray(item?.changelog) ? item.changelog : [],
        cover: resolveRelativeUrl(item?.cover || "", sourceBaseUrl),
        metaPath: resolveRelativeUrl(
          item?.meta || item?.metaPath || "",
          sourceBaseUrl
        ),
        postPath: resolveRelativeUrl(
          item?.post || item?.postPath || "",
          sourceBaseUrl
        ),
      };
    })
    .filter((post) => post.slug);

  return { page, posts };
}

function HomePage({ onNavigate, news }) {
  const { locale, messages, t } = useI18n();
  const [openFaqItems, setOpenFaqItems] = useState(() => new Set());
  const [userOS, setUserOS] = useState("unknown");
  const lightbox = useImageLightbox();
  const [links, setLinks] = useState(() => emptyReleaseData().links);
  const [githubStats, setGithubStats] = useState({ stars: 0, downloads: 0 });
  const [releaseVersion, setReleaseVersion] = useState("");

  useEffect(() => {
    setUserOS(detectOS());

    async function loadLatestRelease() {
      try {
        const data = await fetchGithubReleaseData();
        setLinks(data.links);
        setReleaseVersion(data.version);
        setGithubStats({ stars: data.stars, downloads: data.downloads });
      } catch {
        setLinks(emptyReleaseData().links);
        setGithubStats({ stars: 0, downloads: 0 });
        setReleaseVersion("");
      }
    }

    loadLatestRelease();
  }, []);

  useRevealScroll([locale, news?.posts?.length]);

  const mainDownloadLink = useMemo(
    () => pickMainDownloadLink(links, userOS, FALLBACK_RELEASES_URL),
    [links, userOS]
  );

  const features = useMemo(
    () =>
      (messages.features || []).map((feature, index) => ({
        ...feature,
        icon: FEATURE_ICONS[index],
      })),
    [messages.features]
  );

  const shots = useMemo(
    () =>
      SHOT_LAYOUT.map((layout) => ({
        ...layout,
        ...(messages.shots?.[layout.id] || {}),
      })),
    [messages.shots]
  );

  const shotGallery = useMemo(() => shots.map((shot) => shot.image), [shots]);

  const downloadRows = useMemo(() => {
    const rows = [
      { os: "windows", icon: windowsIcon, files: [{ key: "windows" }] },
      { os: "macos", icon: macosIcon, files: [{ key: "macos" }] },
      {
        os: "linux",
        icon: linuxIcon,
        files: [
          { key: "linuxAppImage", label: ".AppImage" },
          { key: "linuxDeb", label: ".deb" },
          { key: "linuxRpm", label: ".rpm" },
        ],
      },
    ];
    return rows.sort((a, b) => (b.os === userOS) - (a.os === userOS));
  }, [userOS]);

  const faqItems = messages.faq?.items || [];
  const userOsName = OS_NAMES[userOS];
  const heroMeta = [userOsName, releaseVersion && `v${releaseVersion}`].filter(Boolean);

  function toggleFaqItem(index) {
    setOpenFaqItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function renderShotHeadline(section) {
    if (section.lines) {
      return section.lines.map((line, i) => (
        <span key={i} className="block">
          <span className="text-accent-bright">{line.accent}</span> {line.rest}
        </span>
      ));
    }
    return (
      <>
        <span className="text-accent-bright">{section.accentPart}</span> {section.restPart}
      </>
    );
  }

  return (
    <main className="w-full min-w-0">
      <section className="mx-auto max-w-[1240px] px-4 pb-12 pt-16 text-center md:px-6 md:pb-16 md:pt-24">
        <HeroTitle className="reveal text-6xl md:text-8xl" />
        <HeroTagline
          highlight={messages.hero.taglineHighlight}
          rest={messages.hero.taglineRest}
          className="reveal mt-5 text-2xl font-medium text-fg-muted md:text-4xl"
          style={{ animationDelay: "80ms" }}
        />

        <div className="reveal mt-10 flex flex-col items-center gap-3" style={{ animationDelay: "120ms" }}>
          <a
            href={mainDownloadLink}
            className="btn btn-accent btn-xl w-full max-w-xs sm:w-auto sm:min-w-[18rem]"
            data-magnetic
          >
            <DownloadIcon />
            {messages.hero.install}
          </a>
          <p className="text-sm text-fg-faint">
            {heroMeta.length ? `${heroMeta.join(" · ")} · ` : null}
            <a
              href="#download"
              className="text-fg-muted underline decoration-white/20 underline-offset-4 transition hover:text-white"
              onClick={(event) => {
                event.preventDefault();
                document.getElementById("download")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {messages.hero.otherPlatforms}
            </a>
          </p>
        </div>

        <HeroPreview />
        <HeroStats
          stars={githubStats.stars}
          downloads={githubStats.downloads}
          version={releaseVersion}
          labels={messages.hero.stats}
        />
      </section>

      <section id="features" className="scroll-anchor mx-auto max-w-[1240px] px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, i) => (
            <article
              key={`feature-${i}`}
              className="card feature-card reveal reveal-scroll p-6"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="feature-icon">
                <img src={feature.icon} alt="" className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 leading-relaxed text-fg-muted">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <div id="screenshots" className="scroll-anchor">
        {shots.map((section, index) => {
          const characterRight = index % 2 === 1;
          return (
            <section
              key={section.id}
              className={`shot-section mx-auto max-w-[1240px] px-4 py-12 md:px-6 md:py-16 ${
                characterRight ? "is-right" : "is-left"
              }`}
            >
              <h2 className="section-title reveal reveal-scroll mx-auto max-w-4xl text-balance text-center">
                {renderShotHeadline(section)}
              </h2>

              <div
                className={`shot-frame reveal reveal-scroll mt-10 flex flex-col gap-3 md:mt-12 md:items-end ${
                  characterRight ? "md:flex-row-reverse" : "md:flex-row"
                }`}
                style={{ animationDelay: "60ms" }}
              >
                <div className="order-2 flex shrink-0 justify-center md:order-none md:w-[24%]">
                  <img
                    src={section.character}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="shot-character h-auto max-h-[200px] w-auto object-contain object-bottom md:max-h-[460px] md:w-full"
                  />
                </div>
                <button
                  type="button"
                  className="shot-image-button order-1 min-w-0 flex-1 md:order-none"
                  onClick={() => lightbox.openImage(section.image, shotGallery)}
                >
                  <img
                    src={section.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full"
                  />
                  <span className="shot-zoom-hint">{messages.gallery?.zoom}</span>
                </button>
              </div>
            </section>
          );
        })}
      </div>

      <ImageLightbox
        image={lightbox.image}
        alt={lightbox.alt}
        hasGallery={lightbox.hasGallery}
        onClose={lightbox.closeImage}
        onPrev={lightbox.showPrev}
        onNext={lightbox.showNext}
      />

      <div className="mx-auto max-w-[1240px] px-4 md:px-6">
        <LatestNewsSection
          title={messages.latestNews?.title}
          viewAllLabel={messages.latestNews?.viewAll}
          openLabel={messages.news.open}
          posts={news?.posts}
          onNavigate={onNavigate}
        />

        <section id="faq" className="scroll-anchor py-16 md:py-20">
          <h2 className="section-title reveal reveal-scroll text-center">{messages.faq?.title}</h2>
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaqItems.has(index);
              return (
                <div
                  key={index}
                  className={`card faq-item reveal reveal-scroll ${isOpen ? "is-open" : ""}`}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <button
                    type="button"
                    id={`faq-q-${index}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6"
                    onClick={() => toggleFaqItem(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${index}`}
                  >
                    <span className="text-base font-semibold text-white md:text-lg">{item.question}</span>
                    <ChevronIcon
                      className={`faq-chevron h-5 w-5 shrink-0 text-fg-faint ${isOpen ? "is-open" : ""}`}
                    />
                  </button>
                  <div
                    id={`faq-a-${index}`}
                    role="region"
                    aria-labelledby={`faq-q-${index}`}
                    className={`faq-answer-wrap${isOpen ? " is-open" : ""}`}
                  >
                    <div className="faq-answer-inner">
                      <p className="px-5 pb-5 leading-relaxed text-fg-muted md:px-6">{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="download" className="scroll-anchor pb-24 pt-16 md:pb-28 md:pt-20">
          <h2 className="section-title reveal reveal-scroll text-center">{messages.download.title}</h2>
          {releaseVersion ? (
            <p className="reveal reveal-scroll mt-3 text-center text-fg-muted">
              {t("download.version", { version: releaseVersion })}
            </p>
          ) : null}

          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {downloadRows.map((row, index) => {
              const isUserOs = row.os === userOS;
              const single = row.files.length === 1 ? links[row.files[0].key] : "";
              const fileName = single ? extractFilenameFromDownloadUrl(single) : "";
              return (
                <div
                  key={row.os}
                  className={`card reveal reveal-scroll flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${
                    isUserOs ? "!border-accent-to/40" : ""
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <img src={row.icon} alt="" className="h-9 w-9 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xl font-semibold text-white">{OS_NAMES[row.os]}</span>
                        {isUserOs && (
                          <span className="chip chip-accent">
                            {row.os === "linux" ? messages.download.recommended : messages.download.forYou}
                          </span>
                        )}
                      </div>
                      {fileName && fileName !== "releases" ? (
                        <p className="mt-0.5 truncate font-mono text-xs text-fg-faint">{fileName}</p>
                      ) : null}
                    </div>
                  </div>

                  {single ? (
                    <a href={single} className={`btn ${isUserOs ? "btn-accent" : "btn-soft"} sm:min-w-[9rem]`}>
                      <DownloadIcon className="h-4 w-4" />
                      {messages.download.install}
                    </a>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:flex">
                      {row.files.map((file, fileIndex) => (
                        <a
                          key={file.key}
                          href={links[file.key]}
                          title={extractFilenameFromDownloadUrl(links[file.key])}
                          className={`btn ${isUserOs && fileIndex === 0 ? "btn-accent" : "btn-soft"} px-3`}
                        >
                          {file.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-sm">
            <a
              href={FALLBACK_RELEASES_URL}
              target="_blank"
              rel="noreferrer"
              className="text-fg-muted underline decoration-white/20 underline-offset-4 transition hover:text-white"
            >
              {messages.download.allReleases}
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}

function BackLink({ href, label, onNavigate }) {
  return (
    <a
      href={href}
      className="btn btn-ghost btn-sm -ml-2"
      onClick={(event) => {
        event.preventDefault();
        onNavigate(href);
      }}
    >
      <ChevronIcon className="h-4 w-4 rotate-90" />
      {label}
    </a>
  );
}

function PostMeta({ post }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm text-fg-faint">
      {post.date ? <span>{post.date}</span> : null}
      {post.version ? <span className="chip chip-accent">{post.version}</span> : null}
    </p>
  );
}

function NewsListPage({ onNavigate, news, isLoading, loadError }) {
  const { messages } = useI18n();
  const pageTitle = news.page?.title || messages.news.defaultTitle;
  const pageSubtitle = news.page?.subtitle || messages.news.defaultSubtitle;
  const posts = Array.isArray(news.posts) ? news.posts : [];

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 pb-20 pt-12 md:px-6 md:pt-16">
      <section className="text-center">
        <h1 className="page-title">{pageTitle}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-fg-muted">{pageSubtitle}</p>
        {isLoading && messages.news.loading ? (
          <p className="mt-4 text-fg-faint">{messages.news.loading}</p>
        ) : null}
        {loadError && (
          <p className="notice notice-warning mx-auto mt-6 max-w-xl">{messages.news.loadError}</p>
        )}
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`/news/${post.slug}`}
            className="news-card group flex flex-col rounded-2xl p-6 md:p-7"
            onClick={(event) => {
              event.preventDefault();
              onNavigate(`/news/${post.slug}`);
            }}
          >
            <PostMeta post={post} />
            <h2 className="mt-3 text-2xl font-semibold leading-snug text-white">{post.title}</h2>
            {post.excerpt ? <p className="mt-3 flex-1 text-fg-muted">{post.excerpt}</p> : null}
            <span className="mt-6 text-sm font-semibold text-accent-hi transition group-hover:text-white">
              {messages.news.open} →
            </span>
          </a>
        ))}
      </section>
    </main>
  );
}

function NewsArticlePage({ slug, onNavigate, news }) {
  const { messages } = useI18n();
  const posts = Array.isArray(news.posts) ? news.posts : [];
  const post = posts.find((item) => item.slug === slug);
  const [articleState, setArticleState] = useState({
    loading: false,
    error: false,
    markdown: "",
    meta: null,
    markdownUrl: "",
    metaUrl: "",
  });

  useEffect(() => {
    let cancelled = false;
    if (!post) return;

    async function loadRemoteArticle() {
      const hasRemoteSources = post.postPath || post.metaPath;
      if (!hasRemoteSources) {
        setArticleState({
          loading: false,
          error: false,
          markdown: "",
          meta: null,
          markdownUrl: "",
          metaUrl: "",
        });
        return;
      }

      setArticleState((prev) => ({ ...prev, loading: true, error: false }));

      try {
        let markdown = "";
        let markdownUrl = "";
        let meta = null;
        let metaUrl = "";

        if (post.postPath) {
          const markdownResult = await fetchTextWithFallback(post.postPath);
          markdown = markdownResult.text;
          markdownUrl = markdownResult.url;
        }

        if (post.metaPath) {
          const metaResult = await fetchJsonWithFallback(post.metaPath);
          meta = metaResult.data;
          metaUrl = metaResult.url;
        }

        if (!cancelled) {
          setArticleState({
            loading: false,
            error: false,
            markdown,
            meta,
            markdownUrl,
            metaUrl,
          });
        }
      } catch {
        if (!cancelled) {
          setArticleState((prev) => ({ ...prev, loading: false, error: true }));
        }
      }
    }

    loadRemoteArticle();
    return () => {
      cancelled = true;
    };
  }, [post]);

  if (!post) {
    return (
      <main className="mx-auto w-full max-w-[860px] px-4 pb-20 pt-10 md:px-6">
        <BackLink href="/news" label={messages.news.backToNews} onNavigate={onNavigate} />
        <div className="panel mt-6 p-8 text-center">
          <h1 className="text-3xl font-bold text-white">{messages.news.notFound}</h1>
        </div>
      </main>
    );
  }

  const resolvedMeta = articleState.meta || {};
  const mergedDescription =
    Array.isArray(resolvedMeta.description) && resolvedMeta.description.length
      ? resolvedMeta.description
      : Array.isArray(post.description)
        ? post.description
        : [];
  const mergedChangelog =
    Array.isArray(resolvedMeta.changelog) && resolvedMeta.changelog.length
      ? resolvedMeta.changelog
      : Array.isArray(post.changelog)
        ? post.changelog
        : [];
  const markdownAssetBaseUrl = articleState.markdownUrl
    ? articleState.markdownUrl.substring(0, articleState.markdownUrl.lastIndexOf("/") + 1)
    : "";

  return (
    <main className="mx-auto w-full max-w-[860px] px-4 pb-20 pt-10 md:px-6">
      <BackLink href="/news" label={messages.news.backToNews} onNavigate={onNavigate} />

      <article className="panel mt-6 p-6 md:p-10">
        <div className="flex items-start justify-between gap-4">
          <PostMeta post={post} />
          <NewsShareQr slug={post.slug} title={post.title} />
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
          {post.title}
        </h1>

        {articleState.loading && (
          <p className="mt-8 text-fg-faint">{messages.news.articleLoading}</p>
        )}

        {articleState.error && (
          <p className="notice notice-warning mt-8">{messages.news.articleError}</p>
        )}

        {articleState.markdown?.trim() ? (
          <NewsMarkdown markdown={articleState.markdown} assetBaseUrl={markdownAssetBaseUrl} />
        ) : (
          <>
            <section className="mt-8 space-y-4 text-lg leading-relaxed text-fg">
              {mergedDescription.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </section>

            {mergedChangelog.length ? (
              <section className="mt-10">
                <h2 className="text-xl font-semibold text-white">{messages.news.changes}</h2>
                <ul className="news-markdown-list mt-4 space-y-2 text-fg">
                  {mergedChangelog.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </article>
    </main>
  );
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname || "/");
  const [news, setNews] = useState(() => normalizeNewsData(newsData));
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsLoadError, setNewsLoadError] = useState(false);
  const [releaseVersion, setReleaseVersion] = useState("");
  const { user } = useAuth();
  const { messages } = useI18n();
  usePointerEffects();

  async function refreshNews({ isBackground = false } = {}) {
    if (!isBackground) {
      setNewsLoading(true);
    }
    setNewsLoadError(false);
    try {
      const remote = await fetchJsonWithFallback(NEWS_INDEX_PATH);
      setNews(normalizeNewsData(remote.data, remote.url));
      if (!isBackground) {
        setNewsLoading(false);
      }
    } catch {
      setNews(normalizeNewsData(newsData));
      if (!isBackground) {
        setNewsLoading(false);
      }
      setNewsLoadError(true);
    }
  }

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname || "/");
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    let cancelled = false;
    refreshNews();

    const intervalId = window.setInterval(() => {
      if (!cancelled) {
        refreshNews({ isBackground: true });
      }
    }, NEWS_REFRESH_INTERVAL_MS);

    function onVisibilityChange() {
      if (!cancelled && document.visibilityState === "visible") {
        refreshNews({ isBackground: true });
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    fetchGithubReleaseData()
      .then((data) => {
        if (data.version) setReleaseVersion(data.version);
      })
      .catch(() => {});
  }, []);

  function navigate(nextPath) {
    const nextUrl = new URL(nextPath, window.location.origin);
    const currentUrl = new URL(window.location.href);
    if (
      nextUrl.pathname === currentUrl.pathname &&
      nextUrl.search === currentUrl.search
    ) {
      return;
    }
    const lang = new URLSearchParams(window.location.search).get("lang");
    if (lang && !nextUrl.searchParams.has("lang")) {
      nextUrl.searchParams.set("lang", lang);
    }
    window.history.pushState({}, "", `${nextUrl.pathname}${nextUrl.search}`);
    setPath(nextUrl.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const route = getRouteKind(path);

  const homeSections = useMemo(
    () => HOME_ANCHOR_SECTIONS.map((id) => ({ id, label: messages.nav[id] })),
    [messages.nav]
  );

  let page;
  if (route === "themes") {
    page = <ThemesPage onNavigate={navigate} path={path} user={user} />;
  } else if (route === "themes-upload") {
    page = <ThemeUploadPage onNavigate={navigate} path={path} user={user} />;
  } else if (route === "account") {
    page = <AccountPage onNavigate={navigate} path={path} user={user} />;
  } else if (route === "privacy") {
    page = <PrivacyPage />;
  } else if (route === "documentation") {
    page = <DocumentationPage onNavigate={navigate} />;
  } else if (route === "status") {
    page = <StatusPage />;
  } else if (route === "admin-news") {
    page = (
      <NewsAdminPage
        onNavigate={navigate}
        path={path}
        user={user}
        news={news}
        onNewsSaved={() => refreshNews({ isBackground: true })}
      />
    );
  } else if (route === "news") {
    page = (
      <NewsListPage
        onNavigate={navigate}
        news={news}
        isLoading={newsLoading}
        loadError={newsLoadError}
      />
    );
  } else if (route === "article") {
    page = <NewsArticlePage slug={path.replace("/news/", "")} onNavigate={navigate} news={news} />;
  } else if (route === "not-found") {
    page = <NotFoundPage onNavigate={navigate} />;
  } else {
    page = <HomePage onNavigate={navigate} news={news} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="grid-glow" aria-hidden />
      <AppSeo path={path} news={news} releaseVersion={releaseVersion} />
      <SiteHeader
        path={path}
        onNavigate={navigate}
        user={user}
        sections={route === "home" ? homeSections : undefined}
      />
      {page}
      <SiteFooter onNavigate={navigate} />
    </div>
  );
}
