import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiSliders,
  FiX,
} from "react-icons/fi";

import { fetchProducts } from "../../features/products/productSlice.js";
import { fetchCategories } from "../../features/categories/categorySlice.js";

import ProductCard from "../../components/products/ProductCard.jsx";
import ProductCardSkeleton from "../../components/products/ProductCardSkeleton.jsx";

const WOOD_TYPES = [
  "Teak Wood",
  "Sheesham Wood",
  "Mango Wood",
  "Walnut Wood",
  "Sandalwood",
];

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest first",
  },
  {
    value: "price-low",
    label: "Price: Low to high",
  },
  {
    value: "price-high",
    label: "Price: High to low",
  },
  {
    value: "popular",
    label: "Most popular",
  },
  {
    value: "rating",
    label: "Highest rated",
  },
];

const Products = () => {
  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useSearchParams();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | URL filter values
  |--------------------------------------------------------------------------
  */

  const selectedCategory = searchParams.get("category") || "";

  const selectedWoodType = searchParams.get("woodType") || "";

  const selectedSort = searchParams.get("sort") || "newest";

  const searchQuery = searchParams.get("search") || "";

  const minimumPriceQuery = searchParams.get("minPrice") || "";

  const maximumPriceQuery = searchParams.get("maxPrice") || "";

  const currentPage = Math.max(Number(searchParams.get("page")) || 1, 1);

  /*
  |--------------------------------------------------------------------------
  | Local form values
  |--------------------------------------------------------------------------
  | These values remain local while the customer is typing.
  | The URL and product API are updated only after applying the filter.
  |--------------------------------------------------------------------------
  */

  const [searchInput, setSearchInput] = useState(searchQuery);

  const [minimumPrice, setMinimumPrice] = useState(minimumPriceQuery);

  const [maximumPrice, setMaximumPrice] = useState(maximumPriceQuery);

  /*
  |--------------------------------------------------------------------------
  | Redux state
  |--------------------------------------------------------------------------
  */

  const { products, productsLoading, productsError, pagination } = useSelector(
    (state) => state.products,
  );

  const {
    categories,
    loading: categoriesLoading,
    fetched: categoriesFetched,
  } = useSelector((state) => state.categories);

  /*
  |--------------------------------------------------------------------------
  | Synchronize local form fields when the URL changes externally
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setSearchInput(searchQuery);
    setMinimumPrice(minimumPriceQuery);
    setMaximumPrice(maximumPriceQuery);
  }, [searchQuery, minimumPriceQuery, maximumPriceQuery]);

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
  | Resolve category slug or ID
  |--------------------------------------------------------------------------
  */

  const categoryForApi = useMemo(() => {
    if (!selectedCategory) {
      return "";
    }

    const matchedCategory = categories.find(
      (category) =>
        category._id === selectedCategory || category.slug === selectedCategory,
    );

    return matchedCategory?._id || selectedCategory;
  }, [categories, selectedCategory]);

  const selectedCategoryData = useMemo(() => {
    if (!selectedCategory) {
      return null;
    }

    return (
      categories.find(
        (category) =>
          category._id === selectedCategory ||
          category.slug === selectedCategory,
      ) || null
    );
  }, [categories, selectedCategory]);

  /*
  |--------------------------------------------------------------------------
  | Stable product API parameters
  |--------------------------------------------------------------------------
  */

  const productRequestParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: 12,
      sort: selectedSort,
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (categoryForApi) {
      params.category = categoryForApi;
    }

    if (selectedWoodType) {
      params.woodType = selectedWoodType;
    }

    if (minimumPriceQuery) {
      params.minPrice = minimumPriceQuery;
    }

    if (maximumPriceQuery) {
      params.maxPrice = maximumPriceQuery;
    }

    return params;
  }, [
    currentPage,
    selectedSort,
    searchQuery,
    categoryForApi,
    selectedWoodType,
    minimumPriceQuery,
    maximumPriceQuery,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Load products
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (selectedCategory && !categoriesFetched) {
      return;
    }

    dispatch(fetchProducts(productRequestParams));
  }, [dispatch, selectedCategory, categoriesFetched, productRequestParams]);

  /*
  |--------------------------------------------------------------------------
  | Lock background while mobile filters are open
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!mobileFiltersOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileFiltersOpen]);

  /*
  |--------------------------------------------------------------------------
  | Update one URL filter
  |--------------------------------------------------------------------------
  */

  const updateFilter = (key, value) => {
    const updatedParams = new URLSearchParams(searchParams);

    if (value === "" || value === null || value === undefined) {
      updatedParams.delete(key);
    } else {
      updatedParams.set(key, value);
    }

    if (key !== "page") {
      updatedParams.set("page", "1");
    }

    setSearchParams(updatedParams);
  };

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const handleSearch = (event) => {
    event.preventDefault();

    updateFilter("search", searchInput.trim());
  };

  /*
  |--------------------------------------------------------------------------
  | Price input
  |--------------------------------------------------------------------------
  */

  const handleMinimumPriceChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, "");

    setMinimumPrice(digitsOnly);
  };

  const handleMaximumPriceChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, "");

    setMaximumPrice(digitsOnly);
  };

  /*
  |--------------------------------------------------------------------------
  | Apply price filter
  |--------------------------------------------------------------------------
  */

  const applyPriceFilter = () => {
    const updatedParams = new URLSearchParams(searchParams);

    const parsedMinimum =
      minimumPrice !== "" ? Math.max(Number(minimumPrice) || 0, 0) : null;

    const parsedMaximum =
      maximumPrice !== "" ? Math.max(Number(maximumPrice) || 0, 0) : null;

    let finalMinimum = parsedMinimum;
    let finalMaximum = parsedMaximum;

    /*
    |--------------------------------------------------------------------------
    | Automatically correct reversed price values
    |--------------------------------------------------------------------------
    */

    if (
      finalMinimum !== null &&
      finalMaximum !== null &&
      finalMinimum > finalMaximum
    ) {
      const oldMinimum = finalMinimum;

      finalMinimum = finalMaximum;
      finalMaximum = oldMinimum;
    }

    const minimumValue = finalMinimum !== null ? String(finalMinimum) : "";

    const maximumValue = finalMaximum !== null ? String(finalMaximum) : "";

    setMinimumPrice(minimumValue);
    setMaximumPrice(maximumValue);

    if (minimumValue) {
      updatedParams.set("minPrice", minimumValue);
    } else {
      updatedParams.delete("minPrice");
    }

    if (maximumValue) {
      updatedParams.set("maxPrice", maximumValue);
    } else {
      updatedParams.delete("maxPrice");
    }

    updatedParams.set("page", "1");

    setSearchParams(updatedParams);
    setMobileFiltersOpen(false);
  };

  const handlePriceSubmit = (event) => {
    event.preventDefault();

    applyPriceFilter();
  };

  /*
  |--------------------------------------------------------------------------
  | Clear filters
  |--------------------------------------------------------------------------
  */

  const clearFilters = () => {
    setSearchInput("");
    setMinimumPrice("");
    setMaximumPrice("");

    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Retry product request
  |--------------------------------------------------------------------------
  */

  const handleRetry = () => {
    dispatch(fetchProducts(productRequestParams));
  };

  const activeFilterCount = [
    selectedCategory,
    selectedWoodType,
    minimumPriceQuery,
    maximumPriceQuery,
  ].filter(Boolean).length;

  const totalPages = Number(pagination?.totalPages) || 0;

  const totalProducts =
    pagination?.totalProducts ?? pagination?.totalItems ?? products.length;

  /*
  |--------------------------------------------------------------------------
  | Filter controls
  |--------------------------------------------------------------------------
  | This is called as a render function instead of <FilterContent />.
  | That prevents React from remounting the price inputs after every digit.
  |--------------------------------------------------------------------------
  */

  const renderFilterContent = () => (
    <div>
      <div className="flex items-center justify-between border-b border-[#2A1810]/10 pb-5">
        <div className="flex items-center gap-3">
          <FiSliders className="text-[#A45A3A]" />

          <h2 className="font-serif text-2xl text-[#2A1810]">Filters</h2>
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#A45A3A] transition hover:text-[#7D422B]"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}

      <div className="border-b border-[#2A1810]/10 py-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#2A1810]">
          Category
        </h3>

        <div className="mt-5 space-y-3">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-[#6F5A4E]">
            <input
              type="radio"
              name="category"
              checked={!selectedCategory}
              onChange={() => updateFilter("category", "")}
              className="h-4 w-4 accent-[#A45A3A]"
            />
            All collections
          </label>

          {categoriesLoading &&
            Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-5 animate-pulse rounded bg-[#E1D3C0]"
              />
            ))}

          {!categoriesLoading &&
            categories.map((category) => (
              <label
                key={category._id}
                className="flex cursor-pointer items-center gap-3 text-sm text-[#6F5A4E] transition hover:text-[#A45A3A]"
              >
                <input
                  type="radio"
                  name="category"
                  checked={
                    selectedCategory === category.slug ||
                    selectedCategory === category._id
                  }
                  onChange={() =>
                    updateFilter("category", category.slug || category._id)
                  }
                  className="h-4 w-4 accent-[#A45A3A]"
                />

                {category.name}
              </label>
            ))}
        </div>
      </div>

      {/* Wood type */}

      <div className="border-b border-[#2A1810]/10 py-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#2A1810]">
          Wood type
        </h3>

        <div className="mt-5 space-y-3">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-[#6F5A4E]">
            <input
              type="radio"
              name="woodType"
              checked={!selectedWoodType}
              onChange={() => updateFilter("woodType", "")}
              className="h-4 w-4 accent-[#A45A3A]"
            />
            All wood types
          </label>

          {WOOD_TYPES.map((woodType) => (
            <label
              key={woodType}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#6F5A4E] transition hover:text-[#A45A3A]"
            >
              <input
                type="radio"
                name="woodType"
                checked={selectedWoodType === woodType}
                onChange={() =>
                  updateFilter(
                    "woodType",
                    selectedWoodType === woodType ? "" : woodType,
                  )
                }
                className="h-4 w-4 accent-[#A45A3A]"
              />

              {woodType}
            </label>
          ))}
        </div>
      </div>

      {/* Price */}

      <form onSubmit={handlePriceSubmit} className="py-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#2A1810]">
          Price range
        </h3>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A675C]">
              Minimum
            </span>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={minimumPrice}
              onChange={handleMinimumPriceChange}
              placeholder="₹0"
              aria-label="Minimum price"
              className="w-full rounded-xl border border-[#2A1810]/15 bg-[#FFF9EF] px-3 py-3 text-sm text-[#2A1810] outline-none transition focus:border-[#A45A3A]"
            />
          </label>

          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A675C]">
              Maximum
            </span>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={maximumPrice}
              onChange={handleMaximumPriceChange}
              placeholder="₹50,000"
              aria-label="Maximum price"
              className="w-full rounded-xl border border-[#2A1810]/15 bg-[#FFF9EF] px-3 py-3 text-sm text-[#2A1810] outline-none transition focus:border-[#A45A3A]"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-[#2A1810] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#A45A3A]"
        >
          Apply price
        </button>
      </form>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F7F0E5]">
      {/* Page heading */}

      <section className="relative overflow-hidden bg-[#21130E] px-5 py-20 text-[#FFF9EF] sm:px-6 lg:px-10 lg:py-28">
        <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-[#A45A3A]/20 blur-[120px]" />

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="relative mx-auto max-w-[1440px]"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9B477] sm:text-xs">
            {selectedCategoryData
              ? selectedCategoryData.name
              : "The Devkar collection"}
          </p>

          <h1 className="mt-5 font-serif text-5xl tracking-tight sm:text-6xl lg:text-8xl">
            Handcrafted
            <span className="italic text-[#D9B477]"> pieces.</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-[#D8C9B8] sm:text-base">
            {selectedCategoryData?.description ||
              "Explore sculptures, decorative panels and architectural carvings shaped by skilled artisans."}
          </p>
        </motion.div>
      </section>

      <section className="px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1440px]">
          {/* Search and sorting */}

          <div className="flex flex-col gap-4 border-b border-[#2A1810]/10 pb-7 md:flex-row md:items-center md:justify-between">
            <form
              onSubmit={handleSearch}
              className="relative w-full md:max-w-md"
            >
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A675C]" />

              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search carvings..."
                className="h-12 w-full rounded-full border border-[#2A1810]/15 bg-[#FFF9EF] pl-11 pr-24 text-sm text-[#2A1810] outline-none transition focus:border-[#A45A3A]"
              />

              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-[#2A1810] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#A45A3A]"
              >
                Search
              </button>
            </form>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="relative flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#2A1810]/15 bg-[#FFF9EF] px-5 text-xs font-bold uppercase tracking-[0.12em] text-[#2A1810] lg:hidden"
              >
                <FiFilter />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#A45A3A] px-1 text-[9px] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <select
                value={selectedSort}
                onChange={(event) => updateFilter("sort", event.target.value)}
                aria-label="Sort products"
                className="h-12 flex-1 rounded-full border border-[#2A1810]/15 bg-[#FFF9EF] px-5 text-xs font-semibold text-[#2A1810] outline-none md:min-w-48"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[250px_1fr] xl:grid-cols-[280px_1fr]">
            {/* Desktop filters */}

            <aside className="hidden lg:block">
              <div className="sticky top-28">{renderFilterContent()}</div>
            </aside>

            {/* Products */}

            <div>
              <div className="mb-8 flex items-center justify-between gap-4">
                <p className="text-sm text-[#6F5A4E]">
                  {productsLoading
                    ? "Loading pieces..."
                    : `${totalProducts} piece${
                        totalProducts === 1 ? "" : "s"
                      } found`}
                </p>

                {selectedCategoryData && (
                  <button
                    type="button"
                    onClick={() => updateFilter("category", "")}
                    className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#A45A3A] hover:underline"
                  >
                    Remove collection
                  </button>
                )}
              </div>

              {/* Loading */}

              {productsLoading && (
                <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({
                    length: 6,
                  }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
                </div>
              )}

              {/* Error */}

              {!productsLoading && productsError && (
                <div className="rounded-[1.5rem] border border-[#A45A3A]/20 bg-[#A45A3A]/5 px-6 py-14 text-center">
                  <p className="text-sm text-[#6F5A4E]">{productsError}</p>

                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2A1810] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#A45A3A]"
                  >
                    <FiRefreshCw />
                    Try again
                  </button>
                </div>
              )}

              {/* Product grid */}

              {!productsLoading && !productsError && products.length > 0 && (
                <motion.div
                  key={searchParams.toString()}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {products.map((product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}

              {/* Empty products */}

              {!productsLoading && !productsError && products.length === 0 && (
                <div className="rounded-[1.5rem] border border-[#2A1810]/10 bg-[#FFF9EF] px-6 py-16 text-center">
                  <h2 className="font-serif text-3xl text-[#2A1810]">
                    No carvings found
                  </h2>

                  <p className="mt-3 text-sm text-[#6F5A4E]">
                    Try changing or clearing your filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-full bg-[#2A1810] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#A45A3A]"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {/* Pagination */}

              {!productsLoading && totalPages > 1 && (
                <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      updateFilter("page", String(currentPage - 1))
                    }
                    aria-label="Previous page"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#2A1810]/15 text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <FiChevronLeft />
                  </button>

                  {Array.from({
                    length: totalPages,
                  }).map((_, index) => {
                    const page = index + 1;

                    return (
                      <button
                        type="button"
                        key={page}
                        onClick={() => updateFilter("page", String(page))}
                        aria-label={`Open page ${page}`}
                        aria-current={page === currentPage ? "page" : undefined}
                        className={`flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-xs font-bold transition ${
                          page === currentPage
                            ? "border-[#2A1810] bg-[#2A1810] text-white"
                            : "border-[#2A1810]/15 text-[#2A1810] hover:border-[#A45A3A] hover:text-[#A45A3A]"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      updateFilter("page", String(currentPage + 1))
                    }
                    aria-label="Next page"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#2A1810]/15 text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filters */}

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close filters"
              onClick={() => setMobileFiltersOpen(false)}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="fixed inset-0 z-[70] bg-[#160C08]/55 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{
                x: "-100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "-100%",
              }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="fixed inset-y-0 left-0 z-[80] w-[88%] max-w-sm overflow-y-auto bg-[#F7F0E5] p-6 shadow-[20px_0_60px_rgba(22,12,8,0.22)] lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A45A3A]">
                  Refine products
                </p>

                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2A1810] text-white"
                >
                  <FiX />
                </button>
              </div>

              {renderFilterContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Products;
