import { useEffect, useMemo, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";

import discordIcon from "../../assets/discord.png";
import qrIcon from "../../assets/qr.png";
import telegramIcon from "../../assets/telegram.png";
import { useI18n } from "../i18n/I18nProvider";

const SITE_ICON_URL = "/icon.png";

function buildShareUrl(slug) {
  if (typeof window === "undefined") {
    return `https://16-launcher.ru/news/${slug}`;
  }
  return `${window.location.origin}/news/${slug}`;
}

function buildTelegramShareUrl(url, title) {
  const params = new URLSearchParams({
    url,
    text: title ? `${title}\n` : "",
  });
  return `https://t.me/share/url?${params.toString()}`;
}

function buildShareText(url, title) {
  return title ? `${title}\n${url}` : url;
}

function QrCodeCanvas({ url }) {
  const containerRef = useRef(null);

  const qrCode = useMemo(
    () =>
      new QRCodeStyling({
        width: 280,
        height: 280,
        type: "svg",
        data: url,
        image: SITE_ICON_URL,
        margin: 8,
        qrOptions: {
          errorCorrectionLevel: "H",
        },
        dotsOptions: {
          color: "#14141f",
          type: "rounded",
        },
        backgroundOptions: {
          color: "#f4f4f8",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 6,
          imageSize: 0.34,
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#14141f",
        },
        cornersDotOptions: {
          type: "dot",
          color: "#14141f",
        },
      }),
    [url],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    node.replaceChildren();
    qrCode.update({ data: url });
    qrCode.append(node);
  }, [qrCode, url]);

  return <div ref={containerRef} className="news-share-qr-canvas" aria-hidden="true" />;
}

export default function NewsShareQr({ slug, title }) {
  const { messages } = useI18n();
  const [open, setOpen] = useState(false);
  const [discordCopied, setDiscordCopied] = useState(false);
  const shareUrl = buildShareUrl(slug);
  const telegramShareUrl = buildTelegramShareUrl(shareUrl, title);
  const shareText = buildShareText(shareUrl, title);

  useEffect(() => {
    if (!open) return;

    function onKey(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setDiscordCopied(false);
    }
  }, [open]);

  async function shareToDiscord() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: title || messages.news.shareQrTitle,
          text: title || undefined,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setDiscordCopied(true);
      window.setTimeout(() => setDiscordCopied(false), 2200);
    } catch {
      window.prompt(messages.news.shareCopyPrompt, shareText);
    }
  }

  return (
    <>
      <button
        type="button"
        className="news-share-qr-btn"
        aria-label={messages.news.shareQr}
        title={messages.news.shareQr}
        onClick={() => setOpen(true)}
      >
        <img src={qrIcon} alt="" className="news-share-qr-btn-icon" />
      </button>

      {open && (
        <div className="news-share-qr-backdrop" onClick={() => setOpen(false)}>
          <div
            className="news-share-qr-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="news-share-qr-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="news-share-qr-close"
              aria-label={messages.news.shareQrClose}
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <h2 id="news-share-qr-title" className="news-share-qr-title">
              {messages.news.shareQrTitle}
            </h2>
            {title ? <p className="news-share-qr-subtitle">{title}</p> : null}

            <div className="news-share-qr-frame">
              <QrCodeCanvas url={shareUrl} />
            </div>

            <p className="news-share-qr-hint">{messages.news.shareQrHint}</p>
            <p className="news-share-qr-url">{shareUrl}</p>

            <div className="news-share-qr-social">
              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noreferrer"
                className="news-share-qr-social-btn"
                aria-label={messages.news.shareTelegram}
                title={messages.news.shareTelegram}
              >
                <img src={telegramIcon} alt="" className="news-share-qr-social-icon" />
              </a>
              <button
                type="button"
                className="news-share-qr-social-btn"
                aria-label={messages.news.shareDiscord}
                title={discordCopied ? messages.news.shareCopied : messages.news.shareDiscord}
                onClick={shareToDiscord}
              >
                <img src={discordIcon} alt="" className="news-share-qr-social-icon" />
              </button>
            </div>
            {discordCopied ? (
              <p className="news-share-qr-copied">{messages.news.shareCopied}</p>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
