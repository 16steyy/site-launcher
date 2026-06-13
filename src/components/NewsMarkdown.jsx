import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

export default function NewsMarkdown({ markdown, assetBaseUrl }) {
  const components = useMemo(
    () => ({
      h1: ({ children }) => <h2 className="text-3xl font-extrabold">{children}</h2>,
      h2: ({ children }) => <h3 className="text-2xl font-extrabold">{children}</h3>,
      h3: ({ children }) => <h4 className="text-xl font-bold">{children}</h4>,
      p: ({ children }) => <p className="news-markdown-paragraph">{children}</p>,
      ul: ({ children }) => <ul className="space-y-3">{children}</ul>,
      ol: ({ children }) => <ol className="news-markdown-ordered-list space-y-3">{children}</ol>,
      li: ({ children }) => (
        <li className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">{children}</li>
      ),
      img: ({ src, alt }) => (
        <img
          src={resolveRelativeUrl(src, assetBaseUrl)}
          alt={alt || ""}
          className="news-inline-image mt-4 rounded-2xl border border-white/15"
        />
      ),
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
    }),
    [assetBaseUrl]
  );

  const normalizedMarkdown = useMemo(
    () => (markdown ? normalizeMarkdownLinks(markdown) : ""),
    [markdown]
  );

  if (!normalizedMarkdown.trim()) return null;

  return (
    <section className="news-markdown mt-8 space-y-4 text-lg text-white/80">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {normalizedMarkdown}
      </ReactMarkdown>
    </section>
  );
}
