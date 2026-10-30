export default function HeroTitle({ className = "" }) {
  return (
    <h1 className={`hero-title ${className}`.trim()}>
      16Launcher
    </h1>
  );
}
