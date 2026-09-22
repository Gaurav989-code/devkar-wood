import api from "./api.js";

export const getPublicProducts = async (params = {}) => {
  const response = await api.get("/products", {
    params,
  });

  return response.data;
};

export const getFeaturedProducts = async () => {
  const response = await api.get("/products", {
    params: {
      isFeatured: true,
      limit: 8,
      sort: "newest",
    },
  });

  return response.data;
};

export const getProductBySlug = async (slug) => {
  const response = await api.get(`/products/${slug}`);

  return response.data;
};
