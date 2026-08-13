import { useEffect, useState } from "react";

import { ensureValidAccessToken } from "../../api/auth.js";
import {
  mapThemeSubmitError,
  submitTheme,
  THEME_MAX_ZIP_BYTES,
} from "../../api/themes.js";
import { useAuth } from "../../hooks/useAuth.js";
import SiteHeader from "../SiteHeader";
import { useI18n } from "../../i18n/I18nProvider";

export default function ThemeUploadPage({ onNavigate, path, user }) {
  const { messages, t } = useI18n();
  const copy = messages.themes || {};
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      onNavigate("/account?return=/themes/upload");
    }
  }, [authLoading, isAuthenticated, onNavigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (!file) return;

    if (file.size > THEME_MAX_ZIP_BYTES) {
      setErrorMessage(copy.errors?.tooLarge);
      setStatus("error");
      return;
    }

    setStatus("uploading");

    try {
      const token = await ensureValidAccessToken({ force: true });
      if (!token) {
        onNavigate("/account?return=/themes/upload");
        return;
      }

      await submitTheme({
        name: trimmedName,
        file,
        accessToken: token,
      });

      setStatus("success");
      setName("");
      setFile(null);
    } catch (error) {
      setStatus("error");
      setErrorMessage(mapThemeSubmitError(error, messages));
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[720px] px-4 pb-20 pt-10 md:px-6">
        <SiteHeader path={path} onNavigate={onNavigate} user={user} />
        <p className="text-center text-white/60">{copy.loginRequired}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[720px] px-4 pb-20 pt-10 md:px-6">
      <SiteHeader path={path} onNavigate={onNavigate} user={user} />

      <section className="text-center">
        <h1 className="text-4xl font-extrabold md:text-5xl">{copy.uploadTitle}</h1>
      </section>

      {status === "success" ? (
        <div className="mt-10 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center md:p-8">
          <p className="text-xl font-bold text-emerald-200">{copy.uploadSuccess}</p>
          <p className="mt-2 text-white/70">{copy.uploadSuccessHint}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/themes"
              className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
              onClick={(event) => {
                event.preventDefault();
                onNavigate("/themes");
              }}
            >
              {copy.title}
            </a>
            <button
              type="button"
              className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white/80 transition hover:text-white"
              onClick={() => setStatus("idle")}
            >
              {copy.upload}
            </button>
          </div>
        </div>
      ) : (
        <form
          className="mt-10 space-y-6 rounded-3xl border border-white/15 bg-white/[0.04] p-6 md:p-8"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="theme-name" className="block text-sm font-bold text-white/80">
              {copy.uploadName}
            </label>
            <input
              id="theme-name"
              type="text"
              required
              maxLength={80}
              value={name}
              disabled={status === "uploading"}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-accent/50"
            />
          </div>

          <div>
            <label htmlFor="theme-file" className="block text-sm font-bold text-white/80">
              {copy.uploadFile}
            </label>
            <input
              id="theme-file"
              type="file"
              accept=".zip,application/zip"
              required
              disabled={status === "uploading"}
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="mt-2 w-full rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-3 text-sm text-white/80 file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
            />
            <p className="mt-2 text-sm text-white/50">{copy.uploadHint}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="text-sm font-semibold text-white/55">{copy.uploadAuthor}: </span>
            <span className="text-sm font-bold text-white">{user?.nickname}</span>
          </div>

          {status === "error" && errorMessage && (
            <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "uploading"}
            className="w-full rounded-xl bg-accent px-6 py-3 text-base font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "uploading" ? "…" : copy.uploadSubmit}
          </button>
        </form>
      )}
    </main>
  );
}
