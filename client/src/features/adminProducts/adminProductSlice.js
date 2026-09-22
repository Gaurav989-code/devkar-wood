import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  archiveAdminProduct,
  createAdminProduct,
  getAdminProductById,
  getAdminProducts,
  removeAdminProductImage,
  setAdminProductPrimaryImage,
  updateAdminProduct,
  uploadAdminProductImages,
} from "../../services/adminProductService.js";

/*
|--------------------------------------------------------------------------
| Response helpers
|--------------------------------------------------------------------------
*/

const extractErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const extractProduct = (response) => {
  return response?.data?.product || response?.product || null;
};

const extractProducts = (response) => {
  const products = response?.data?.products || response?.products || [];

  return Array.isArray(products) ? products : [];
};

const extractPagination = (response) => {
  return (
    response?.data?.pagination ||
    response?.pagination || {
      currentPage: 1,
      totalPages: 0,
      totalProducts: 0,
      limit: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    }
  );
};

const extractImages = (response) => {
  const images = response?.data?.images || response?.images || [];

  return Array.isArray(images) ? images : [];
};

/*
|--------------------------------------------------------------------------
| Fetch admin products
|--------------------------------------------------------------------------
*/

export const fetchAdminProducts = createAsyncThunk(
  "adminProducts/fetchAdminProducts",

  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAdminProducts(params);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to fetch products"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Fetch one admin product
|--------------------------------------------------------------------------
*/

export const fetchAdminProductById = createAsyncThunk(
  "adminProducts/fetchAdminProductById",

  async (productId, { rejectWithValue }) => {
    try {
      return await getAdminProductById(productId);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to fetch product"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Create product
|--------------------------------------------------------------------------
*/

export const createProductForAdmin = createAsyncThunk(
  "adminProducts/createProductForAdmin",

  async (productData, { rejectWithValue }) => {
    try {
      return await createAdminProduct(productData);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to create product"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Update product
|--------------------------------------------------------------------------
*/

export const updateProductForAdmin = createAsyncThunk(
  "adminProducts/updateProductForAdmin",

  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      return await updateAdminProduct(productId, productData);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to update product"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Archive product
|--------------------------------------------------------------------------
*/

export const archiveProductForAdmin = createAsyncThunk(
  "adminProducts/archiveProductForAdmin",

  async (productId, { rejectWithValue }) => {
    try {
      const response = await archiveAdminProduct(productId);

      return {
        productId,
        response,
      };
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to archive product"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Upload product images
|--------------------------------------------------------------------------
*/

export const uploadProductImagesForAdmin = createAsyncThunk(
  "adminProducts/uploadProductImagesForAdmin",

  async ({ productId, files }, { dispatch, rejectWithValue }) => {
    try {
      return await uploadAdminProductImages(
        productId,
        files,

        (progress) => {
          dispatch(setImageUploadProgress(progress));
        },
      );
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to upload product images"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Set primary product image
|--------------------------------------------------------------------------
*/

export const setPrimaryProductImageForAdmin = createAsyncThunk(
  "adminProducts/setPrimaryProductImageForAdmin",

  async ({ productId, fileId }, { rejectWithValue }) => {
    try {
      return await setAdminProductPrimaryImage(productId, fileId);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to update the primary image"),
      );
    }
  },
);

/*
|--------------------------------------------------------------------------
| Remove product image
|--------------------------------------------------------------------------
*/

export const removeProductImageForAdmin = createAsyncThunk(
  "adminProducts/removeProductImageForAdmin",

  async ({ productId, fileId }, { rejectWithValue }) => {
    try {
      return await removeAdminProductImage(productId, fileId);
    } catch (error) {
      return rejectWithValue(
        extractErrorMessage(error, "Unable to remove product image"),
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
  products: [],

  selectedProduct: null,

  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalProducts: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  },

  productsLoading: false,
  selectedProductLoading: false,

  creating: false,
  updating: false,
  archiving: false,

  uploadingImages: false,
  updatingPrimaryImage: false,
  removingImage: false,

  imageUploadProgress: 0,

  productsError: null,
  selectedProductError: null,
  mutationError: null,
};

/*
|--------------------------------------------------------------------------
| Admin product slice
|--------------------------------------------------------------------------
*/

const adminProductSlice = createSlice({
  name: "adminProducts",

  initialState,

  reducers: {
    clearSelectedAdminProduct: (state) => {
      state.selectedProduct = null;
      state.selectedProductError = null;
    },

    clearAdminProductErrors: (state) => {
      state.productsError = null;
      state.selectedProductError = null;
      state.mutationError = null;
    },

    clearAdminProductMutationError: (state) => {
      state.mutationError = null;
    },

    setImageUploadProgress: (state, action) => {
      state.imageUploadProgress = Math.min(
        Math.max(Number(action.payload) || 0, 0),
        100,
      );
    },

    resetImageUploadProgress: (state) => {
      state.imageUploadProgress = 0;
    },

    setSelectedAdminProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      /*
      |--------------------------------------------------------------------------
      | Fetch products
      |--------------------------------------------------------------------------
      */

      .addCase(fetchAdminProducts.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })

      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.productsLoading = false;

        state.products = extractProducts(action.payload);
        state.pagination = extractPagination(action.payload);
      })

      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload || "Unable to fetch products";
      })

      /*
      |--------------------------------------------------------------------------
      | Fetch one product
      |--------------------------------------------------------------------------
      */

      .addCase(fetchAdminProductById.pending, (state) => {
        state.selectedProductLoading = true;
        state.selectedProductError = null;
      })

      .addCase(fetchAdminProductById.fulfilled, (state, action) => {
        state.selectedProductLoading = false;
        state.selectedProduct = extractProduct(action.payload);
      })

      .addCase(fetchAdminProductById.rejected, (state, action) => {
        state.selectedProductLoading = false;
        state.selectedProductError =
          action.payload || "Unable to fetch product";
      })

      /*
      |--------------------------------------------------------------------------
      | Create product
      |--------------------------------------------------------------------------
      */

      .addCase(createProductForAdmin.pending, (state) => {
        state.creating = true;
        state.mutationError = null;
      })

      .addCase(createProductForAdmin.fulfilled, (state, action) => {
        state.creating = false;

        const product = extractProduct(action.payload);

        if (product) {
          state.selectedProduct = product;
          state.products.unshift(product);

          state.pagination.totalProducts =
            Number(state.pagination.totalProducts || 0) + 1;
        }
      })

      .addCase(createProductForAdmin.rejected, (state, action) => {
        state.creating = false;
        state.mutationError = action.payload || "Unable to create product";
      })

      /*
      |--------------------------------------------------------------------------
      | Update product
      |--------------------------------------------------------------------------
      */

      .addCase(updateProductForAdmin.pending, (state) => {
        state.updating = true;
        state.mutationError = null;
      })

      .addCase(updateProductForAdmin.fulfilled, (state, action) => {
        state.updating = false;

        const updatedProduct = extractProduct(action.payload);

        if (!updatedProduct) {
          return;
        }

        state.selectedProduct = updatedProduct;

        const productIndex = state.products.findIndex(
          (product) => product._id === updatedProduct._id,
        );

        if (productIndex !== -1) {
          state.products[productIndex] = updatedProduct;
        }
      })

      .addCase(updateProductForAdmin.rejected, (state, action) => {
        state.updating = false;
        state.mutationError = action.payload || "Unable to update product";
      })

      /*
      |--------------------------------------------------------------------------
      | Archive product
      |--------------------------------------------------------------------------
      */

      .addCase(archiveProductForAdmin.pending, (state) => {
        state.archiving = true;
        state.mutationError = null;
      })

      .addCase(archiveProductForAdmin.fulfilled, (state, action) => {
        state.archiving = false;

        const { productId, response } = action.payload;

        const archivedProduct = extractProduct(response);

        const productIndex = state.products.findIndex(
          (product) => product._id === productId,
        );

        if (productIndex !== -1) {
          if (archivedProduct) {
            state.products[productIndex] = archivedProduct;
          } else {
            state.products[productIndex] = {
              ...state.products[productIndex],
              status: "archived",
              isActive: false,
            };
          }
        }

        if (state.selectedProduct?._id === productId) {
          state.selectedProduct = archivedProduct || {
            ...state.selectedProduct,
            status: "archived",
            isActive: false,
          };
        }
      })

      .addCase(archiveProductForAdmin.rejected, (state, action) => {
        state.archiving = false;
        state.mutationError = action.payload || "Unable to archive product";
      })

      /*
      |--------------------------------------------------------------------------
      | Upload images
      |--------------------------------------------------------------------------
      */

      .addCase(uploadProductImagesForAdmin.pending, (state) => {
        state.uploadingImages = true;
        state.imageUploadProgress = 0;
        state.mutationError = null;
      })

      .addCase(uploadProductImagesForAdmin.fulfilled, (state, action) => {
        state.uploadingImages = false;
        state.imageUploadProgress = 100;

        const images = extractImages(action.payload);

        if (state.selectedProduct) {
          state.selectedProduct.images = images;

          const productIndex = state.products.findIndex(
            (product) => product._id === state.selectedProduct._id,
          );

          if (productIndex !== -1) {
            state.products[productIndex].images = images;
          }
        }
      })

      .addCase(uploadProductImagesForAdmin.rejected, (state, action) => {
        state.uploadingImages = false;
        state.imageUploadProgress = 0;
        state.mutationError =
          action.payload || "Unable to upload product images";
      })

      /*
      |--------------------------------------------------------------------------
      | Set primary image
      |--------------------------------------------------------------------------
      */

      .addCase(setPrimaryProductImageForAdmin.pending, (state) => {
        state.updatingPrimaryImage = true;
        state.mutationError = null;
      })

      .addCase(setPrimaryProductImageForAdmin.fulfilled, (state, action) => {
        state.updatingPrimaryImage = false;

        const images = extractImages(action.payload);

        if (state.selectedProduct) {
          state.selectedProduct.images = images;

          const productIndex = state.products.findIndex(
            (product) => product._id === state.selectedProduct._id,
          );

          if (productIndex !== -1) {
            state.products[productIndex].images = images;
          }
        }
      })

      .addCase(setPrimaryProductImageForAdmin.rejected, (state, action) => {
        state.updatingPrimaryImage = false;
        state.mutationError =
          action.payload || "Unable to update the primary image";
      })

      /*
      |--------------------------------------------------------------------------
      | Remove image
      |--------------------------------------------------------------------------
      */

      .addCase(removeProductImageForAdmin.pending, (state) => {
        state.removingImage = true;
        state.mutationError = null;
      })

      .addCase(removeProductImageForAdmin.fulfilled, (state, action) => {
        state.removingImage = false;

        const images = extractImages(action.payload);

        if (state.selectedProduct) {
          state.selectedProduct.images = images;

          const productIndex = state.products.findIndex(
            (product) => product._id === state.selectedProduct._id,
          );

          if (productIndex !== -1) {
            state.products[productIndex].images = images;
          }
        }
      })

      .addCase(removeProductImageForAdmin.rejected, (state, action) => {
        state.removingImage = false;
        state.mutationError =
          action.payload || "Unable to remove product image";
      });
  },
});

export const {
  clearSelectedAdminProduct,
  clearAdminProductErrors,
  clearAdminProductMutationError,
  resetImageUploadProgress,
  setImageUploadProgress,
  setSelectedAdminProduct,
} = adminProductSlice.actions;

export default adminProductSlice.reducer;
