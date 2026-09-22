import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import {
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiImage,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiStar,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import {
  clearAdminCategoryMutationError,
  createCategoryForAdmin,
  deleteCategoryForAdmin,
  fetchAdminCategories,
  removeCategoryImageForAdmin,
  resetCategoryImageUploadProgress,
  setSelectedAdminCategory,
  updateCategoryForAdmin,
  uploadCategoryImageForAdmin,
} from "../../features/adminCategories/adminCategorySlice.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const initialCategoryForm = {
  name: "",
  description: "",
  isActive: true,
  isFeatured: false,
  displayOrder: "0",
};

const inputClass = (hasError = false) => {
  return [
    "h-12 w-full rounded-xl border bg-[#FFFCF7] px-4",
    "text-sm text-[#2A1810] outline-none transition",
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-[#2A1810]/15 focus:border-[#A45A3A]",
  ].join(" ");
};

const AdminCategories = () => {
  const dispatch = useDispatch();

  const imageInputRef = useRef(null);

  const {
    categories,
    loading,
    error,
    creating,
    updating,
    deleting,
    uploadingImage,
    removingImage,
    imageUploadProgress,
    mutationError,
  } = useSelector((state) => state.adminCategories);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState(initialCategoryForm);
  const [formErrors, setFormErrors] = useState({});

  const [imageCategory, setImageCategory] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageAltText, setImageAltText] = useState("");

  const [deleteCandidate, setDeleteCandidate] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Load categories
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  /*
  |--------------------------------------------------------------------------
  | Cleanup selected image preview
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (selectedImage?.preview) {
        URL.revokeObjectURL(selectedImage.preview);
      }
    };
  }, [selectedImage]);

  /*
  |--------------------------------------------------------------------------
  | Mutation errors
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!mutationError) {
      return;
    }

    toast.error(mutationError);
    dispatch(clearAdminCategoryMutationError());
  }, [dispatch, mutationError]);

  /*
  |--------------------------------------------------------------------------
  | Category form
  |--------------------------------------------------------------------------
  */

  const openCreateForm = () => {
    setEditingCategory(null);
    setFormData(initialCategoryForm);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || "",
      description: category.description || "",
      isActive: category.isActive !== false,
      isFeatured: Boolean(category.isFeatured),
      displayOrder: String(category.displayOrder ?? 0),
    });

    setFormErrors({});
    setFormOpen(true);

    dispatch(setSelectedAdminCategory(category));
  };

  const closeForm = () => {
    if (creating || updating) {
      return;
    }

    setFormOpen(false);
    setEditingCategory(null);
    setFormErrors({});
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    let cleanedValue = type === "checkbox" ? checked : value;

    if (name === "displayOrder") {
      cleanedValue = value.replace(/\D/g, "");
    }

    setFormData((current) => ({
      ...current,
      [name]: cleanedValue,
    }));

    setFormErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateCategoryForm = () => {
    const validationErrors = {};

    if (!formData.name.trim()) {
      validationErrors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      validationErrors.name =
        "Category name must contain at least 2 characters";
    }

    if (formData.description.length > 500) {
      validationErrors.description = "Description cannot exceed 500 characters";
    }

    const displayOrder = Number(formData.displayOrder);

    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      validationErrors.displayOrder =
        "Display order must be a non-negative whole number";
    }

    setFormErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    if (creating || updating || !validateCategoryForm()) {
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      isActive: Boolean(formData.isActive),
      isFeatured: Boolean(formData.isFeatured),
      displayOrder: Number(formData.displayOrder),
    };

    try {
      if (editingCategory?._id) {
        await dispatch(
          updateCategoryForAdmin({
            categoryId: editingCategory._id,
            categoryData,
          }),
        ).unwrap();

        toast.success("Category updated successfully");
      } else {
        const response = await dispatch(
          createCategoryForAdmin(categoryData),
        ).unwrap();

        const createdCategory = response?.data?.category || response?.category;

        toast.success("Category created successfully");

        if (createdCategory?._id) {
          setFormOpen(false);
          setEditingCategory(null);

          openImageManager(createdCategory);
          return;
        }
      }

      closeForm();
    } catch (submitError) {
      toast.error(
        typeof submitError === "string"
          ? submitError
          : submitError?.message || "Unable to save category",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Image manager
  |--------------------------------------------------------------------------
  */

  const clearSelectedImage = () => {
    setSelectedImage((current) => {
      if (current?.preview) {
        URL.revokeObjectURL(current.preview);
      }

      return null;
    });

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const openImageManager = (category) => {
    clearSelectedImage();

    setImageCategory(category);

    setImageAltText(category.image?.altText || `${category.name} collection`);

    dispatch(resetCategoryImageUploadProgress());
  };

  const closeImageManager = () => {
    if (uploadingImage || removingImage) {
      return;
    }

    clearSelectedImage();
    setImageCategory(null);
    setImageAltText("");
    dispatch(resetCategoryImageUploadProgress());
  };

  const handleImageSelection = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Category image must be JPG, PNG or WebP");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Category image must be smaller than 5 MB");
      return;
    }

    clearSelectedImage();

    setSelectedImage({
      file,
      preview: URL.createObjectURL(file),
    });
  };

  const handleUploadImage = async () => {
    if (!imageCategory?._id || !selectedImage?.file || uploadingImage) {
      return;
    }

    try {
      const response = await dispatch(
        uploadCategoryImageForAdmin({
          categoryId: imageCategory._id,
          file: selectedImage.file,
          altText: imageAltText.trim() || `${imageCategory.name} collection`,
        }),
      ).unwrap();

      const updatedCategory = response?.data?.category || response?.category;

      if (updatedCategory) {
        setImageCategory(updatedCategory);
      }

      clearSelectedImage();

      toast.success("Category image uploaded successfully");

      window.setTimeout(() => {
        dispatch(resetCategoryImageUploadProgress());
      }, 700);
    } catch (uploadError) {
      toast.error(
        typeof uploadError === "string"
          ? uploadError
          : uploadError?.message || "Unable to upload category image",
      );
    }
  };

  const handleRemoveCategoryImage = async () => {
    if (!imageCategory?._id || !imageCategory.image?.url || removingImage) {
      return;
    }

    try {
      const response = await dispatch(
        removeCategoryImageForAdmin(imageCategory._id),
      ).unwrap();

      const updatedCategory = response?.data?.category || response?.category;

      if (updatedCategory) {
        setImageCategory(updatedCategory);
      } else {
        setImageCategory((current) => ({
          ...current,

          image: {
            fileId: "",
            url: "",
            thumbnailUrl: "",
            altText: "",
          },
        }));
      }

      toast.success("Category image removed");
    } catch (removeError) {
      toast.error(
        typeof removeError === "string"
          ? removeError
          : removeError?.message || "Unable to remove category image",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete category
  |--------------------------------------------------------------------------
  */

  const handleDeleteCategory = async () => {
    if (!deleteCandidate?._id || deleting) {
      return;
    }

    try {
      await dispatch(deleteCategoryForAdmin(deleteCandidate._id)).unwrap();

      toast.success("Category deleted successfully");
      setDeleteCandidate(null);
    } catch (deleteError) {
      toast.error(
        typeof deleteError === "string"
          ? deleteError
          : deleteError?.message || "Unable to delete category",
      );
    }
  };

  const categoryBeingProcessed = creating || updating;

  return (
    <>
      <main className="p-4">
        {/* Heading */}

        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A45A3A]">
              Catalogue organisation
            </p>

            <h1 className="mt-2 font-serif text-4xl text-[#2A1810] sm:text-5xl">
              Categories
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#756157]">
              Organise products into visual storefront collections.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => dispatch(fetchAdminCategories())}
              disabled={loading}
              aria-label="Refresh categories"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2A1810]/15 bg-white text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A] disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#2A1810] px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#A45A3A]"
            >
              <FiPlus size={17} />
              Add category
            </button>
          </div>
        </section>

        {/* Summary */}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#2A1810]/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <FiLayers className="text-[#A45A3A]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8A7569]">
                Total
              </span>
            </div>

            <p className="mt-5 font-serif text-4xl text-[#2A1810]">
              {categories.length}
            </p>

            <p className="mt-1 text-xs text-[#756157]">All categories</p>
          </div>

          <div className="rounded-3xl border border-[#2A1810]/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <FiEye className="text-emerald-600" />

              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8A7569]">
                Active
              </span>
            </div>

            <p className="mt-5 font-serif text-4xl text-[#2A1810]">
              {categories.filter((category) => category.isActive).length}
            </p>

            <p className="mt-1 text-xs text-[#756157]">Visible collections</p>
          </div>

          <div className="rounded-3xl border border-[#2A1810]/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <FiStar className="text-[#B88A44]" />

              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8A7569]">
                Featured
              </span>
            </div>

            <p className="mt-5 font-serif text-4xl text-[#2A1810]">
              {categories.filter((category) => category.isFeatured).length}
            </p>

            <p className="mt-1 text-xs text-[#756157]">Featured collections</p>
          </div>
        </section>

        {/* Loading */}

        {loading && (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-[1.75rem] bg-white"
              />
            ))}
          </section>
        )}

        {/* Error */}

        {!loading && error && (
          <section className="mt-8 rounded-[1.75rem] border border-red-200 bg-red-50 px-6 py-16 text-center">
            <h2 className="font-serif text-3xl text-[#2A1810]">
              Categories could not be loaded
            </h2>

            <p className="mt-3 text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => dispatch(fetchAdminCategories())}
              className="mt-6 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
            >
              Try again
            </button>
          </section>
        )}

        {/* Categories */}

        {!loading && !error && categories.length > 0 && (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category, index) => (
              <motion.article
                key={category._id}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: Math.min(index, 5) * 0.05,
                }}
                className="group overflow-hidden rounded-[1.75rem] border border-[#2A1810]/10 bg-white shadow-[0_16px_45px_rgba(42,24,16,0.04)]"
              >
                <div className="relative aspect-video overflow-hidden bg-linear-to-br from-[#D4B997] to-[#8C684F]">
                  {category.image?.url ? (
                    <img
                      src={category.image.url}
                      alt={category.image.altText || category.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-[#FFF9EF]">
                      <FiImage size={28} />

                      <span className="mt-3 font-serif text-xl">
                        {category.name}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-[#21130E]/70 via-transparent to-transparent" />

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] backdrop-blur-md ${
                        category.isActive
                          ? "bg-emerald-100/95 text-emerald-700"
                          : "bg-stone-200/95 text-stone-600"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>

                    {category.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#D9B477]/95 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#21130E]">
                        <FiStar className="fill-current" />
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 right-4">
                    <span className="rounded-full bg-[#FFF9EF]/95 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#2A1810] backdrop-blur-md">
                      Order {category.displayOrder || 0}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="font-serif text-2xl text-[#2A1810]">
                    {category.name}
                  </h2>

                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#A45A3A]">
                    /{category.slug}
                  </p>

                  <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-[#756157]">
                    {category.description ||
                      "No category description has been added."}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#2A1810]/10 pt-5">
                    <button
                      type="button"
                      onClick={() => openImageManager(category)}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#2A1810]/10 text-[8px] font-bold uppercase tracking-widest text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A]"
                    >
                      <FiImage />
                      Image
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditForm(category)}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#2A1810]/10 text-[8px] font-bold uppercase tracking-widest text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A]"
                    >
                      <FiEdit2 />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteCandidate(category)}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-red-200 text-[8px] font-bold uppercase tracking-widest text-red-600 transition hover:bg-red-50"
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </section>
        )}

        {/* Empty state */}

        {!loading && !error && categories.length === 0 && (
          <section className="mt-8 rounded-[1.75rem] border border-[#2A1810]/10 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#A45A3A]/10 text-[#A45A3A]">
              <FiLayers size={27} />
            </div>

            <h2 className="mt-5 font-serif text-3xl text-[#2A1810]">
              No categories created
            </h2>

            <p className="mt-3 text-sm text-[#756157]">
              Create the first category for your product catalogue.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
            >
              <FiPlus />
              Add category
            </button>
          </section>
        )}
      </main>

      {/* Create/edit modal */}

      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 z-120 flex items-center justify-center overflow-y-auto px-5 py-10">
            <motion.button
              type="button"
              aria-label="Close category form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              disabled={categoryBeingProcessed}
              onClick={closeForm}
              className="fixed inset-0 bg-[#160C08]/65 backdrop-blur-sm"
            />

            <motion.form
              onSubmit={handleCategorySubmit}
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              className="relative my-auto w-full max-w-xl rounded-4xl bg-[#FFF9EF] p-6 shadow-[0_30px_90px_rgba(22,12,8,0.35)] sm:p-8"
            >
              <button
                type="button"
                disabled={categoryBeingProcessed}
                onClick={closeForm}
                aria-label="Close"
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-[#756157] transition hover:bg-[#2A1810]/5 hover:text-[#2A1810]"
              >
                <FiX />
              </button>

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A45A3A]">
                {editingCategory ? "Update collection" : "New collection"}
              </p>

              <h2 className="mt-2 pr-12 font-serif text-3xl text-[#2A1810] sm:text-4xl">
                {editingCategory ? "Edit category" : "Create category"}
              </h2>

              <div className="mt-7 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Category name *
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    maxLength={60}
                    placeholder="Example: Wall Panels"
                    className={inputClass(formErrors.name)}
                  />

                  {formErrors.name && (
                    <span className="mt-1.5 block text-xs text-red-600">
                      {formErrors.name}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Description
                  </span>

                  <textarea
                    name="description"
                    rows={5}
                    maxLength={500}
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Describe this collection..."
                    className={`w-full resize-none rounded-xl border bg-[#FFFCF7] p-4 text-sm leading-6 text-[#2A1810] outline-none transition ${
                      formErrors.description
                        ? "border-red-500"
                        : "border-[#2A1810]/15 focus:border-[#A45A3A]"
                    }`}
                  />

                  <div className="mt-1.5 flex justify-between">
                    <span className="text-xs text-red-600">
                      {formErrors.description || ""}
                    </span>

                    <span className="text-[10px] text-[#8A7569]">
                      {formData.description.length}/500
                    </span>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Display order
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleFormChange}
                    className={inputClass(formErrors.displayOrder)}
                  />

                  {formErrors.displayOrder && (
                    <span className="mt-1.5 block text-xs text-red-600">
                      {formErrors.displayOrder}
                    </span>
                  )}
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#2A1810]/10 bg-white p-4">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      className="mt-0.5 h-4 w-4 accent-[#A45A3A]"
                    />

                    <span>
                      <span className="flex items-center gap-2 text-sm font-semibold text-[#2A1810]">
                        {formData.isActive ? <FiEye /> : <FiEyeOff />}
                        Active
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#756157]">
                        Show this category publicly.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#2A1810]/10 bg-white p-4">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleFormChange}
                      className="mt-0.5 h-4 w-4 accent-[#A45A3A]"
                    />

                    <span>
                      <span className="flex items-center gap-2 text-sm font-semibold text-[#2A1810]">
                        <FiStar />
                        Featured
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#756157]">
                        Highlight this collection.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={categoryBeingProcessed}
                  onClick={closeForm}
                  className="h-11 rounded-full border border-[#2A1810]/15 px-6 text-[9px] font-bold uppercase tracking-[0.13em] text-[#2A1810] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={categoryBeingProcessed}
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#2A1810] px-6 text-[9px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#A45A3A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {categoryBeingProcessed ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      {editingCategory ? "Save changes" : "Create category"}
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Image manager */}

      <AnimatePresence>
        {imageCategory && (
          <div className="fixed inset-0 z-125 flex items-center justify-center overflow-y-auto px-5 py-10">
            <motion.button
              type="button"
              aria-label="Close image manager"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              disabled={uploadingImage || removingImage}
              onClick={closeImageManager}
              className="fixed inset-0 bg-[#160C08]/65 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              className="relative my-auto w-full max-w-2xl rounded-4xl bg-[#FFF9EF] p-6 shadow-[0_30px_90px_rgba(22,12,8,0.35)] sm:p-8"
            >
              <button
                type="button"
                disabled={uploadingImage || removingImage}
                onClick={closeImageManager}
                aria-label="Close"
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-[#756157] transition hover:bg-[#2A1810]/5"
              >
                <FiX />
              </button>

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A45A3A]">
                Collection media
              </p>

              <h2 className="mt-2 pr-12 font-serif text-3xl text-[#2A1810] sm:text-4xl">
                {imageCategory.name}
              </h2>

              <div className="mt-7 grid gap-6 md:grid-cols-2">
                {/* Current image */}

                <div>
                  <p className="mb-3 text-xs font-semibold text-[#5F4A3F]">
                    Current image
                  </p>

                  <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-linear-to-br from-[#D4B997] to-[#8C684F]">
                    {imageCategory.image?.url ? (
                      <img
                        src={imageCategory.image.url}
                        alt={imageCategory.image.altText || imageCategory.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-[#FFF9EF]">
                        <FiImage size={30} />

                        <span className="mt-3 font-serif text-xl">
                          No image
                        </span>
                      </div>
                    )}

                    {imageCategory.image?.url && (
                      <button
                        type="button"
                        disabled={removingImage || uploadingImage}
                        onClick={handleRemoveCategoryImage}
                        className="absolute bottom-3 right-3 flex h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-[8px] font-bold uppercase tracking-widest text-white disabled:opacity-50"
                      >
                        {removingImage ? (
                          <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Removing
                          </>
                        ) : (
                          <>
                            <FiTrash2 />
                            Remove
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* New image */}

                <div>
                  <p className="mb-3 text-xs font-semibold text-[#5F4A3F]">
                    New image
                  </p>

                  {selectedImage ? (
                    <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-[#E9DDCC]">
                      <img
                        src={selectedImage.preview}
                        alt="Selected category preview"
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={clearSelectedImage}
                        aria-label="Remove selected image"
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#21130E]/85 text-white"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <label className="flex aspect-4/3 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#A45A3A]/40 bg-[#A45A3A]/5 px-5 text-center transition hover:border-[#A45A3A]">
                      <FiUploadCloud size={28} className="text-[#A45A3A]" />

                      <span className="mt-3 text-sm font-semibold text-[#2A1810]">
                        Select category image
                      </span>

                      <span className="mt-1 text-xs text-[#756157]">
                        JPG, PNG or WebP · Maximum 5 MB
                      </span>

                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploadingImage}
                        onChange={handleImageSelection}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <label className="mt-6 block">
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Alternative text
                </span>

                <input
                  type="text"
                  value={imageAltText}
                  onChange={(event) => setImageAltText(event.target.value)}
                  maxLength={150}
                  placeholder={`${imageCategory.name} collection`}
                  className={inputClass(false)}
                />
              </label>

              {uploadingImage && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-semibold text-[#5F4A3F]">
                    <span>Uploading category image</span>
                    <span>{imageUploadProgress}%</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E1D3C0]">
                    <motion.div
                      animate={{
                        width: `${imageUploadProgress}%`,
                      }}
                      className="h-full rounded-full bg-[#A45A3A]"
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={uploadingImage || removingImage}
                  onClick={closeImageManager}
                  className="h-11 rounded-full border border-[#2A1810]/15 px-6 text-[9px] font-bold uppercase tracking-[0.13em] text-[#2A1810] disabled:opacity-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={!selectedImage || uploadingImage || removingImage}
                  onClick={handleUploadImage}
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#2A1810] px-6 text-[9px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#A45A3A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Uploading {imageUploadProgress}%
                    </>
                  ) : (
                    <>
                      <FiUploadCloud />
                      {imageCategory.image?.url
                        ? "Replace image"
                        : "Upload image"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}

      <AnimatePresence>
        {deleteCandidate && (
          <div className="fixed inset-0 z-130 flex items-center justify-center px-5">
            <motion.button
              type="button"
              aria-label="Close delete confirmation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              disabled={deleting}
              onClick={() => setDeleteCandidate(null)}
              className="absolute inset-0 bg-[#160C08]/65 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-category-title"
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 18,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 18,
              }}
              className="relative w-full max-w-md rounded-4xl bg-[#FFF9EF] p-7 shadow-[0_30px_90px_rgba(22,12,8,0.35)] sm:p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                <FiTrash2 size={23} />
              </div>

              <h2
                id="delete-category-title"
                className="mt-5 font-serif text-3xl text-[#2A1810]"
              >
                Delete category?
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#756157]">
                <strong className="text-[#2A1810]">
                  {deleteCandidate.name}
                </strong>{" "}
                will be permanently deleted.
              </p>

              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-700">
                The backend will prevent deletion if products are still assigned
                to this category. Deactivate it instead when necessary.
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteCandidate(null)}
                  className="h-11 rounded-full border border-[#2A1810]/15 px-6 text-[9px] font-bold uppercase tracking-[0.13em] text-[#2A1810] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteCategory}
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-[9px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 />
                      Delete category
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminCategories;
