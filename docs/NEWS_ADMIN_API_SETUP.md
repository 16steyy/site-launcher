# News admin — API setup (VPS)

This document describes the backend endpoints required for `/admin/news` on the site.

## Access control

The frontend allows access when any of these is true:

- `GET /me` returns `is_admin: true`, or `role: "admin"`, or `roles` includes `"admin"`
- the user's nickname is listed in `VITE_NEWS_ADMIN_NICKNAMES` (comma-separated)

The API must also enforce admin rights on every endpoint below.

## Repository

News are published to the same repository the site already reads:

- `16steyy/16Launcher-Site-News`
- index file: `news/index.json`
- post layout:
  - `updates/<version>/post.md`
  - `updates/<version>/meta.json`
  - `updates/<version>/assets/cover.png`

## CORS

Same as theme uploads:

- `https://16-launcher.ru`
- `http://localhost:5173`

Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

Headers: `Authorization`, `Content-Type`

## GET /news/admin/posts

- **Auth:** Bearer JWT (admin only)
- **Response:** `{ "posts": [ ...full post objects with markdown... ] }`

## GET /news/admin/posts/:slug

- **Auth:** Bearer JWT (admin only)
- **Response:**

```json
{
  "slug": "update-3-2-3",
  "title": "Обновление 3.2.3",
  "version": "3.2.3",
  "date": "2026-08-28",
  "excerpt": "Краткое описание",
  "markdown": "# Заголовок\n\nТекст..."
}
```

## POST /news/admin/posts

- **Auth:** Bearer JWT (admin only)
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `title` (string, required)
  - `slug` (string, required, unique)
  - `version` (string, optional)
  - `date` (string `YYYY-MM-DD`, required)
  - `excerpt` (string, optional)
  - `markdown` (string, required)
  - `cover` (image file, optional)

### Expected behaviour

1. Create `updates/<version-or-slug>/post.md` from `markdown`
2. Create/update `meta.json` if needed
3. Save cover to `assets/cover.png` when provided
4. Prepend the item to `news/index.json`
5. Commit and push to the news repository

### Response (201)

```json
{
  "ok": true,
  "slug": "update-3-2-3"
}
```

## PUT /news/admin/posts/:slug

Same fields as `POST`. Updates the existing post and `news/index.json`.

## DELETE /news/admin/posts/:slug

- **Auth:** Bearer JWT (admin only)
- Removes the post from `news/index.json` and deletes its folder in the repository.

## Frontend env

```env
VITE_NEWS_ADMIN_NICKNAMES=your_nickname,another_admin
```

Use this only until the backend returns an admin flag in `/me`.
