export default function HeroTitle({ className = "" }) {
  return (
    <h1 className={`hero-title ${className}`.trim()}>
      <span className="text-accent-bright">16</span>Launcher
    </h1>
  );
}
