import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "theme-preference";

type ThemeState = {
  preference: ThemePreference;
};

const initialState: ThemeState = {
  preference: "system",
};

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export const loadThemePreference = createAsyncThunk("theme/load", async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return isThemePreference(stored) ? stored : "system";
});

export const setThemePreference = createAsyncThunk(
  "theme/setPreference",
  async (preference: ThemePreference, { dispatch }) => {
    // Commit immediately (same tick) so the UI updates without waiting on
    // the AsyncStorage write, matching the previous zustand `persist`
    // middleware's optimistic-set-then-persist behavior.
    dispatch(themeActions.setPreferenceLocal(preference));
    await AsyncStorage.setItem(STORAGE_KEY, preference);
  },
);

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setPreferenceLocal: (state, action: PayloadAction<ThemePreference>) => {
      state.preference = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadThemePreference.fulfilled, (state, action) => {
      state.preference = action.payload;
    });
  },
});

export const themeActions = themeSlice.actions;
export default themeSlice.reducer;
