import LanguageSwitcher from "./LanguageSwitcher";
import AccountAvatar from "./AccountAvatar";
import SectionNav from "./SectionNav";
import { useI18n } from "../i18n/I18nProvider";

const NAV_LINKS = [
  { href: "/", key: "home", match: (path) => path === "/" },
  { href: "/news", key: "news", match: (path) => path.startsWith("/news") },
  { href: "/themes", key: "themes", match: (path) => path.startsWith("/themes") },
];

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export default function SiteHeader({ path, onNavigate, user, sections }) {
  const { messages } = useI18n();
  const nav = messages.nav || {};

  function go(event, href) {
    event.preventDefault();
    onNavigate(href);
  }

  const pageLinks = NAV_LINKS.map(({ href, key, match }) => (
    <a
      key={href}
      href={href}
      className={`site-nav-link ${match(path) ? "is-active" : ""}`}
      aria-current={match(path) ? "page" : undefined}
      onClick={(event) => go(event, href)}
    >
      {nav[key]}
    </a>
  ));

  const accountActive = path === "/account";

  return (
    <header className="site-header">
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center gap-4 px-4 md:px-6">
        <a
          href="/"
          className="site-logo flex shrink-0 items-center gap-2.5 text-[1.05rem] font-bold tracking-tight text-white"
          onClick={(event) => go(event, "/")}
        >
          <img src="/icon.png" alt="" width="28" height="28" className="h-7 w-7" />
          16Launcher
        </a>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label={nav.pages}>
          {pageLinks}
        </nav>

        {sections?.length ? (
          <>
            <span className="hidden h-5 w-px bg-white/10 xl:block" aria-hidden />
            <SectionNav
              className="hidden xl:flex"
              sections={sections}
              ariaLabel={nav.sections}
            />
          </>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <a
            href="/account"
            className={`btn btn-sm h-9 gap-2 px-2.5 ${accountActive ? "btn-tint" : "btn-soft"}`}
            aria-label={user?.nickname || messages.account?.title}
            onClick={(event) => go(event, "/account")}
          >
            {user ? (
              <AccountAvatar user={user} size={20} className="h-5 w-5 shrink-0 overflow-hidden rounded" />
            ) : (
              <UserIcon />
            )}
            <span className="hidden max-w-[9rem] truncate sm:inline">
              {user?.nickname || messages.account?.login}
            </span>
          </a>
        </div>
      </div>

      <nav
        className="site-nav-scroll flex items-center gap-0.5 overflow-x-auto border-t border-white/[0.06] px-3 py-1.5 md:hidden"
        aria-label={nav.pages}
      >
        {pageLinks}
      </nav>
    </header>
  );
}
