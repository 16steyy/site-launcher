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

const FALLBACK_RELEASES_URL =
  "https://github.com/launcherdev11/rust-launcher/releases";
const LATEST_RELEASE_API =
  "https://api.github.com/repos/launcherdev11/rust-launcher/releases/latest";

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
];

const CHARACTER_SHOT_CLASSES =
  "h-auto w-full max-w-[500px] object-contain object-bottom md:max-h-[min(600px,82vh)] md:max-w-[min(860px,38vw)]";

const CHARACTER_WRAP_DEFAULT_CLASSES =
  "relative flex min-h-[260px] flex-[1_1_28%] flex-col items-center justify-end px-1 md:min-h-0 md:basis-[28%] md:justify-end md:px-2";

const CHARACTER_SHOT_CLASSES_STYLE_RUN =
  "h-auto w-full max-w-[980px] object-contain object-bottom md:max-h-[min(1020px,86vh)] md:max-w-[min(980px,45vw)]";

const CHARACTER_WRAP_CLASSES_STYLE_RUN =
  "relative flex min-h-[300px] flex-[1_1_33%] flex-col items-center justify-end px-1 md:min-h-0 md:basis-[33%] md:justify-end md:px-2";

const FEATURES = [
  {
    title: "Оптимизация",
    text: "Максимальная оптимизация, лаунчер будет работать даже на слабых ПК.",
    icon: rocketIcon,
  },
  {
    title: "Контент",
    text: "Удобный поиск контента прямо в лаунчере, а также простое создание и управление сборками.",
    icon: modsIcon,
  },
  {
    title: "Безопасность",
    text: "Лаунчер абсолютно безопасен: он не содержит вредоносного ПО. Кроме того, его исходный код открыт.",
    icon: shieldIcon,
  },
];

const SHOTS = [
  {
    id: "mods",
    headlinePosition: "top",
    headingAlign: "center",
    lines: [
      { accent: "Скачивание", rest: "контента прямо в лаунчере." },
      { accent: "Удобный", rest: "поиск, фильтры, простор для ваших сборок!" },
    ],
    image: modsShot,
    character: coolCharacter,
    characterClasses: CHARACTER_SHOT_CLASSES,
  },
  {
    id: "settings",
    headlinePosition: "top",
    accentPart: "Настройка внешнего вида под ваш вкус.",
    restPart: "Самовыражайтесь!",
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
    lines: [
      {
        accent: "Удобное",
        rest: "управление профилями, создание сборок и их настройка.",
      },
    ],
    image: modpacksShot,
    character: armCharacter,
    characterClasses: CHARACTER_SHOT_CLASSES,
  },
  {
    id: "java",
    headlinePosition: "top",
    accentPart: "Детальная",
    restPart: "настройка игры под ваши нужды.",
    image: javaShot,
    character: runCharacter,
    characterClasses: CHARACTER_SHOT_CLASSES_STYLE_RUN,
    characterWrapClasses: CHARACTER_WRAP_CLASSES_STYLE_RUN,
    headingAlign: "center",
  },
];

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

