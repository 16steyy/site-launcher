import { useEffect, useMemo, useRef, useState } from "react";

import NewsMarkdown, { prepareNewsMarkdown } from "../NewsMarkdown";
import { getDocumentationMarkdown } from "../../content/documentation";
import { useI18n } from "../../i18n/I18nProvider";
import { extractHeadings } from "../../lib/markdownHeadings";

const ACTIVE_LINE_PX = 160;

function useActiveHeading(ids) {
  const [activeId, setActiveId] = useState(ids[0] || "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      let current = ids[0] || "";
      for (const id of ids) {
        const node = document.getElementById(id);
        if (!node) continue;
        if (node.getBoundingClientRect().top - ACTIVE_LINE_PX > 0) break;
        current = id;
      }
      setActiveId(current);

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids]);

  return { activeId, progress };
}

function scrollToHeading(event, id) {
  event.preventDefault();
  const url = new URL(window.location.href);
  url.hash = id;
  window.history.replaceState(window.history.state, "", url);
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function TocList({ sections, activeId, activeSectionId, onPick }) {
  return (
    <ol className="doc-toc-list">
      {sections.map((section, index) => {
        const isCurrent = section.id === activeSectionId;
        return (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={`doc-toc-link${section.id === activeId ? " is-active" : ""}${
                isCurrent ? " is-current" : ""
              }`}
              onClick={(event) => {
                scrollToHeading(event, section.id);
                onPick?.();
              }}
            >
              <span className="doc-toc-index">{String(index + 1).padStart(2, "0")}</span>
              <span>{section.text}</span>
            </a>
            {isCurrent && section.children.length ? (
              <ol className="doc-toc-sublist">
                {section.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      className={`doc-toc-sublink${child.id === activeId ? " is-active" : ""}`}
                      onClick={(event) => {
                        scrollToHeading(event, child.id);
                        onPick?.();
                      }}
                    >
                      {child.text}
                    </a>
                  </li>
                ))}
              </ol>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export default function DocumentationPage({ onNavigate }) {
  const { locale, messages } = useI18n();
  const copy = messages.documentation || {};
  const markdown = getDocumentationMarkdown(locale);
  const mobileTocRef = useRef(null);

  const headings = useMemo(() => extractHeadings(prepareNewsMarkdown(markdown)), [markdown]);

  const sections = useMemo(() => {
    const list = [];
    headings.forEach((heading) => {
      if (heading.level === 2) {
        list.push({ ...heading, children: [] });
      } else if (list.length) {
        list[list.length - 1].children.push(heading);
      }
    });
    return list;
  }, [headings]);

  const ids = useMemo(() => headings.map((heading) => heading.id), [headings]);
  const { activeId, progress } = useActiveHeading(ids);
  const activeSectionId =
    sections.find(
      (section) =>
        section.id === activeId || section.children.some((child) => child.id === activeId)
    )?.id || "";

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return;
    let cancelled = false;
    const jump = () => {
      if (!cancelled) document.getElementById(hash)?.scrollIntoView({ block: "start", behavior: "instant" });
    };
    const frame = window.requestAnimationFrame(jump);
    document.fonts?.ready.then(() => window.requestAnimationFrame(jump));
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [markdown]);

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 pb-24 pt-12 md:px-6 md:pt-16">
      <div className="doc-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden />

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[16rem_minmax(0,46rem)] xl:justify-center">
        <aside className="hidden lg:block">
          <nav className="doc-toc" aria-label={copy.onThisPage}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-fg-faint">
              {copy.onThisPage}
            </p>
            <TocList sections={sections} activeId={activeId} activeSectionId={activeSectionId} />
            <a
              href="#top"
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-fg-faint transition hover:text-white"
              onClick={(event) => {
                event.preventDefault();
                window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              ↑ {copy.backToTop}
            </a>
          </nav>
        </aside>

        <article className="documentation-page min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-sm text-fg-faint">
            <span className="chip chip-accent">{copy.badge}</span>
            {copy.updated ? <span>{copy.updated}</span> : null}
          </p>

          <details ref={mobileTocRef} className="doc-toc-mobile card mt-6 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold text-white">
              {copy.onThisPage}
              <span className="doc-toc-mobile-chevron" aria-hidden>
                ▾
              </span>
            </summary>
            <div className="border-t border-white/[0.06] px-2 py-3">
              <TocList
                sections={sections}
                activeId={activeId}
                activeSectionId={activeSectionId}
                onPick={() => mobileTocRef.current?.removeAttribute("open")}
              />
            </div>
          </details>

          <NewsMarkdown markdown={markdown} documentMode />

          <footer className="doc-footer card mt-16 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div>
              <p className="font-semibold text-white">{copy.footerTitle}</p>
              <p className="mt-1 text-sm text-fg-muted">{copy.footerText}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/themes"
                className="btn btn-soft"
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate?.("/themes");
                }}
              >
                {copy.browseThemes}
              </a>
              <a
                href="/themes/upload"
                className="btn btn-accent"
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate?.("/themes/upload");
                }}
              >
                {copy.uploadTheme}
              </a>
            </div>
          </footer>
        </article>
      </div>
    </main>
  );
}
