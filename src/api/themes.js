import { ApiError, getApiBaseUrl } from "./client.js";

export const THEME_MAX_ZIP_BYTES = 5 * 1024 * 1024;

export async function submitTheme({ name, file, accessToken }) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("file", file);

  const response = await fetch(`${getApiBaseUrl()}/themes/submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const contentType = response.headers.get("content-type") || "";
  let body = null;
  if (contentType.includes("application/json")) {
    body = await response.json();
  } else {
    const text = await response.text();
    body = text ? { message: text } : null;
  }

  if (!response.ok) {
    throw new ApiError(body?.message || body?.error || "Submit failed", {
      status: response.status,
      code: body?.code || "",
      details: body,
    });
  }

  return body;
}

export function mapThemeSubmitError(error, t) {
  const errors = t?.themes?.errors || {};
  const status = error?.status || 0;
  const message = String(error?.message || "").toLowerCase();

  if (status === 413 || message.includes("large") || message.includes("size")) {
    return errors.tooLarge;
  }
  if (status === 409 || message.includes("duplicate") || message.includes("moderation")) {
    return errors.duplicate;
  }
  if (status === 429 || message.includes("rate")) {
    return errors.rateLimit;
  }
  if (status === 400 || message.includes("theme.json") || message.includes("style.css") || message.includes("zip")) {
    return errors.invalidZip;
  }

  return errors.generic;
}
