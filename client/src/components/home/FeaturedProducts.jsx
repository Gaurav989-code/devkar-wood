import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { FiArrowRight, FiRefreshCw } from "react-icons/fi";

import { fetchFeaturedProducts } from "../../features/products/productSlice.js";

import ProductCard from "../products/ProductCard.jsx";
import ProductCardSkeleton from "../products/ProductCardSkeleton.jsx";

const FeaturedProducts = () => {
  const dispatch = useDispatch();

  const { featuredProducts, featuredLoading, featuredError } = useSelector(
    (state) => state.products,
  );

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  const retryFetch = () => {
    dispatch(fetchFeaturedProducts());
  };

  return (
    <section className="overflow-hidden bg-[#FFF9EF] px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-360">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{
              opacity: 0,
              x: -30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.5,
            }}
            transition={{
              duration: 0.7,
            }}
          >
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-[#A45A3A]" />

              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A45A3A] sm:text-xs">
                Curated by our artisans
              </p>
            </div>

            <h2 className="mt-5 font-serif text-4xl leading-tight tracking-tight text-[#2A1810] sm:text-5xl lg:text-6xl">
              Featured
              <span className="italic text-[#A45A3A]"> masterpieces.</span>
            </h2>
          </motion.div>

          <Link
            to="/products"
            className="group inline-flex w-fit items-center gap-3 border-b border-[#2A1810] pb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2A1810] transition-colors hover:border-[#A45A3A] hover:text-[#A45A3A]"
          >
            Shop all pieces
            <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {featuredError && !featuredLoading && (
          <div className="mt-16 rounded-3xl border border-[#A45A3A]/20 bg-[#A45A3A]/5 px-6 py-12 text-center">
            <p className="text-sm text-[#6F5A4E]">{featuredError}</p>

            <button
              type="button"
              onClick={retryFetch}
              className="mx-auto mt-5 flex items-center gap-2 rounded-full bg-[#2A1810] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
            >
              <FiRefreshCw />
              Try again
            </button>
          </div>
        )}

        {featuredLoading && (
          <div className="mt-14 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-x-7">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!featuredLoading && !featuredError && featuredProducts.length > 0 && (
          <div className="mt-14 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-x-7">
            {featuredProducts.slice(0, 8).map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        )}

        {!featuredLoading &&
          !featuredError &&
          featuredProducts.length === 0 && (
            <div className="mt-16 rounded-3xl border border-[#2A1810]/10 bg-[#F7F0E5] px-6 py-12 text-center">
              <p className="font-serif text-2xl text-[#2A1810]">
                Featured pieces are coming soon.
              </p>
            </div>
          )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
