import NewsMarkdown from "../NewsMarkdown";
import SiteHeader from "../SiteHeader";
import { getPrivacyMarkdown } from "../../content/privacy";
import { useI18n } from "../../i18n/I18nProvider";

export default function PrivacyPage({ onNavigate, path, user }) {
  const { locale, messages } = useI18n();
  const copy = messages.privacy || {};
  const markdown = getPrivacyMarkdown(locale);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1240px] px-4 pb-20 pt-10 md:px-6">
      <SiteHeader path={path} onNavigate={onNavigate} user={user} />

      <article className="privacy-page mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white/55">
          {copy.versionLabel || "v1.0"} · {copy.effectiveDate}
        </p>
        <NewsMarkdown markdown={markdown} documentMode />
      </article>
    </main>
  );
}
