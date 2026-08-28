# Download mirror — API setup (VPS)

GitHub release files are served from `release-assets.githubusercontent.com`. In some networks (including many ISPs in Russia) that host is slow or unreachable without VPN. The site can point download buttons to a mirror on **api.16-launcher.ru** instead.

Implement this in the **api.16-launcher.ru** backend repository.

## URL format

The site build script writes mirror URLs like:

```text
https://api.16-launcher.ru/releases/v3.2.6/16Launcher_3.2.6_x64-setup.exe
```

Pattern: `{DOWNLOAD_MIRROR_BASE}/v{version}/{filename}`

`filename` is taken from the GitHub release asset name (`.exe`, `.dmg`, `.deb`, `.rpm`, `.AppImage`).

## Option A — proxy from GitHub (recommended)

No need to upload binaries manually. The API streams the file from GitHub when the user downloads.

### Route

`GET /releases/v:version/:filename`

Example: `GET /releases/v3.2.6/16Launcher_3.2.6_x64-setup.exe`

### Behaviour

1. Validate `version` and `filename` (alphanumeric, dots, dashes, underscores only).
2. Resolve the GitHub asset URL:
   `https://github.com/launcherdev11/rust-launcher/releases/download/v{version}/{filename}`
3. Stream the response to the client with headers:
   - `Content-Type: application/octet-stream`
   - `Content-Disposition: attachment; filename="..."`
   - `Cache-Control: public, max-age=3600`
4. Optional: cache on disk or in object storage after first fetch.

### Nginx

```nginx
location /releases/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_buffering off;
    proxy_read_timeout 600s;
    client_max_body_size 0;
}
```

Large files (AppImage ~110 MB) need a long read timeout.

## Option B — static files on disk

Copy release assets to the server after each GitHub release:

```text
/var/www/launcher-releases/v3.2.6/16Launcher_3.2.6_x64-setup.exe
```

Serve with Nginx `alias` or upload to object storage (S3, Yandex Object Storage) and use that URL as `DOWNLOAD_MIRROR_BASE`.

## CORS

Not required for direct browser navigation (`<a href="...">`). Required only if you add a fetch-based download UI later.

## Enable mirror on the site

The mirror is **enabled by default** (`https://api.16-launcher.ru/releases`). The site uses API URLs when available and falls back to GitHub if the mirror is disabled or missing a file.

To override at build time:

```bash
DOWNLOAD_MIRROR_BASE=https://api.16-launcher.ru/releases npm run build
```

To disable mirrors (GitHub only):

```bash
DOWNLOAD_MIRROR_BASE=0 npm run build
```

Optional GitHub Actions variable `DOWNLOAD_MIRROR_BASE` overrides the default when set.

## Smoke test

```bash
curl -I "https://api.16-launcher.ru/releases/v3.2.6/16Launcher_3.2.6_x64-setup.exe"
```

Expect `200` or `302` and `Content-Length` around 23 MB for the Windows installer.

Without VPN, the same request to GitHub often times out:

```bash
curl -I "https://github.com/launcherdev11/rust-launcher/releases/download/v3.2.6/16Launcher_3.2.6_x64-setup.exe"
```

## Until the mirror is live

Download buttons still point to GitHub. Users in affected regions can use VPN or download from the [GitHub Releases](https://github.com/launcherdev11/rust-launcher/releases) page when it loads.
