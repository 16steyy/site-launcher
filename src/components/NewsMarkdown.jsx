import { Children, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ImageLightbox, { useImageLightbox } from "./ImageLightbox";
import NewsImageSlider from "./NewsImageSlider";
import { useI18n } from "../i18n/I18nProvider";
import { extractHeadings } from "../lib/markdownHeadings";

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

export function prepareNewsMarkdown(markdown) {
  return markdown ? transformNewsMarkdownSliders(normalizeMarkdownLinks(markdown)) : "";
}

function useCopiedFlag(durationMs = 1400) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(0);
  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(false), durationMs);
  }

  return [copied, copy];
}

const CODE_LANGUAGE_LABELS = { css: "CSS", json: "JSON", js: "JavaScript", bash: "Shell", sh: "Shell" };

function CodeBlock({ children }) {
  const { messages } = useI18n();
  const copy = messages.markdown || {};
  const [copied, copyText] = useCopiedFlag();
  const code = Children.toArray(children)[0];
  const language = String(code?.props?.className || "").match(/language-([\w-]+)/)?.[1] || "";
  const text = String(code?.props?.children ?? "").replace(/\n$/, "");
  const label = CODE_LANGUAGE_LABELS[language] || "";

  return (
    <div className={`code-block${label ? "" : " is-bare"}`}>
      <div className="code-block-head">
        <span>{label}</span>
        <button
          type="button"
          className={`code-block-copy${copied ? " is-copied" : ""}`}
          onClick={() => copyText(text)}
        >
          {copied ? copy.copied : copy.copyCode}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 pb-4 pt-1 font-mono text-sm leading-relaxed text-fg">
        {children}
      </pre>
    </div>
  );
}

function AnchoredHeading({ as: Tag, id, className, children }) {
  const { messages } = useI18n();
  const copy = messages.markdown || {};
  const [copied, copyText] = useCopiedFlag();

  function handleClick(event) {
    event.preventDefault();
    const url = new URL(window.location.href);
    url.hash = id;
    window.history.replaceState(window.history.state, "", url);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    copyText(url.toString());
  }

  return (
    <Tag id={id} className={`doc-heading ${className}`}>
      {children}
      {id ? (
        <a
          href={`#${id}`}
          className={`doc-heading-anchor${copied ? " is-copied" : ""}`}
          aria-label={copy.copyLink}
          title={copied ? copy.linkCopied : copy.copyLink}
          onClick={handleClick}
        >
          {copied ? "✓" : "#"}
        </a>
      ) : null}
    </Tag>
  );
}

export default function NewsMarkdown({ markdown, assetBaseUrl, documentMode = false }) {
  const { image, alt, hasGallery, openImage, closeImage, showPrev, showNext } = useImageLightbox();

  const normalizedMarkdown = useMemo(() => prepareNewsMarkdown(markdown), [markdown]);

  const headingIds = useMemo(() => {
    if (!documentMode) return null;
    return new Map(extractHeadings(normalizedMarkdown).map((heading) => [heading.line, heading.id]));
  }, [documentMode, normalizedMarkdown]);

  const components = useMemo(
    () => ({
      h1: ({ children }) =>
        documentMode ? (
          <h1 className="page-title">{children}</h1>
        ) : (
          <h2 className="mt-8 text-2xl font-bold text-white">{children}</h2>
        ),
      h2: ({ children, node }) =>
        documentMode ? (
          <AnchoredHeading
            as="h2"
            id={headingIds?.get(node?.position?.start?.line)}
            className="!mt-14 text-2xl font-bold tracking-tight text-white"
          >
            {children}
          </AnchoredHeading>
        ) : (
          <h3 className="mt-6 text-xl font-semibold text-white">{children}</h3>
        ),
      h3: ({ children, node }) =>
        documentMode ? (
          <AnchoredHeading
            as="h3"
            id={headingIds?.get(node?.position?.start?.line)}
            className="!mt-9 text-lg font-semibold text-white"
          >
            {children}
          </AnchoredHeading>
        ) : (
          <h4 className="mt-4 text-lg font-semibold text-white">{children}</h4>
        ),
      p: ({ children }) => <p className="news-markdown-paragraph">{children}</p>,
      ul: ({ children, className }) => (
        <ul className={`news-markdown-list space-y-1.5 ${className || ""}`}>{children}</ul>
      ),
      ol: ({ children }) => <ol className="news-markdown-ordered-list space-y-1.5">{children}</ol>,
      li: ({ children, className }) =>
        className?.includes("task-list-item") ? (
          <li className="task-list-item">
            <label>{children}</label>
          </li>
        ) : (
          <li className="pl-1">{children}</li>
        ),
      input: ({ type, checked }) =>
        type === "checkbox" ? (
          <input type="checkbox" className="task-check" defaultChecked={checked} />
        ) : null,
      blockquote: ({ children }) => <blockquote className="markdown-callout">{children}</blockquote>,
      img: ({ src, alt: imageAlt }) => {
        const resolvedSrc = resolveRelativeUrl(src, assetBaseUrl);
        return (
          <button
            type="button"
            className="relative mt-4 block w-full cursor-zoom-in"
            onClick={() => openImage(resolvedSrc)}
          >
            <img
              src={resolvedSrc}
              alt={imageAlt || ""}
              className="news-inline-image rounded-2xl border border-white/10"
            />
          </button>
        );
      },
      a: ({ href, children }) => {
        const className =
          "font-medium text-accent-hi underline decoration-accent-to/50 underline-offset-2 transition hover:text-white";
        if (href?.startsWith("/") && !href.startsWith("//")) {
          return (
            <a
              href={href}
              className={className}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                event.preventDefault();
                const url = new URL(href, window.location.origin);
                const lang = new URLSearchParams(window.location.search).get("lang");
                if (lang && !url.searchParams.has("lang")) url.searchParams.set("lang", lang);
                window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
                window.dispatchEvent(new PopStateEvent("popstate"));
                window.scrollTo({ top: 0 });
              }}
            >
              {children}
            </a>
          );
        }
        return (
          <a href={href} className={className} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      },
      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      code: ({ children, className }) => {
        if (className) return <code className={className}>{children}</code>;
        return (
          <code className="rounded border border-white/10 bg-ink-3 px-1.5 py-0.5 font-mono text-[0.88em] text-fg">
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
        return <CodeBlock>{children}</CodeBlock>;
      },
      hr: () => <hr className="!my-10 border-white/10" />,
      table: ({ children }) => (
        <div className="news-markdown-table-wrap overflow-x-auto rounded-xl border border-white/10">
          <table className="news-markdown-table w-full min-w-[36rem] border-collapse text-left text-base">
            {children}
          </table>
        </div>
      ),
      thead: ({ children }) => <thead className="bg-ink-3 text-white">{children}</thead>,
      tbody: ({ children }) => <tbody>{children}</tbody>,
      tr: ({ children }) => <tr className="border-t border-white/10">{children}</tr>,
      th: ({ children }) => (
        <th className="px-4 py-3 align-top font-semibold text-white">{children}</th>
      ),
      td: ({ children }) => (
        <td className="px-4 py-3 align-top text-fg-muted">{children}</td>
      ),
    }),
    [assetBaseUrl, documentMode, headingIds, openImage]
  );

  if (!normalizedMarkdown.trim()) return null;

  return (
    <>
      <section
        className={`news-markdown${documentMode ? " is-document" : ""} mt-8 space-y-4 text-[1.0625rem] text-fg`}
      >
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
