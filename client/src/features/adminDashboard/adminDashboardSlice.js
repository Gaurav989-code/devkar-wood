import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getAdminDashboardRequest } from "../../services/adminDashboardService.js";

const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

/*
|--------------------------------------------------------------------------
| Fetch dashboard
|--------------------------------------------------------------------------
*/

export const fetchAdminDashboard = createAsyncThunk(
  "adminDashboard/fetchAdminDashboard",

  async (_, { rejectWithValue }) => {
    try {
      return await getAdminDashboardRequest();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load admin dashboard"),
      );
    }
  },
);

const initialState = {
  overview: {
    totalRevenue: 0,
    averageOrderValue: 0,

    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,

    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,

    totalCategories: 0,
    activeCategories: 0,

    totalEnquiries: 0,
    newEnquiries: 0,
    quotedEnquiries: 0,
  },

  orderStatuses: {},
  paymentMethods: {},
  monthlySales: [],
  recentOrders: [],
  recentEnquiries: [],
  lowStockItems: [],

  loading: false,
  refreshing: false,
  loaded: false,
  error: null,
};

const adminDashboardSlice = createSlice({
  name: "adminDashboard",

  initialState,

  reducers: {
    clearAdminDashboardError: (state) => {
      state.error = null;
    },

    resetAdminDashboard: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        if (state.loaded) {
          state.refreshing = true;
        } else {
          state.loading = true;
        }

        state.error = null;
      })

      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        const dashboard = action.payload?.data || {};

        state.overview = {
          ...initialState.overview,
          ...(dashboard.overview || {}),
        };

        state.orderStatuses = dashboard.orderStatuses || {};

        state.paymentMethods = dashboard.paymentMethods || {};

        state.monthlySales = Array.isArray(dashboard.monthlySales)
          ? dashboard.monthlySales
          : [];

        state.recentOrders = Array.isArray(dashboard.recentOrders)
          ? dashboard.recentOrders
          : [];

        state.recentEnquiries = Array.isArray(dashboard.recentEnquiries)
          ? dashboard.recentEnquiries
          : [];

        state.lowStockItems = Array.isArray(dashboard.lowStockItems)
          ? dashboard.lowStockItems
          : [];

        state.loading = false;
        state.refreshing = false;
        state.loaded = true;
        state.error = null;
      })

      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;

        state.error = action.payload || "Unable to load admin dashboard";
      });
  },
});

export const { clearAdminDashboardError, resetAdminDashboard } =
  adminDashboardSlice.actions;

export const selectDashboardOverview = (state) => state.adminDashboard.overview;

export const selectOrderStatusSummary = (state) =>
  state.adminDashboard.orderStatuses;

export const selectPaymentMethodSummary = (state) =>
  state.adminDashboard.paymentMethods;

export const selectMonthlySales = (state) => state.adminDashboard.monthlySales;

export const selectRecentOrders = (state) => state.adminDashboard.recentOrders;

export const selectRecentEnquiries = (state) =>
  state.adminDashboard.recentEnquiries;

export const selectLowStockItems = (state) =>
  state.adminDashboard.lowStockItems;

export const selectDashboardLoading = (state) => state.adminDashboard.loading;

export const selectDashboardRefreshing = (state) =>
  state.adminDashboard.refreshing;

export const selectDashboardLoaded = (state) => state.adminDashboard.loaded;

export const selectDashboardError = (state) => state.adminDashboard.error;

export default adminDashboardSlice.reducer;
