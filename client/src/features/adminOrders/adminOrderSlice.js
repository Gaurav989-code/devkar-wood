import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getAdminOrderById,
  getAdminOrders,
  updateAdminOrderStatus,
  updateAdminOrderTracking,
} from "../../services/adminOrderService.js";

/*
|--------------------------------------------------------------------------
| Response helpers
|--------------------------------------------------------------------------
*/

const extractErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const extractOrders = (response) => {
  const orders = response?.data?.orders || response?.orders || [];

  return Array.isArray(orders) ? orders : [];
};

const extractOrder = (response) => {
  return response?.data?.order || response?.order || null;
};

const extractPagination = (response) => {
  return (
    response?.data?.pagination ||
    response?.pagination || {
      currentPage: 1,
      totalPages: 0,
      totalOrders: 0,
      limit: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    }
  );
};

/*
|--------------------------------------------------------------------------
| Fetch admin orders
|--------------------------------------------------------------------------
*/

export const fetchAdminOrders = createAsyncThunk(
  "adminOrders/fetchAdminOrders",

  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAdminOrders(params);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to fetch orders"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Fetch one admin order
|--------------------------------------------------------------------------
*/

export const fetchAdminOrderById = createAsyncThunk(
  "adminOrders/fetchAdminOrderById",

  async (orderId, { rejectWithValue }) => {
    try {
      return await getAdminOrderById(orderId);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to fetch order"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Update order status
|--------------------------------------------------------------------------
*/

export const updateOrderStatusForAdmin = createAsyncThunk(
  "adminOrders/updateOrderStatusForAdmin",

  async (
    { orderId, orderStatus, cancellationReason = "" },
    { rejectWithValue },
  ) => {
    try {
      return await updateAdminOrderStatus(orderId, {
        orderStatus,
        cancellationReason,
      });
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to update order status"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Update order tracking
|--------------------------------------------------------------------------
*/

export const updateOrderTrackingForAdmin = createAsyncThunk(
  "adminOrders/updateOrderTrackingForAdmin",

  async (
    { orderId, courierName, trackingNumber, trackingUrl = "" },
    { rejectWithValue },
  ) => {
    try {
      return await updateAdminOrderTracking(orderId, {
        courierName,
        trackingNumber,
        trackingUrl,
      });
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to update tracking information"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Initial state
|--------------------------------------------------------------------------
*/

const initialState = {
  orders: [],
  selectedOrder: null,

  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalOrders: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  },

  ordersLoading: false,
  selectedOrderLoading: false,

  updatingStatus: false,
  updatingTracking: false,

  ordersError: null,
  selectedOrderError: null,
  mutationError: null,

  fetched: false,
};

/*
|--------------------------------------------------------------------------
| Update order in list and selected-order state
|--------------------------------------------------------------------------
*/

const updateOrderInState = (state, updatedOrder) => {
  if (!updatedOrder?._id) {
    return;
  }

  const orderIndex = state.orders.findIndex(
    (order) => order._id === updatedOrder._id,
  );

  if (orderIndex !== -1) {
    state.orders[orderIndex] = updatedOrder;
  }

  if (
    state.selectedOrder?._id === updatedOrder._id ||
    state.selectedOrder?.orderNumber === updatedOrder.orderNumber
  ) {
    state.selectedOrder = updatedOrder;
  }
};

/*
|--------------------------------------------------------------------------
| Admin order slice
|--------------------------------------------------------------------------
*/

const adminOrderSlice = createSlice({
  name: "adminOrders",

  initialState,

  reducers: {
    setSelectedAdminOrder: (state, action) => {
      state.selectedOrder = action.payload;
      state.selectedOrderError = null;
    },

    clearSelectedAdminOrder: (state) => {
      state.selectedOrder = null;
      state.selectedOrderError = null;
    },

    clearAdminOrderErrors: (state) => {
      state.ordersError = null;
      state.selectedOrderError = null;
      state.mutationError = null;
    },

    clearAdminOrderMutationError: (state) => {
      state.mutationError = null;
    },

    resetAdminOrders: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder

      /*
      |--------------------------------------------------------------------------
      | Fetch orders
      |--------------------------------------------------------------------------
      */

      .addCase(fetchAdminOrders.pending, (state) => {
        state.ordersLoading = true;
        state.ordersError = null;
      })

      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.fetched = true;

        state.orders = extractOrders(action.payload);
        state.pagination = extractPagination(action.payload);
      })

      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.fetched = true;

        state.ordersError = action.payload || "Unable to fetch orders";
      })

      /*
      |--------------------------------------------------------------------------
      | Fetch one order
      |--------------------------------------------------------------------------
      */

      .addCase(fetchAdminOrderById.pending, (state) => {
        state.selectedOrderLoading = true;
        state.selectedOrderError = null;
      })

      .addCase(fetchAdminOrderById.fulfilled, (state, action) => {
        state.selectedOrderLoading = false;

        const order = extractOrder(action.payload);

        state.selectedOrder = order;

        if (order) {
          updateOrderInState(state, order);
        }
      })

      .addCase(fetchAdminOrderById.rejected, (state, action) => {
        state.selectedOrderLoading = false;

        state.selectedOrderError = action.payload || "Unable to fetch order";
      })

      /*
      |--------------------------------------------------------------------------
      | Update order status
      |--------------------------------------------------------------------------
      */

      .addCase(updateOrderStatusForAdmin.pending, (state) => {
        state.updatingStatus = true;
        state.mutationError = null;
      })

      .addCase(updateOrderStatusForAdmin.fulfilled, (state, action) => {
        state.updatingStatus = false;

        const order = extractOrder(action.payload);

        if (order) {
          updateOrderInState(state, order);
        }
      })

      .addCase(updateOrderStatusForAdmin.rejected, (state, action) => {
        state.updatingStatus = false;

        state.mutationError = action.payload || "Unable to update order status";
      })

      /*
      |--------------------------------------------------------------------------
      | Update tracking
      |--------------------------------------------------------------------------
      */

      .addCase(updateOrderTrackingForAdmin.pending, (state) => {
        state.updatingTracking = true;
        state.mutationError = null;
      })

      .addCase(updateOrderTrackingForAdmin.fulfilled, (state, action) => {
        state.updatingTracking = false;

        const order = extractOrder(action.payload);

        if (order) {
          updateOrderInState(state, order);
        }
      })

      .addCase(updateOrderTrackingForAdmin.rejected, (state, action) => {
        state.updatingTracking = false;

        state.mutationError =
          action.payload || "Unable to update tracking information";
      });
  },
});

export const {
  clearAdminOrderErrors,
  clearAdminOrderMutationError,
  clearSelectedAdminOrder,
  resetAdminOrders,
  setSelectedAdminOrder,
} = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
