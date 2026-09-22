import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getFeaturedProducts,
  getProductBySlug,
  getPublicProducts,
} from "../../services/productService.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const extractProducts = (response) => {
  const products =
    response?.data?.products || response?.products || response?.data || [];

  return Array.isArray(products) ? products : [];
};

const extractPagination = (response) => {
  return response?.data?.pagination || response?.pagination || null;
};

/*
|--------------------------------------------------------------------------
| Async actions
|--------------------------------------------------------------------------
*/

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",

  async (params = {}, { rejectWithValue }) => {
    try {
      return await getPublicProducts(params);
    } catch (error) {
      return rejectWithValue(error.message || "Unable to fetch products");
    }
  },
);

export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeaturedProducts",

  async (_, { rejectWithValue }) => {
    try {
      return await getFeaturedProducts();
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to fetch featured products",
      );
    }
  },
);

export const fetchProductBySlug = createAsyncThunk(
  "products/fetchProductBySlug",

  async (slug, { rejectWithValue }) => {
    try {
      return await getProductBySlug(slug);
    } catch (error) {
      return rejectWithValue(error.message || "Unable to fetch product");
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
  featuredProducts: [],
  selectedProduct: null,
  pagination: null,

  productsLoading: false,
  featuredLoading: false,
  selectedProductLoading: false,

  productsError: null,
  featuredError: null,
  selectedProductError: null,
};

/*
|--------------------------------------------------------------------------
| Slice
|--------------------------------------------------------------------------
*/

const productSlice = createSlice({
  name: "products",
  initialState,

  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.selectedProductError = null;
    },

    clearProductErrors: (state) => {
      state.productsError = null;
      state.featuredError = null;
      state.selectedProductError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      /*
      |--------------------------------------------------------------------------
      | All products
      |--------------------------------------------------------------------------
      */

      .addCase(fetchProducts.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })

      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.productsLoading = false;

        state.products = extractProducts(action.payload);

        state.pagination = extractPagination(action.payload);
      })

      .addCase(fetchProducts.rejected, (state, action) => {
        state.productsLoading = false;

        state.productsError = action.payload || "Unable to fetch products";
      })

      /*
      |--------------------------------------------------------------------------
      | Featured products
      |--------------------------------------------------------------------------
      */

      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.featuredLoading = true;
        state.featuredError = null;
      })

      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredLoading = false;

        const products = extractProducts(action.payload);

        const featured = products.filter((product) => product.isFeatured);

        state.featuredProducts =
          featured.length > 0 ? featured.slice(0, 8) : products.slice(0, 8);
      })

      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.featuredLoading = false;

        state.featuredError =
          action.payload || "Unable to fetch featured products";
      })

      /*
      |--------------------------------------------------------------------------
      | Selected product
      |--------------------------------------------------------------------------
      */

      .addCase(fetchProductBySlug.pending, (state) => {
        state.selectedProductLoading = true;

        state.selectedProductError = null;

        state.selectedProduct = null;
      })

      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.selectedProductLoading = false;

        state.selectedProduct =
          action.payload?.data?.product ||
          action.payload?.product ||
          action.payload?.data ||
          null;
      })

      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.selectedProductLoading = false;

        state.selectedProductError =
          action.payload || "Unable to fetch product";
      });
  },
});

export const { clearSelectedProduct, clearProductErrors } =
  productSlice.actions;

export default productSlice.reducer;
