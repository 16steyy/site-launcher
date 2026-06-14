import { useEffect, useRef, useState } from "react";

export default function SectionNav({
  sections,
  activeSection,
  onSectionClick,
  ariaLabel,
  className = "",
}) {
  const navRef = useRef(null);
  const itemRefs = useRef({});
  const [indicator, setIndicator] = useState({ x: 0, width: 0, visible: false });

  useEffect(() => {
    function updateIndicator() {
      if (!activeSection) {
        setIndicator((prev) => ({ ...prev, visible: false }));
        return;
      }

      const nav = navRef.current;
      const item = itemRefs.current[activeSection];
      if (!nav || !item) return;

      setIndicator({
        x: item.offsetLeft,
        width: item.offsetWidth,
        visible: true,
      });
    }

    updateIndicator();
    const nav = navRef.current;
    window.addEventListener("resize", updateIndicator);
    nav?.addEventListener("scroll", updateIndicator, { passive: true });
    return () => {
      window.removeEventListener("resize", updateIndicator);
      nav?.removeEventListener("scroll", updateIndicator);
    };
  }, [activeSection, sections]);

  useEffect(() => {
    const item = itemRefs.current[activeSection];
    item?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeSection]);

  return (
    <nav
      ref={navRef}
      className={`site-nav-pills relative flex w-full min-w-0 max-w-full shrink-0 items-center gap-0.5 overflow-x-auto rounded-full border border-white/[0.08] bg-white/[0.03] p-1 md:w-auto md:max-w-none md:overflow-visible ${className}`}
      aria-label={ariaLabel}
    >
      <span
        className="site-nav-indicator"
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.x}px)`,
          opacity: indicator.visible ? 1 : 0,
        }}
        aria-hidden
      />
      {sections.map(({ id, label }) => (
        <a
          key={id}
          ref={(el) => {
            itemRefs.current[id] = el;
          }}
          href={`#${id}`}
          className={`site-nav-anchor shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold sm:px-3.5 sm:text-sm md:px-4 ${
            activeSection === id
              ? "is-active"
              : "text-white/55 hover:bg-white/[0.06] hover:text-white/90"
          }`}
          onClick={(event) => onSectionClick(event, id)}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
