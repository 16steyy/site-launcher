import { useEffect, useMemo, useState } from "react";

import { STATUS } from "../../api/status";
import { useServiceStatus } from "../../hooks/useServiceStatus";
import { useI18n } from "../../i18n/I18nProvider";

const GROUP_ORDER = ["launcher", "web"];

const OVERALL_KEYS = {
  [STATUS.ok]: "operational",
  [STATUS.slow]: "degraded",
  major: "major",
};

const COMMUNITY_LINKS = [
  { href: "https://discord.gg/55Y95EfsHM", label: "Discord" },
  { href: "https://t.me/of16launcher", label: "Telegram" },
];

function RefreshIcon({ className = "h-4 w-4" }) {
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
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </svg>
  );
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function ServiceRow({ row }) {
  const { messages, t } = useI18n();
  const copy = messages.status || {};
  const service = copy.services?.[row.id] || {};
  const { result } = row;
  const errorText =
    result.status === STATUS.down && result.error
      ? copy.errors?.[result.error] || result.error
      : "";

  return (
    <li className="flex items-center gap-3 px-5 py-3.5 md:px-6">
      <span className={`status-dot is-${result.status}`} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-white">{service.name || row.id}</span>
        <span className="block truncate text-sm text-fg-faint">
          {errorText || service.description}
        </span>
      </span>
      {result.latency && result.status !== STATUS.down ? (
        <span className="hidden font-mono text-sm tabular-nums text-fg-faint sm:inline">
          {t("status.ms", { value: result.latency })}
        </span>
      ) : null}
      <span className={`status-label is-${result.status}`}>{copy.states?.[result.status]}</span>
    </li>
  );
}

export default function StatusPage() {
  const { messages, t } = useI18n();
  const copy = messages.status || {};
  const { rows, overall, checkedAt, isChecking, refresh } = useServiceStatus();
  const now = useNow();

  const groups = useMemo(
    () =>
      GROUP_ORDER.map((id) => ({ id, rows: rows.filter((row) => row.group === id) })).filter(
        (group) => group.rows.length
      ),
    [rows]
  );

  const overallKey = OVERALL_KEYS[overall] || "checking";
  const secondsAgo = checkedAt ? Math.max(0, Math.round((now - checkedAt) / 1000)) : null;

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 pb-24 pt-12 md:px-6 md:pt-16">
      <header className="text-center">
        <h1 className="page-title">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-fg-muted">{copy.subtitle}</p>
      </header>

      <section className="panel mt-10 overflow-hidden" aria-live="polite">
        <div className="flex items-center gap-3 px-5 py-5 md:px-6">
          <span className={`status-dot is-${overallKey}`} aria-hidden />
          <h2 className="min-w-0 flex-1 text-lg font-semibold text-white">
            {copy.overall?.[overallKey]}
          </h2>
          <span className="hidden text-sm text-fg-faint sm:inline">
            {secondsAgo === null
              ? null
              : secondsAgo < 3
                ? copy.checkedJustNow
                : t("status.checkedAgo", { seconds: secondsAgo })}
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={refresh}
            disabled={isChecking}
            aria-label={copy.refresh}
            title={copy.refresh}
          >
            <RefreshIcon className={`h-4 w-4${isChecking ? " animate-spin" : ""}`} />
          </button>
        </div>

        {groups.map((group) => (
          <div key={group.id} className="border-t border-white/[0.06]">
            <h3 className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-[0.12em] text-fg-faint md:px-6">
              {copy.groups?.[group.id]}
            </h3>
            <ul className="pb-2">
              {group.rows.map((row) => (
                <ServiceRow key={`${group.id}:${row.id}`} row={row} />
              ))}
            </ul>
          </div>
        ))}
      </section>

      <p className="mx-auto mt-8 max-w-xl text-center text-sm leading-relaxed text-fg-faint">
        {copy.footnote}{" "}
        {COMMUNITY_LINKS.map((link, index) => (
          <span key={link.href}>
            {index ? ` ${copy.or} ` : null}
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="text-fg-muted underline decoration-white/20 underline-offset-4 transition hover:text-white"
            >
              {link.label}
            </a>
          </span>
        ))}
        .
      </p>
    </main>
  );
}
