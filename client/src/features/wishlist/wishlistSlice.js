import { createSlice } from "@reduxjs/toolkit";

import {
  loadWishlist,
  removeWishlistStorage,
  saveWishlist,
} from "../../utils/wishlistStorage.js";

const getProductId = (product) => {
  return product?._id || product?.id || product?.productId || "";
};

const getProductPrice = (product) => {
  if (product?.salePrice !== null && product?.salePrice !== undefined) {
    return Number(product.salePrice);
  }

  if (product?.effectivePrice !== undefined) {
    return Number(product.effectivePrice);
  }

  return Number(product?.price) || 0;
};

const getProductImage = (product) => {
  if (typeof product?.image === "string") {
    return product.image;
  }

  if (!Array.isArray(product?.images)) {
    return "";
  }

  const primaryImage =
    product.images.find((image) => image.isPrimary) || product.images[0];

  return primaryImage?.url || "";
};

const normalizeWishlistProduct = (product) => {
  return {
    productId: getProductId(product),
    name: product?.name || "",
    slug: product?.slug || "",
    sku: product?.sku || "",
    image: getProductImage(product),
    price: getProductPrice(product),
    regularPrice: Number(product?.price) || 0,
    woodType: product?.woodType || "",
    stock: Number(product?.stock) || 0,
    trackInventory: product?.trackInventory ?? true,
    addedAt: new Date().toISOString(),
  };
};

const initialState = {
  items: loadWishlist(),
};

const wishlistSlice = createSlice({
  name: "wishlist",

  initialState,

  reducers: {
    addToWishlist: (state, action) => {
      const product = normalizeWishlistProduct(action.payload);

      if (!product.productId) {
        return;
      }

      const alreadyExists = state.items.some(
        (item) => item.productId === product.productId,
      );

      if (alreadyExists) {
        return;
      }

      state.items.unshift(product);

      saveWishlist(state.items);
    },

    removeFromWishlist: (state, action) => {
      const productId = action.payload;

      state.items = state.items.filter((item) => item.productId !== productId);

      saveWishlist(state.items);
    },

    toggleWishlist: (state, action) => {
      const product = normalizeWishlistProduct(action.payload);

      if (!product.productId) {
        return;
      }

      const existingIndex = state.items.findIndex(
        (item) => item.productId === product.productId,
      );

      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.unshift(product);
      }

      saveWishlist(state.items);
    },

    clearWishlist: (state) => {
      state.items = [];

      removeWishlistStorage();
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;

export const selectWishlistItemCount = (state) => state.wishlist.items.length;

export const selectIsProductWishlisted = (state, productId) => {
  return state.wishlist.items.some((item) => item.productId === productId);
};

export default wishlistSlice.reducer;
