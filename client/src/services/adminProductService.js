import api from "./api.js";

/*
|--------------------------------------------------------------------------
| Get all products for admin
|--------------------------------------------------------------------------
| GET /api/v1/products/admin/all
*/

export const getAdminProducts = async (params = {}) => {
  const response = await api.get("/products/admin/all", {
    params,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get one product for admin
|--------------------------------------------------------------------------
| GET /api/v1/products/admin/:id
*/

export const getAdminProductById = async (productId) => {
  const response = await api.get(`/products/admin/${productId}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Create product
|--------------------------------------------------------------------------
| POST /api/v1/products
*/

export const createAdminProduct = async (productData) => {
  const response = await api.post("/products", productData);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Update product
|--------------------------------------------------------------------------
| PATCH /api/v1/products/:id
*/

export const updateAdminProduct = async (productId, productData) => {
  const response = await api.patch(`/products/${productId}`, productData);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Archive product
|--------------------------------------------------------------------------
| DELETE /api/v1/products/:id
|
| Your backend uses this endpoint to archive the product rather than
| permanently deleting it.
*/

export const archiveAdminProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Upload product images
|--------------------------------------------------------------------------
| POST /api/v1/products/:id/images
|
| FormData field name: images
*/

export const uploadAdminProductImages = async (
  productId,
  files,
  onUploadProgress,
) => {
  const formData = new FormData();

  Array.from(files || []).forEach((file) => {
    formData.append("images", file);
  });

  const response = await api.post(`/products/${productId}/images`, formData, {
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
| Set primary product image
|--------------------------------------------------------------------------
| PATCH /api/v1/products/:id/images/primary
*/

export const setAdminProductPrimaryImage = async (productId, fileId) => {
  const response = await api.patch(`/products/${productId}/images/primary`, {
    fileId,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Remove product image
|--------------------------------------------------------------------------
| DELETE /api/v1/products/:id/images
|
| Axios requires DELETE request bodies inside the data property.
*/

export const removeAdminProductImage = async (productId, fileId) => {
  const response = await api.delete(`/products/${productId}/images`, {
    data: {
      fileId,
    },
  });

  return response.data;
};
