import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";

import {
  ensureValidAccessToken,
  fetchEmailVerificationStatus,
  mapAuthErrorMessage,
  sendEmailVerificationCode,
} from "../../api/auth.js";
import { fetchMySubmissions, fetchThemesCatalog } from "../../api/themes.js";
import { useAuth } from "../../hooks/useAuth.js";
import { isNewsAdmin } from "../../lib/newsAdmin.js";
import SiteHeader from "../SiteHeader";
import AccountAvatar from "../AccountAvatar";
import { useI18n } from "../../i18n/I18nProvider";

const SkinPreview3d = lazy(() => import("../SkinPreview3d.jsx"));
const CODE_RESEND_COOLDOWN_SECS = 60;
const CODE_LENGTH = 6;

function getReturnPath() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("return");
  if (value && value.startsWith("/")) return value;
  return "/themes/upload";
}

function normalizeAuthor(value) {
  return String(value || "").trim().toLowerCase();
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88M10.73 5.08A10.5 10.5 0 0121 12c-.6 1.26-1.5 2.4-2.6 3.35M6.61 6.61A10.45 10.45 0 003 12c1.73 4.04 5.84 7 9 7 1.5 0 2.95-.4 4.24-1.1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  autoComplete,
  showLabel,
  hideLabel,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-white/80">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          value={value}
          disabled={disabled}
          onChange={onChange}
          className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 pr-12 text-base text-white outline-none transition focus:border-accent/50"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? hideLabel : showLabel}
          className="absolute inset-y-0 right-2 my-auto flex h-9 w-9 items-center justify-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          <EyeIcon open={visible} />
        </button>
      </div>
    </div>
  );
}

