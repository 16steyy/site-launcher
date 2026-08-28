import { ApiError, apiRequest, getApiBaseUrl } from "./client.js";

export async function fetchAdminNewsPosts(accessToken) {
  return apiRequest("/news/admin/posts", { accessToken });
}

export async function fetchAdminNewsPost(accessToken, slug) {
  return apiRequest(`/news/admin/posts/${encodeURIComponent(slug)}`, {
    accessToken,
  });
}

export async function createNewsPost({ accessToken, payload, cover }) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("slug", payload.slug);
  formData.append("version", payload.version || "");
  formData.append("date", payload.date);
  formData.append("excerpt", payload.excerpt || "");
  formData.append("markdown", payload.markdown || "");
  if (cover) {
    formData.append("cover", cover);
  }

  const response = await fetch(`${getApiBaseUrl()}/news/admin/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  return parseNewsResponse(response);
}

export async function updateNewsPost({ accessToken, slug, payload, cover }) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("slug", payload.slug);
  formData.append("version", payload.version || "");
  formData.append("date", payload.date);
  formData.append("excerpt", payload.excerpt || "");
  formData.append("markdown", payload.markdown || "");
  if (cover) {
    formData.append("cover", cover);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/news/admin/posts/${encodeURIComponent(slug)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  return parseNewsResponse(response);
}

export async function deleteNewsPost({ accessToken, slug }) {
  return apiRequest(`/news/admin/posts/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    accessToken,
  });
}

async function parseNewsResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  let body = null;
  if (contentType.includes("application/json")) {
    body = await response.json();
  } else {
    const text = await response.text();
    body = text ? { message: text } : null;
  }

  if (!response.ok) {
    throw new ApiError(body?.message || body?.error || "News request failed", {
      status: response.status,
      code: body?.code || "",
      details: body,
    });
  }

  return body;
}

export function mapNewsAdminError(error, t) {
  const errors = t?.newsAdmin?.errors || {};
  const status = error?.status || 0;
  const message = String(error?.message || "").toLowerCase();

  if (status === 401 || status === 403) {
    return errors.forbidden;
  }
  if (status === 404 || message.includes("not found")) {
    return errors.notFound;
  }
  if (status === 409 || message.includes("exist") || message.includes("duplicate")) {
    return errors.duplicateSlug;
  }
  if (status === 413 || message.includes("large") || message.includes("size")) {
    return errors.coverTooLarge;
  }
  if (status === 429 || message.includes("rate")) {
    return errors.rateLimit;
  }
  if (status === 501 || message.includes("not implemented")) {
    return errors.apiUnavailable;
  }

  return errors.generic;
}