export default function App() {
  const [linuxOpen, setLinuxOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [userOS, setUserOS] = useState("unknown");
  const [lightboxImage, setLightboxImage] = useState(null);
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

  const mainDownloadLink = useMemo(() => {
    if (userOS === "windows") return links.windows;
    return FALLBACK_RELEASES_URL;
  }, [links.windows, userOS]);

  const downloadBaseDelay = 260 + SHOTS.length * 180;

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

  function handleFeatureCursor(event, index) {
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
    setActiveFeature(index);
  }

  function resetFeatureCursor(event) {
    const card = event.currentTarget;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    setActiveFeature(null);
  }

  return (
    <main className="w-full min-w-0 pb-16 pt-10">
      <div className="mx-auto max-w-[1240px] px-4 md:px-6">
        <section className="py-16 text-center md:py-24">
          <h1
            className="reveal text-5xl font-extrabold tracking-tight md:text-7xl"
            style={{ animationDelay: "120ms" }}
          >
            16Launcher
          </h1>
          <p
            className="reveal mt-3 text-2xl font-semibold text-white/70 md:text-4xl"
            style={{ animationDelay: "200ms" }}
          >
            Лучший выбор для игры в Minecraft
          </p>
          <a
            href={mainDownloadLink}
            className="reveal interactive-cta mx-auto mt-12 inline-flex min-w-72 items-center justify-center rounded-2xl bg-accent px-8 py-5 text-2xl font-bold text-white shadow-glow"
            style={{ animationDelay: "280ms" }}
          >
            <span className="relative z-[1]">Установить лаунчер</span>
          </a>
        </section>

        <section className="py-20 md:py-28">
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <article
                key={feature.title}
                className={`reveal glass interactive-feature-card rounded-3xl p-8 text-center ${
                  activeFeature === i ? "is-active" : ""
                }`}
                style={{ animationDelay: `${120 + i * 120}ms` }}
                onMouseMove={(event) => handleFeatureCursor(event, i)}
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

      {SHOTS.map((section, index) => {
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

        const baseDelay = 260 + index * 180;

        return (
          <section
            key={section.id}
            className={`feature-shot-section relative isolate w-full overflow-hidden py-20 md:py-28 ${
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
                className={`${headlineBlock} ${headlineMarginBottom} reveal`}
                style={{ animationDelay: `${baseDelay}ms` }}
              >
                {renderShotHeadline(section)}
              </h2>
            )}

            <div className={sectionPad}>
              <div
                className={`glass relative reveal flex w-full max-w-[min(1920px,100%)] flex-col gap-4 rounded-2xl p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] md:flex-row md:items-stretch md:gap-0 md:p-5 ${
                  biasLeft ? "ml-0 mr-auto" : "ml-auto mr-0"
                }`}
                style={{ animationDelay: `${baseDelay + 120}ms` }}
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
                    onClick={() => setLightboxImage(section.image)}
                  >
                    <img
                      src={section.image}
                      alt=""
                      className="h-full w-full rounded-xl object-cover object-left-top shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/0 opacity-0 transition-opacity duration-200 group-hover:bg-black/35 group-hover:opacity-100" />
                  </button>
                </div>
              </div>
            </div>

            {!headlineTop && (
              <h2
                className={`${headlineBlock} ${headlineMarginTop} reveal`}
                style={{ animationDelay: `${baseDelay}ms` }}
              >
                {renderShotHeadline(section)}
              </h2>
            )}
          </section>
        );
      })}

      {lightboxImage && (
        <div
          className="lightbox-backdrop"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={lightboxImage} alt="" className="lightbox-image" />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1240px] px-4 md:px-6">
        <section className="py-24 md:py-32">
          <h2
            className="reveal text-center text-6xl font-extrabold"
            style={{ animationDelay: `${downloadBaseDelay}ms` }}
          >
            Скачать
          </h2>
          <div className="mx-auto mt-12 max-w-5xl space-y-5">
            <a
              href={links.windows}
              className="glass reveal interactive-row flex items-center justify-between rounded-3xl px-7 py-5"
              style={{ animationDelay: `${downloadBaseDelay + 80}ms` }}
            >
              <div className="flex items-center gap-4">
                <img src={windowsIcon} alt="" className="h-9 w-9" />
                <span className="text-5xl font-extrabold">Windows</span>
                {userOS === "windows" && (
                  <span className="rounded-full bg-accent px-3 py-1 text-sm font-bold">
                    для вас
                  </span>
                )}
              </div>
              <span className="rounded-full bg-accent px-10 py-3 text-2xl font-bold">
                Установить
              </span>
            </a>

            <a
              href={links.macos}
              className="glass reveal interactive-row flex items-center justify-between rounded-3xl px-7 py-5"
              style={{ animationDelay: `${downloadBaseDelay + 160}ms` }}
            >
              <div className="flex items-center gap-4">
                <img src={macosIcon} alt="" className="h-9 w-9" />
                <span className="text-5xl font-extrabold">macOS</span>
                {userOS === "macos" && (
                  <span className="rounded-full bg-accent px-3 py-1 text-sm font-bold">
                    для вас
                  </span>
                )}
              </div>
              <span className="rounded-full bg-accent px-10 py-3 text-2xl font-bold">
                Установить
              </span>
            </a>

            <div
              className="glass rounded-3xl px-7 py-5 reveal"
              style={{ animationDelay: `${downloadBaseDelay + 240}ms` }}
            >
              <button
                onClick={() => setLinuxOpen((prev) => !prev)}
                className="interactive-row flex w-full items-center justify-between rounded-2xl"
              >
                <span className="flex items-center gap-4">
                  <img src={linuxIcon} alt="" className="h-9 w-9" />
                  <span className="text-5xl font-extrabold">Linux</span>
                  {userOS === "linux" && (
                    <span className="rounded-full bg-accent px-3 py-1 text-sm font-bold">
                      рекомендовано
                    </span>
                  )}
                </span>
                <span className="rounded-full bg-accent px-10 py-3 text-2xl font-bold">
                  {linuxOpen ? "Скрыть" : "Выбрать"}
                </span>
              </button>

              {linuxOpen && (
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <a
                    href={links.linuxDeb}
                    className="interactive-row rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-center text-xl font-bold reveal"
                    style={{ animationDelay: `${downloadBaseDelay + 360}ms` }}
                  >
                    .deb
                  </a>
                  <a
                    href={links.linuxRpm}
                    className="interactive-row rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-center text-xl font-bold reveal"
                    style={{ animationDelay: `${downloadBaseDelay + 420}ms` }}
                  >
                    .rpm
                  </a>
                  <a
                    href={links.linuxAppImage}
                    className="interactive-row rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-center text-xl font-bold reveal"
                    style={{ animationDelay: `${downloadBaseDelay + 480}ms` }}
                  >
                    .AppImage
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="pt-4 text-center text-base font-semibold text-white/60">
          16Launcher не является официальным продуктом Mojang или Microsoft.

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
