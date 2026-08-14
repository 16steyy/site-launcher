import LanguageSwitcher from "./LanguageSwitcher";
import AccountAvatar from "./AccountAvatar";
import { useI18n } from "../i18n/I18nProvider";

const NAV_LINKS = [
  { href: "/", key: "home", match: (path) => path === "/" },
  { href: "/news", key: "news", match: (path) => path.startsWith("/news") },
  { href: "/themes", key: "themes", match: (path) => path.startsWith("/themes") },
];

export default function SiteHeader({ path, onNavigate, user, accountLabel }) {
  const { messages } = useI18n();
  const nav = messages.nav || {};

  return (
    <header className="mb-10 flex flex-wrap items-center justify-between gap-3">
      <nav className="flex flex-wrap items-center gap-2">
        {NAV_LINKS.map(({ href, key, match }) => (
          <a
            key={href}
            href={href}
            className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
              match(path)
                ? "border-accent/40 bg-accent/15 text-white"
                : "border-white/20 bg-white/5 text-white/80 hover:text-white"
            }`}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(href);
            }}
          >
            {key === "themes" ? messages.themes?.nav || nav.themes : nav[key]}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <a
          href="/account"
          className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-bold transition ${
            path === "/account"
              ? "border-accent/40 bg-accent/15 text-white"
              : "border-white/20 bg-white/5 text-white/80 hover:text-white"
          }`}
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/account");
          }}
        >
          {user ? (
            <AccountAvatar user={user} size={24} className="h-6 w-6 shrink-0 overflow-hidden rounded-md" />
          ) : null}
          <span>{user?.nickname || accountLabel || messages.account?.title || "Account"}</span>
        </a>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
