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

function Stat({ value, label }) {
  return (
    <div className="px-5 text-center sm:px-8">
      <p className="text-2xl font-bold tabular-nums tracking-tight text-white md:text-3xl">{value}</p>
      <p className="mt-0.5 text-sm text-fg-muted">{label}</p>
    </div>
  );
}

function CountStat({ value, label }) {
  const { value: animated, ref } = useAnimatedCounter(value);
  return (
    <div ref={ref}>
      <Stat value={`${formatCount(animated)}+`} label={label} />
    </div>
  );
}

export default function HeroStats({ stars, downloads, version, labels = {} }) {
  if (!(stars > 0 || downloads > 0 || version)) return null;

  return (
    <div
      className="reveal panel mx-auto mt-10 inline-flex flex-wrap items-center justify-center gap-y-3 divide-x divide-white/10 px-2 py-4"
      style={{ animationDelay: "220ms" }}
    >
      {downloads > 0 && <CountStat value={downloads} label={labels.downloads} />}
      {stars > 0 && <CountStat value={stars} label={labels.stars} />}
      {version && <Stat value={`v${version}`} label={labels.version} />}
    </div>
  );
}
