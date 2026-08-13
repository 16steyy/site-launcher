# theme-submissions

Private repository for 16Launcher theme submissions.

Pull requests are created automatically by the API bot when users upload themes on [16-launcher.ru](https://16-launcher.ru).

## Moderation

1. Open the PR created by the bot.
2. Download `theme.zip` and test in 16Launcher (**Settings → Themes → Import ZIP**).
3. If approved, add the label **`approved`**.
4. GitHub Action publishes the theme to [site-launcher](https://github.com/16steyy/site-launcher).

To reject, close the PR without the `approved` label (optionally add `rejected`).

## Structure

```
submissions/
  {username}/
    {theme-id}/
      theme.json
      style.css
      (assets...)
      theme.zip
      .meta.json
```

## Setup

1. Create this repo as **private** under `16steyy/theme-submissions`.
2. Copy `.github/workflows/publish-theme.yml` from this template.
3. Create GitHub App **16Launcher Theme Bot** with Contents + Pull requests (Read & Write).
4. Install the App on this repo.
5. Add secret **`PUBLISH_TOKEN`** — PAT or token with push access to `16steyy/site-launcher`.

See `docs/THEMES_STORE.ru.md` in site-launcher for the user-facing guide.
