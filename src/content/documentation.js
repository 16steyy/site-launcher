import de from "./documentation/de.md?raw";
import en from "./documentation/en.md?raw";
import es from "./documentation/es.md?raw";
import ru from "./documentation/ru.md?raw";
import zh from "./documentation/zh.md?raw";

const DOCUMENTATION_MARKDOWN = { ru, en, zh, de, es };

export function getDocumentationMarkdown(locale) {
  return DOCUMENTATION_MARKDOWN[locale] || DOCUMENTATION.en;
}
