import { TurboModuleRegistry } from "react-native";

type GoogleSigninModule = typeof import("@react-native-google-signin/google-signin");

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/** Thrown when the user closes the Google account picker — not an error to show. */
export class GoogleSignInCancelledError extends Error {
  constructor() {
    super("Google sign-in was cancelled");
    this.name = "GoogleSignInCancelledError";
  }
}

let configured = false;

// The package's JS entry calls TurboModuleRegistry.getEnforcing, which throws
// on a build made before it was added. Check first, then require lazily, so
// an old dev build still runs (Google sign-in just reports unavailable).
function getGoogleSignin(): GoogleSigninModule | null {
  if (!TurboModuleRegistry.get("RNGoogleSignin")) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const google = require("@react-native-google-signin/google-signin") as GoogleSigninModule;

  if (!configured) {
    google.GoogleSignin.configure({
      // The ID token's audience is the *web* client ID — the backend verifies
      // against the same value (GOOGLE_CLIENT_IDS).
      webClientId: WEB_CLIENT_ID,
      iosClientId: IOS_CLIENT_ID,
    });
    configured = true;
  }

  return google;
}

/**
 * Opens the native Google account picker and returns the ID token to send to
 * POST /auth/google. Throws GoogleSignInCancelledError if the user backs out.
 */
export async function getGoogleIdToken(): Promise<string> {
  if (!WEB_CLIENT_ID) {
    throw new Error("Google sign-in isn't configured (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID).");
  }

  const google = getGoogleSignin();
  if (!google) {
    throw new Error("Google sign-in needs a new app build. Rebuild the app and try again.");
  }

  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = google;

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) throw new GoogleSignInCancelledError();
    if (!response.data.idToken) throw new Error("Google didn't return an ID token.");

    return response.data.idToken;
  } catch (error) {
    if (error instanceof GoogleSignInCancelledError) throw error;
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          throw new GoogleSignInCancelledError();
        case statusCodes.IN_PROGRESS:
          throw new Error("Google sign-in is already in progress.");
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new Error("Google Play Services is not available on this device.");
      }
    }
    throw error instanceof Error ? error : new Error("Google sign-in failed.");
  }
}

/** Clears the cached Google account so the picker shows again next time. */
export async function signOutFromGoogle() {
  try {
    await getGoogleSignin()?.GoogleSignin.signOut();
  } catch {
    // Best-effort — the app session is what matters.
  }
}
