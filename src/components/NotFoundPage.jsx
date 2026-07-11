import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../i18n/I18nProvider";

export default function NotFoundPage({ onNavigate }) {
  const { messages } = useI18n();
  const copy = messages.notFoundPage || {};

  return (
    <main className="mx-auto min-h-screen w-full max-w-[920px] px-4 pb-20 pt-10 md:px-6">
      <header className="flex items-center justify-between gap-3">
        <a
          href="/"
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 transition hover:text-white"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/");
          }}
        >
          {copy.backHome || messages.news.backHome}
        </a>
        <LanguageSwitcher />
      </header>

      <div className="mt-16 text-center">
        <p className="text-8xl font-extrabold tracking-tight text-accent md:text-9xl">404</p>
        <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/70 md:text-xl">
          {copy.description}
        </p>
        <a
          href="/"
          className="mt-10 inline-flex rounded-xl bg-accent px-6 py-3 text-base font-bold text-white transition hover:brightness-110"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("/");
          }}
        >
          {copy.backHome || messages.news.backHome}
        </a>
      </div>
    </main>
  );
}
