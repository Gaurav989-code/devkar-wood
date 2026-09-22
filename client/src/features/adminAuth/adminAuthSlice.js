import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getCurrentAdminRequest,
  loginAdminRequest,
  logoutAdminRequest,
} from "../../services/adminAuthService.js";

const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

/*
|--------------------------------------------------------------------------
| Admin login
|--------------------------------------------------------------------------
*/

export const loginAdmin = createAsyncThunk(
  "adminAuth/loginAdmin",

  async (credentials, { rejectWithValue }) => {
    try {
      return await loginAdminRequest(credentials);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Unable to log in"));
    }
  },
);

/*
|--------------------------------------------------------------------------
| Restore admin session
|--------------------------------------------------------------------------
*/

export const fetchCurrentAdmin = createAsyncThunk(
  "adminAuth/fetchCurrentAdmin",

  async (_, { rejectWithValue }) => {
    try {
      return await getCurrentAdminRequest();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Admin session not found"));
    }
  },
);

/*
|--------------------------------------------------------------------------
| Admin logout
|--------------------------------------------------------------------------
*/

export const logoutAdmin = createAsyncThunk(
  "adminAuth/logoutAdmin",

  async (_, { rejectWithValue }) => {
    try {
      return await logoutAdminRequest();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Unable to log out"));
    }
  },
);

const initialState = {
  admin: null,
  authenticated: false,

  // Becomes true after /me has been checked.
  initialized: false,

  loginLoading: false,
  sessionLoading: false,
  logoutLoading: false,

  error: null,
};

const adminAuthSlice = createSlice({
  name: "adminAuth",

  initialState,

  reducers: {
    clearAdminAuthError: (state) => {
      state.error = null;
    },

    clearAdminSession: (state) => {
      state.admin = null;
      state.authenticated = false;
      state.initialized = true;

      state.loginLoading = false;
      state.sessionLoading = false;
      state.logoutLoading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /*
      |--------------------------------------------------------------------------
      | Login
      |--------------------------------------------------------------------------
      */

      .addCase(loginAdmin.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })

      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.initialized = true;

        state.admin = action.payload?.data?.admin || null;

        state.authenticated = Boolean(state.admin);
      })

      .addCase(loginAdmin.rejected, (state, action) => {
        state.loginLoading = false;
        state.initialized = true;

        state.admin = null;
        state.authenticated = false;

        state.error = action.payload || "Unable to log in";
      })

      /*
      |--------------------------------------------------------------------------
      | Restore session
      |--------------------------------------------------------------------------
      */

      .addCase(fetchCurrentAdmin.pending, (state) => {
        state.sessionLoading = true;
        state.error = null;
      })

      .addCase(fetchCurrentAdmin.fulfilled, (state, action) => {
        state.sessionLoading = false;
        state.initialized = true;

        state.admin = action.payload?.data?.admin || null;

        state.authenticated = Boolean(state.admin);
      })

      .addCase(fetchCurrentAdmin.rejected, (state) => {
        state.sessionLoading = false;
        state.initialized = true;

        state.admin = null;
        state.authenticated = false;

        // An expired or absent session is normal.
        state.error = null;
      })

      /*
      |--------------------------------------------------------------------------
      | Logout
      |--------------------------------------------------------------------------
      */

      .addCase(logoutAdmin.pending, (state) => {
        state.logoutLoading = true;
        state.error = null;
      })

      .addCase(logoutAdmin.fulfilled, (state) => {
        state.logoutLoading = false;
        state.initialized = true;

        state.admin = null;
        state.authenticated = false;
        state.error = null;
      })

      .addCase(logoutAdmin.rejected, (state, action) => {
        state.logoutLoading = false;

        state.error = action.payload || "Unable to log out";
      });
  },
});

export const { clearAdminAuthError, clearAdminSession } =
  adminAuthSlice.actions;

export const selectCurrentAdmin = (state) => state.adminAuth.admin;

export const selectAdminAuthenticated = (state) =>
  state.adminAuth.authenticated;

export const selectAdminInitialized = (state) => state.adminAuth.initialized;

export const selectAdminLoginLoading = (state) => state.adminAuth.loginLoading;

export const selectAdminSessionLoading = (state) =>
  state.adminAuth.sessionLoading;

export const selectAdminLogoutLoading = (state) =>
  state.adminAuth.logoutLoading;

export const selectAdminAuthError = (state) => state.adminAuth.error;

export default adminAuthSlice.reducer;
