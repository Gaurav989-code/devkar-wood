import api from "./api.js";

export const getPublicCategories =
  async () => {
    const response = await api.get(
      "/categories",
    );

    return response.data;
  };