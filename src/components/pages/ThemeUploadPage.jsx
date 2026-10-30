import { useEffect, useState } from "react";

import { ensureValidAccessToken } from "../../api/auth.js";
import {
  mapThemeSubmitError,
  submitTheme,
  THEME_MAX_ZIP_BYTES,
} from "../../api/themes.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useI18n } from "../../i18n/I18nProvider";

export default function ThemeUploadPage({ onNavigate, path, user }) {
  const { messages, t, localePath } = useI18n();
  const copy = messages.themes || {};
  const rules = Array.isArray(copy.rules) ? copy.rules : [];
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
      <main className="mx-auto w-full max-w-[720px] px-4 pb-20 pt-12 md:px-6 md:pt-16">
        <p className="text-center text-fg-muted">{copy.loginRequired}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[720px] px-4 pb-20 pt-12 md:px-6 md:pt-16">

      <section className="text-center">
        <h1 className="page-title">{copy.uploadTitle}</h1>
      </section>

      {status === "success" ? (
        <div className="mt-10 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center md:p-8">
          <p className="text-xl font-bold text-emerald-200">{copy.uploadSuccess}</p>
          <p className="mt-2 text-fg-muted">{copy.uploadSuccessHint}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={localePath("/themes")}
              className="btn btn-accent"
              onClick={(event) => {
                event.preventDefault();
                onNavigate("/themes");
              }}
            >
              {copy.title}
            </a>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => setStatus("idle")}
            >
              {copy.upload}
            </button>
          </div>
        </div>
      ) : (
        <>
        {rules.length > 0 && (
          <section className="notice notice-warning mt-10 !p-5 md:!p-6">
            <h2 className="text-base font-bold text-amber-100">{copy.rulesTitle}</h2>
            <p className="mt-1 font-normal">{copy.rulesIntro}</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 font-normal">
              {rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>
        )}

        <form
          className="panel mt-6 space-y-6 p-6 md:p-8"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="theme-name" className="block text-sm font-semibold text-fg">
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
              className="input mt-2"
            />
          </div>

          <div>
            <label htmlFor="theme-file" className="block text-sm font-semibold text-fg">
              {copy.uploadFile}
            </label>
            <input
              id="theme-file"
              type="file"
              accept=".zip,application/zip"
              required
              disabled={status === "uploading"}
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="mt-2 w-full rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-3 text-sm text-fg-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent-from file:px-4 file:py-2 file:text-sm file:font-bold file:text-ink-0"
            />
            <p className="mt-2 text-sm text-fg-faint">{copy.uploadHint}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="text-sm font-semibold text-fg-muted">{copy.uploadAuthor}: </span>
            <span className="text-sm font-bold text-white">{user?.nickname}</span>
          </div>

          {status === "error" && errorMessage && (
            <p className="notice notice-error">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "uploading"}
            className="btn btn-accent btn-lg w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "uploading" ? "…" : copy.uploadSubmit}
          </button>
        </form>
        </>
      )}
    </main>
  );
}
