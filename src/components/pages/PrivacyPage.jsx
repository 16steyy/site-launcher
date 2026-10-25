import NewsMarkdown from "../NewsMarkdown";
import { getPrivacyMarkdown } from "../../content/privacy";
import { useI18n } from "../../i18n/I18nProvider";

export default function PrivacyPage() {
  const { locale, messages } = useI18n();
  const copy = messages.privacy || {};
  const markdown = getPrivacyMarkdown(locale);

  return (
    <main className="mx-auto w-full max-w-[860px] px-4 pb-20 pt-12 md:px-6 md:pt-16">
      <article className="privacy-page">
        <p className="text-sm text-fg-faint">
          {[copy.versionLabel, copy.effectiveDate].filter(Boolean).join(" · ")}
        </p>
        <NewsMarkdown markdown={markdown} documentMode />
      </article>
    </main>
  );
}
