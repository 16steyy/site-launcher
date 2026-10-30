import { useI18n } from "../i18n/I18nProvider";

export default function LatestNewsSection({ title, viewAllLabel, openLabel, posts, onNavigate }) {
  const { localePath } = useI18n();
  const items = (posts || []).slice(0, 2);
  if (!items.length) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="reveal reveal-scroll flex flex-col items-center justify-between gap-4 md:flex-row md:items-end">
        <h2 className="section-title text-center md:text-left">{title}</h2>
        <a
          href={localePath("/news")}
          className="btn btn-soft"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/news");
          }}
        >
          {viewAllLabel}
        </a>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {items.map((post, index) => (
          <a
            key={post.slug}
            href={localePath(`/news/${post.slug}`)}
            className="news-card reveal reveal-scroll group flex flex-col rounded-2xl p-6 md:p-7"
            style={{ animationDelay: `${index * 60}ms` }}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(`/news/${post.slug}`);
            }}
          >
            <p className="flex flex-wrap items-center gap-2 text-sm text-fg-faint">
              {post.date ? <span>{post.date}</span> : null}
              {post.version ? <span className="chip chip-accent">{post.version}</span> : null}
            </p>
            <h3 className="mt-3 text-2xl font-semibold leading-snug text-white">{post.title}</h3>
            {post.excerpt ? (
              <p className="mt-3 line-clamp-3 flex-1 text-fg-muted">{post.excerpt}</p>
            ) : null}
            <span className="mt-6 text-sm font-semibold text-accent-hi transition group-hover:text-white">
              {openLabel} →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
