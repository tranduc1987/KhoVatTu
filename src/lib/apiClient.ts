const TOKEN_KEY = "khovattu_token";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "/api";
let unauthorizedHandler: (() => void) | null = null;

const buildUrl = (path: string) => {
  const base = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const setUnauthorizedHandler = (handler: () => void) => {
  unauthorizedHandler = handler;
};

export const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
      unauthorizedHandler?.();
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    const message = await response.text();
    throw new Error(message || "Có lỗi xảy ra khi gọi API.");
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return (response.text() as unknown) as T;
};

export const apiDownload = async (path: string, filename: string) => {
  const headers = new Headers();
  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), { headers });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuthToken();
      unauthorizedHandler?.();
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    const message = await response.text();
    throw new Error(message || "Không thể tải file.");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
