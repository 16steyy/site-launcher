import { useAnimatedCounter } from "../hooks/useAnimatedCounter";

function formatCount(value) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 10_000) {
    return `${Math.round(value / 100) / 10}K`.replace(/\.0K$/, "K");
  }
  return new Intl.NumberFormat().format(value);
}

function StatItem({ label, value, suffix = "" }) {
  const { value: animated, ref } = useAnimatedCounter(value);

  return (
    <div ref={ref} className="hero-stat-item text-center">
      <p className="hero-stat-value text-3xl font-extrabold tracking-tight md:text-4xl">
        {formatCount(animated)}
        {suffix}
      </p>
      <p className="mt-1 text-sm font-semibold text-white/55 md:text-base">{label}</p>
    </div>
  );
}

export default function HeroStats({ stars, downloads, version, labels = {} }) {
  const showStats = stars > 0 || downloads > 0 || version;

  if (!showStats) return null;

  return (
    <div
      className="hero-stats reveal mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-10 gap-y-4 md:mt-10 md:gap-x-14"
      style={{ animationDelay: "260ms" }}
    >
      {stars > 0 && <StatItem label={labels.stars} value={stars} suffix="+" />}
      {downloads > 0 && <StatItem label={labels.downloads} value={downloads} suffix="+" />}
      {version && (
        <div className="hero-stat-item text-center">
          <p className="hero-stat-value text-3xl font-extrabold tracking-tight md:text-4xl">
            v{version}
          </p>
          <p className="mt-1 text-sm font-semibold text-white/55 md:text-base">
            {labels.version}
          </p>
        </div>
      )}
    </div>
  );
}
