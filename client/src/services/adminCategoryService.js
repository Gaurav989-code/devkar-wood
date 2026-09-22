import api from "./api.js";

/*
|--------------------------------------------------------------------------
| Get all categories for admin
|--------------------------------------------------------------------------
| GET /api/v1/categories/admin/all
*/

export const getAdminCategories = async () => {
  const response = await api.get("/categories/admin/all");

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get one public category by slug
|--------------------------------------------------------------------------
| GET /api/v1/categories/:slug
*/

export const getAdminCategoryBySlug = async (slug) => {
  const response = await api.get(`/categories/${encodeURIComponent(slug)}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Create category
|--------------------------------------------------------------------------
| POST /api/v1/categories
*/

export const createAdminCategory = async (categoryData) => {
  const response = await api.post("/categories", categoryData);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Update category
|--------------------------------------------------------------------------
| PATCH /api/v1/categories/:id
*/

export const updateAdminCategory = async (categoryId, categoryData) => {
  const response = await api.patch(`/categories/${categoryId}`, categoryData);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Delete category
|--------------------------------------------------------------------------
| DELETE /api/v1/categories/:id
|
| The backend prevents deletion when the category contains products.
*/

export const deleteAdminCategory = async (categoryId) => {
  const response = await api.delete(`/categories/${categoryId}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Upload category image
|--------------------------------------------------------------------------
| POST /api/v1/categories/:id/image
|
| FormData:
| image   -> image file
| altText -> optional accessible image description
*/

export const uploadAdminCategoryImage = async (
  categoryId,
  file,
  altText = "",
  onUploadProgress,
) => {
  const formData = new FormData();

  formData.append("image", file);

  if (altText.trim()) {
    formData.append("altText", altText.trim());
  }

  const response = await api.post(`/categories/${categoryId}/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },

    onUploadProgress: (progressEvent) => {
      if (!progressEvent.total || typeof onUploadProgress !== "function") {
        return;
      }

      const progress = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );

      onUploadProgress(progress);
    },
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Remove category image
|--------------------------------------------------------------------------
| DELETE /api/v1/categories/:id/image
*/

export const removeAdminCategoryImage = async (categoryId) => {
  const response = await api.delete(`/categories/${categoryId}/image`);

  return response.data;
};
