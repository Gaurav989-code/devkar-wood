import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import {
  FiArchive,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiImage,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSliders,
  FiX,
} from "react-icons/fi";

import {
  archiveProductForAdmin,
  clearAdminProductMutationError,
  fetchAdminProducts,
} from "../../features/adminProducts/adminProductSlice.js";

const STATUS_OPTIONS = [
  {
    value: "",
    label: "All statuses",
  },
  {
    value: "active",
    label: "Active",
  },
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "archived",
    label: "Archived",
  },
];

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest first",
  },
  {
    value: "oldest",
    label: "Oldest first",
  },
  {
    value: "priceHighToLow",
    label: "Price: High to low",
  },
  {
    value: "priceLowToHigh",
    label: "Price: Low to high",
  },
  {
    value: "stockLowToHigh",
    label: "Stock: Low to high",
  },
];

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
};

const getProductImage = (product) => {
  return (
    product.images?.find((image) => image.isPrimary) ||
    product.images?.[0] ||
    null
  );
};

const getEffectivePrice = (product) => {
  const regularPrice = Number(product.price) || 0;
  const salePrice = Number(product.salePrice);

  if (
    product.salePrice !== null &&
    product.salePrice !== undefined &&
    Number.isFinite(salePrice) &&
    salePrice < regularPrice
  ) {
    return salePrice;
  }

  return regularPrice;
};

const getProductStatus = (product) => {
  if (product.status) {
    return product.status;
  }

  return product.isActive === false ? "archived" : "active";
};

const getStatusClasses = (status) => {
  const classes = {
    active: "bg-emerald-100 text-emerald-700",
    draft: "bg-amber-100 text-amber-700",
    archived: "bg-stone-200 text-stone-600",
  };

  return classes[status] || "bg-stone-100 text-stone-600";
};

