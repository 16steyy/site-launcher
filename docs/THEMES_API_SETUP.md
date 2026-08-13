# Theme store — API setup (VPS)

This document describes Part 2 of the theme store. Implement these changes in the **api.16-launcher.ru** backend repository.

## Environment variables

```env
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=          # PEM, multiline ok
GITHUB_INSTALLATION_ID=
GITHUB_SUBMISSIONS_REPO=16steyy/theme-submissions
GITHUB_SUBMISSIONS_DEFAULT_BRANCH=main
THEME_MAX_ZIP_BYTES=5242880
THEME_SUBMIT_RATE_LIMIT_PER_HOUR=3
THEME_ALLOWED_EXTENSIONS=.json,.css,.png,.jpg,.jpeg,.webp,.woff,.woff2,.ttf,.txt
```

## CORS

Allow origins:

- `https://16-launcher.ru`
- `http://localhost:5173`

Methods: `GET`, `POST`, `PATCH`, `OPTIONS`

Headers: `Authorization`, `Content-Type`

## Nginx

```nginx
client_max_body_size 6M;
```

## POST /themes/submit

- **Auth:** Bearer JWT (required)
- **Content-Type:** `multipart/form-data`
- **Fields:** `name` (string, 1–80), `file` (.zip)

See the full algorithm in the project specification: validate ZIP, merge `theme.json`, slugify ID, commit to `theme-submissions`, open PR, return `202`.

### Response (202)

```json
{
  "ok": true,
  "message": "Тема отправлена на модерацию",
  "theme_id": "ocean-mint"
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Invalid ZIP |
| 401 | Unauthorized |
| 409 | Duplicate pending theme |
| 413 | File too large |
| 429 | Rate limit |
| 500 | GitHub / internal error |

## GitHub App module

Required functions:

- `getInstallationToken()`
- `createBranch(repo, branch, fromSha)`
- `createOrUpdateFiles(repo, branch, files[])`
- `createPullRequest(repo, title, head, base, body)`

## Optional

`GET /themes/my-submissions` — list user submissions (pending/approved/rejected).

## Test

```bash
TOKEN=$(curl -s -X POST https://api.16-launcher.ru/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"..."}' | jq -r .access_token)

curl -X POST https://api.16-launcher.ru/themes/submit \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Test Theme" \
  -F "file=@test-theme.zip"
```

Expected: `202` and a PR in `16steyy/theme-submissions`.

## Owner checklist

| # | Action |
|---|--------|
| 1 | Create private repo `16steyy/theme-submissions` (copy from `templates/theme-submissions/`) |
| 2 | Create GitHub App → App ID, PEM, Installation ID |
| 3 | Secret `PUBLISH_TOKEN` in theme-submissions |
| 4 | Set env on VPS → redeploy API |
| 5 | Deploy site-launcher |
| 6 | E2E test: login → upload → approve PR → `/themes` |
