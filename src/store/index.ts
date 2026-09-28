import { configureStore } from "@reduxjs/toolkit";

import { setSessionExpiredListener } from "@/lib/api-client";
import authReducer, { authActions } from "@/store/auth-slice";
import onboardingReducer from "@/store/onboarding-slice";
import themeReducer from "@/theme/theme-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    theme: themeReducer,
  },
});

setSessionExpiredListener(() => store.dispatch(authActions.sessionExpired()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