const AdminProducts = () => {
  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );

  const [archiveCandidate, setArchiveCandidate] = useState(null);

  const {
    products,
    pagination,
    productsLoading,
    productsError,
    archiving,
    mutationError,
  } = useSelector((state) => state.adminProducts);

  const currentPage = Math.max(Number(searchParams.get("page")) || 1, 1);

  const selectedStatus = searchParams.get("status") || "";
  const selectedSort = searchParams.get("sort") || "newest";

  const requestParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: 10,
      sort: selectedSort,
    };

    const search = searchParams.get("search");

    if (search) {
      params.search = search;
    }

    if (selectedStatus) {
      params.status = selectedStatus;
    }

    return params;
  }, [currentPage, searchParams, selectedSort, selectedStatus]);

  /*
  |--------------------------------------------------------------------------
  | Load products
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(fetchAdminProducts(requestParams));
  }, [dispatch, requestParams]);

  /*
  |--------------------------------------------------------------------------
  | Show mutation errors
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!mutationError) {
      return;
    }

    toast.error(mutationError);
    dispatch(clearAdminProductMutationError());
  }, [dispatch, mutationError]);

  /*
  |--------------------------------------------------------------------------
  | URL filters
  |--------------------------------------------------------------------------
  */

  const updateFilter = (key, value) => {
    const updatedParams = new URLSearchParams(searchParams);

    if (value === "" || value === null || value === undefined) {
      updatedParams.delete(key);
    } else {
      updatedParams.set(key, String(value));
    }

    if (key !== "page") {
      updatedParams.set("page", "1");
    }

    setSearchParams(updatedParams);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    updateFilter("search", searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  /*
  |--------------------------------------------------------------------------
  | Archive product
  |--------------------------------------------------------------------------
  */

  const handleArchiveProduct = async () => {
    if (!archiveCandidate?._id || archiving) {
      return;
    }

    try {
      await dispatch(archiveProductForAdmin(archiveCandidate._id)).unwrap();

      toast.success(`${archiveCandidate.name} archived successfully`);

      setArchiveCandidate(null);

      dispatch(fetchAdminProducts(requestParams));
    } catch (error) {
      toast.error(error || "Unable to archive product");
    }
  };

  const totalPages = Number(pagination?.totalPages) || 0;

  const totalProducts =
    pagination?.totalProducts ?? pagination?.totalItems ?? products.length;

  const hasActiveFilters = Boolean(
    searchParams.get("search") || selectedStatus,
  );

  return (
    <>
      <main className="p-4">
        {/* Heading */}

        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A45A3A]">
              Catalogue management
            </p>

            <h1 className="mt-2 font-serif text-4xl text-[#2A1810] sm:text-5xl">
              Products
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#756157]">
              Create, update and manage every handcrafted product.
            </p>
          </div>

          <Link
            to="/admin/products/new"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#2A1810] px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#A45A3A]"
          >
            <FiPlus size={17} />
            Add product
          </Link>
        </section>

        {/* Filters */}

        <section className="mt-8 rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-4 shadow-[0_16px_45px_rgba(42,24,16,0.05)] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <form onSubmit={handleSearch} className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7569]" />

              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by product name, SKU or wood type..."
                className="h-12 w-full rounded-full border border-[#2A1810]/10 bg-[#FAF6EF] pl-11 pr-24 text-sm text-[#2A1810] outline-none transition focus:border-[#A45A3A]"
              />

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-[#2A1810] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#A45A3A]"
              >
                Search
              </button>
            </form>

            <div className="grid gap-3 sm:grid-cols-2 xl:flex">
              <div className="relative">
                <FiSliders className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7569]" />

                <select
                  value={selectedStatus}
                  onChange={(event) =>
                    updateFilter("status", event.target.value)
                  }
                  className="h-12 w-full appearance-none rounded-full border border-[#2A1810]/10 bg-[#FAF6EF] pl-11 pr-10 text-xs font-semibold text-[#2A1810] outline-none transition focus:border-[#A45A3A] xl:w-44"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedSort}
                onChange={(event) => updateFilter("sort", event.target.value)}
                className="h-12 w-full rounded-full border border-[#2A1810]/10 bg-[#FAF6EF] px-5 text-xs font-semibold text-[#2A1810] outline-none transition focus:border-[#A45A3A] xl:w-48"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => dispatch(fetchAdminProducts(requestParams))}
              disabled={productsLoading}
              aria-label="Refresh products"
              className="flex h-12 w-full items-center justify-center rounded-full border border-[#2A1810]/10 bg-[#FAF6EF] text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A] disabled:opacity-50 xl:w-12"
            >
              <FiRefreshCw className={productsLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A7569]">
                Active filters:
              </span>

              {searchParams.get("search") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateFilter("search", "");
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#A45A3A]/10 px-3 py-1.5 text-[10px] font-semibold text-[#A45A3A]"
                >
                  Search: {searchParams.get("search")}
                  <FiX />
                </button>
              )}

              {selectedStatus && (
                <button
                  type="button"
                  onClick={() => updateFilter("status", "")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#A45A3A]/10 px-3 py-1.5 text-[10px] font-semibold capitalize text-[#A45A3A]"
                >
                  {selectedStatus}
                  <FiX />
                </button>
              )}

              <button
                type="button"
                onClick={clearFilters}
                className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#756157] transition hover:text-[#A45A3A]"
              >
                Clear all
              </button>
            </div>
          )}
        </section>

        {/* Product count */}

        <div className="mt-7 flex items-center justify-between">
          <p className="text-sm text-[#756157]">
            {productsLoading
              ? "Loading products..."
              : `${totalProducts} product${
                  totalProducts === 1 ? "" : "s"
                } found`}
          </p>
        </div>

        {/* Loading */}

        {productsLoading && (
          <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-[#2A1810]/10 bg-white">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-4 border-b border-[#2A1810]/8 p-5 last:border-b-0"
              >
                <div className="h-16 w-14 shrink-0 rounded-xl bg-[#E7D9C5]" />

                <div className="flex-1">
                  <div className="h-4 w-48 rounded bg-[#E7D9C5]" />
                  <div className="mt-3 h-3 w-28 rounded bg-[#EFE5D7]" />
                </div>

                <div className="hidden h-4 w-20 rounded bg-[#E7D9C5] sm:block" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}

        {!productsLoading && productsError && (
          <section className="mt-5 rounded-[1.75rem] border border-red-200 bg-red-50 px-6 py-16 text-center">
            <FiPackage size={32} className="mx-auto text-red-500" />

            <h2 className="mt-4 font-serif text-3xl text-[#2A1810]">
              Products could not be loaded
            </h2>

            <p className="mt-3 text-sm text-red-700">{productsError}</p>

            <button
              type="button"
              onClick={() => dispatch(fetchAdminProducts(requestParams))}
              className="mt-6 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
            >
              Try again
            </button>
          </section>
        )}

        {/* Desktop table */}

        {!productsLoading && !productsError && products.length > 0 && (
          <section className="mt-5 hidden overflow-hidden rounded-[1.75rem] border border-[#2A1810]/10 bg-white shadow-[0_16px_45px_rgba(42,24,16,0.04)] lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-225">
                <thead className="bg-[#F4ECE0]">
                  <tr className="text-left text-[9px] font-bold uppercase tracking-[0.16em] text-[#756157]">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Featured</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const image = getProductImage(product);
                    const status = getProductStatus(product);

                    const outOfStock =
                      product.trackInventory !== false &&
                      Number(product.stock) <= 0;

                    return (
                      <tr
                        key={product._id}
                        className="border-t border-[#2A1810]/8 transition hover:bg-[#FCF8F2]"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E9DDCC]">
                              {image?.url ? (
                                <img
                                  src={image.url}
                                  alt={image.altText || product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <FiImage className="text-[#9A8476]" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-xs truncate font-serif text-lg font-semibold text-[#2A1810]">
                                {product.name}
                              </p>

                              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#8A7569]">
                                {product.sku || "No SKU"} ·{" "}
                                {product.woodType || "Wood not set"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-bold text-[#2A1810]">
                            {formatPrice(getEffectivePrice(product))}
                          </p>

                          {product.salePrice !== null &&
                            product.salePrice !== undefined &&
                            Number(product.salePrice) <
                              Number(product.price) && (
                              <p className="mt-1 text-[10px] text-[#8A7569] line-through">
                                {formatPrice(product.price)}
                              </p>
                            )}
                        </td>

                        <td className="px-5 py-5">
                          {product.trackInventory === false ? (
                            <span className="text-xs font-semibold text-[#52724B]">
                              Not tracked
                            </span>
                          ) : (
                            <div>
                              <p
                                className={`text-sm font-bold ${
                                  outOfStock
                                    ? "text-red-600"
                                    : Number(product.stock) <= 5
                                      ? "text-amber-600"
                                      : "text-[#2A1810]"
                                }`}
                              >
                                {Number(product.stock) || 0}
                              </p>

                              <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#8A7569]">
                                {outOfStock
                                  ? "Out of stock"
                                  : Number(product.stock) <= 5
                                    ? "Low stock"
                                    : "Available"}
                              </p>
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${getStatusClasses(
                              status,
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex flex-wrap gap-1.5">
                            {product.isFeatured && (
                              <span className="rounded-full bg-[#D9B477]/20 px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest text-[#8A642D]">
                                Featured
                              </span>
                            )}

                            {product.isBestseller && (
                              <span className="rounded-full bg-[#A45A3A]/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest text-[#A45A3A]">
                                Bestseller
                              </span>
                            )}

                            {!product.isFeatured && !product.isBestseller && (
                              <span className="text-xs text-[#9A8476]">—</span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-1">
                            {product.slug && (
                              <Link
                                to={`/products/${product.slug}`}
                                target="_blank"
                                aria-label={`View ${product.name}`}
                                className="flex h-10 w-10 items-center justify-center rounded-full text-[#756157] transition hover:bg-[#2A1810]/5 hover:text-[#A45A3A]"
                              >
                                <FiEye />
                              </Link>
                            )}

                            <Link
                              to={`/admin/products/${product._id}/edit`}
                              aria-label={`Edit ${product.name}`}
                              className="flex h-10 w-10 items-center justify-center rounded-full text-[#756157] transition hover:bg-[#2A1810]/5 hover:text-[#A45A3A]"
                            >
                              <FiEdit2 />
                            </Link>

                            {status !== "archived" && (
                              <button
                                type="button"
                                onClick={() => setArchiveCandidate(product)}
                                aria-label={`Archive ${product.name}`}
                                className="flex h-10 w-10 items-center justify-center rounded-full text-[#756157] transition hover:bg-red-50 hover:text-red-600"
                              >
                                <FiArchive />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Mobile cards */}

        {!productsLoading && !productsError && products.length > 0 && (
          <section className="mt-5 grid gap-4 lg:hidden">
            {products.map((product, index) => {
              const image = getProductImage(product);
              const status = getProductStatus(product);

              return (
                <motion.article
                  key={product._id}
                  initial={{
                    opacity: 0,
                    y: 16,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: Math.min(index, 5) * 0.04,
                  }}
                  className="rounded-3xl border border-[#2A1810]/10 bg-white p-4"
                >
                  <div className="flex gap-4">
                    <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#E9DDCC]">
                      {image?.url ? (
                        <img
                          src={image.url}
                          alt={image.altText || product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FiImage className="text-[#9A8476]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate font-serif text-xl font-semibold text-[#2A1810]">
                            {product.name}
                          </h2>

                          <p className="mt-1 truncate text-[9px] uppercase tracking-[0.13em] text-[#8A7569]">
                            {product.sku || "No SKU"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest ${getStatusClasses(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-bold text-[#2A1810]">
                        {formatPrice(getEffectivePrice(product))}
                      </p>

                      <p className="mt-1 text-xs text-[#756157]">
                        {product.trackInventory === false
                          ? "Inventory not tracked"
                          : `${Number(product.stock) || 0} in stock`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#2A1810]/8 pt-4">
                    <Link
                      to={`/products/${product.slug}`}
                      target="_blank"
                      className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#2A1810]/10 text-[9px] font-bold uppercase tracking-widest text-[#2A1810]"
                    >
                      <FiEye />
                      View
                    </Link>

                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#2A1810]/10 text-[9px] font-bold uppercase tracking-widest text-[#2A1810]"
                    >
                      <FiEdit2 />
                      Edit
                    </Link>

                    <button
                      type="button"
                      disabled={status === "archived"}
                      onClick={() => setArchiveCandidate(product)}
                      className="flex h-10 items-center justify-center gap-2 rounded-full border border-red-200 text-[9px] font-bold uppercase tracking-widest text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <FiArchive />
                      Archive
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </section>
        )}

        {/* Empty state */}

        {!productsLoading && !productsError && products.length === 0 && (
          <section className="mt-5 rounded-[1.75rem] border border-[#2A1810]/10 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#A45A3A]/10 text-[#A45A3A]">
              <FiPackage size={27} />
            </div>

            <h2 className="mt-5 font-serif text-3xl text-[#2A1810]">
              No products found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756157]">
              {hasActiveFilters
                ? "Try changing or clearing your current filters."
                : "Create your first handcrafted product to begin building the catalogue."}
            </p>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/admin/products/new"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
              >
                <FiPlus />
                Add product
              </Link>
            )}
          </section>
        )}

        {/* Pagination */}

        {!productsLoading && totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-[#2A1810]/10 bg-white px-5 py-4 sm:flex-row">
            <p className="text-xs text-[#756157]">
              Page <strong className="text-[#2A1810]">{currentPage}</strong> of{" "}
              <strong className="text-[#2A1810]">{totalPages}</strong>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => updateFilter("page", currentPage - 1)}
                className="flex h-10 items-center gap-2 rounded-full border border-[#2A1810]/10 px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2A1810] transition hover:bg-[#2A1810] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <FiChevronLeft />
                Previous
              </button>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => updateFilter("page", currentPage + 1)}
                className="flex h-10 items-center gap-2 rounded-full border border-[#2A1810]/10 px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2A1810] transition hover:bg-[#2A1810] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Archive confirmation */}

      <AnimatePresence>
        {archiveCandidate && (
          <div className="fixed inset-0 z-120 flex items-center justify-center px-5">
            <motion.button
              type="button"
              aria-label="Close confirmation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!archiving) {
                  setArchiveCandidate(null);
                }
              }}
              className="absolute inset-0 bg-[#160C08]/65 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="archive-product-title"
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
              className="relative w-full max-w-md rounded-4xl bg-[#FFF9EF] p-7 shadow-[0_30px_90px_rgba(22,12,8,0.35)] sm:p-8"
            >
              <button
                type="button"
                disabled={archiving}
                onClick={() => setArchiveCandidate(null)}
                aria-label="Close"
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[#756157] transition hover:bg-[#2A1810]/5 hover:text-[#2A1810]"
              >
                <FiX />
              </button>

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                <FiArchive size={23} />
              </div>

              <h2
                id="archive-product-title"
                className="mt-5 font-serif text-3xl text-[#2A1810]"
              >
                Archive product?
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#756157]">
                <strong className="text-[#2A1810]">
                  {archiveCandidate.name}
                </strong>{" "}
                will no longer appear as an active storefront product.
              </p>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={archiving}
                  onClick={() => setArchiveCandidate(null)}
                  className="h-11 rounded-full border border-[#2A1810]/15 px-6 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2A1810] disabled:opacity-50"
                >
                  Keep product
                </button>

                <button
                  type="button"
                  disabled={archiving}
                  onClick={handleArchiveProduct}
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {archiving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Archiving...
                    </>
                  ) : (
                    <>
                      <FiArchive />
                      Archive product
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

export default AdminProducts;
