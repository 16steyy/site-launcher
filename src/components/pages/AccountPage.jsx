import { useState } from "react";

import { useAuth } from "../../hooks/useAuth.js";
import SiteHeader from "../SiteHeader";
import { useI18n } from "../../i18n/I18nProvider";

function getReturnPath() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("return");
  if (value && value.startsWith("/")) return value;
  return "/themes/upload";
}

export default function AccountPage({ onNavigate, path, user }) {
  const { messages } = useI18n();
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
    <main className="mx-auto min-h-screen w-full max-w-[720px] px-4 pb-20 pt-10 md:px-6">
      <SiteHeader path={path} onNavigate={onNavigate} user={user} />

      <section className="text-center">
        <h1 className="text-4xl font-extrabold md:text-5xl">{copy.title}</h1>
      </section>

      {loading ? (
        <p className="mt-10 text-center text-white/50">…</p>
      ) : user ? (
        <div className="mt-10 rounded-3xl border border-white/15 bg-white/[0.04] p-6 text-center md:p-8">
          <p className="text-lg text-white/70">{copy.loggedInAs || copy.nickname}</p>
          <p className="mt-2 text-3xl font-extrabold text-accent">{user.nickname}</p>
          {user.email && (
            <p className="mt-2 text-sm text-white/50">{user.email}</p>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white/80 transition hover:text-white"
          >
            {copy.logout}
          </button>
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
                className="w-full rounded-xl bg-accent px-6 py-3 text-base font-bold text-white transition hover:brightness-110 disabled:opacity-60"
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
                className="w-full rounded-xl bg-accent px-6 py-3 text-base font-bold text-white transition hover:brightness-110 disabled:opacity-60"
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
