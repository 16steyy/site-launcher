import { useEffect, useMemo, useState } from "react";

import rocketIcon from "../assets/rocket.png";
import modsIcon from "../assets/mods.png";
import shieldIcon from "../assets/shield.png";
import modpacksShot from "../assets/modpacks.png";
import modsShot from "../assets/mods_tab.png";
import javaShot from "../assets/java_settings.png";
import settingsShot from "../assets/settings.png";
import armCharacter from "../assets/arm.png";
import coolCharacter from "../assets/cool.png";
import runCharacter from "../assets/run.png";
import styleCharacter from "../assets/style.png";
import windowsIcon from "../assets/windows.png";
import macosIcon from "../assets/macos.png";
import linuxIcon from "../assets/linux.png";
import githubIcon from "../assets/github.png";
import discordIcon from "../assets/discord.png";
import telegramIcon from "../assets/telegram.png";
import boostyIcon from "../assets/boosty.png";
import newsData from "./content/news.json";
import HeroTagline from "./components/HeroTagline";
import HeroTitle from "./components/HeroTitle";
import LanguageSwitcher from "./components/LanguageSwitcher";
import SectionNav from "./components/SectionNav";
import ImageLightbox, { useImageLightbox } from "./components/ImageLightbox";
import NewsMarkdown from "./components/NewsMarkdown";
import AppSeo from "./seo/AppSeo";
import { useRevealScroll } from "./hooks/useRevealScroll";
import { useI18n } from "./i18n/I18nProvider";

const FALLBACK_RELEASES_URL =
  "https://github.com/launcherdev11/rust-launcher/releases";
const LATEST_RELEASE_API =
  "https://api.github.com/repos/launcherdev11/rust-launcher/releases/latest";
const NEWS_CDN_BASE =
  "https://cdn.jsdelivr.net/gh/16steyy/16Launcher-Site-News@main";
const NEWS_RAW_BASE =
  "https://raw.githubusercontent.com/16steyy/16Launcher-Site-News/main";
const NEWS_INDEX_PATH = "news/index.json";
const NEWS_REFRESH_INTERVAL_MS = 1 * 60 * 1000;

const HOME_ANCHOR_SECTIONS = [
  { id: "features", labelKey: "features" },
  { id: "screenshots", labelKey: "screenshots" },
  { id: "faq", labelKey: "faq" },
  { id: "download", labelKey: "download" },
];

const SOCIAL_LINKS = [
  {
    href: "https://github.com/launcherdev11",
    icon: githubIcon,
    label: "GitHub",
  },
  {
    href: "https://discord.gg/55Y95EfsHM",
    icon: discordIcon,
    label: "Discord",
  },
  {
    href: "https://t.me/of16launcher",
    icon: telegramIcon,
    label: "Telegram",
  },
  {
    href: "https://boosty.to/16steyy",
    icon: boostyIcon,
    label: "Boosty",
  },
];

const CHARACTER_SHOT_CLASSES =
  "h-auto w-full max-w-[500px] object-contain object-bottom md:max-h-[min(600px,82vh)] md:max-w-[min(860px,38vw)]";

const CHARACTER_WRAP_DEFAULT_CLASSES =
  "relative flex min-h-[260px] flex-[1_1_28%] flex-col items-center justify-end px-1 md:min-h-0 md:basis-[28%] md:justify-end md:px-2";

const CHARACTER_SHOT_CLASSES_STYLE_RUN =
  "h-auto w-full max-w-[980px] object-contain object-bottom md:max-h-[min(1020px,86vh)] md:max-w-[min(980px,45vw)]";

const CHARACTER_WRAP_CLASSES_STYLE_RUN =
  "relative flex min-h-[300px] flex-[1_1_33%] flex-col items-center justify-end px-1 md:min-h-0 md:basis-[33%] md:justify-end md:px-2";

const FEATURE_ICONS = [rocketIcon, modsIcon, shieldIcon];

