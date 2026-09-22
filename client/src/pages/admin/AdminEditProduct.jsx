import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiChevronLeft,
  FiEye,
  FiImage,
  FiStar,
  FiTrash2,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import AdminProductForm from "../../components/admin/products/AdminProductForm.jsx";

import {
  clearAdminProductMutationError,
  clearSelectedAdminProduct,
  fetchAdminProductById,
  removeProductImageForAdmin,
  resetImageUploadProgress,
  setPrimaryProductImageForAdmin,
  updateProductForAdmin,
  uploadProductImagesForAdmin,
} from "../../features/adminProducts/adminProductSlice.js";

import {
  clearCategoryError,
  fetchCategories,
} from "../../features/categories/categorySlice.js";

const MAX_PRODUCT_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const AdminEditProduct = () => {
  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const imageSectionRef = useRef(null);
  const previewsRef = useRef([]);

  const [selectedImages, setSelectedImages] = useState([]);
  const [removeCandidate, setRemoveCandidate] = useState(null);

  const {
    selectedProduct: product,
    selectedProductLoading,
    selectedProductError,

    updating,
    uploadingImages,
    updatingPrimaryImage,
    removingImage,

    imageUploadProgress,
    mutationError,
  } = useSelector((state) => state.adminProducts);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetched: categoriesFetched,
  } = useSelector((state) => state.categories);

  /*
  |--------------------------------------------------------------------------
  | Load product
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(clearAdminProductMutationError());
    dispatch(fetchAdminProductById(id));

    return () => {
      dispatch(clearSelectedAdminProduct());
      dispatch(resetImageUploadProgress());
    };
  }, [dispatch, id]);

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
  | Keep preview reference current
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    previewsRef.current = selectedImages;
  }, [selectedImages]);

  /*
  |--------------------------------------------------------------------------
  | Release browser image previews
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Show errors
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!mutationError) {
      return;
    }

    toast.error(mutationError);
    dispatch(clearAdminProductMutationError());
  }, [dispatch, mutationError]);

  useEffect(() => {
    if (!categoriesError) {
      return;
    }

    toast.error(categoriesError);
    dispatch(clearCategoryError());
  }, [dispatch, categoriesError]);

  /*
  |--------------------------------------------------------------------------
  | Scroll to image section after product creation
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !product ||
      !location.state?.showImageUploader ||
      !imageSectionRef.current
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      imageSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      toast.success("Now upload images for your product");

      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [location.pathname, location.state, navigate, product]);

  /*
  |--------------------------------------------------------------------------
  | Update product
  |--------------------------------------------------------------------------
  */

  const handleUpdateProduct = async (productData) => {
    try {
      await dispatch(
        updateProductForAdmin({
          productId: id,
          productData,
        }),
      ).unwrap();

      toast.success("Product updated successfully");
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to update product",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Select new images
  |--------------------------------------------------------------------------
  */

  const handleImageSelection = (event) => {
    const files = Array.from(event.target.files || []);

    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const existingImageCount = product?.images?.length || 0;
    const availableSlots =
      MAX_PRODUCT_IMAGES - existingImageCount - selectedImages.length;

    if (availableSlots <= 0) {
      toast.error(
        `A product can have a maximum of ${MAX_PRODUCT_IMAGES} images`,
      );

      return;
    }

    const acceptedFiles = [];

    for (const file of files) {
      if (acceptedFiles.length >= availableSlots) {
        break;
      }

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} must be JPG, PNG or WebP`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} must be smaller than 5 MB`);
        continue;
      }

      const duplicate = selectedImages.some(
        (image) =>
          image.file.name === file.name &&
          image.file.size === file.size &&
          image.file.lastModified === file.lastModified,
      );

      if (duplicate) {
        continue;
      }

      acceptedFiles.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (files.length > availableSlots) {
      toast.error(
        `You can select only ${availableSlots} more image${
          availableSlots === 1 ? "" : "s"
        }`,
      );
    }

    setSelectedImages((current) => [...current, ...acceptedFiles]);
  };

  const removeSelectedImage = (imageId) => {
    setSelectedImages((current) => {
      const image = current.find((currentImage) => currentImage.id === imageId);

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      return current.filter((currentImage) => currentImage.id !== imageId);
    });
  };

  const clearSelectedImages = () => {
    selectedImages.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });

    setSelectedImages([]);
  };

  /*
  |--------------------------------------------------------------------------
  | Upload images
  |--------------------------------------------------------------------------
  */

  const handleUploadImages = async () => {
    if (selectedImages.length === 0 || uploadingImages) {
      return;
    }

    try {
      await dispatch(
        uploadProductImagesForAdmin({
          productId: id,
          files: selectedImages.map((image) => image.file),
        }),
      ).unwrap();

      clearSelectedImages();

      toast.success("Product images uploaded successfully");

      window.setTimeout(() => {
        dispatch(resetImageUploadProgress());
      }, 700);
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to upload images",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Set primary image
  |--------------------------------------------------------------------------
  */

  const handleSetPrimaryImage = async (fileId) => {
    if (!fileId || updatingPrimaryImage) {
      return;
    }

    try {
      await dispatch(
        setPrimaryProductImageForAdmin({
          productId: id,
          fileId,
        }),
      ).unwrap();

      toast.success("Primary product image updated");
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to update primary image",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Remove uploaded image
  |--------------------------------------------------------------------------
  */

  const handleRemoveImage = async () => {
    if (!removeCandidate?.fileId || removingImage) {
      return;
    }

    try {
      await dispatch(
        removeProductImageForAdmin({
          productId: id,
          fileId: removeCandidate.fileId,
        }),
      ).unwrap();

      setRemoveCandidate(null);

      toast.success("Product image removed");
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to remove image",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (selectedProductLoading) {
    return (
      <main className="animate-pulse">
        <div className="h-4 w-36 rounded bg-[#DED0BD]" />

        <div className="mt-6 h-12 w-72 rounded bg-[#DED0BD]" />

        <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-80 rounded-[1.75rem] bg-white" />
            ))}
          </div>

          <div className="h-96 rounded-[1.75rem] bg-white" />
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (selectedProductError || !product) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <FiImage size={27} />
          </div>

          <h1 className="mt-5 font-serif text-4xl text-[#2A1810]">
            Product not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#756157]">
            {selectedProductError || "This product could not be loaded."}
          </p>

          <Link
            to="/admin/products"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
          >
            <FiChevronLeft />
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  const uploadedImages = Array.isArray(product.images) ? product.images : [];

  const remainingImageSlots = Math.max(
    MAX_PRODUCT_IMAGES - uploadedImages.length - selectedImages.length,
    0,
  );

  return (
    <>
      <main>
        <AdminProductForm
          initialValues={product}
          categories={categories}
          categoriesLoading={categoriesLoading}
          submitting={updating}
          submitLabel="Save changes"
          heading="Edit product"
          description={`Update ${product.name} and manage its storefront information.`}
          onSubmit={handleUpdateProduct}
        />

        {/* Product images */}

        <section
          ref={imageSectionRef}
          className="scroll-mt-28 mt-8 rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 shadow-[0_16px_45px_rgba(42,24,16,0.04)] sm:p-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#A45A3A]/10 text-[#A45A3A]">
                <FiImage />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A45A3A]">
                  Product media
                </p>

                <h2 className="mt-1 font-serif text-3xl text-[#2A1810]">
                  Product images
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#756157]">
                  Upload up to {MAX_PRODUCT_IMAGES} images and choose the
                  primary storefront image.
                </p>
              </div>
            </div>

            {product.slug && (
              <Link
                to={`/products/${product.slug}`}
                target="_blank"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#2A1810]/15 px-5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A]"
              >
                <FiEye />
                View storefront
              </Link>
            )}
          </div>

          {/* Uploaded images */}

          {uploadedImages.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {uploadedImages.map((image, index) => (
                <motion.article
                  layout
                  key={image.fileId || image._id || image.url}
                  className={`group relative overflow-hidden rounded-2xl border bg-[#E9DDCC] ${
                    image.isPrimary
                      ? "border-[#A45A3A] ring-2 ring-[#A45A3A]/15"
                      : "border-[#2A1810]/10"
                  }`}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image.url}
                      alt={
                        image.altText || `${product.name} image ${index + 1}`
                      }
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  {image.isPrimary && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#A45A3A] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-white shadow-lg">
                      <FiStar className="fill-current" />
                      Primary
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-[#21130E]/85 p-3 backdrop-blur-md transition duration-300 group-hover:translate-y-0">
                    {!image.isPrimary && (
                      <button
                        type="button"
                        disabled={updatingPrimaryImage || removingImage}
                        onClick={() => handleSetPrimaryImage(image.fileId)}
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#FFF9EF] px-3 text-[8px] font-bold uppercase tracking-[0.1em] text-[#2A1810] disabled:opacity-50"
                      >
                        <FiStar />
                        Primary
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={removingImage || updatingPrimaryImage}
                      onClick={() => setRemoveCandidate(image)}
                      aria-label="Remove product image"
                      className={`flex h-9 items-center justify-center rounded-full bg-red-600 px-3 text-white transition hover:bg-red-700 disabled:opacity-50 ${
                        image.isPrimary ? "flex-1 gap-2" : "w-9"
                      }`}
                    >
                      <FiTrash2 />

                      {image.isPrimary && (
                        <span className="text-[8px] font-bold uppercase tracking-[0.1em]">
                          Remove
                        </span>
                      )}
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[#2A1810]/15 bg-[#FAF6EF] px-6 py-12 text-center">
              <FiImage size={30} className="mx-auto text-[#A45A3A]" />

              <p className="mt-4 font-serif text-2xl text-[#2A1810]">
                No product images
              </p>

              <p className="mt-2 text-sm text-[#756157]">
                Select images below to begin building the product gallery.
              </p>
            </div>
          )}

          {/* Image selector */}

          <div className="mt-8 border-t border-[#2A1810]/10 pt-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-serif text-2xl text-[#2A1810]">
                  Upload new images
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#756157]">
                  JPG, PNG or WebP. Maximum 5 MB per image.{" "}
                  {remainingImageSlots} image
                  {remainingImageSlots === 1 ? "" : "s"} remaining.
                </p>
              </div>

              <label
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-[9px] font-bold uppercase tracking-[0.13em] transition ${
                  remainingImageSlots > 0 && !uploadingImages
                    ? "cursor-pointer bg-[#2A1810] text-white hover:bg-[#A45A3A]"
                    : "cursor-not-allowed bg-[#2A1810]/20 text-[#756157]"
                }`}
              >
                <FiUploadCloud size={16} />
                Select images
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={remainingImageSlots <= 0 || uploadingImages}
                  onChange={handleImageSelection}
                  className="hidden"
                />
              </label>
            </div>

            <AnimatePresence>
              {selectedImages.length > 0 && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 12,
                  }}
                  className="mt-6"
                >
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {selectedImages.map((image) => (
                      <motion.div
                        layout
                        key={image.id}
                        className="relative aspect-square overflow-hidden rounded-2xl bg-[#E9DDCC]"
                      >
                        <img
                          src={image.preview}
                          alt="Selected product preview"
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          disabled={uploadingImages}
                          onClick={() => removeSelectedImage(image.id)}
                          aria-label="Remove selected image"
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#21130E]/85 text-white backdrop-blur-sm disabled:opacity-50"
                        >
                          <FiX />
                        </button>

                        <span className="absolute bottom-2 left-2 rounded-full bg-[#FFF9EF]/90 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#2A1810] backdrop-blur-sm">
                          New
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {uploadingImages && (
                    <div className="mt-6">
                      <div className="flex justify-between text-xs font-semibold text-[#5F4A3F]">
                        <span>Uploading product images</span>
                        <span>{imageUploadProgress}%</span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E1D3C0]">
                        <motion.div
                          animate={{
                            width: `${imageUploadProgress}%`,
                          }}
                          transition={{
                            duration: 0.2,
                          }}
                          className="h-full rounded-full bg-[#A45A3A]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={uploadingImages}
                      onClick={clearSelectedImages}
                      className="h-11 rounded-full border border-[#2A1810]/15 px-6 text-[9px] font-bold uppercase tracking-[0.13em] text-[#2A1810] disabled:opacity-50"
                    >
                      Clear selection
                    </button>

                    <button
                      type="button"
                      disabled={uploadingImages || selectedImages.length === 0}
                      onClick={handleUploadImages}
                      className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#A45A3A] px-6 text-[9px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#86452F] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploadingImages ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Uploading {imageUploadProgress}%
                        </>
                      ) : (
                        <>
                          <FiUploadCloud />
                          Upload {selectedImages.length} image
                          {selectedImages.length === 1 ? "" : "s"}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Remove image confirmation */}

      <AnimatePresence>
        {removeCandidate && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center px-5">
            <motion.button
              type="button"
              aria-label="Close confirmation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              disabled={removingImage}
              onClick={() => setRemoveCandidate(null)}
              className="absolute inset-0 bg-[#160C08]/65 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="remove-image-title"
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 18,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 18,
              }}
              className="relative w-full max-w-md rounded-[2rem] bg-[#FFF9EF] p-7 shadow-[0_30px_90px_rgba(22,12,8,0.35)] sm:p-8"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                <FiTrash2 size={23} />
              </div>

              <h2
                id="remove-image-title"
                className="mt-5 font-serif text-3xl text-[#2A1810]"
              >
                Remove this image?
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#756157]">
                The image will be permanently removed from ImageKit and the
                product gallery.
              </p>

              {removeCandidate.isPrimary && (
                <div className="mt-4 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-700">
                  This is the primary image. Another image will become primary
                  automatically after removal.
                </div>
              )}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={removingImage}
                  onClick={() => setRemoveCandidate(null)}
                  className="h-11 rounded-full border border-[#2A1810]/15 px-6 text-[9px] font-bold uppercase tracking-[0.13em] text-[#2A1810] disabled:opacity-50"
                >
                  Keep image
                </button>

                <button
                  type="button"
                  disabled={removingImage}
                  onClick={handleRemoveImage}
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-[9px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {removingImage ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <FiTrash2 />
                      Remove image
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

export default AdminEditProduct;
