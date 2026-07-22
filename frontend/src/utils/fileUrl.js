const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ""
).replace(/\/$/, "");

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

export function buildFileUrl(file, options = {}) {
  const value = normalizePath(file);
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) return value;

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
