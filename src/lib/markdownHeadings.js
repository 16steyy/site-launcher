const FENCE_RE = /^\s*(```|~~~)/;
const HEADING_RE = /^(#{2,3})\s+(.+?)\s*#*\s*$/;

export function plainHeadingText(text) {
  return String(text || "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim();
}

export function slugifyHeading(text) {
  return plainHeadingText(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function extractHeadings(markdown) {
  const seen = new Map();
  const headings = [];
  let inFence = false;

  String(markdown || "")
    .split(/\r?\n/)
    .forEach((line, index) => {
      if (FENCE_RE.test(line)) {
        inFence = !inFence;
        return;
      }
      if (inFence) return;
      const match = line.match(HEADING_RE);
      if (!match) return;

      const base = slugifyHeading(match[2]) || `section-${index + 1}`;
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);

      headings.push({
        level: match[1].length,
        text: plainHeadingText(match[2]),
        id: count ? `${base}-${count + 1}` : base,
        line: index + 1,
      });
    });

  return headings;
}
