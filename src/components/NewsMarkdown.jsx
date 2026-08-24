import { Children, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ImageLightbox, { useImageLightbox } from "./ImageLightbox";
import NewsImageSlider from "./NewsImageSlider";

const IMAGE_LINE_RE =
  /^\s*!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)\s*$/;
const FENCE_RE = /^\s*(```|~~~)/;
const SLIDER_OPEN_RE = /^\s*:::slider\s*$/i;
const SLIDER_CLOSE_RE = /^\s*:::\s*$/;

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

function parseImageLine(line) {
  const match = line.match(IMAGE_LINE_RE);
  if (!match) return null;
  return { alt: match[1] || "", src: match[2] };
}

function toSliderFence(images) {
  return ["```news-slider", JSON.stringify(images), "```"].join("\n");
}

export function transformNewsMarkdownSliders(markdown) {
  const lines = markdown.split(/\r?\n/);
  const output = [];
  let inFence = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      output.push(line);
      i += 1;
      continue;
    }

    if (!inFence && SLIDER_OPEN_RE.test(line)) {
      const start = i;
      const images = [];
      const collected = [];
      i += 1;
      let closed = false;
      while (i < lines.length) {
        if (SLIDER_CLOSE_RE.test(lines[i])) {
          closed = true;
          i += 1;
          break;
        }
        collected.push(lines[i]);
        const image = parseImageLine(lines[i]);
        if (image) images.push(image);
        i += 1;
      }
      if (!closed) {
        output.push(lines[start], ...collected);
        continue;
      }
      if (images.length >= 2) {
        output.push(toSliderFence(images));
      } else {
        images.forEach((image) => {
          output.push(`![${image.alt}](${image.src})`);
        });
      }
      continue;
    }

    if (!inFence && parseImageLine(line)) {
      const images = [];
      while (i < lines.length && parseImageLine(lines[i])) {
        images.push(parseImageLine(lines[i]));
        i += 1;
      }
      if (images.length >= 2) {
        output.push(toSliderFence(images));
      } else {
        output.push(`![${images[0].alt}](${images[0].src})`);
      }
      continue;
    }

    output.push(line);
    i += 1;
  }

  return output.join("\n");
}

function extractNewsSlider(children) {
  const nodes = Children.toArray(children);
  const code = nodes.find(
    (child) =>
      child?.props?.className && String(child.props.className).includes("language-news-slider")
  );
  if (!code) return null;
  const raw = String(code.props.children ?? "").trim();
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => item?.src) : null;
  } catch {
    return null;
  }
}

export default function NewsMarkdown({ markdown, assetBaseUrl, documentMode = false }) {
  const { image, alt, hasGallery, openImage, closeImage, showPrev, showNext } = useImageLightbox();

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
      img: ({ src, alt: imageAlt }) => {
        const resolvedSrc = resolveRelativeUrl(src, assetBaseUrl);
        return (
          <button
            type="button"
            className="group relative mt-4 block w-full cursor-zoom-in"
            onClick={() => openImage(resolvedSrc)}
          >
            <img
              src={resolvedSrc}
              alt={imageAlt || ""}
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
      pre: ({ children }) => {
        const sliderImages = extractNewsSlider(children);
        if (sliderImages?.length >= 2) {
          return (
            <NewsImageSlider
              images={sliderImages.map((item) => ({
                alt: item.alt || "",
                src: resolveRelativeUrl(item.src, assetBaseUrl),
              }))}
              onOpenImage={openImage}
            />
          );
        }
        return (
          <pre className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-sm text-white/85">
            {children}
          </pre>
        );
      },
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
    () => (markdown ? transformNewsMarkdownSliders(normalizeMarkdownLinks(markdown)) : ""),
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
      <ImageLightbox
        image={image}
        alt={alt}
        hasGallery={hasGallery}
        onClose={closeImage}
        onPrev={showPrev}
        onNext={showNext}
      />
    </>
  );
}
