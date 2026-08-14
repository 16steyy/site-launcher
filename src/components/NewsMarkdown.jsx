import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ImageLightbox, { useImageLightbox } from "./ImageLightbox";

function resolveRelativeUrl(path, baseUrl) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (!baseUrl) return path;
  try {
    return new URL(path, `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}`).toString();
  } catch {
    return path;
  }
}

function normalizeMarkdownLinks(markdown) {
  return markdown.replace(/\[([^\]]+)\]\s+\(([^)]+)\)/g, "[$1]($2)");
}

export default function NewsMarkdown({ markdown, assetBaseUrl, documentMode = false }) {
  const { image, openImage, closeImage } = useImageLightbox();

  const components = useMemo(
    () => ({
      h1: ({ children }) =>
        documentMode ? (
          <h1 className="hero-title text-4xl font-extrabold tracking-tight md:text-5xl">{children}</h1>
        ) : (
          <h2 className="text-3xl font-extrabold">{children}</h2>
        ),
      h2: ({ children }) =>
        documentMode ? (
          <h2 className="mt-10 text-2xl font-extrabold md:text-3xl">{children}</h2>
        ) : (
          <h3 className="text-2xl font-extrabold">{children}</h3>
        ),
      h3: ({ children }) =>
        documentMode ? (
          <h3 className="mt-6 text-xl font-bold">{children}</h3>
        ) : (
          <h4 className="text-xl font-bold">{children}</h4>
        ),
      p: ({ children }) => <p className="news-markdown-paragraph">{children}</p>,
      ul: ({ children }) => <ul className="space-y-3">{children}</ul>,
      ol: ({ children }) => <ol className="news-markdown-ordered-list space-y-3">{children}</ol>,
      li: ({ children }) => (
        <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">{children}</li>
      ),
      img: ({ src, alt }) => {
        const resolvedSrc = resolveRelativeUrl(src, assetBaseUrl);
        return (
          <button
            type="button"
            className="group relative mt-4 block w-full cursor-zoom-in"
            onClick={() => openImage(resolvedSrc)}
          >
            <img
              src={resolvedSrc}
              alt={alt || ""}
              className="news-inline-image rounded-2xl border border-white/15 transition-transform duration-300 ease-out group-hover:scale-[1.02] group-hover:shadow-[0_20px_50px_rgba(44,96,255,0.2)]"
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-black/0 opacity-0 transition-opacity duration-200 group-hover:bg-black/35 group-hover:opacity-100" />
          </button>
        );
      },
      a: ({ href, children }) => (
        <a
          href={href}
          className="font-semibold text-accent underline decoration-accent/40 underline-offset-2 transition hover:brightness-110"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),
      strong: ({ children }) => <strong className="font-bold text-white/95">{children}</strong>,
      em: ({ children }) => <em className="italic text-white/85">{children}</em>,
      code: ({ children, className }) => {
        if (className) return <code className={className}>{children}</code>;
        return (
          <code className="rounded-md border border-white/10 bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-white/90">
            {children}
          </code>
        );
      },
      pre: ({ children }) => (
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-sm text-white/85">
          {children}
        </pre>
      ),
      hr: () => <hr className="my-8 border-white/15" />,
      table: ({ children }) => (
        <div className="news-markdown-table-wrap overflow-x-auto rounded-xl border border-white/10">
          <table className="news-markdown-table w-full min-w-[36rem] border-collapse text-left text-base">
            {children}
          </table>
        </div>
      ),
      thead: ({ children }) => <thead className="bg-white/10 text-white">{children}</thead>,
      tbody: ({ children }) => <tbody>{children}</tbody>,
      tr: ({ children }) => <tr className="border-t border-white/10">{children}</tr>,
      th: ({ children }) => (
        <th className="px-4 py-3 align-top font-bold text-white">{children}</th>
      ),
      td: ({ children }) => (
        <td className="px-4 py-3 align-top text-white/80">{children}</td>
      ),
    }),
    [assetBaseUrl, documentMode, openImage]
  );

  const normalizedMarkdown = useMemo(
    () => (markdown ? normalizeMarkdownLinks(markdown) : ""),
    [markdown]
  );

  if (!normalizedMarkdown.trim()) return null;

  return (
    <>
      <section className="news-markdown mt-8 space-y-4 text-lg text-white/80">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {normalizedMarkdown}
        </ReactMarkdown>
      </section>
      <ImageLightbox image={image} onClose={closeImage} />
    </>
  );
}
