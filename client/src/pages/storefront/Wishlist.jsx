import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import { FiArrowRight, FiHeart, FiShoppingBag, FiTrash2 } from "react-icons/fi";

import {
  clearWishlist,
  removeFromWishlist,
  selectWishlistItems,
} from "../../features/wishlist/wishlistSlice.js";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
};

const Wishlist = () => {
  const dispatch = useDispatch();

  const wishlistItems = useSelector(selectWishlistItems);

  const [imageErrors, setImageErrors] = useState({});

  const handleRemoveProduct = (productId, productName) => {
    dispatch(removeFromWishlist(productId));

    toast.success(`${productName} removed from wishlist`);
  };

  const handleClearWishlist = () => {
    if (wishlistItems.length === 0) {
      return;
    }

    dispatch(clearWishlist());

    toast.success("Wishlist cleared");
  };

  const handleImageError = (productId) => {
    setImageErrors((current) => ({
      ...current,
      [productId]: true,
    }));
  };

  return (
    <main className="min-h-[75vh] bg-[#F7F0E5]">
      {/* Page header */}

      <section className="border-b border-[#2A1810]/10 px-5 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A45A3A]">
              Your favourites
            </p>

            <h1 className="mt-4 font-serif text-5xl text-[#2A1810] sm:text-6xl">
              Wishlist
            </h1>

            <p className="mt-4 text-sm leading-7 text-[#6F5A4E]">
              {wishlistItems.length === 0
                ? "Save the wooden pieces you love and return to them later."
                : `${wishlistItems.length} ${
                    wishlistItems.length === 1 ? "piece" : "pieces"
                  } saved on this device.`}
            </p>
          </motion.div>

          {wishlistItems.length > 0 && (
            <button
              type="button"
              onClick={handleClearWishlist}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-red-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-red-700 transition hover:bg-red-50"
            >
              <FiTrash2 />
              Clear wishlist
            </button>
          )}
        </div>
      </section>

      {/* Wishlist content */}

      <section className="px-5 py-12 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1440px]">
          {wishlistItems.length === 0 ? (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.45,
              }}
              className="rounded-[2rem] border border-[#2A1810]/10 bg-[#FFF9EF] px-6 py-16 text-center shadow-[0_20px_60px_rgba(42,24,16,0.06)]"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#A45A3A]/10 text-[#A45A3A]">
                <FiHeart size={32} />
              </div>

              <h2 className="mt-6 font-serif text-3xl text-[#2A1810]">
                Your wishlist is empty
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#6F5A4E]">
                Discover handcrafted wooden sculptures and save your favourite
                pieces by selecting the heart button.
              </p>

              <Link
                to="/products"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#2A1810] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#48291C]"
              >
                Explore products
                <FiArrowRight />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {wishlistItems.map((item, index) => {
                  const isOutOfStock = item.trackInventory && item.stock <= 0;

                  return (
                    <motion.article
                      layout
                      key={item.productId}
                      initial={{
                        opacity: 0,
                        y: 25,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                      }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                      }}
                      className="group overflow-hidden rounded-[1.75rem] border border-[#2A1810]/10 bg-[#FFF9EF] shadow-[0_14px_40px_rgba(42,24,16,0.06)]"
                    >
                      {/* Product image */}

                      <div className="relative aspect-[4/5] overflow-hidden bg-[#E9DDCC]">
                        {item.image && !imageErrors[item.productId] ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            onError={() => handleImageError(item.productId)}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[#A45A3A]">
                            <FiShoppingBag size={32} />

                            <span className="text-xs">Image unavailable</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveProduct(item.productId, item.name)
                          }
                          aria-label={`Remove ${item.name} from wishlist`}
                          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF9EF]/95 text-[#A45A3A] shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-[#A45A3A] hover:text-white"
                        >
                          <FiHeart size={19} fill="currentColor" />
                        </button>

                        {isOutOfStock && (
                          <span className="absolute bottom-4 left-4 rounded-full bg-[#2A1810] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                            Out of stock
                          </span>
                        )}
                      </div>

                      {/* Product information */}

                      <div className="p-5">
                        {item.woodType && (
                          <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#A45A3A]">
                            {item.woodType}
                          </p>
                        )}

                        <Link
                          to={`/products/${item.slug}`}
                          className="mt-2 block"
                        >
                          <h2 className="line-clamp-2 font-serif text-xl leading-snug text-[#2A1810] transition group-hover:text-[#A45A3A]">
                            {item.name}
                          </h2>
                        </Link>

                        <div className="mt-4 flex items-center gap-2">
                          <p className="font-semibold text-[#2A1810]">
                            {formatPrice(item.price)}
                          </p>

                          {item.regularPrice > item.price && (
                            <p className="text-xs text-[#9B897B] line-through">
                              {formatPrice(item.regularPrice)}
                            </p>
                          )}
                        </div>

                        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                          <Link
                            to={`/products/${item.slug}`}
                            className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#2A1810] px-4 text-[10px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#48291C]"
                          >
                            View product
                            <FiArrowRight />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveProduct(item.productId, item.name)
                            }
                            aria-label={`Delete ${item.name}`}
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#2A1810]/15 text-[#6F5A4E] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Wishlist;
