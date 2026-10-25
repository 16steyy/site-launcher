import { useI18n } from "../i18n/I18nProvider";

export default function NotFoundPage({ onNavigate }) {
  const { messages } = useI18n();
  const copy = messages.notFoundPage || {};

  return (
    <main className="mx-auto w-full max-w-[860px] px-4 pb-24 pt-20 text-center md:px-6">
      <p className="text-7xl font-extrabold tracking-tight text-accent-hi md:text-8xl">404</p>
      <h1 className="page-title mt-4">{copy.title}</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-fg-muted">{copy.description}</p>
      <a
        href="/"
        className="btn btn-accent btn-lg mt-10"
        onClick={(event) => {
          event.preventDefault();
          onNavigate("/");
        }}
      >
        {copy.backHome}
      </a>
    </main>
  );
}
