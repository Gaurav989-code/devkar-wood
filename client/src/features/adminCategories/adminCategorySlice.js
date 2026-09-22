import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  getAdminCategoryBySlug,
  removeAdminCategoryImage,
  updateAdminCategory,
  uploadAdminCategoryImage,
} from "../../services/adminCategoryService.js";

/*
|--------------------------------------------------------------------------
| Response helpers
|--------------------------------------------------------------------------
*/

const extractErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const extractCategories = (response) => {
  const categories = response?.data?.categories || response?.categories || [];

  return Array.isArray(categories) ? categories : [];
};

const extractCategory = (response) => {
  return response?.data?.category || response?.category || null;
};

/*
|--------------------------------------------------------------------------
| Fetch all admin categories
|--------------------------------------------------------------------------
*/

export const fetchAdminCategories = createAsyncThunk(
  "adminCategories/fetchAdminCategories",

  async (_, { rejectWithValue }) => {
    try {
      return await getAdminCategories();
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to fetch categories"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Fetch one category by slug
|--------------------------------------------------------------------------
*/

export const fetchAdminCategoryBySlug = createAsyncThunk(
  "adminCategories/fetchAdminCategoryBySlug",

  async (slug, { rejectWithValue }) => {
    try {
      return await getAdminCategoryBySlug(slug);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to fetch category"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Create category
|--------------------------------------------------------------------------
*/

export const createCategoryForAdmin = createAsyncThunk(
  "adminCategories/createCategoryForAdmin",

  async (categoryData, { rejectWithValue }) => {
    try {
      return await createAdminCategory(categoryData);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to create category"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Update category
|--------------------------------------------------------------------------
*/

export const updateCategoryForAdmin = createAsyncThunk(
  "adminCategories/updateCategoryForAdmin",

  async ({ categoryId, categoryData }, { rejectWithValue }) => {
    try {
      return await updateAdminCategory(categoryId, categoryData);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to update category"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Delete category
|--------------------------------------------------------------------------
*/

export const deleteCategoryForAdmin = createAsyncThunk(
  "adminCategories/deleteCategoryForAdmin",

  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await deleteAdminCategory(categoryId);

      return {
        categoryId,
        response,
      };
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to delete category"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Upload category image
|--------------------------------------------------------------------------
*/

export const uploadCategoryImageForAdmin = createAsyncThunk(
  "adminCategories/uploadCategoryImageForAdmin",

  async ({ categoryId, file, altText = "" }, { dispatch, rejectWithValue }) => {
    try {
      return await uploadAdminCategoryImage(
        categoryId,
        file,
        altText,

        (progress) => {
          dispatch(setCategoryImageUploadProgress(progress));
        },
      );
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to upload category image"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Remove category image
|--------------------------------------------------------------------------
*/

export const removeCategoryImageForAdmin = createAsyncThunk(
  "adminCategories/removeCategoryImageForAdmin",

  async (categoryId, { rejectWithValue }) => {
    try {
      return await removeAdminCategoryImage(categoryId);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to remove category image"),
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
  categories: [],
  selectedCategory: null,

  loading: false,
  selectedCategoryLoading: false,

  creating: false,
  updating: false,
  deleting: false,

  uploadingImage: false,
  removingImage: false,

  imageUploadProgress: 0,

  error: null,
  selectedCategoryError: null,
  mutationError: null,

  fetched: false,
};

/*
|--------------------------------------------------------------------------
| Update a category in local state
|--------------------------------------------------------------------------
*/

const updateCategoryInState = (state, updatedCategory) => {
  if (!updatedCategory?._id) {
    return;
  }

  const categoryIndex = state.categories.findIndex(
    (category) => category._id === updatedCategory._id,
  );

  if (categoryIndex !== -1) {
    state.categories[categoryIndex] = updatedCategory;
  } else {
    state.categories.push(updatedCategory);
  }

  if (state.selectedCategory?._id === updatedCategory._id) {
    state.selectedCategory = updatedCategory;
  }

  state.categories.sort((firstCategory, secondCategory) => {
    const firstOrder = Number(firstCategory.displayOrder) || 0;
    const secondOrder = Number(secondCategory.displayOrder) || 0;

    if (firstOrder !== secondOrder) {
      return firstOrder - secondOrder;
    }

    return String(firstCategory.name || "").localeCompare(
      String(secondCategory.name || ""),
    );
  });
};

/*
|--------------------------------------------------------------------------
| Admin category slice
|--------------------------------------------------------------------------
*/

const adminCategorySlice = createSlice({
  name: "adminCategories",

  initialState,

  reducers: {
    setSelectedAdminCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.selectedCategoryError = null;
    },

    clearSelectedAdminCategory: (state) => {
      state.selectedCategory = null;
      state.selectedCategoryError = null;
    },

    clearAdminCategoryErrors: (state) => {
      state.error = null;
      state.selectedCategoryError = null;
      state.mutationError = null;
    },

    clearAdminCategoryMutationError: (state) => {
      state.mutationError = null;
    },

    setCategoryImageUploadProgress: (state, action) => {
      state.imageUploadProgress = Math.min(
        Math.max(Number(action.payload) || 0, 0),
        100,
      );
    },

    resetCategoryImageUploadProgress: (state) => {
      state.imageUploadProgress = 0;
    },

    resetAdminCategories: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder

      /*
      |--------------------------------------------------------------------------
      | Fetch all categories
      |--------------------------------------------------------------------------
      */

      .addCase(fetchAdminCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.fetched = true;
        state.categories = extractCategories(action.payload);
      })

      .addCase(fetchAdminCategories.rejected, (state, action) => {
        state.loading = false;
        state.fetched = true;
        state.error = action.payload || "Unable to fetch categories";
      })

      /*
      |--------------------------------------------------------------------------
      | Fetch one category
      |--------------------------------------------------------------------------
      */

      .addCase(fetchAdminCategoryBySlug.pending, (state) => {
        state.selectedCategoryLoading = true;
        state.selectedCategoryError = null;
      })

      .addCase(fetchAdminCategoryBySlug.fulfilled, (state, action) => {
        state.selectedCategoryLoading = false;

        const category = extractCategory(action.payload);

        state.selectedCategory = category;

        if (category) {
          updateCategoryInState(state, category);
        }
      })

      .addCase(fetchAdminCategoryBySlug.rejected, (state, action) => {
        state.selectedCategoryLoading = false;
        state.selectedCategoryError =
          action.payload || "Unable to fetch category";
      })

      /*
      |--------------------------------------------------------------------------
      | Create category
      |--------------------------------------------------------------------------
      */

      .addCase(createCategoryForAdmin.pending, (state) => {
        state.creating = true;
        state.mutationError = null;
      })

      .addCase(createCategoryForAdmin.fulfilled, (state, action) => {
        state.creating = false;

        const category = extractCategory(action.payload);

        if (category) {
          state.selectedCategory = category;
          updateCategoryInState(state, category);
        }
      })

      .addCase(createCategoryForAdmin.rejected, (state, action) => {
        state.creating = false;
        state.mutationError = action.payload || "Unable to create category";
      })

      /*
      |--------------------------------------------------------------------------
      | Update category
      |--------------------------------------------------------------------------
      */

      .addCase(updateCategoryForAdmin.pending, (state) => {
        state.updating = true;
        state.mutationError = null;
      })

      .addCase(updateCategoryForAdmin.fulfilled, (state, action) => {
        state.updating = false;

        const category = extractCategory(action.payload);

        if (category) {
          updateCategoryInState(state, category);
        }
      })

      .addCase(updateCategoryForAdmin.rejected, (state, action) => {
        state.updating = false;
        state.mutationError = action.payload || "Unable to update category";
      })

      /*
      |--------------------------------------------------------------------------
      | Delete category
      |--------------------------------------------------------------------------
      */

      .addCase(deleteCategoryForAdmin.pending, (state) => {
        state.deleting = true;
        state.mutationError = null;
      })

      .addCase(deleteCategoryForAdmin.fulfilled, (state, action) => {
        state.deleting = false;

        const { categoryId } = action.payload;

        state.categories = state.categories.filter(
          (category) => category._id !== categoryId,
        );

        if (state.selectedCategory?._id === categoryId) {
          state.selectedCategory = null;
        }
      })

      .addCase(deleteCategoryForAdmin.rejected, (state, action) => {
        state.deleting = false;
        state.mutationError = action.payload || "Unable to delete category";
      })

      /*
      |--------------------------------------------------------------------------
      | Upload category image
      |--------------------------------------------------------------------------
      */

      .addCase(uploadCategoryImageForAdmin.pending, (state) => {
        state.uploadingImage = true;
        state.imageUploadProgress = 0;
        state.mutationError = null;
      })

      .addCase(uploadCategoryImageForAdmin.fulfilled, (state, action) => {
        state.uploadingImage = false;
        state.imageUploadProgress = 100;

        const category = extractCategory(action.payload);

        if (category) {
          updateCategoryInState(state, category);
        }
      })

      .addCase(uploadCategoryImageForAdmin.rejected, (state, action) => {
        state.uploadingImage = false;
        state.imageUploadProgress = 0;
        state.mutationError =
          action.payload || "Unable to upload category image";
      })

      /*
      |--------------------------------------------------------------------------
      | Remove category image
      |--------------------------------------------------------------------------
      */

      .addCase(removeCategoryImageForAdmin.pending, (state) => {
        state.removingImage = true;
        state.mutationError = null;
      })

      .addCase(removeCategoryImageForAdmin.fulfilled, (state, action) => {
        state.removingImage = false;

        const category = extractCategory(action.payload);

        if (category) {
          updateCategoryInState(state, category);
        }
      })

      .addCase(removeCategoryImageForAdmin.rejected, (state, action) => {
        state.removingImage = false;
        state.mutationError =
          action.payload || "Unable to remove category image";
      });
  },
});

export const {
  clearAdminCategoryErrors,
  clearAdminCategoryMutationError,
  clearSelectedAdminCategory,
  resetAdminCategories,
  resetCategoryImageUploadProgress,
  setCategoryImageUploadProgress,
  setSelectedAdminCategory,
} = adminCategorySlice.actions;

export default adminCategorySlice.reducer;
