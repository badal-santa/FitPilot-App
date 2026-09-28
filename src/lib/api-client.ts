import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Single place for everything network-related: the API base URL, the
 * access/refresh tokens, and the fetch wrapper every *-api.ts module uses.
 *
 * - Tokens live in SecureStore and are cached in memory, so every request
 *   picks up the latest token automatically (callers never pass one).
 * - A 401 triggers one refresh (shared across concurrent requests) and a
 *   retry; if the refresh fails, tokens are cleared and the session-expired
 *   listener fires so the store can sign the user out.
 */

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------

const DEFAULT_PORT = "8787";
const LOOPBACK_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"];

// On a phone/emulator "localhost" is the device itself, not the dev machine.
// So in development, when the configured URL points at loopback, send API
// calls through Metro instead: metro.config.js proxies /__api/* to the local
// backend. The device can always reach Metro (it's where the JS bundle comes
// from) — USB, Wi-Fi or emulator — so this needs no extra `adb reverse`.
// Release builds, or a non-localhost EXPO_PUBLIC_API_URL, use the URL as-is.
function resolveApiUrl(): string {
  const configured = (process.env.EXPO_PUBLIC_API_URL ?? `http://localhost:${DEFAULT_PORT}`).replace(
    /\/+$/,
    "",
  );

  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    return configured;
  }

  if (!__DEV__ || Platform.OS === "web" || !LOOPBACK_HOSTS.includes(url.hostname)) {
    return configured;
  }

  // hostUri is how this device reached Metro, e.g. "localhost:8081" (USB),
  // "192.168.1.132:8081" (Wi-Fi) or "10.0.2.2:8081" (emulator).
  const metroHost = Constants.expoConfig?.hostUri;
  if (metroHost) {
    return `http://${metroHost}/__api`;
  }

  return configured;
}

export const API_URL = resolveApiUrl();

if (__DEV__) console.log("🌐 API_URL:", API_URL);

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

const ACCESS_TOKEN_KEY = "fitpilot_access_token";
const REFRESH_TOKEN_KEY = "fitpilot_refresh_token";

type Tokens = { accessToken: string | null; refreshToken: string | null };

let tokens: Tokens = { accessToken: null, refreshToken: null };
let tokensLoaded = false;
let refreshPromise: Promise<boolean> | null = null;
let sessionExpiredListener: (() => void) | null = null;

async function ensureTokensLoaded() {
  if (tokensLoaded) return;
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);
  tokens = { accessToken, refreshToken };
  tokensLoaded = true;
}

export async function getTokens(): Promise<Tokens> {
  await ensureTokensLoaded();
  return tokens;
}

export async function saveTokens(accessToken: string, refreshToken: string) {
  tokens = { accessToken, refreshToken };
  tokensLoaded = true;
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function clearTokens() {
  tokens = { accessToken: null, refreshToken: null };
  tokensLoaded = true;
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

/** Called when a refresh fails and the user has to sign in again. */
export function setSessionExpiredListener(listener: (() => void) | null) {
  sessionExpiredListener = listener;
}

// Deduplicated so parallel 401s share a single /auth/refresh call.
function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken } = await getTokens();
      if (!refreshToken) return false;
      try {
        const json = await apiRequest<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
          method: "POST",
          body: { refreshToken },
          auth: false,
        });
        await saveTokens(json.accessToken, json.refreshToken);
        return true;
      } catch {
        await clearTokens();
        sessionExpiredListener?.();
        return false;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export type ApiErrorBody = { success?: boolean; message?: string; error?: string; data?: unknown };

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | null;
  constructor(message: string, status: number, body: ApiErrorBody | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  /** Attach the Bearer token and auto-refresh on 401. Defaults to true. */
  auth?: boolean;
};

function buildUrl(endpoint: string, params?: RequestOptions["params"]) {
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const query = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join("&");
    if (query) url += `${url.includes("?") ? "&" : "?"}${query}`;
  }
  return url;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params, headers, auth = true } = options;

  const send = async () => {
    const accessToken = auth ? (await getTokens()).accessToken : null;
    try {
      return await fetch(buildUrl(endpoint, params), {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(`Can't reach the server at ${API_URL}. Check your connection.`, 0, null);
    }
  };

  let response = await send();
  if (response.status === 401 && auth && (await refreshSession())) {
    response = await send();
  }

  const data = (await response.json().catch(() => null)) as T | ApiErrorBody | null;

  if (!response.ok) {
    const errorBody = data as ApiErrorBody | null;
    const message =
      (typeof errorBody?.message === "string" && errorBody.message) ||
      (typeof errorBody?.error === "string" && errorBody.error) ||
      "Something went wrong";
    throw new ApiError(message, response.status, errorBody);
  }

  return data as T;
}
