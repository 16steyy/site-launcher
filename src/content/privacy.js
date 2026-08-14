import de from "./privacy/de.md?raw";
import en from "./privacy/en.md?raw";
import es from "./privacy/es.md?raw";
import ru from "./privacy/ru.md?raw";
import zh from "./privacy/zh.md?raw";

const PRIVACY_MARKDOWN = { ru, en, zh, de, es };

export function getPrivacyMarkdown(locale) {
  return PRIVACY_MARKDOWN[locale] || PRIVACY_MARKDOWN.en;
}
