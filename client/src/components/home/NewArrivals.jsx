import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { FiArrowRight } from "react-icons/fi";

import { fetchProducts } from "../../features/products/productSlice.js";

import ProductCard from "../products/ProductCard.jsx";
import ProductCardSkeleton from "../products/ProductCardSkeleton.jsx";

const NewArrivals = () => {
  const dispatch = useDispatch();

  const { products, productsLoading, productsError } = useSelector(
    (state) => state.products,
  );

  useEffect(() => {
    dispatch(
      fetchProducts({
        isNewArrival: true,
        limit: 4,
        sort: "newest",
      }),
    );
  }, [dispatch]);

  const newArrivalProducts = products.filter((product) => product.isNewArrival);

  const displayedProducts =
    newArrivalProducts.length > 0
      ? newArrivalProducts.slice(0, 4)
      : products.slice(0, 4);

  return (
    <section className="overflow-hidden bg-[#F7F0E5] px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
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
                Recently created
              </p>
            </div>

            <h2 className="mt-5 font-serif text-4xl leading-tight tracking-tight text-[#2A1810] sm:text-5xl lg:text-6xl">
              Fresh from the
              <span className="italic text-[#A45A3A]"> workshop.</span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#6F5A4E] sm:text-base">
              Discover our newest handcrafted carvings, shaped slowly and
              finished with care.
            </p>
          </motion.div>

          <Link
            to="/products?sort=newest"
            className="group inline-flex w-fit items-center gap-3 border-b border-[#2A1810] pb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2A1810] transition-colors hover:border-[#A45A3A] hover:text-[#A45A3A]"
          >
            View new arrivals
            <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {productsLoading && (
          <div className="mt-14 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-x-7">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!productsLoading && productsError && (
          <div className="mt-16 rounded-[1.5rem] border border-[#A45A3A]/20 bg-[#A45A3A]/5 px-6 py-12 text-center">
            <p className="text-sm text-[#6F5A4E]">{productsError}</p>

            <button
              type="button"
              onClick={() =>
                dispatch(
                  fetchProducts({
                    isNewArrival: true,
                    limit: 4,
                    sort: "newest",
                  }),
                )
              }
              className="mt-5 rounded-full bg-[#2A1810] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white"
            >
              Try again
            </button>
          </div>
        )}

        {!productsLoading && !productsError && displayedProducts.length > 0 && (
          <div className="mt-14 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-x-7">
            {displayedProducts.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        )}

        {!productsLoading &&
          !productsError &&
          displayedProducts.length === 0 && (
            <div className="mt-16 rounded-[1.5rem] border border-[#2A1810]/10 bg-[#FFF9EF] px-6 py-12 text-center">
              <p className="font-serif text-2xl text-[#2A1810]">
                New creations are coming soon.
              </p>
            </div>
          )}
      </div>
    </section>
  );
};

export default NewArrivals;
