import { useEffect, useRef, useState } from "react";

export default function SectionNav({ sections, ariaLabel, className = "" }) {
  const itemRefs = useRef({});
  const [activeSection, setActiveSection] = useState("");
  const [indicator, setIndicator] = useState({ x: 0, width: 0, visible: false });

  useEffect(() => {
    const nodes = sections
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.15, 0.35, 0.55] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    function updateIndicator() {
      const item = itemRefs.current[activeSection];
      if (!activeSection || !item) {
        setIndicator((prev) => ({ ...prev, visible: false }));
        return;
      }
      setIndicator({ x: item.offsetLeft, width: item.offsetWidth, visible: true });
    }

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeSection, sections]);

  function handleClick(event, id) {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  }

  return (
    <nav
      className={`site-nav-sections relative flex items-center gap-0.5 ${className}`}
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
          className={`site-nav-link ${activeSection === id ? "is-active" : ""}`}
          onClick={(event) => handleClick(event, id)}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
