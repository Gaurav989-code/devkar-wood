import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { FiArrowRight, FiLayers, FiRefreshCw } from "react-icons/fi";

import {
  clearCategoryError,
  fetchCategories,
} from "../../features/categories/categorySlice.js";

const getCategoryImage = (category) => {
  if (typeof category?.image === "string") {
    return category.image;
  }

  console.log(category);
  return (
    category?.image?.url ||
    category?.thumbnail?.url ||
    category?.banner?.url ||
    ""
  );
};

const getProductCount = (category) => {
  return (
    category?.productCount ??
    category?.productsCount ??
    category?.totalProducts ??
    null
  );
};

const Collections = () => {
  const dispatch = useDispatch();

  const { categories, loading, error, fetched } = useSelector(
    (state) => state.categories,
  );

  useEffect(() => {
    if (!fetched) {
      dispatch(fetchCategories());
    }
  }, [dispatch, fetched]);

  const handleRetry = () => {
    dispatch(clearCategoryError());
    dispatch(fetchCategories());
  };

  return (
    <main className="min-h-screen bg-[#F7F0E5]">
      {/* Hero */}

      <section className="relative overflow-hidden border-b border-[#2A1810]/10 px-5 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-[#A45A3A]/10" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full border border-[#A45A3A]/10" />
        <div className="pointer-events-none absolute bottom-10 left-10 h-24 w-24 rotate-45 border border-[#B88A44]/10" />

        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mx-auto max-w-[1440px]"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A45A3A]">
            Handcrafted artistry
          </p>

          <div className="mt-5 grid gap-7 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.98] tracking-tight text-[#2A1810] sm:text-6xl lg:text-8xl">
              Discover our collections
            </h1>

            <p className="max-w-xl text-sm leading-7 text-[#6F5A4E] sm:text-base">
              Explore wooden carvings shaped by traditional craftsmanship,
              natural materials and stories that give every space a distinct
              character.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Collections */}

      <section className="px-5 py-14 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          {loading && categories.length === 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-[2rem] bg-[#E7DAC7]"
                >
                  <div className="aspect-[4/5] bg-[#DDCDB7]" />

                  <div className="p-6">
                    <div className="h-3 w-24 rounded bg-[#CEBCA5]" />
                    <div className="mt-4 h-8 w-3/4 rounded bg-[#CEBCA5]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && categories.length === 0 && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="rounded-[2rem] border border-red-200 bg-[#FFF9EF] px-6 py-16 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                <FiLayers size={26} />
              </div>

              <h2 className="mt-5 font-serif text-3xl text-[#2A1810]">
                Collections could not be loaded
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#6F5A4E]">
                {error}
              </p>

              <button
                type="button"
                onClick={handleRetry}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2A1810] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#A45A3A]"
              >
                <FiRefreshCw />
                Try again
              </button>
            </motion.div>
          )}

          {!loading && !error && fetched && categories.length === 0 && (
            <div className="rounded-[2rem] border border-[#2A1810]/10 bg-[#FFF9EF] px-6 py-16 text-center">
              <FiLayers size={30} className="mx-auto text-[#A45A3A]" />

              <h2 className="mt-5 font-serif text-3xl text-[#2A1810]">
                Collections are coming soon
              </h2>

              <p className="mt-3 text-sm text-[#6F5A4E]">
                Our handcrafted collections are currently being prepared.
              </p>
            </div>
          )}

          {categories.length > 0 && (
            <>
              <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A45A3A]">
                    Browse by craft
                  </p>

                  <h2 className="mt-3 font-serif text-4xl text-[#2A1810]">
                    Curated for meaningful spaces
                  </h2>
                </div>

                <p className="text-sm text-[#7A675C]">
                  {categories.length}{" "}
                  {categories.length === 1 ? "collection" : "collections"}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category, index) => {
                  const image = getCategoryImage(category);
                  const productCount = getProductCount(category);

                  const categoryIdentifier = category.slug || category._id;

                  const categoryPath = `/products?category=${encodeURIComponent(
                    categoryIdentifier,
                  )}`;

                  return (
                    <motion.article
                      key={category._id || category.slug}
                      initial={{
                        opacity: 0,
                        y: 35,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.15,
                      }}
                      transition={{
                        duration: 0.65,
                        delay: Math.min(index, 5) * 0.07,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="group"
                    >
                      <Link
                        to={categoryPath}
                        className="relative block aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#DCCBB5]"
                      >
                        {image ? (
                          <motion.img
                            src={image}
                            alt={category.image?.altText || category.name}
                            loading="lazy"
                            whileHover={{
                              scale: 1.06,
                            }}
                            transition={{
                              duration: 0.8,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#D8C4A9] via-[#BFA382] to-[#8C6449]">
                            <div className="text-center text-[#FFF9EF]">
                              <FiLayers
                                size={34}
                                className="mx-auto opacity-80"
                              />

                              <p className="mt-4 font-serif text-2xl">
                                {category.name}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-linear-to-t from-[#160C08]/90 via-[#21130E]/15 to-transparent" />

                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                          {productCount !== null && (
                            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#D9B477]">
                              {productCount}{" "}
                              {Number(productCount) === 1 ? "piece" : "pieces"}
                            </p>
                          )}

                          <h2 className="mt-2 font-serif text-3xl text-[#FFF9EF]">
                            {category.name}
                          </h2>

                          {category.description && (
                            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#E1D2C0]">
                              {category.description}
                            </p>
                          )}

                          <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                              Explore collection
                            </span>

                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF9EF] text-[#2A1810] transition duration-300 group-hover:rotate-[-15deg] group-hover:bg-[#D9B477]">
                              <FiArrowRight />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  );
                })}
              </div>

              <div className="mt-14 text-center">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-full border border-[#2A1810]/20 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-[#2A1810] transition hover:border-[#2A1810] hover:bg-[#2A1810] hover:text-white"
                >
                  Shop all carvings
                  <FiArrowRight />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Collections;
