import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AdminProductForm, {
  emptyProductForm,
} from "../../components/admin/products/AdminProductForm.jsx";

import {
  clearAdminProductMutationError,
  createProductForAdmin,
} from "../../features/adminProducts/adminProductSlice.js";

import {
  clearCategoryError,
  fetchCategories,
} from "../../features/categories/categorySlice.js";

const extractCreatedProduct = (response) => {
  return response?.data?.product || response?.product || null;
};

const AdminCreateProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { creating } = useSelector((state) => state.adminProducts);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetched: categoriesFetched,
  } = useSelector((state) => state.categories);

  /*
  |--------------------------------------------------------------------------
  | Load categories
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!categoriesFetched) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoriesFetched]);

  /*
  |--------------------------------------------------------------------------
  | Show category error
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!categoriesError) {
      return;
    }

    toast.error(categoriesError);
    dispatch(clearCategoryError());
  }, [dispatch, categoriesError]);

  /*
  |--------------------------------------------------------------------------
  | Clear old product mutation errors
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(clearAdminProductMutationError());
  }, [dispatch]);

  /*
  |--------------------------------------------------------------------------
  | Create product
  |--------------------------------------------------------------------------
  */

  const handleCreateProduct = async (productData) => {
    try {
      const response = await dispatch(
        createProductForAdmin(productData),
      ).unwrap();

      const product = extractCreatedProduct(response);

      if (!product?._id) {
        throw new Error("Created product information was not returned");
      }

      toast.success("Product created successfully");

      /*
      |--------------------------------------------------------------------------
      | Redirect to edit page
      |
      | The admin can upload product images from the edit page because the
      | product must exist in MongoDB before images can be uploaded.
      |--------------------------------------------------------------------------
      */

      navigate(`/admin/products/${product._id}/edit`, {
        replace: true,

        state: {
          productCreated: true,
          showImageUploader: true,
        },
      });
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to create product",
      );
    }
  };

  return (
    <AdminProductForm
      initialValues={emptyProductForm}
      categories={categories}
      categoriesLoading={categoriesLoading}
      submitting={creating}
      submitLabel="Create product"
      heading="Create product"
      description="Add a new handcrafted piece to your product catalogue."
      onSubmit={handleCreateProduct}
    />
  );
};

export default AdminCreateProduct;
