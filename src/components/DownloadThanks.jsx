import { useEffect, useRef } from "react";

import githubIcon from "../../assets/github.png";
import discordIcon from "../../assets/discord.png";
import telegramIcon from "../../assets/telegram.png";
import { DISCORD_INVITE_URL, GITHUB_REPO_URL, TELEGRAM_URL } from "../api/community";
import { useI18n } from "../i18n/I18nProvider";

export const LIBRIUM_URL = "https://libriumhub.com/project/16Launcher";

function StarIcon({ className = "h-5 w-5" }) {
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
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </svg>
  );
}

function NewspaperIcon({ className = "h-5 w-5" }) {
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
      <path d="M15 18h-5" />
      <path d="M18 14h-8" />
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2" />
      <rect width="8" height="4" x="10" y="6" rx="1" />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function osInstallKey(linkKey) {
  if (linkKey === "macos") return "macos";
  if (linkKey?.startsWith("linux")) return "linux";
  return "windows";
}

export default function DownloadThanks({ download, latestPost, onClose, onNavigate }) {
  const { messages, localePath } = useI18n();
  const content = messages.thanks || {};
  const cards = content.cards || {};
  const closeRef = useRef(null);

  useEffect(() => {
    if (!download) return undefined;
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [download, onClose]);

  if (!download) return null;

  const social = [
    { id: "discord", href: DISCORD_INVITE_URL, icon: discordIcon },
    { id: "telegram", href: TELEGRAM_URL, icon: telegramIcon },
    { id: "github", href: GITHUB_REPO_URL, icon: githubIcon },
  ];

  const newsTarget = latestPost ? `/news/${latestPost.slug}` : "/news";

  return (
    <div
      className="thanks-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="thanks-title"
    >
      <button
        ref={closeRef}
        type="button"
        className="icon-btn thanks-close"
        onClick={onClose}
        aria-label={content.closeLabel}
        title={content.closeLabel}
      >
        <CloseIcon />
      </button>

      {/* Вне .thanks-inner: у него transform в анимации, и fixed-позиция считалась бы от него */}
      <div className="mc-toast" aria-hidden>
        <span className="inv-slot inv-slot-sm">
          <img src="/icon.png" alt="" className="h-6 w-6" />
        </span>
        <span className="min-w-0 text-left">
          <span className="mc-toast-title">{content.toastTitle}</span>
          <span className="mc-toast-text">{content.toastText}</span>
        </span>
      </div>

      <div className="thanks-inner mx-auto w-full max-w-[880px] px-4 pb-16 pt-24 md:px-6 md:pt-28">
        <h1 id="thanks-title" className="page-title text-balance text-center">
          {content.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-center text-lg text-fg-muted">
          {content.install?.[osInstallKey(download.key)]}
        </p>
        <p className="mt-3 text-center text-sm text-fg-faint">
          {content.notStarted}{" "}
          <a
            href={download.href}
            className="text-fg-muted underline decoration-white/20 underline-offset-4 transition hover:text-white"
          >
            {content.retry}
          </a>
        </p>

        <h2 className="mt-14 text-center text-sm font-semibold uppercase tracking-[0.14em] text-fg-faint">
          {content.whileWaiting}
        </h2>

        <a
          href={LIBRIUM_URL}
          target="_blank"
          rel="noreferrer"
          className="card card-hover thanks-feature group mt-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center md:p-6"
        >
          <span className="inv-slot shrink-0 text-amber-300" aria-hidden>
            <StarIcon className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-semibold text-white">{cards.librium?.title}</span>
            <span className="mt-1 block text-sm leading-relaxed text-fg-muted">
              {cards.librium?.text}
            </span>
          </span>
          <span className="btn btn-accent shrink-0">{cards.librium?.action}</span>
        </a>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {social.map((item) => {
            const text = cards[item.id] || {};
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="card card-hover group flex items-start gap-4 p-5"
              >
                <span className="inv-slot inv-slot-sm" aria-hidden>
                  <img src={item.icon} alt="" className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-white">{text.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-fg-muted">{text.text}</span>
                  <span className="mt-3 block text-sm font-semibold text-accent-hi transition group-hover:text-white">
                    {text.action} →
                  </span>
                </span>
              </a>
            );
          })}

          <a
            href={localePath(newsTarget)}
            className="card card-hover group flex items-start gap-4 p-5"
            onClick={(event) => {
              event.preventDefault();
              onClose();
              onNavigate(newsTarget);
            }}
          >
            <span className="inv-slot inv-slot-sm" aria-hidden>
              <NewspaperIcon />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-white">{cards.news?.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-fg-muted">
                {latestPost?.title || cards.news?.text}
              </span>
              <span className="mt-3 block text-sm font-semibold text-accent-hi transition group-hover:text-white">
                {cards.news?.action} →
              </span>
            </span>
          </a>
        </div>

        <div className="mt-12 text-center">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {content.close}
          </button>
        </div>
      </div>
    </div>
  );
}
