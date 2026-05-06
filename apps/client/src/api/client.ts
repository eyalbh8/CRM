export const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  throw new Error("VITE_API_URL is not set");
}

const accessTokenKey = "proline_access_token";

let accessToken = readStoredAccessToken();
let unauthorizedHandler: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;

  if (!token) {
    window.localStorage.removeItem(accessTokenKey);
    return;
  }

  window.localStorage.setItem(accessTokenKey, token);
}

export function getAccessToken() {
  return accessToken;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (response.status === 401 && !path.startsWith("/auth/login")) {
    unauthorizedHandler?.();
  }

  return response;
}

function readStoredAccessToken() {
  return window.localStorage.getItem(accessTokenKey);
}