function VerificationCodeField({
  id,
  label,
  value,
  onChange,
  disabled,
  autoFocus,
}) {
  const inputRef = useRef(null);
  const digits = value.padEnd(CODE_LENGTH, " ").slice(0, CODE_LENGTH).split("");

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative mx-auto max-w-[300px]">
        <div className="pointer-events-none grid grid-cols-6 gap-2" aria-hidden>
          {digits.map((digit, index) => {
            const filled = digit.trim().length > 0;
            const isActive = value.length === index || (value.length === CODE_LENGTH && index === CODE_LENGTH - 1);
            return (
              <div
                key={index}
                className={`flex h-14 items-center justify-center rounded-xl border text-2xl font-semibold tabular-nums transition ${
                  filled
                    ? "border-accent/45 bg-accent/15 text-white"
                    : isActive
                      ? "border-accent/40 bg-black/50 text-white/30"
                      : "border-white/15 bg-black/40 text-white/20"
                }`}
              >
                {filled ? digit : "·"}
              </div>
            );
          })}
        </div>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
          }
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
          aria-label={label}
        />
      </div>
      <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
        {Array.from({ length: CODE_LENGTH }).map((_, index) => (
          <span
            key={index}
            className={`h-1.5 w-7 rounded-full transition ${
              value.length > index ? "bg-accent" : "bg-white/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
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
  const [formInfo, setFormInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(true);
  const [registerStep, setRegisterStep] = useState("form");
  const [sendingCode, setSendingCode] = useState(false);
  const [resendIn, setResendIn] = useState(0);

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
    let cancelled = false;
    fetchEmailVerificationStatus()
      .then((status) => {
        if (!cancelled) {
          setEmailVerificationRequired(Boolean(status?.required));
        }
      })
      .catch(() => {
        if (!cancelled) setEmailVerificationRequired(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = window.setTimeout(() => setResendIn((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

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
    setFormInfo("");
    setSubmitting(true);

    const result = await login(loginForm, messages);
    setSubmitting(false);

    if (result.ok) {
      onNavigate(getReturnPath());
      return;
    }

    setFormError(result.error);
  }

  async function handleSendCode({ silentSuccess = false } = {}) {
    setFormError("");
    if (!silentSuccess) setFormInfo("");
    const email = registerForm.email.trim();
    if (!email.includes("@") || email.length < 5) {
      setFormError(copy.errors?.invalidEmail || copy.errors?.generic);
      return false;
    }

    setSendingCode(true);
    try {
      await sendEmailVerificationCode(email);
      setResendIn(CODE_RESEND_COOLDOWN_SECS);
      if (!silentSuccess) {
        setFormInfo(copy.codeSentHint || "Код отправлен на почту");
      }
      return true;
    } catch (error) {
      setFormError(mapAuthErrorMessage(error?.message, "register", messages));
      return false;
    } finally {
      setSendingCode(false);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setFormError("");
    setFormInfo("");

    const nickname = registerForm.nickname.trim();
    const email = registerForm.email.trim();
    const password = registerForm.password;

    if (!nickname || !email || !password) {
      setFormError(copy.errors?.generic);
      return;
    }

    if (emailVerificationRequired && registerStep === "form") {
      setSubmitting(true);
      const sent = await handleSendCode({ silentSuccess: true });
      setSubmitting(false);
      if (!sent) return;
      setRegisterForm((prev) => ({ ...prev, verification_code: "" }));
      setRegisterStep("verify");
      setFormInfo(copy.codeSentHint || "Код отправлен на почту");
      return;
    }

    if (
      emailVerificationRequired &&
      registerForm.verification_code.trim().length !== CODE_LENGTH
    ) {
      setFormError(copy.errors?.verificationRequired || copy.errors?.generic);
      return;
    }

    setSubmitting(true);

    const payload = {
      nickname,
      email,
      password,
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

    if (result.needsVerification) {
      setRegisterStep("verify");
    }
    setFormError(result.error);
  }

  function resetRegisterFlow() {
    setRegisterStep("form");
    setRegisterForm((prev) => ({ ...prev, verification_code: "" }));
    setFormError("");
    setFormInfo("");
    setResendIn(0);
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
    setRegisterStep("form");
    setFormError("");
    setFormInfo("");
    setResendIn(0);
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
                  {isNewsAdmin(user) ? (
                    <button
                      type="button"
                      onClick={() => onNavigate("/admin/news")}
                      className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/85 transition hover:text-white"
                    >
                      {messages.newsAdmin?.openAdmin || "News admin"}
                    </button>
                  ) : null}
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
                setFormInfo("");
                resetRegisterFlow();
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
                setFormInfo("");
                resetRegisterFlow();
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
              <PasswordField
                id="login-password"
                label={copy.password}
                value={loginForm.password}
                disabled={submitting}
                autoComplete="current-password"
                showLabel={copy.showPassword || "Показать пароль"}
                hideLabel={copy.hidePassword || "Скрыть пароль"}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                }
              />
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
              {registerStep === "verify" ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-accent/25 bg-gradient-to-b from-accent/10 to-black/20 px-5 py-7 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/80">
                      {copy.verificationStepLabel || "Подтверждение"}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {copy.verificationTitle || "Введите код из письма"}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                      {t("account.verificationHintEmail", {
                        email: registerForm.email.trim(),
                      })}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      {copy.codeSpamHint || "Если письма нет — загляните в «Спам»"}
                    </p>

                    <div className="mt-6">
                      <VerificationCodeField
                        id="reg-code"
                        label={copy.verificationCode}
                        value={registerForm.verification_code}
                        disabled={submitting || sendingCode}
                        autoFocus
                        onChange={(code) =>
                          setRegisterForm((prev) => ({
                            ...prev,
                            verification_code: code,
                          }))
                        }
                      />
                    </div>

                    <button
                      type="button"
                      disabled={sendingCode || submitting || resendIn > 0}
                      onClick={() => void handleSendCode()}
                      className="mt-5 text-sm font-semibold text-accent/90 underline-offset-2 transition hover:text-accent hover:underline disabled:opacity-50"
                    >
                      {sendingCode
                        ? copy.sendingCode || "Отправка…"
                        : resendIn > 0
                          ? t("account.resendCodeIn", { seconds: resendIn })
                          : copy.resendCode || "Отправить код снова"}
                    </button>
                  </div>

                  {formInfo && !formError && (
                    <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">
                      {formInfo}
                    </p>
                  )}
                  {formError && (
                    <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
                      {formError}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={submitting || sendingCode}
                      onClick={resetRegisterFlow}
                      className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-bold text-white/80 transition hover:text-white disabled:opacity-60"
                    >
                      {copy.backToForm || "Назад"}
                    </button>
                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        sendingCode ||
                        registerForm.verification_code.length !== CODE_LENGTH
                      }
                      className="interactive-cta flex-[1.4] rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {copy.registerSubmit}
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                      disabled={submitting || sendingCode}
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
                      disabled={submitting || sendingCode}
                      onChange={(event) =>
                        setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-accent/50"
                    />
                  </div>
                  <PasswordField
                    id="reg-password"
                    label={copy.password}
                    value={registerForm.password}
                    disabled={submitting || sendingCode}
                    autoComplete="new-password"
                    showLabel={copy.showPassword || "Показать пароль"}
                    hideLabel={copy.hidePassword || "Скрыть пароль"}
                    onChange={(event) =>
                      setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                  />
                  {formError && (
                    <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
                      {formError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || sendingCode}
                    className="interactive-cta w-full rounded-xl bg-accent px-6 py-3 text-base font-bold text-white disabled:opacity-60"
                  >
                    {emailVerificationRequired
                      ? copy.continueToCode || "Продолжить"
                      : copy.registerSubmit}
                  </button>
                </>
              )}
            </form>
          )}
        </>
      )}
    </main>
  );
}
