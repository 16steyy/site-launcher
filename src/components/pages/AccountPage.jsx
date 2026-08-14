import { lazy, Suspense, useEffect, useMemo, useState } from "react";

import { ensureValidAccessToken } from "../../api/auth.js";
import { fetchMySubmissions, fetchThemesCatalog } from "../../api/themes.js";
import { useAuth } from "../../hooks/useAuth.js";
import SiteHeader from "../SiteHeader";
import AccountAvatar from "../AccountAvatar";
import { useI18n } from "../../i18n/I18nProvider";

const SkinPreview3d = lazy(() => import("../SkinPreview3d.jsx"));

function getReturnPath() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("return");
  if (value && value.startsWith("/")) return value;
  return "/themes/upload";
}

function normalizeAuthor(value) {
  return String(value || "").trim().toLowerCase();
}

function ThemeStatusBadge({ status, copy }) {
  const labels = {
    pending: copy.statusPending,
    approved: copy.statusApproved,
    rejected: copy.statusRejected,
  };
  const styles = {
    pending: "border-amber-400/35 bg-amber-500/15 text-amber-100",
    approved: "border-emerald-400/35 bg-emerald-500/15 text-emerald-100",
    rejected: "border-red-400/35 bg-red-500/15 text-red-100",
  };

  const key = status in labels ? status : "pending";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider ${styles[key]}`}
    >
      {labels[key]}
    </span>
  );
}

function UserThemeCard({ theme, copy }) {
  const isPublished = theme.status === "approved" || !theme.status;

  return (
    <article className="account-theme-card group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="relative aspect-video w-full overflow-hidden bg-white/[0.04]">
        {theme.preview ? (
          <img
            src={theme.preview}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 text-sm font-bold text-white/30">
            16Launcher
          </div>
        )}
        <div className="absolute left-3 top-3">
          <ThemeStatusBadge status={theme.status || "approved"} copy={copy} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="text-lg font-extrabold leading-tight">{theme.name}</h3>
        {theme.version && (
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/40">
            v{theme.version}
          </p>
        )}
        {theme.description && (
          <p className="mt-2 flex-1 text-sm text-white/65 line-clamp-2">{theme.description}</p>
        )}
        {isPublished && theme.download && (
          <a
            href={theme.download}
            download
            className="interactive-cta mt-4 inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white"
          >
            {copy.downloadTheme}
          </a>
        )}
        {!isPublished && theme.submitted_at && (
          <p className="mt-3 text-xs text-white/40">
            {copy.submittedAt}: {theme.submitted_at}
          </p>
        )}
      </div>
    </article>
  );
}

export default function AccountPage({ onNavigate, path, user }) {
  const { messages, t } = useI18n();
  const copy = messages.account || {};
  const { login, register, logout, loading } = useAuth();

  const [tab, setTab] = useState("login");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const [loginForm, setLoginForm] = useState({ login: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    nickname: "",
    email: "",
    password: "",
    verification_code: "",
  });

  const [userThemes, setUserThemes] = useState([]);
  const [themesLoading, setThemesLoading] = useState(false);

  useEffect(() => {
    if (!user?.nickname) {
      setUserThemes([]);
      return;
    }

    let cancelled = false;

    async function loadUserThemes() {
      setThemesLoading(true);
      try {
        const catalog = await fetchThemesCatalog();
        const nickname = normalizeAuthor(user.nickname);

        const published = catalog
          .filter((theme) => normalizeAuthor(theme.author) === nickname)
          .map((theme) => ({ ...theme, status: "approved" }));

        const token = await ensureValidAccessToken();
        let pending = [];
        if (token) {
          const submissions = await fetchMySubmissions(token);
          pending = submissions
            .filter((item) => item.status !== "approved")
            .map((item) => ({
              id: item.theme_id || item.id,
              name: item.name,
              status: item.status || "pending",
              submitted_at: item.submitted_at || item.created_at,
              preview: item.preview || null,
              version: item.version || null,
              description: item.description || "",
            }));
        }

        const publishedIds = new Set(published.map((theme) => theme.id));
        const merged = [
          ...published,
          ...pending.filter((item) => !publishedIds.has(item.id)),
        ];

        if (!cancelled) setUserThemes(merged);
      } catch {
        if (!cancelled) setUserThemes([]);
      } finally {
        if (!cancelled) setThemesLoading(false);
      }
    }

    void loadUserThemes();
    return () => {
      cancelled = true;
    };
  }, [user?.nickname]);

  const themeCount = userThemes.length;
  const publishedCount = useMemo(
    () => userThemes.filter((theme) => theme.status === "approved" || !theme.status).length,
    [userThemes]
  );

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);

    const result = await login(loginForm, messages);
    setSubmitting(false);

    if (result.ok) {
      onNavigate(getReturnPath());
      return;
    }

    setFormError(result.error);
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);

    const payload = {
      nickname: registerForm.nickname.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
    };
    if (registerForm.verification_code.trim()) {
      payload.verification_code = registerForm.verification_code.trim();
    }

    const result = await register(payload, messages);
    setSubmitting(false);

    if (result.ok) {
      onNavigate(getReturnPath());
      return;
    }

    setNeedsVerification(Boolean(result.needsVerification));
    setFormError(result.error);
  }

  async function handleLogout() {
    await logout();
    setLoginForm({ login: "", password: "" });
    setRegisterForm({
      nickname: "",
      email: "",
      password: "",
      verification_code: "",
    });
  }

  return (
    <main className="account-page mx-auto min-h-screen w-full max-w-[1100px] px-4 pb-20 pt-10 md:px-6">
      <SiteHeader path={path} onNavigate={onNavigate} user={user} />

      <section className="relative text-center">
        <div className="account-hero-glow pointer-events-none" aria-hidden />
        <h1 className="hero-title text-5xl font-extrabold tracking-tight md:text-6xl">
          {copy.title}
        </h1>
        {user && (
          <p className="mx-auto mt-3 max-w-lg text-base text-white/55 md:text-lg">
            {copy.profileSubtitle}
          </p>
        )}
      </section>

      {loading ? (
        <p className="mt-10 text-center text-white/50">…</p>
      ) : user ? (
        <div className="mt-10 space-y-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-stretch">
            <div className="account-profile-card shot-glass-panel relative overflow-hidden rounded-3xl p-6 md:p-8">
              <div className="account-card-shimmer pointer-events-none" aria-hidden />
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/45">
                    {copy.loggedInAs || copy.nickname}
                  </p>
                  <span className="account-online-dot" title={copy.online} aria-hidden />
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div className="account-avatar-ring shrink-0 rounded-2xl p-[2px]">
                    <AccountAvatar
                      user={user}
                      size={64}
                      className="h-16 w-16 overflow-hidden rounded-[14px]"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="account-nickname-gradient truncate text-3xl font-extrabold md:text-4xl">
                      {user.nickname}
                    </p>
                    {user.email && (
                      <p className="mt-1 truncate text-sm text-white/50">{user.email}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="account-stat-pill">
                    {t("account.themesCount", { count: themeCount })}
                  </span>
                  {publishedCount > 0 && (
                    <span className="account-stat-pill account-stat-pill--accent">
                      {t("account.publishedCount", { count: publishedCount })}
                    </span>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate("/themes/upload")}
                    className="interactive-cta rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white"
                  >
                    {copy.uploadTheme}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="interactive-row rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/75 transition hover:text-white"
                  >
                    {copy.logout}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <p className="mb-3 text-center text-sm font-bold uppercase tracking-wider text-white/40 lg:text-left">
                {copy.skinPreview || "3D skin"}
              </p>
              <Suspense
                fallback={
                  <div className="flex h-[min(420px,50vh)] flex-1 items-center justify-center rounded-3xl border border-white/15 bg-black/40 text-white/40">
                    …
                  </div>
                }
              >
                <SkinPreview3d
                  user={user}
                  interactive={false}
                  className="account-skin-frame relative flex h-[min(420px,50vh)] w-full flex-1 flex-col overflow-hidden rounded-3xl border border-white/15 bg-black/40 shadow-xl"
                />
              </Suspense>
              <p className="mt-2 text-center text-xs text-white/35 lg:text-left">
                {copy.skinPreviewHint}
              </p>
            </div>
          </div>

          <section className="reveal">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold md:text-3xl">{copy.myWorks}</h2>
                <p className="mt-1 text-sm text-white/50">{copy.myWorksSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("/themes")}
                className="text-sm font-bold text-accent transition hover:brightness-125"
              >
                {copy.browseAllThemes} →
              </button>
            </div>

            {themesLoading && (
              <p className="rounded-2xl border border-white/10 bg-white/[0.03] py-10 text-center text-white/45">
                …
              </p>
            )}

            {!themesLoading && userThemes.length === 0 && (
              <div className="account-empty-works shot-glass-panel rounded-3xl p-8 text-center md:p-10">
                <p className="text-xl font-semibold text-white/80">{copy.myWorksEmpty}</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/55">{copy.myWorksEmptyHint}</p>
                <button
                  type="button"
                  onClick={() => onNavigate("/themes/upload")}
                  className="interactive-cta mt-6 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white"
                >
                  {copy.uploadTheme}
                </button>
              </div>
            )}

            {!themesLoading && userThemes.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {userThemes.map((theme) => (
                  <UserThemeCard
                    key={theme.id}
                    theme={theme}
                    copy={copy}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <>
          <div className="mt-8 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setFormError("");
              }}
              className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                tab === "login"
                  ? "bg-accent text-white"
                  : "border border-white/20 bg-white/5 text-white/70"
              }`}
            >
              {copy.login}
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setFormError("");
              }}
              className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                tab === "register"
                  ? "bg-accent text-white"
                  : "border border-white/20 bg-white/5 text-white/70"
              }`}
            >
              {copy.register}
            </button>
          </div>

          {tab === "login" ? (
            <form
              className="mt-8 space-y-5 rounded-3xl border border-white/15 bg-white/[0.04] p-6 md:p-8"
              onSubmit={handleLoginSubmit}
            >
              <div>
                <label htmlFor="login-field" className="block text-sm font-bold text-white/80">
                  {copy.loginField || copy.login}
                </label>
                <input
                  id="login-field"
                  type="text"
                  required
                  autoComplete="username"
                  value={loginForm.login}
                  disabled={submitting}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, login: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-accent/50"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-bold text-white/80">
                  {copy.password}
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={loginForm.password}
                  disabled={submitting}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-accent/50"
                />
              </div>
              {formError && (
                <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
                  {formError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="interactive-cta w-full rounded-xl bg-accent px-6 py-3 text-base font-bold text-white disabled:opacity-60"
              >
                {copy.loginSubmit}
              </button>
            </form>
          ) : (
            <form
              className="mt-8 space-y-5 rounded-3xl border border-white/15 bg-white/[0.04] p-6 md:p-8"
              onSubmit={handleRegisterSubmit}
            >
              <div>
                <label htmlFor="reg-nickname" className="block text-sm font-bold text-white/80">
                  {copy.nickname}
                </label>
                <input
                  id="reg-nickname"
                  type="text"
                  required
                  autoComplete="username"
                  value={registerForm.nickname}
                  disabled={submitting}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, nickname: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-accent/50"
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-sm font-bold text-white/80">
                  {copy.email}
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={registerForm.email}
                  disabled={submitting}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-accent/50"
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-sm font-bold text-white/80">
                  {copy.password}
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={registerForm.password}
                  disabled={submitting}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-accent/50"
                />
              </div>
              {(needsVerification || registerForm.verification_code) && (
                <div>
                  <label htmlFor="reg-code" className="block text-sm font-bold text-white/80">
                    {copy.verificationCode}
                  </label>
                  <input
                    id="reg-code"
                    type="text"
                    value={registerForm.verification_code}
                    disabled={submitting}
                    onChange={(event) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        verification_code: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-accent/50"
                  />
                </div>
              )}
              {formError && (
                <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
                  {formError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="interactive-cta w-full rounded-xl bg-accent px-6 py-3 text-base font-bold text-white disabled:opacity-60"
              >
                {copy.registerSubmit}
              </button>
            </form>
          )}
        </>
      )}
    </main>
  );
}
