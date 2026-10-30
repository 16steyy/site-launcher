import { useEffect, useState } from "react";

import githubIcon from "../../assets/github.png";
import discordIcon from "../../assets/discord.png";
import telegramIcon from "../../assets/telegram.png";
import boostyIcon from "../../assets/boosty.png";
import {
  BOOSTY_URL,
  DISCORD_INVITE_URL,
  fetchDiscordCounts,
  GITHUB_REPO_URL,
  TELEGRAM_URL,
} from "../api/community";
import { useI18n } from "../i18n/I18nProvider";

function useDiscordCounts() {
  const [counts, setCounts] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchDiscordCounts({ signal: controller.signal })
      .then(setCounts)
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return counts;
}

export default function CommunitySection({ stars, version }) {
  const { locale, messages, t } = useI18n();
  const content = messages.community || {};
  const discord = useDiscordCounts();
  const format = (value) => new Intl.NumberFormat(locale).format(value);

  const cards = [
    {
      id: "discord",
      href: DISCORD_INVITE_URL,
      icon: discordIcon,
      stat: discord?.members
        ? {
            text: t("community.discordStat", {
              members: format(discord.members),
              online: format(discord.online),
            }),
            live: true,
          }
        : null,
    },
    { id: "telegram", href: TELEGRAM_URL, icon: telegramIcon },
    {
      id: "github",
      href: GITHUB_REPO_URL,
      icon: githubIcon,
      stat:
        stars > 0
          ? { text: [`★ ${format(stars)}`, version && `v${version}`].filter(Boolean).join(" · ") }
          : null,
    },
    { id: "boosty", href: BOOSTY_URL, icon: boostyIcon },
  ];

  return (
    <section id="community" className="scroll-anchor py-16 md:py-20">
      <h2 className="section-title reveal reveal-scroll text-center">{content.title}</h2>
      <p className="reveal reveal-scroll mx-auto mt-4 max-w-2xl text-balance text-center text-fg-muted">
        {content.subtitle}
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const text = content.cards?.[card.id] || {};
          return (
            <a
              key={card.id}
              href={card.href}
              target="_blank"
              rel="noreferrer"
              className="community-card card card-hover reveal reveal-scroll group flex flex-col p-5"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="inv-slot inv-slot-sm" aria-hidden>
                  <img src={card.icon} alt="" className="h-5 w-5" />
                </span>
                <h3 className="text-base font-semibold text-white">{text.title}</h3>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-fg-muted">{text.text}</p>
              {card.stat ? (
                <p className="mt-4 flex items-center gap-2 text-sm tabular-nums text-fg">
                  {card.stat.live ? <span className="status-dot is-operational" aria-hidden /> : null}
                  {card.stat.text}
                </p>
              ) : null}
              <span className="mt-4 text-sm font-semibold text-accent-hi transition group-hover:text-white">
                {text.action} →
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
