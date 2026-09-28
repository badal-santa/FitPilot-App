import { apiRequest } from "@/lib/api-client";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
};

export type AuthSession = {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  name: string;
  email: string;
  password: string;
};

/**
 * Register
 */
export async function signUp(
  payload: SignUpPayload,
): Promise<AuthSession> {
  return apiRequest<AuthSession>("/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

/**
 * Login
 */
export async function signIn(
  payload: SignInPayload,
): Promise<AuthSession> {
  return apiRequest<AuthSession>("/auth/login", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

/**
 * Sign in (or sign up) with a Google ID token from the native account picker.
 * Same session shape as /auth/login; isNewUser is true on first sign-in.
 */
export async function googleSignIn(
  idToken: string,
): Promise<AuthSession & { isNewUser: boolean }> {
  return apiRequest<AuthSession & { isNewUser: boolean }>("/auth/google", {
    method: "POST",
    body: { idToken },
    auth: false,
  });
}

/**
 * Get current authenticated user
 */
export async function getMe() {
  return apiRequest<{
    success: true;
    user: AuthUser;
  }>("/auth/me");
}

/**
 * Logout
 */
export async function signOutRequest() {
  return apiRequest<{
    success: true;
    message: string;
  }>("/auth/logout", { method: "POST" });
}