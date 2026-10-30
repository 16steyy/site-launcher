import { useI18n } from "../i18n/I18nProvider";

const INTEGRATIONS = [
  { id: "content", names: ["Modrinth", "CurseForge"] },
  { id: "loaders", names: ["Fabric", "Quilt", "Forge", "NeoForge"] },
  { id: "accounts", names: ["Microsoft", "Ely.by"] },
  { id: "import", names: ["Prism Launcher", "MultiMC", "ATLauncher", "GDLauncher", "CurseForge App"] },
  { id: "formats", names: [".mrpack", ".zip", ".jar"] },
  { id: "discord", names: ["Discord Rich Presence"] },
];

export default function IntegrationsSection() {
  const { messages } = useI18n();
  const content = messages.integrations || {};
  const groups = content.groups || {};

  return (
    <section id="integrations" className="scroll-anchor mx-auto max-w-[1240px] px-4 py-14 md:px-6 md:py-20">
      <h2 className="section-title reveal reveal-scroll text-center">{content.title}</h2>
      <p className="reveal reveal-scroll mx-auto mt-4 max-w-2xl text-balance text-center text-fg-muted">
        {content.subtitle}
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((integration, index) => {
          const text = groups[integration.id] || {};
          return (
            <article
              key={integration.id}
              className="card reveal reveal-scroll flex flex-col p-5 md:p-6"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <h3 className="text-base font-semibold text-white">{text.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-fg-muted">{text.text}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {integration.names.map((name) => (
                  <li key={name} className="integration-tag">
                    {name}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
