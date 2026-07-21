const TOKEN_KEY = "token";
const USER_KEY = "user";
const TAB_TOKEN_KEY = "sme_tab_token";
const TAB_USER_KEY = "sme_tab_user";
const SESSION_COOKIE_KEY = "sme_session";
const SESSION_EXPIRES_AT_KEY = "sme_session_expires_at";
const COOKIE_MAX_AGE = 60 * 5;

function setCookie(name, value, maxAge = COOKIE_MAX_AGE) {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure}`;
}

function deleteCookie(name) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Strict`;
}

export function getAuthToken() {
  const expiresAt = Number(sessionStorage.getItem(SESSION_EXPIRES_AT_KEY) || 0);
  if (!expiresAt || Date.now() > expiresAt) {
    clearAuthSession();
    return "";
  }

  setCookie(SESSION_COOKIE_KEY, "active");
  sessionStorage.setItem(
    SESSION_EXPIRES_AT_KEY,
    String(Date.now() + COOKIE_MAX_AGE * 1000),
  );

  return sessionStorage.getItem(TAB_TOKEN_KEY) || "";
}

export function getAuthSessionExpiresAt() {
  return Number(sessionStorage.getItem(SESSION_EXPIRES_AT_KEY) || 0);
}

export function getAuthUser() {
  return sessionStorage.getItem(TAB_USER_KEY) || localStorage.getItem(USER_KEY) || "";
}

export function setAuthSession(token, user) {
  const userText = typeof user === "string" ? user : JSON.stringify(user || {});

  sessionStorage.setItem(TAB_TOKEN_KEY, token);
  sessionStorage.setItem(TAB_USER_KEY, userText);
  sessionStorage.setItem(
    SESSION_EXPIRES_AT_KEY,
    String(Date.now() + COOKIE_MAX_AGE * 1000),
  );
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, userText);
  setCookie(SESSION_COOKIE_KEY, "active");
}

export function clearAuthSession() {
  sessionStorage.removeItem(TAB_TOKEN_KEY);
  sessionStorage.removeItem(TAB_USER_KEY);
  sessionStorage.removeItem(SESSION_EXPIRES_AT_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  deleteCookie(TOKEN_KEY);
  deleteCookie(USER_KEY);
  deleteCookie(SESSION_COOKIE_KEY);
}
