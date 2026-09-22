const WISHLIST_STORAGE_KEY = "devkar_wishlist";

export const loadWishlist = () => {
  try {
    const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);

    if (!savedWishlist) {
      return [];
    }

    const parsedWishlist = JSON.parse(savedWishlist);

    return Array.isArray(parsedWishlist) ? parsedWishlist : [];
  } catch (error) {
    console.error("Unable to load wishlist:", error);

    return [];
  }
};

export const saveWishlist = (items) => {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Unable to save wishlist:", error);
  }
};

export const removeWishlistStorage = () => {
  try {
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
  } catch (error) {
    console.error("Unable to clear wishlist:", error);
  }
};
