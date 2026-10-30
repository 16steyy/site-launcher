import { useMemo, useState } from "react";

import accountIcon from "../../assets/launcher-icons/account.svg";
import displayIcon from "../../assets/launcher-icons/display.svg";
import exportIcon from "../../assets/launcher-icons/export.svg";
import groupIcon from "../../assets/launcher-icons/group.svg";
import javaIcon from "../../assets/launcher-icons/java.svg";
import modpackIcon from "../../assets/launcher-icons/modpack_icon.svg";
import modsIcon from "../../assets/launcher-icons/mods.svg";
import paletteIcon from "../../assets/launcher-icons/palette.svg";
import playIcon from "../../assets/launcher-icons/play.svg";
import settingsIcon from "../../assets/launcher-icons/settings.svg";
import storageIcon from "../../assets/launcher-icons/storage.svg";
import versionsIcon from "../../assets/launcher-icons/versions.svg";

import { useI18n } from "../i18n/I18nProvider";

const GROUP_ICONS = {
  versions: versionsIcon,
  java: javaIcon,
  launch: playIcon,
  diagnostics: displayIcon,
  profiles: modpackIcon,
  mods: modsIcon,
  worlds: storageIcon,
  transfer: exportIcon,
  accounts: accountIcon,
  platform: groupIcon,
  appearance: paletteIcon,
  comfort: settingsIcon,
};

const COLLAPSED_ITEMS = 3;

function GroupIcon({ id }) {
  const src = GROUP_ICONS[id] || GROUP_ICONS.profiles;
  return <span className="launcher-icon h-6 w-6" style={{ "--icon": `url("${src}")` }} aria-hidden />;
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="caps-search-icon h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function Highlight({ text, query }) {
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="caps-mark">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

export default function CapabilitiesSection() {
  const { messages, t } = useI18n();
  const content = messages.capabilities || {};
  const groups = useMemo(
    () => (Array.isArray(content.groups) ? content.groups : []),
    [content.groups]
  );
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());

  const normalizedQuery = query.trim().toLowerCase();
  const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);

  const visibleGroups = useMemo(() => {
    if (!normalizedQuery) return groups;
    return groups
      .map((group) => {
        if (group.title.toLowerCase().includes(normalizedQuery)) return group;
        const items = group.items.filter((item) => item.toLowerCase().includes(normalizedQuery));
        return items.length ? { ...group, items } : null;
      })
      .filter(Boolean);
  }, [groups, normalizedQuery]);

  if (!groups.length) return null;

  function toggleGroup(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <section id="capabilities" className="scroll-anchor mx-auto max-w-[1240px] px-4 py-14 md:px-6 md:py-20">
      <h2 className="section-title reveal reveal-scroll text-center">{content.title}</h2>
      <p className="reveal reveal-scroll mx-auto mt-4 max-w-2xl text-balance text-center text-fg-muted">
        {content.subtitle}
      </p>

      <div
        className="reveal reveal-scroll mx-auto mt-8 flex max-w-3xl flex-col items-center gap-4 sm:flex-row"
        style={{ animationDelay: "40ms" }}
      >
        <label className="caps-search w-full flex-1">
          <span className="sr-only">{content.searchLabel}</span>
          <SearchIcon />
          <input
            type="search"
            className="input pl-10"
            value={query}
            placeholder={content.searchPlaceholder}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <p className="shrink-0 text-sm text-fg-faint">
          {t("capabilities.counter", { groups: groups.length, items: totalItems })}
        </p>
      </div>

      <div className="caps-grid reveal reveal-scroll mt-8" style={{ animationDelay: "80ms" }}>
        {visibleGroups.map((group) => {
          const isExpanded = expanded.has(group.id) || Boolean(normalizedQuery);
          const hiddenCount = Math.max(0, group.items.length - COLLAPSED_ITEMS);
          return (
            <article key={group.id} className={`caps-card card ${isExpanded ? "is-expanded" : ""}`}>
              <header className="flex items-center gap-3.5">
                <span className="inv-slot" aria-hidden>
                  <GroupIcon id={group.id} />
                  <span className="inv-slot-count">{group.items.length}</span>
                </span>
                <h3 className="text-lg font-semibold leading-snug text-white">
                  <Highlight text={group.title} query={normalizedQuery} />
                </h3>
              </header>
              <ul className="caps-list">
                {group.items.map((item, index) => (
                  <li key={item} className={index >= COLLAPSED_ITEMS ? "caps-item-extra" : undefined}>
                    <Highlight text={item} query={normalizedQuery} />
                  </li>
                ))}
              </ul>
              {hiddenCount > 0 && !normalizedQuery ? (
                <button
                  type="button"
                  className="caps-more"
                  aria-expanded={isExpanded}
                  onClick={() => toggleGroup(group.id)}
                >
                  {isExpanded ? content.showLess : t("capabilities.showMore", { count: hiddenCount })}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>

      {!visibleGroups.length ? (
        <p className="mt-10 text-center text-fg-muted">
          {t("capabilities.nothingFound", { query: query.trim() })}
        </p>
      ) : null}
    </section>
  );
}
