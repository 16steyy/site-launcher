import githubIcon from "../../assets/github.png";
import discordIcon from "../../assets/discord.png";
import telegramIcon from "../../assets/telegram.png";
import boostyIcon from "../../assets/boosty.png";
import { useEffect, useState } from "react";

import { checkService, getStatusServices, STATUS } from "../api/status";
import { useI18n } from "../i18n/I18nProvider";

function useApiPulse() {
  const [status, setStatus] = useState(STATUS.pending);
  useEffect(() => {
    let cancelled = false;
    const api = getStatusServices().find((service) => service.id === "api");
    checkService(api).then((result) => {
      if (!cancelled) setStatus(result.status);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return status;
}

const SOCIAL_LINKS = [
  { href: "https://github.com/launcherdev11", icon: githubIcon, label: "GitHub" },
  { href: "https://discord.gg/55Y95EfsHM", icon: discordIcon, label: "Discord" },
  { href: "https://t.me/of16launcher", icon: telegramIcon, label: "Telegram" },
  { href: "https://boosty.to/16steyy", icon: boostyIcon, label: "Boosty" },
];

export default function SiteFooter({ onNavigate }) {
  const { messages } = useI18n();
  const nav = messages.nav || {};
  const footer = messages.footer || {};
  const apiStatus = useApiPulse();

  const links = [
    { href: "/news", label: nav.news },
    { href: "/themes", label: nav.themes },
    { href: "/documentation", label: footer.documentation },
    { href: "/status", label: footer.status },
    { href: "/privacy", label: footer.privacy },
  ];

  return (
    <footer className="mt-auto border-t border-white/[0.06]">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5 font-bold text-white">
            <img src="/icon.png" alt="" width="24" height="24" className="h-6 w-6" />
            16Launcher
          </div>
          <p className="mt-3 text-sm leading-relaxed text-fg-faint">{footer.disclaimer}</p>
          <a
            href="/status"
            className="footer-status mt-4"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("/status");
            }}
          >
            <span className={`status-dot is-${apiStatus}`} aria-hidden />
            {footer.statusLabel?.[apiStatus] || footer.status}
          </a>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label={nav.pages}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-fg-muted transition hover:text-white"
              onClick={(event) => {
                event.preventDefault();
                onNavigate(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {SOCIAL_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              aria-label={item.label}
              title={item.label}
              className="icon-btn border border-white/[0.08] bg-ink-2 hover:border-white/15"
            >
              <img src={item.icon} alt="" className="h-5 w-5 opacity-80" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
