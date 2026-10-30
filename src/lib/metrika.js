const METRIKA_ID = 109451983;

export function trackPageView(url, referer) {
  if (typeof window.ym !== "function") return;
  window.ym(METRIKA_ID, "hit", url, { title: document.title, referer });
}
