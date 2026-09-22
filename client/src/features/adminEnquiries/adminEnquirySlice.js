import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getAdminEnquiries,
  getAdminEnquiryById,
  updateAdminEnquiryCustomer,
  updateAdminEnquiryNote,
  updateAdminEnquiryQuote,
  updateAdminEnquiryStatus,
} from "../../services/adminEnquiryService.js";

/*
|--------------------------------------------------------------------------
| Response helpers
|--------------------------------------------------------------------------
*/

const extractErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const extractEnquiries = (response) => {
  const enquiries = response?.data?.enquiries || response?.enquiries || [];

  return Array.isArray(enquiries) ? enquiries : [];
};

const extractEnquiry = (response) => {
  return response?.data?.enquiry || response?.enquiry || null;
};

const extractPagination = (response) => {
  return (
    response?.data?.pagination ||
    response?.pagination || {
      currentPage: 1,
      totalPages: 0,
      totalEnquiries: 0,
      limit: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    }
  );
};

/*
|--------------------------------------------------------------------------
| Fetch admin enquiries
|--------------------------------------------------------------------------
*/

export const fetchAdminEnquiries = createAsyncThunk(
  "adminEnquiries/fetchAdminEnquiries",

  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAdminEnquiries(params);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to fetch enquiries"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Fetch one admin enquiry
|--------------------------------------------------------------------------
*/

export const fetchAdminEnquiryById = createAsyncThunk(
  "adminEnquiries/fetchAdminEnquiryById",

  async (enquiryId, { rejectWithValue }) => {
    try {
      return await getAdminEnquiryById(enquiryId);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to fetch enquiry"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Update enquiry status
|--------------------------------------------------------------------------
*/

export const updateEnquiryStatusForAdmin = createAsyncThunk(
  "adminEnquiries/updateEnquiryStatusForAdmin",

  async ({ enquiryId, status, message = "" }, { rejectWithValue }) => {
    try {
      return await updateAdminEnquiryStatus(enquiryId, {
        status,
        message,
      });
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to update enquiry status"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Update enquiry quotation
|--------------------------------------------------------------------------
*/

export const updateEnquiryQuoteForAdmin = createAsyncThunk(
  "adminEnquiries/updateEnquiryQuoteForAdmin",

  async (
    {
      enquiryId,
      estimatedPrice,
      estimatedCompletionDays,
      quoteMessage = "",
      validUntil = "",
    },
    { rejectWithValue },
  ) => {
    try {
      return await updateAdminEnquiryQuote(enquiryId, {
        estimatedPrice,
        estimatedCompletionDays,
        quoteMessage,
        validUntil,
      });
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to update enquiry quotation"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Update private admin note
|--------------------------------------------------------------------------
*/

export const updateEnquiryNoteForAdmin = createAsyncThunk(
  "adminEnquiries/updateEnquiryNoteForAdmin",

  async ({ enquiryId, adminNote }, { rejectWithValue }) => {
    try {
      return await updateAdminEnquiryNote(enquiryId, adminNote);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to update admin note"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Update customer details
|--------------------------------------------------------------------------
*/

export const updateEnquiryCustomerForAdmin = createAsyncThunk(
  "adminEnquiries/updateEnquiryCustomerForAdmin",

  async ({ enquiryId, customerData }, { rejectWithValue }) => {
    try {
      return await updateAdminEnquiryCustomer(enquiryId, customerData);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to update customer details"),
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
  enquiries: [],
  selectedEnquiry: null,

  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalEnquiries: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  },

  enquiriesLoading: false,
  selectedEnquiryLoading: false,

  updatingStatus: false,
  updatingQuote: false,
  updatingNote: false,
  updatingCustomer: false,

  enquiriesError: null,
  selectedEnquiryError: null,
  mutationError: null,

  fetched: false,
};

/*
|--------------------------------------------------------------------------
| Update enquiry in list and selected enquiry
|--------------------------------------------------------------------------
*/

const updateEnquiryInState = (state, updatedEnquiry) => {
  if (!updatedEnquiry?._id) {
    return;
  }

  const enquiryIndex = state.enquiries.findIndex(
    (enquiry) => enquiry._id === updatedEnquiry._id,
  );

  if (enquiryIndex !== -1) {
    state.enquiries[enquiryIndex] = updatedEnquiry;
  }

  if (
    state.selectedEnquiry?._id === updatedEnquiry._id ||
    state.selectedEnquiry?.enquiryNumber === updatedEnquiry.enquiryNumber
  ) {
    state.selectedEnquiry = updatedEnquiry;
  }
};

/*
|--------------------------------------------------------------------------
| Admin enquiry slice
|--------------------------------------------------------------------------
*/

const adminEnquirySlice = createSlice({
  name: "adminEnquiries",

  initialState,

  reducers: {
    setSelectedAdminEnquiry: (state, action) => {
      state.selectedEnquiry = action.payload;
      state.selectedEnquiryError = null;
    },

    clearSelectedAdminEnquiry: (state) => {
      state.selectedEnquiry = null;
      state.selectedEnquiryError = null;
    },

    clearAdminEnquiryErrors: (state) => {
      state.enquiriesError = null;
      state.selectedEnquiryError = null;
      state.mutationError = null;
    },

    clearAdminEnquiryMutationError: (state) => {
      state.mutationError = null;
    },

    resetAdminEnquiries: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder

      /*
      |--------------------------------------------------------------------------
      | Fetch enquiries
      |--------------------------------------------------------------------------
      */

      .addCase(fetchAdminEnquiries.pending, (state) => {
        state.enquiriesLoading = true;
        state.enquiriesError = null;
      })

      .addCase(fetchAdminEnquiries.fulfilled, (state, action) => {
        state.enquiriesLoading = false;
        state.fetched = true;

        state.enquiries = extractEnquiries(action.payload);

        state.pagination = extractPagination(action.payload);
      })

      .addCase(fetchAdminEnquiries.rejected, (state, action) => {
        state.enquiriesLoading = false;
        state.fetched = true;

        state.enquiriesError = action.payload || "Unable to fetch enquiries";
      })

      /*
      |--------------------------------------------------------------------------
      | Fetch one enquiry
      |--------------------------------------------------------------------------
      */

      .addCase(fetchAdminEnquiryById.pending, (state) => {
        state.selectedEnquiryLoading = true;
        state.selectedEnquiryError = null;
      })

      .addCase(fetchAdminEnquiryById.fulfilled, (state, action) => {
        state.selectedEnquiryLoading = false;

        const enquiry = extractEnquiry(action.payload);

        state.selectedEnquiry = enquiry;

        if (enquiry) {
          updateEnquiryInState(state, enquiry);
        }
      })

      .addCase(fetchAdminEnquiryById.rejected, (state, action) => {
        state.selectedEnquiryLoading = false;

        state.selectedEnquiryError =
          action.payload || "Unable to fetch enquiry";
      })

      /*
      |--------------------------------------------------------------------------
      | Update status
      |--------------------------------------------------------------------------
      */

      .addCase(updateEnquiryStatusForAdmin.pending, (state) => {
        state.updatingStatus = true;
        state.mutationError = null;
      })

      .addCase(updateEnquiryStatusForAdmin.fulfilled, (state, action) => {
        state.updatingStatus = false;

        const enquiry = extractEnquiry(action.payload);

        if (enquiry) {
          updateEnquiryInState(state, enquiry);
        }
      })

      .addCase(updateEnquiryStatusForAdmin.rejected, (state, action) => {
        state.updatingStatus = false;

        state.mutationError =
          action.payload || "Unable to update enquiry status";
      })

      /*
      |--------------------------------------------------------------------------
      | Update quotation
      |--------------------------------------------------------------------------
      */

      .addCase(updateEnquiryQuoteForAdmin.pending, (state) => {
        state.updatingQuote = true;
        state.mutationError = null;
      })

      .addCase(updateEnquiryQuoteForAdmin.fulfilled, (state, action) => {
        state.updatingQuote = false;

        const enquiry = extractEnquiry(action.payload);

        if (enquiry) {
          updateEnquiryInState(state, enquiry);
        }
      })

      .addCase(updateEnquiryQuoteForAdmin.rejected, (state, action) => {
        state.updatingQuote = false;

        state.mutationError =
          action.payload || "Unable to update enquiry quotation";
      })

      /*
      |--------------------------------------------------------------------------
      | Update note
      |--------------------------------------------------------------------------
      */

      .addCase(updateEnquiryNoteForAdmin.pending, (state) => {
        state.updatingNote = true;
        state.mutationError = null;
      })

      .addCase(updateEnquiryNoteForAdmin.fulfilled, (state, action) => {
        state.updatingNote = false;

        const enquiry = extractEnquiry(action.payload);

        if (enquiry) {
          updateEnquiryInState(state, enquiry);
        }
      })

      .addCase(updateEnquiryNoteForAdmin.rejected, (state, action) => {
        state.updatingNote = false;

        state.mutationError = action.payload || "Unable to update admin note";
      })

      /*
      |--------------------------------------------------------------------------
      | Update customer
      |--------------------------------------------------------------------------
      */

      .addCase(updateEnquiryCustomerForAdmin.pending, (state) => {
        state.updatingCustomer = true;
        state.mutationError = null;
      })

      .addCase(updateEnquiryCustomerForAdmin.fulfilled, (state, action) => {
        state.updatingCustomer = false;

        const enquiry = extractEnquiry(action.payload);

        if (enquiry) {
          updateEnquiryInState(state, enquiry);
        }
      })

      .addCase(updateEnquiryCustomerForAdmin.rejected, (state, action) => {
        state.updatingCustomer = false;

        state.mutationError =
          action.payload || "Unable to update customer details";
      });
  },
});

export const {
  clearAdminEnquiryErrors,
  clearAdminEnquiryMutationError,
  clearSelectedAdminEnquiry,
  resetAdminEnquiries,
  setSelectedAdminEnquiry,
} = adminEnquirySlice.actions;

export default adminEnquirySlice.reducer;
