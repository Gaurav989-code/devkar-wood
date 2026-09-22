import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getPublicCategories } from "../../services/categoryService.js";

/*
|--------------------------------------------------------------------------
| Extract categories from API response
|--------------------------------------------------------------------------
*/

const extractCategories = (response) => {
  const categories =
    response?.data?.categories || response?.categories || response?.data || [];

  return Array.isArray(categories) ? categories : [];
};

/*
|--------------------------------------------------------------------------
| Fetch public categories
|--------------------------------------------------------------------------
*/

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",

  async (_, { rejectWithValue }) => {
    try {
      return await getPublicCategories();
    } catch (error) {
      return rejectWithValue(error.message || "Unable to fetch categories");
    }
  },
);

/*
|--------------------------------------------------------------------------
| Initial state
|--------------------------------------------------------------------------
*/

const initialState = {
  categories: [],
  loading: false,
  error: null,
  fetched: false,
};

/*
|--------------------------------------------------------------------------
| Category slice
|--------------------------------------------------------------------------
*/

const categorySlice = createSlice({
  name: "categories",
  initialState,

  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.fetched = true;

        state.categories = extractCategories(action.payload);
      })

      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.fetched = true;

        state.error = action.payload || "Unable to fetch categories";
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;

export default categorySlice.reducer;
