import { useEffect, useMemo, useState } from "react";

import {
  createNewsPost,
  deleteNewsPost,
  fetchAdminNewsPost,
  mapNewsAdminError,
  updateNewsPost,
} from "../../api/news.js";
import { ensureValidAccessToken } from "../../api/auth.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  emptyNewsForm,
  isNewsAdmin,
  slugifyTitle,
  slugifyVersion,
  todayIsoDate,
} from "../../lib/newsAdmin.js";
import NewsMarkdown from "../NewsMarkdown.jsx";
import SiteHeader from "../SiteHeader.jsx";
import { useI18n } from "../../i18n/I18nProvider";

const COVER_MAX_BYTES = 5 * 1024 * 1024;

async function fetchRemoteMarkdown(postPath) {
  if (!postPath) return "";
  const response = await fetch(postPath, { cache: "no-store" });
  if (!response.ok) throw new Error("markdown_load_failed");
  return response.text();
}

function FieldLabel({ children, hint }) {
  return (
    <div className="mb-2">
      <label className="text-sm font-bold text-white/80">{children}</label>
      {hint ? <p className="mt-0.5 text-xs text-white/45">{hint}</p> : null}
    </div>
  );
}

export default function NewsAdminPage({ onNavigate, path, user, news, onNewsSaved }) {
  const { messages, t } = useI18n();
  const copy = messages.newsAdmin || {};
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [view, setView] = useState("list");
  const [editingSlug, setEditingSlug] = useState("");
  const [form, setForm] = useState(emptyNewsForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [previewMode, setPreviewMode] = useState("edit");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);

  const posts = useMemo(
    () => (Array.isArray(news?.posts) ? news.posts : []),
    [news?.posts]
  );

  const canAccess = isNewsAdmin(user);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      onNavigate("/account?return=/admin/news");
    }
  }, [authLoading, isAuthenticated, onNavigate]);

  function resetEditor() {
    setForm(emptyNewsForm());
    setEditingSlug("");
    setSlugTouched(false);
    setCoverFile(null);
    setPreviewMode("edit");
    setStatus("idle");
    setErrorMessage("");
    setLoadingPost(false);
  }

  function openCreate() {
    resetEditor();
    setView("edit");
  }

  async function openEdit(post) {
    resetEditor();
    setView("edit");
    setEditingSlug(post.slug);
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      version: post.version || "",
      date: post.date || todayIsoDate(),
      excerpt: post.excerpt || "",
      markdown: "",
    });
    setSlugTouched(true);
    setLoadingPost(true);

    try {
      const token = await ensureValidAccessToken({ force: true });
      if (token) {
        const remote = await fetchAdminNewsPost(token, post.slug);
        setForm({
          title: remote?.title || post.title || "",
          slug: remote?.slug || post.slug || "",
          version: remote?.version || post.version || "",
          date: remote?.date || post.date || todayIsoDate(),
          excerpt: remote?.excerpt || post.excerpt || "",
          markdown: remote?.markdown || "",
        });
        setLoadingPost(false);
        return;
      }
    } catch {
    }

    try {
      const markdown = await fetchRemoteMarkdown(post.postPath);
      setForm((prev) => ({ ...prev, markdown }));
    } catch {
      setErrorMessage(copy.errors?.markdownLoad);
    } finally {
      setLoadingPost(false);
    }
  }

  function handleFieldChange(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (!slugTouched && (field === "version" || field === "title")) {
        const fromVersion = slugifyVersion(next.version);
        next.slug = fromVersion || slugifyTitle(next.title);
      }
      if (field === "slug") {
        setSlugTouched(true);
      }
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      version: form.version.trim(),
      date: form.date.trim(),
      excerpt: form.excerpt.trim(),
      markdown: form.markdown,
    };

    if (!payload.title || !payload.slug || !payload.date) {
      setErrorMessage(copy.errors?.required);
      return;
    }

    if (coverFile && coverFile.size > COVER_MAX_BYTES) {
      setErrorMessage(copy.errors?.coverTooLarge);
      return;
    }

    setStatus("saving");

    try {
      const token = await ensureValidAccessToken({ force: true });
      if (!token) {
        onNavigate("/account?return=/admin/news");
        return;
      }

      if (editingSlug) {
        await updateNewsPost({
          accessToken: token,
          slug: editingSlug,
          payload,
          cover: coverFile,
        });
      } else {
        await createNewsPost({
          accessToken: token,
          payload,
          cover: coverFile,
        });
      }

      setStatus("success");
      await onNewsSaved?.();
      setView("list");
      resetEditor();
    } catch (error) {
      setStatus("error");
      setErrorMessage(mapNewsAdminError(error, messages));
    }
  }

  async function handleDelete(post) {
    const confirmed = window.confirm(
      t("newsAdmin.deleteConfirm", { title: post.title })
    );
    if (!confirmed) return;

    setErrorMessage("");
    setStatus("saving");

    try {
      const token = await ensureValidAccessToken({ force: true });
      if (!token) {
        onNavigate("/account?return=/admin/news");
        return;
      }

      await deleteNewsPost({ accessToken: token, slug: post.slug });
      setStatus("idle");
      await onNewsSaved?.();
    } catch (error) {
      setStatus("error");
      setErrorMessage(mapNewsAdminError(error, messages));
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[1100px] px-4 pb-20 pt-10 md:px-6">
        <SiteHeader path={path} onNavigate={onNavigate} user={user} />
        <p className="text-center text-white/60">{copy.loading}</p>
      </main>
    );
  }

  if (!canAccess) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[1100px] px-4 pb-20 pt-10 md:px-6">
        <SiteHeader path={path} onNavigate={onNavigate} user={user} />
        <section className="mt-10 rounded-3xl border border-red-400/25 bg-red-500/10 p-8 text-center">
          <h1 className="text-3xl font-extrabold">{copy.forbiddenTitle}</h1>
          <p className="mt-3 text-white/70">{copy.forbiddenHint}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1100px] px-4 pb-20 pt-10 md:px-6">
      <SiteHeader path={path} onNavigate={onNavigate} user={user} />

      <section className="text-center">
        <h1 className="hero-title text-4xl font-extrabold tracking-tight md:text-5xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-white/55">{copy.subtitle}</p>
      </section>

      {view === "list" ? (
        <section className="mt-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/45">
              {t("newsAdmin.postsCount", { count: posts.length })}
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="interactive-cta rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white"
            >
              {copy.create}
            </button>
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {errorMessage}
            </p>
          ) : null}

          {posts.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/60">
              {copy.empty}
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="news-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                      {post.date}
                      {post.version ? ` • v${post.version}` : ""}
                    </p>
                    <h2 className="mt-1 truncate text-xl font-extrabold">{post.title}</h2>
                    {post.excerpt ? (
                      <p className="mt-1 line-clamp-2 text-sm text-white/60">{post.excerpt}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(post)}
                      className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold text-white/85 transition hover:text-white"
                    >
                      {copy.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post)}
                      className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100 transition hover:bg-red-500/20"
                    >
                      {copy.delete}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="mt-10">
          <button
            type="button"
            onClick={() => {
              setView("list");
              resetEditor();
            }}
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 transition hover:text-white"
          >
            {copy.backToList}
          </button>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
          >
            <h2 className="text-2xl font-extrabold">
              {editingSlug ? copy.editTitle : copy.createTitle}
            </h2>

            {loadingPost ? (
              <p className="text-sm text-white/55">{copy.loadingPost}</p>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <FieldLabel>{copy.fields.title}</FieldLabel>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => handleFieldChange("title", event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-accent/40 focus:ring-2"
                  required
                />
              </div>
              <div>
                <FieldLabel hint={copy.fields.slugHint}>{copy.fields.slug}</FieldLabel>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => handleFieldChange("slug", event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-accent/40 focus:ring-2"
                  required
                />
              </div>
              <div>
                <FieldLabel>{copy.fields.version}</FieldLabel>
                <input
                  type="text"
                  value={form.version}
                  onChange={(event) => handleFieldChange("version", event.target.value)}
                  placeholder="3.2.3"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-accent/40 focus:ring-2"
                />
              </div>
              <div>
                <FieldLabel>{copy.fields.date}</FieldLabel>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => handleFieldChange("date", event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-accent/40 focus:ring-2"
                  required
                />
              </div>
            </div>

            <div>
              <FieldLabel>{copy.fields.excerpt}</FieldLabel>
              <textarea
                value={form.excerpt}
                onChange={(event) => handleFieldChange("excerpt", event.target.value)}
                rows={2}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none ring-accent/40 focus:ring-2"
              />
            </div>

            <div>
              <FieldLabel hint={copy.fields.coverHint}>{copy.fields.cover}</FieldLabel>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                className="block w-full text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
              />
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <FieldLabel hint={copy.fields.markdownHint}>{copy.fields.markdown}</FieldLabel>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("edit")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                      previewMode === "edit"
                        ? "bg-accent text-white"
                        : "border border-white/15 bg-white/5 text-white/70"
                    }`}
                  >
                    {copy.previewEdit}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("preview")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                      previewMode === "preview"
                        ? "bg-accent text-white"
                        : "border border-white/15 bg-white/5 text-white/70"
                    }`}
                  >
                    {copy.previewView}
                  </button>
                </div>
              </div>

              {previewMode === "edit" ? (
                <textarea
                  value={form.markdown}
                  onChange={(event) => handleFieldChange("markdown", event.target.value)}
                  rows={18}
                  placeholder={copy.fields.markdownPlaceholder}
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 font-mono text-sm leading-relaxed text-white outline-none ring-accent/40 focus:ring-2"
                />
              ) : (
                <div className="min-h-[18rem] rounded-xl border border-white/10 bg-black/20 p-4 md:p-6">
                  {form.markdown.trim() ? (
                    <NewsMarkdown markdown={form.markdown} />
                  ) : (
                    <p className="text-sm text-white/45">{copy.previewEmpty}</p>
                  )}
                </div>
              )}
            </div>

            {errorMessage ? (
              <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </p>
            ) : null}

            {status === "success" ? (
              <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {copy.saveSuccess}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={status === "saving" || loadingPost}
                className="interactive-cta rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "saving" ? copy.saving : copy.save}
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}
