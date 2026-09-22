const CART_STORAGE_KEY = "devkar-wood-cart";

export const loadCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      return {
        items: [],
      };
    }

    const parsedCart = JSON.parse(savedCart);

    if (!parsedCart || !Array.isArray(parsedCart.items)) {
      return {
        items: [],
      };
    }

    return {
      items: parsedCart.items,
    };
  } catch {
    return {
      items: [],
    };
  }
};

export const saveCart = (cart) => {
  try {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        items: cart.items,
      }),
    );
  } catch {
    // Ignore unavailable or full storage.
  }
};

export const removeSavedCart = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // Ignore unavailable storage.
  }
};
