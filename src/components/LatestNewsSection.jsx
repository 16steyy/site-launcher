export default function LatestNewsSection({
  title,
  viewAllLabel,
  openLabel,
  posts,
  onNavigate,
  baseDelay = 0,
}) {
  const items = (posts || []).slice(0, 2);
  if (!items.length) return null;

  return (
    <section className="scroll-anchor py-20 md:py-28">
      <div className="reveal reveal-scroll flex flex-col items-center justify-between gap-4 md:flex-row md:items-end">
        <h2
          className="text-center text-4xl font-extrabold md:text-left md:text-6xl"
          style={{ animationDelay: `${baseDelay}ms` }}
        >
          {title}
        </h2>
        <a
          href="/news"
          className="rounded-full border border-white/15 bg-white/[0.05] px-5 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/news");
          }}
        >
          {viewAllLabel}
        </a>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {items.map((post, index) => (
          <article
            key={post.slug}
            className="news-card reveal reveal-scroll rounded-3xl p-6 md:p-8"
            style={{ animationDelay: `${baseDelay + 70 + index * 60}ms` }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/55">
              {post.date} {post.version ? `• ${post.version}` : ""}
            </p>
            <h3 className="mt-3 text-2xl font-extrabold leading-tight md:text-3xl">
              {post.title}
            </h3>
            <p className="mt-4 line-clamp-3 text-lg text-white/70">{post.excerpt}</p>
            <a
              href={`/news/${post.slug}`}
              className="mt-8 inline-flex rounded-xl bg-accent px-5 py-3 text-base font-bold text-white transition hover:brightness-110"
              onClick={(event) => {
                event.preventDefault();
                onNavigate(`/news/${post.slug}`);
              }}
            >
              {openLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
