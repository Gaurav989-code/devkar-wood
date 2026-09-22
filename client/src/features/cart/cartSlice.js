import { createSlice } from "@reduxjs/toolkit";

const MAX_QUANTITY_PER_PRODUCT = 10;

const getMaximumQuantity = (item) => {
  if (item.trackInventory === false) {
    return MAX_QUANTITY_PER_PRODUCT;
  }

  return Math.min(Number(item.stock) || 1, MAX_QUANTITY_PER_PRODUCT);
};

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart: (state, action) => {
      const incomingItem = action.payload;

      const existingItem = state.items.find(
        (item) => item.productId === incomingItem.productId,
      );

      const maximumQuantity = getMaximumQuantity(incomingItem);

      if (existingItem) {
        existingItem.quantity = Math.min(
          existingItem.quantity + incomingItem.quantity,
          maximumQuantity,
        );

        existingItem.price = incomingItem.price;

        existingItem.regularPrice = incomingItem.regularPrice;

        existingItem.stock = incomingItem.stock;

        existingItem.image = incomingItem.image;

        return;
      }

      state.items.push({
        ...incomingItem,

        quantity: Math.min(
          Math.max(Number(incomingItem.quantity) || 1, 1),
          maximumQuantity,
        ),
      });
    },

    updateCartQuantity: (state, action) => {
      const { productId, quantity } = action.payload;

      const item = state.items.find(
        (cartItem) => cartItem.productId === productId,
      );

      if (!item) {
        return;
      }

      const maximumQuantity = getMaximumQuantity(item);

      item.quantity = Math.min(
        Math.max(Number(quantity) || 1, 1),
        maximumQuantity,
      );
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload,
      );
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, updateCartQuantity, removeFromCart, clearCart } =
  cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

export default cartSlice.reducer;
