import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { logoutFromOneSignal } from "@/lib/onesignal";

import { clearTokens, getTokens, saveTokens } from "@/lib/api-client";
import {
  type AuthUser,
  getMe,
  googleSignIn as googleSignInRequest,
  signIn as signInRequest,
  signOutRequest,
  signUp as signUpRequest,
  type SignInPayload,
  type SignUpPayload,
} from "@/lib/auth-api";
import { getGoogleIdToken, GoogleSignInCancelledError, signOutFromGoogle } from "@/lib/google-auth";
import { getProfile, type Profile } from "@/lib/profile-api";
import { onboardingActions } from "@/store/onboarding-slice";

type Status = "idle" | "loading" | "authenticated" | "unauthenticated";

// Tokens are owned by api-client (SecureStore + in-memory cache), not Redux.
type Session = {
  user: AuthUser | null;
  profile: Profile | null;
};

type AuthState = Session & {
  status: Status;
  // True once initializeAuth has resolved the stored session at launch.
  // App gates first render on this, not on status — status also goes
  // "loading" during sign-in, and unmounting the navigator then blanks the screen.
  initialized: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  profile: null,
  status: "idle",
  initialized: false,
  error: null,
};

// Fetches onboarding/profile data alongside auth and hydrates the onboarding
// slice with it. Never throws — a failed profile fetch shouldn't block
// sign-in/sign-up; getOnboardingRoute(null) just falls through to routing
// the user through onboarding again.
async function loadProfile(dispatch: Dispatch<UnknownAction>): Promise<Profile | null> {
  try {
    const profile = await getProfile();
    dispatch(onboardingActions.hydrateFromProfile(profile));
    return profile;
  } catch {
    return null;
  }
}

export const signIn = createAsyncThunk(
  "auth/signIn",
  async (payload: SignInPayload, { dispatch, rejectWithValue }) => {
    try {
      const session = await signInRequest(payload);
      await saveTokens(session.accessToken, session.refreshToken);
      const profile = await loadProfile(dispatch);
      const result: Session = { user: session.user, profile };
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Sign in failed");
    }
  },
);

export const signUp = createAsyncThunk(
  "auth/signUp",
  async (payload: SignUpPayload, { dispatch, rejectWithValue }) => {
    try {
      const session = await signUpRequest(payload);
      await saveTokens(session.accessToken, session.refreshToken);
      const profile = await loadProfile(dispatch);
      const result: Session = { user: session.user, profile };
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Sign up failed");
    }
  },
);

// Signs in or creates the account — the backend handles both. Rejects with
// `null` when the user just closed the Google picker, so no error shows.
export const signInWithGoogle = createAsyncThunk(
  "auth/signInWithGoogle",
  async (_: void, { dispatch, rejectWithValue }) => {
    try {
      const idToken = await getGoogleIdToken();
      const session = await googleSignInRequest(idToken);
      await saveTokens(session.accessToken, session.refreshToken);
      const profile = await loadProfile(dispatch);
      const result: Session = { user: session.user, profile };
      return result;
    } catch (error) {
      if (error instanceof GoogleSignInCancelledError) return rejectWithValue(null);
      return rejectWithValue(error instanceof Error ? error.message : "Google sign-in failed");
    }
  },
);

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_: void, { dispatch }): Promise<Session & { authenticated: boolean }> => {
    const { accessToken, refreshToken } = await getTokens();
    if (!accessToken || !refreshToken) {
      return { user: null, profile: null, authenticated: false };
    }

    try {
      // api-client refreshes the access token on a 401 automatically.
      const { user } = await getMe();
      const profile = await loadProfile(dispatch);
      return { user, profile, authenticated: true };
    } catch {
      await clearTokens();
      return { user: null, profile: null, authenticated: false };
    }
  },
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  logoutFromOneSignal();
  signOutFromGoogle();

  try {
    if ((await getTokens()).accessToken) {
      await signOutRequest();
    }
  } finally {
    await clearTokens();
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Refresh token rejected by the API — see setSessionExpiredListener.
    sessionExpired: (state) => {
      state.user = null;
      state.profile = null;
      state.status = "unauthenticated";
      state.error = "Your session expired. Please sign in again.";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.status = "authenticated";
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = (action.payload as string | undefined) ?? "Sign in failed";
      })
      .addCase(signUp.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.status = "authenticated";
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = (action.payload as string | undefined) ?? "Sign up failed";
      })
      // No pending case: the email form's button reads status "loading", so
      // AuthScreen tracks the Google button's spinner locally instead.
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.status = "authenticated";
        state.error = null;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.error = (action.payload as string | null | undefined) ?? null;
      })
      .addCase(initializeAuth.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        const { authenticated, ...session } = action.payload;
        Object.assign(state, session);
        state.status = authenticated ? "authenticated" : "unauthenticated";
        state.initialized = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.status = "unauthenticated";
        state.error = null;
      });
  },
});

export const authActions = authSlice.actions;

export default authSlice.reducer;