const SHOT_LAYOUT = [
  {
    id: "mods",
    headlinePosition: "top",
    headingAlign: "center",
    image: modsShot,
    character: coolCharacter,
    characterClasses: CHARACTER_SHOT_CLASSES,
  },
  {
    id: "settings",
    headlinePosition: "top",
    image: settingsShot,
    character: styleCharacter,
    characterClasses: CHARACTER_SHOT_CLASSES_STYLE_RUN,
    characterWrapClasses: CHARACTER_WRAP_CLASSES_STYLE_RUN,
    headingAlign: "center",
  },
  {
    id: "modpacks",
    headlinePosition: "top",
    headingAlign: "center",
    image: modpacksShot,
    character: armCharacter,
    characterClasses: CHARACTER_SHOT_CLASSES,
  },
  {
    id: "java",
    headlinePosition: "top",
    image: javaShot,
    character: runCharacter,
    characterClasses: CHARACTER_SHOT_CLASSES_STYLE_RUN,
    characterWrapClasses: CHARACTER_WRAP_CLASSES_STYLE_RUN,
    headingAlign: "center",
  },
];

function scrollToSection(event, sectionId) {
  event.preventDefault();
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function detectOS() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "unknown";
}

function pickAssetUrl(assets, matcher) {
  const found = assets.find((asset) => matcher(asset.name.toLowerCase()));
  return found?.browser_download_url || FALLBACK_RELEASES_URL;
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

async function fetchJsonWithFallback(relativePath) {
  const isAbsolute = /^https?:\/\//i.test(relativePath || "");
  const candidates = isAbsolute
    ? [relativePath]
    : [
        toAbsoluteUrl(NEWS_RAW_BASE, relativePath),
        toAbsoluteUrl(NEWS_CDN_BASE, relativePath),
      ];

  for (const candidate of candidates) {
    try {
      const url = withCacheBust(candidate);
      const response = await fetch(url, { cache: "no-store" });
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
    : [
        toAbsoluteUrl(NEWS_RAW_BASE, relativePathOrAbsolute),
        toAbsoluteUrl(NEWS_CDN_BASE, relativePathOrAbsolute),
      ];

  for (const candidate of candidates) {
    try {
      const url = withCacheBust(candidate);
      const response = await fetch(url, { cache: "no-store" });
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

function HomePage({ onNavigate, path }) {
  const { locale, messages } = useI18n();
  const [linuxOpen, setLinuxOpen] = useState(false);
  const [openFaqItems, setOpenFaqItems] = useState(() => new Set());
  const [userOS, setUserOS] = useState("unknown");
  const { image: lightboxImage, openImage: openLightboxImage, closeImage: closeLightboxImage } =
    useImageLightbox();
  const [activeSection, setActiveSection] = useState("");
  const [links, setLinks] = useState({
    windows: FALLBACK_RELEASES_URL,
    macos: FALLBACK_RELEASES_URL,
    linuxDeb: FALLBACK_RELEASES_URL,
    linuxRpm: FALLBACK_RELEASES_URL,
    linuxAppImage: FALLBACK_RELEASES_URL,
  });

  useEffect(() => {
    setUserOS(detectOS());

    async function loadLatestRelease() {
      try {
        const response = await fetch(LATEST_RELEASE_API);
        if (!response.ok) throw new Error("failed_release_load");
        const release = await response.json();
        const assets = release.assets || [];

        setLinks({
          windows: pickAssetUrl(
            assets,
            (name) => name.endsWith(".exe") || name.endsWith(".msi")
          ),
          macos: pickAssetUrl(
            assets,
            (name) =>
              name.endsWith(".dmg") || name.endsWith(".pkg") || name.includes("mac")
          ),
          linuxDeb: pickAssetUrl(assets, (name) => name.endsWith(".deb")),
          linuxRpm: pickAssetUrl(assets, (name) => name.endsWith(".rpm")),
          linuxAppImage: pickAssetUrl(assets, (name) => name.endsWith(".appimage")),
        });
      } catch {
        setLinks({
          windows: FALLBACK_RELEASES_URL,
          macos: FALLBACK_RELEASES_URL,
          linuxDeb: FALLBACK_RELEASES_URL,
          linuxRpm: FALLBACK_RELEASES_URL,
          linuxAppImage: FALLBACK_RELEASES_URL,
        });
      }
    }

    loadLatestRelease();
  }, []);

  useEffect(() => {
    const sections = HOME_ANCHOR_SECTIONS.map(({ id }) =>
      document.getElementById(id)
    ).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.15, 0.35, 0.55] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [locale]);

  useRevealScroll([linuxOpen, openFaqItems, locale]);

  const mainDownloadLink = useMemo(() => {
    if (userOS === "windows") return links.windows;
    return FALLBACK_RELEASES_URL;
  }, [links.windows, userOS]);

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

  const faqItems = messages.faq?.items || [];
  const faqBaseDelay = 160 + shots.length * 120;
  const downloadBaseDelay = faqBaseDelay + 120 + faqItems.length * 60;

  const navSections = useMemo(
    () =>
      HOME_ANCHOR_SECTIONS.map(({ id, labelKey }) => ({
        id,
        label: messages.nav[labelKey],
      })),
    [messages.nav]
  );

  const downloadCardClass =
    "glass reveal reveal-scroll interactive-row flex min-w-0 flex-col gap-4 rounded-2xl px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:rounded-3xl sm:px-6 sm:py-5 md:px-7";
  const downloadInfoClass = "flex min-w-0 flex-wrap items-center gap-2.5 sm:gap-4";
  const downloadIconClass = "h-8 w-8 shrink-0 sm:h-9 sm:w-9";
  const downloadOsClass = "text-2xl font-extrabold sm:text-4xl md:text-5xl";
  const downloadBadgeClass =
    "rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold sm:px-3 sm:py-1 sm:text-sm";
  const downloadActionClass =
    "inline-flex shrink-0 items-center justify-center self-stretch rounded-full bg-accent px-6 py-2.5 text-base font-bold sm:self-auto sm:px-8 sm:py-2.5 sm:text-xl md:px-10 md:py-3 md:text-2xl";

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
          <span className="text-accent">{line.accent}</span>{" "}
          <span className="text-white">{line.rest}</span>
        </span>
      ));
    }
    return (
      <>
        <span className="text-accent">{section.accentPart}</span>{" "}
        <span className="text-white">{section.restPart}</span>
      </>
    );
  }

  function handleFeatureCursor(event) {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) * 2 - 1) * -4;
    const rotateY = ((x / rect.width) * 2 - 1) * 5;

    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
    card.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
    card.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
  }

  function resetFeatureCursor(event) {
    const card = event.currentTarget;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  }

  return (
    <main className="home-page-main w-full min-w-0 pb-16">
      <div className="site-header-shell min-w-0 px-3 pt-2.5 pb-2 sm:px-4 sm:pt-3 md:px-6">
        <header className="site-header glass mx-auto flex w-full min-w-0 max-w-[1240px] flex-col gap-2 rounded-2xl px-2.5 py-2 sm:gap-2.5 sm:rounded-[1.35rem] sm:px-3 sm:py-2.5 md:flex-row md:items-center md:justify-between md:gap-3 md:px-5 md:py-3">
          <SectionNav
            className="order-2 md:order-none"
            sections={navSections}
            activeSection={activeSection}
            onSectionClick={(event, id) => {
              scrollToSection(event, id);
              setActiveSection(id);
            }}
            ariaLabel={messages.nav.sections}
          />

          <div className="order-1 flex min-w-0 items-center justify-between gap-2 md:order-none md:shrink-0 md:justify-end md:gap-3">
            <LanguageSwitcher />
            <nav className="site-nav-pages flex shrink-0 items-center gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
              <a
                href="/"
                className={`site-nav-page whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold transition sm:px-3.5 sm:text-sm md:px-4 ${
                  path === "/"
                    ? "is-active"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white/90"
                }`}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate("/");
                }}
              >
                {messages.nav.home}
              </a>
              <a
                href="/news"
                className={`site-nav-page whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold transition sm:px-3.5 sm:text-sm md:px-4 ${
                  path.startsWith("/news")
                    ? "is-active"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white/90"
                }`}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate("/news");
                }}
              >
                {messages.nav.news}
              </a>
            </nav>
          </div>
        </header>
      </div>

      <div className="mx-auto max-w-[1240px] px-4 md:px-6">
        <section className="py-16 text-center md:py-24">
          <HeroTitle className="text-5xl font-extrabold tracking-tight md:text-7xl" />
          <HeroTagline
            highlight={messages.hero.taglineHighlight}
            rest={messages.hero.taglineRest}
            className="reveal mt-3 text-2xl font-semibold text-white/70 md:text-4xl"
            style={{ animationDelay: "110ms" }}
          />
          <a
            href={mainDownloadLink}
            className="reveal interactive-cta mx-auto mt-12 inline-flex min-w-72 items-center justify-center rounded-2xl bg-accent px-8 py-5 text-2xl font-bold text-white shadow-glow"
            style={{ animationDelay: "160ms" }}
          >
            <span className="relative z-[1]">{messages.hero.install}</span>
          </a>
        </section>

        <section id="features" className="scroll-anchor py-20 md:py-28">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
              <article
                key={`feature-${i}`}
                className="reveal reveal-scroll glass interactive-feature-card rounded-3xl p-8 text-center"
                style={{ animationDelay: `${60 + i * 70}ms` }}
                onMouseMove={handleFeatureCursor}
                onMouseLeave={resetFeatureCursor}
              >
                <img src={feature.icon} alt="" className="mx-auto h-11 w-11" />
                <h3 className="mt-5 text-4xl font-extrabold">{feature.title}</h3>
                <p className="mt-4 text-2xl font-semibold text-white/70">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {shots.map((section, index) => {
        const isModsBlock = section.id === "mods";
        const alignClass =
          section.headingAlign === "right" ? "text-right" : "text-center";
        const headlineTop = section.headlinePosition !== "bottom";
        const biasLeft = index % 2 === 0;
        const characterClasses =
          section.characterClasses || CHARACTER_SHOT_CLASSES;
        const headlineText = isModsBlock
          ? "text-4xl font-extrabold leading-tight tracking-tight md:text-6xl"
          : "text-4xl font-extrabold leading-tight tracking-tight text-balance md:text-6xl";
        const headlineMarginTop = "mt-10 md:mt-14";
        const headlineMarginBottom = "mb-10 md:mb-14";
        const headlineBlock = isModsBlock
          ? `mx-auto w-full max-w-7xl px-2 md:px-4 ${headlineText} ${alignClass}`
          : `mx-auto w-full max-w-6xl px-4 md:px-8 ${headlineText} ${alignClass}`;
        const sectionPad = biasLeft
          ? "pl-4 pr-8 sm:pl-6 sm:pr-12 md:pl-10 md:pr-20 lg:pl-16 lg:pr-28 xl:pl-24 xl:pr-36"
          : "pl-8 pr-4 sm:pl-12 sm:pr-6 md:pl-20 md:pr-10 lg:pl-28 lg:pr-16 xl:pl-36 xl:pr-24";

        const baseDelay = 160 + index * 120;

        return (
          <section
            key={section.id}
            id={index === 0 ? "screenshots" : undefined}
            className={`feature-shot-section scroll-anchor relative isolate w-full overflow-hidden py-20 md:py-28 ${
              index === 0 ? "mt-5 md:mt-20" : ""
            }`}
          >
            {biasLeft ? (
              <div
                className="pointer-events-none absolute -left-[15%] top-1/2 h-[min(120%,800px)] w-[min(75vw,900px)] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(44,96,255,0.38),transparent)] blur-2xl"
                aria-hidden
              />
            ) : (
              <div
                className="pointer-events-none absolute -right-[15%] top-1/2 h-[min(120%,800px)] w-[min(75vw,900px)] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(86,115,255,0.36),transparent)] blur-2xl"
                aria-hidden
              />
            )}
            {headlineTop && (
              <h2
                className={`${headlineBlock} ${headlineMarginBottom} reveal reveal-scroll`}
                style={{ animationDelay: `${baseDelay}ms` }}
              >
                {renderShotHeadline(section)}
              </h2>
            )}

            <div className={sectionPad}>
              <div
                className={`glass shot-glass-panel relative reveal reveal-scroll flex w-full max-w-[min(1920px,100%)] flex-col gap-4 rounded-2xl p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] md:flex-row md:items-stretch md:gap-0 md:p-5 ${
                  biasLeft ? "ml-0 mr-auto" : "ml-auto mr-0"
                }`}
                style={{ animationDelay: `${baseDelay + 70}ms` }}
              >
                <div
                  className={
                    section.characterWrapClasses ||
                    CHARACTER_WRAP_DEFAULT_CLASSES
                  }
                >
                  <img
                    src={section.character}
                    alt=""
                    className={`relative z-[1] ${characterClasses}`}
                  />
                </div>
                <div className="min-w-0 flex-[1_1_72%] md:basis-[72%]">
                  <button
                    type="button"
                    className="group relative block h-full w-full"
                    onClick={() => openLightboxImage(section.image)}
                  >
                    <img
                      src={section.image}
                      alt=""
                      className="h-full w-full rounded-xl object-cover object-left-top shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-[1.03] group-hover:shadow-[0_20px_50px_rgba(44,96,255,0.2)]"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/0 opacity-0 transition-opacity duration-200 group-hover:bg-black/35 group-hover:opacity-100" />
                  </button>
                </div>
              </div>
            </div>

            {!headlineTop && (
              <h2
                className={`${headlineBlock} ${headlineMarginTop} reveal reveal-scroll`}
                style={{ animationDelay: `${baseDelay}ms` }}
              >
                {renderShotHeadline(section)}
              </h2>
            )}
          </section>
        );
      })}

      <ImageLightbox image={lightboxImage} onClose={closeLightboxImage} />

      <div className="mx-auto max-w-[1240px] px-4 md:px-6">
        <section id="faq" className="scroll-anchor py-20 md:py-28">
          <h2
            className="reveal reveal-scroll text-center text-5xl font-extrabold md:text-6xl"
            style={{ animationDelay: `${faqBaseDelay}ms` }}
          >
            {messages.faq?.title}
          </h2>
          <div className="mx-auto mt-12 max-w-5xl space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaqItems.has(index);
              return (
                <button
                  key={index}
                  type="button"
                  className="faq-item glass reveal reveal-scroll rounded-3xl px-6 py-5 text-left md:px-7"
                  style={{ animationDelay: `${faqBaseDelay + 50 + index * 55}ms` }}
                  onClick={() => toggleFaqItem(index)}
                  aria-expanded={isOpen}
                >
                  <span className="relative z-[1] flex w-full items-center justify-between gap-4">
                    <span className="text-2xl font-extrabold leading-snug md:text-3xl">
                      {item.question}
                    </span>
                    <svg
                      className={`faq-chevron linux-chevron h-6 w-6 shrink-0 text-white/70 ${isOpen ? "is-open" : ""}`}
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
                  </span>
                  <div className={`faq-answer-wrap${isOpen ? " is-open" : ""}`}>
                    <div className="faq-answer-inner">
                      <p className="faq-answer relative z-[1] mt-4 text-lg font-semibold leading-relaxed text-white/70 md:text-xl">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section id="download" className="scroll-anchor py-24 md:py-32">
          <h2
            className="reveal reveal-scroll text-center text-4xl font-extrabold sm:text-5xl md:text-6xl"
            style={{ animationDelay: `${downloadBaseDelay}ms` }}
          >
            {messages.download.title}
          </h2>
          <div className="mx-auto mt-8 max-w-5xl space-y-4 sm:mt-12 sm:space-y-5">
            <a
              href={links.windows}
              className={downloadCardClass}
              style={{ animationDelay: `${downloadBaseDelay + 50}ms` }}
            >
              <div className={downloadInfoClass}>
                <img src={windowsIcon} alt="" className={downloadIconClass} />
                <span className={downloadOsClass}>Windows</span>
                {userOS === "windows" && (
                  <span className={downloadBadgeClass}>{messages.download.forYou}</span>
                )}
              </div>
              <span className={downloadActionClass}>{messages.download.install}</span>
            </a>

            <a
              href={links.macos}
              className={downloadCardClass}
              style={{ animationDelay: `${downloadBaseDelay + 100}ms` }}
            >
              <div className={downloadInfoClass}>
                <img src={macosIcon} alt="" className={downloadIconClass} />
                <span className={downloadOsClass}>macOS</span>
                {userOS === "macos" && (
                  <span className={downloadBadgeClass}>{messages.download.forYou}</span>
                )}
              </div>
              <span className={downloadActionClass}>{messages.download.install}</span>
            </a>

            <div
              className="glass reveal reveal-scroll min-w-0 rounded-2xl px-4 py-4 sm:rounded-3xl sm:px-6 sm:py-5 md:px-7"
              style={{ animationDelay: `${downloadBaseDelay + 150}ms` }}
            >
              <button
                type="button"
                onClick={() => setLinuxOpen((prev) => !prev)}
                className="interactive-row flex w-full min-w-0 flex-col gap-4 rounded-2xl text-left sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <span className={downloadInfoClass}>
                  <img src={linuxIcon} alt="" className={downloadIconClass} />
                  <span className={downloadOsClass}>Linux</span>
                  {userOS === "linux" && (
                    <span className={downloadBadgeClass}>{messages.download.recommended}</span>
                  )}
                </span>
                <span className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:shrink-0 sm:gap-3">
                  <span className={`${downloadActionClass} min-w-0 flex-1 sm:flex-none`}>
                    {linuxOpen ? messages.download.hide : messages.download.choose}
                  </span>
                  <svg
                    className={`linux-chevron h-5 w-5 shrink-0 text-white/70 sm:h-6 sm:w-6 ${linuxOpen ? "is-open" : ""}`}
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
                </span>
              </button>

              {linuxOpen && (
                <div className="mt-4 grid gap-3 sm:mt-5 md:grid-cols-3">
                  <a
                    href={links.linuxDeb}
                    className="interactive-row rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-center text-xl font-bold reveal reveal-scroll"
                    style={{ animationDelay: `${downloadBaseDelay + 5}ms` }}
                  >
                    .deb
                  </a>
                  <a
                    href={links.linuxRpm}
                    className="interactive-row rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-center text-xl font-bold reveal reveal-scroll"
                    style={{ animationDelay: `${downloadBaseDelay + 10}ms` }}
                  >
                    .rpm
                  </a>
                  <a
                    href={links.linuxAppImage}
                    className="interactive-row rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-center text-xl font-bold reveal reveal-scroll"
                    style={{ animationDelay: `${downloadBaseDelay + 15}ms` }}
                  >
                    .AppImage
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="pt-4 text-center text-base font-semibold text-white/60">
          {messages.footer.disclaimer}

          <div className="mt-4 flex items-center justify-center gap-3">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="group inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 p-2 transition-transform duration-200 hover:scale-110 hover:-translate-y-0.5 hover:rotate-3"
              >
                <img
                  src={item.icon}
                  alt=""
                  className="h-7 w-7 transition-transform duration-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(134,59,255,0.65)]"
                />
              </a>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}

function NewsListPage({ onNavigate, news, isLoading, loadError }) {
  const { messages } = useI18n();
  const pageTitle = news.page?.title || messages.news.defaultTitle;
  const pageSubtitle = news.page?.subtitle || messages.news.defaultSubtitle;
  const posts = Array.isArray(news.posts) ? news.posts : [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1240px] px-4 pb-20 pt-10 md:px-6">
      <header className="mb-10 flex items-center justify-between gap-3">
        <a
          href="/"
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 transition hover:text-white"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/");
          }}
        >
          {messages.news.backHome}
        </a>
        <LanguageSwitcher />
      </header>

      <section className="text-center">
        <h1 className="hero-title text-5xl font-extrabold tracking-tight md:text-7xl">
          {pageTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-white/70 md:text-2xl">
          {pageSubtitle}
        </p>
        {isLoading && (
          <p className="mx-auto mt-4 max-w-3xl text-base text-white/50">
            {messages.news.loading}
          </p>
        )}
        {loadError && (
          <p className="mx-auto mt-4 max-w-3xl text-base text-amber-300/95">
            {messages.news.loadError}
          </p>
        )}
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.slug} className="news-card rounded-3xl p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/55">
              {post.date} {post.version ? `• ${post.version}` : ""}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight">{post.title}</h2>
            <p className="mt-4 text-lg text-white/70">{post.excerpt}</p>
            <a
              href={`/news/${post.slug}`}
              className="mt-8 inline-flex rounded-xl bg-accent px-5 py-3 text-base font-bold text-white transition hover:brightness-110"
              onClick={(event) => {
                event.preventDefault();
                onNavigate(`/news/${post.slug}`);
              }}
            >
              {messages.news.open}
            </a>
          </article>
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
      <main className="mx-auto min-h-screen w-full max-w-[920px] px-4 pb-20 pt-10 md:px-6">
        <header className="flex items-center justify-between gap-3">
          <a
            href="/news"
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 transition hover:text-white"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("/news");
            }}
          >
            {messages.news.backToNews}
          </a>
          <LanguageSwitcher />
        </header>
        <div className="mt-12 rounded-3xl border border-white/15 bg-white/5 p-8">
          <h1 className="text-4xl font-extrabold">{messages.news.notFound}</h1>
          <p className="mt-4 text-white/70">
            
          </p>
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
    <main className="mx-auto min-h-screen w-full max-w-[920px] px-4 pb-20 pt-10 md:px-6">
      <header className="flex items-center justify-between gap-3">
        <a
          href="/news"
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 transition hover:text-white"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/news");
          }}
        >
          {messages.news.backToNews}
        </a>
        <LanguageSwitcher />
      </header>

      <article className="mt-8 rounded-3xl border border-white/15 bg-white/[0.04] p-6 md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/55">
          {post.date} {post.version ? `• ${post.version}` : ""}
        </p>
        <h1 className="mt-2 text-4xl font-extrabold leading-tight md:text-5xl">
          {post.title}
        </h1>

        {articleState.loading && (
          <p className="mt-8 text-base text-white/55">{messages.news.articleLoading}</p>
        )}

        {articleState.error && (
          <p className="mt-8 text-base text-amber-300/95">{messages.news.articleError}</p>
        )}

        {articleState.markdown?.trim() ? (
          <NewsMarkdown markdown={articleState.markdown} assetBaseUrl={markdownAssetBaseUrl} />
        ) : (
          <>
            <section className="mt-8 space-y-4 text-lg text-white/80">
              {mergedDescription.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-extrabold">{messages.news.changes}</h2>
              <ul className="mt-4 space-y-3 text-white/85">
                {mergedChangelog.map((item, index) => (
                  <li
                    key={index}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
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
    async function loadReleaseVersion() {
      try {
        const response = await fetch(LATEST_RELEASE_API);
        if (!response.ok) return;
        const release = await response.json();
        if (release?.tag_name) {
          setReleaseVersion(String(release.tag_name).replace(/^v/i, ""));
        }
      } catch {
      }
    }

    loadReleaseVersion();
  }, []);

  function navigate(nextPath) {
    if (nextPath === window.location.pathname) return;
    const nextUrl = new URL(nextPath, window.location.origin);
    const lang = new URLSearchParams(window.location.search).get("lang");
    if (lang) {
      nextUrl.searchParams.set("lang", lang);
    }
    window.history.pushState({}, "", `${nextUrl.pathname}${nextUrl.search}`);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (path === "/news") {
    return (
      <>
        <AppSeo path={path} news={news} releaseVersion={releaseVersion} />
        <NewsListPage
          onNavigate={navigate}
          news={news}
          isLoading={newsLoading}
          loadError={newsLoadError}
        />
      </>
    );
  }

  if (path.startsWith("/news/")) {
    const slug = path.replace("/news/", "");
    return (
      <>
        <AppSeo path={path} news={news} releaseVersion={releaseVersion} />
        <NewsArticlePage slug={slug} onNavigate={navigate} news={news} />
      </>
    );
  }

  return (
    <>
      <AppSeo path={path} news={news} releaseVersion={releaseVersion} />
      <HomePage onNavigate={navigate} path={path} />
    </>
  );
}
