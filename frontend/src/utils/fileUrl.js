import { getAuthToken } from "./authSession";
import { API_BASE_URL } from "../config/apiBase.js";

const normalizePath = (value) =>
  String(value || "")
    .trim()
    .replace(/\\/g, "/");

const encodePathSegments = (value) =>
  normalizePath(value)
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

// Extracts the file ID out of a Google Drive webViewLink/webContentLink
// (e.g. "https://drive.google.com/file/d/<ID>/view?usp=drivesdk", or the
// older "https://drive.google.com/open?id=<ID>" form).
function extractDriveFileId(url) {
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch) return idParamMatch[1];

  return null;
}

export function buildFileUrl(file, options = {}) {
  const value = normalizePath(file);
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    // Route Google Drive links through our own backend instead of opening
    // Google's page directly — the uploaded file is never shared on Drive,
    // so a direct link 403s for anyone but the uploader. The backend proxy
    // streams the file server-side using the uploader's own connection.
    if (/drive\.google\.com/i.test(value)) {
      const driveFileId = extractDriveFileId(value);
      if (driveFileId) {
        return `${API_BASE_URL}/google-drive/file/${encodeURIComponent(driveFileId)}/stream`;
      }
    }

    return value;
  }

  if (value.startsWith("/uploads/")) {
    return `${API_BASE_URL}/${encodePathSegments(value)}`;
  }

  if (value.startsWith("uploads/")) {
    return `${API_BASE_URL}/${encodePathSegments(value)}`;
  }

  const lower = value.toLowerCase();
  const folder =
    options.folder ||
    (value.startsWith("MOU-") ||
    value.startsWith("MOU-EDIT-") ||
    lower.includes("mou")
      ? "mou"
      : "dokumentasi");

  return `${API_BASE_URL}/uploads/${folder}/${encodePathSegments(value)}`;
}

// URLs built by buildFileUrl() for a Drive-backed document point at our own
// backend proxy, which requires the caller's Bearer token — a plain <img>,
// <iframe>, or window.open() can never attach that header. Anything else
// (plain /uploads/... static assets) has no such requirement.
export function isAuthorizedFileUrl(url) {
  return typeof url === "string" && url.includes("/google-drive/file/");
}

// Resolves a file URL to something an <img>/<iframe> src or window.open()
// can actually load: URLs that need our Bearer token are fetched with it
// and turned into a local blob: URL; anything else passes through as-is.
// Caller owns the returned blob: URL's lifetime — revoke it (revokeBlobUrl
// below) once it's no longer being displayed, e.g. on unmount or when the
// resolved URL changes again, to avoid leaking memory.
export async function resolveViewableFileUrl(url) {
  if (!url) return null;
  if (!isAuthorizedFileUrl(url)) return url;

  const token = getAuthToken();
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Gagal memuat dokumen.");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function revokeBlobUrl(url) {
  if (typeof url === "string" && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
