import { configureStore } from "@reduxjs/toolkit";

import productReducer from "../features/products/productSlice.js";
import categoryReducer from "../features/categories/categorySlice.js";
import cartReducer from "../features/cart/cartSlice.js";
import wishlistReducer from "../features/wishlist/wishlistSlice.js";

import adminAuthReducer from "../features/adminAuth/adminAuthSlice.js";
import adminDashboardReducer from "../features/adminDashboard/adminDashboardSlice.js";
import adminProductReducer from "../features/adminProducts/adminProductSlice.js";
import adminCategoryReducer from "../features/adminCategories/adminCategorySlice.js";
import adminOrderReducer from "../features/adminOrders/adminOrderSlice.js";
import adminEnquiryReducer from "../features/adminEnquiries/adminEnquirySlice.js";

import { loadCart, saveCart } from "../utils/cartStorage.js";

const savedCart = loadCart();

export const store = configureStore({
  reducer: {
    products: productReducer,
    categories: categoryReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    adminAuth: adminAuthReducer,
    adminDashboard: adminDashboardReducer,
    adminProducts: adminProductReducer,
    adminCategories: adminCategoryReducer,
    adminOrders: adminOrderReducer,
    adminEnquiries: adminEnquiryReducer,
  },

  preloadedState: {
    cart: savedCart,
  },

  devTools: import.meta.env.MODE !== "production",
});

/*
|--------------------------------------------------------------------------
| Persist cart when its Redux state changes
|--------------------------------------------------------------------------
*/

let previousCart = store.getState().cart;

store.subscribe(() => {
  const currentCart = store.getState().cart;

  if (currentCart !== previousCart) {
    previousCart = currentCart;

    saveCart(currentCart);
  }
});

export default store;
