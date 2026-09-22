import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiChevronRight,
  FiHeart,
  FiMinus,
  FiPackage,
  FiPlus,
  FiShield,
  FiStar,
  FiTruck,
} from "react-icons/fi";

import {
  clearSelectedProduct,
  fetchProductBySlug,
} from "../../features/products/productSlice.js";

import { addToCart } from "../../features/cart/cartSlice.js";

import {
  selectIsProductWishlisted,
  toggleWishlist,
} from "../../features/wishlist/wishlistSlice.js";

import ProductGallery from "../../components/products/ProductGallery.jsx";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
};

const ProductDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(1);

  const {
    selectedProduct: product,
    selectedProductLoading,
    selectedProductError,
  } = useSelector((state) => state.products);

  const productData = useMemo(() => product || {}, [product]);

  const productId =
    productData?._id || productData?.id || productData?.productId || "";

  const isWishlisted = useSelector((state) =>
    selectIsProductWishlisted(state, productId),
  );

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    setQuantity(1);
  }, [slug]);

  const regularPrice = Number(productData.price) || 0;

  const hasSalePrice =
    productData.salePrice !== null &&
    productData.salePrice !== undefined &&
    Number(productData.salePrice) < regularPrice;

  const effectivePrice = hasSalePrice
    ? Number(productData.salePrice)
    : regularPrice;

  const discountPercentage =
    hasSalePrice && regularPrice > 0
      ? Math.round(((regularPrice - effectivePrice) / regularPrice) * 100)
      : 0;

  const isInStock =
    productData.trackInventory === false || Number(productData.stock) > 0;

  const maximumQuantity =
    productData.trackInventory === false
      ? 10
      : Math.min(Math.max(Number(productData.stock) || 1, 1), 10);

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(current + 1, maximumQuantity));
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(current - 1, 1));
  };

  const handleAddToCart = () => {
    if (!isInStock || !productId) {
      toast.error("This product is currently unavailable");
      return;
    }

    const primaryImage =
      productData.images?.find((image) => image.isPrimary) ||
      productData.images?.[0];

    dispatch(
      addToCart({
        productId,
        slug: productData.slug,
        name: productData.name,
        sku: productData.sku,
        woodType: productData.woodType,
        image: primaryImage?.url || "",
        price: effectivePrice,
        regularPrice,
        quantity,
        stock: Number(productData.stock) || 0,
        trackInventory: productData.trackInventory,
      }),
    );

    toast.success(`${quantity} × ${productData.name} added to cart`);
  };

  const handleWishlist = () => {
    if (!productId) {
      toast.error("Unable to save this product");
      return;
    }

    dispatch(toggleWishlist(productData));

    if (isWishlisted) {
      toast.success(`${productData.name} removed from wishlist`);
    } else {
      toast.success(`${productData.name} added to wishlist`);
    }
  };

  if (selectedProductLoading) {
    return (
      <main className="min-h-screen bg-[#F7F0E5] px-5 py-12 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1440px] animate-pulse gap-12 lg:grid-cols-2">
          <div className="aspect-[4/5] rounded-[2rem] bg-[#E1D3C0]" />

          <div className="py-8">
            <div className="h-3 w-32 rounded bg-[#E1D3C0]" />
            <div className="mt-6 h-14 w-4/5 rounded bg-[#E1D3C0]" />
            <div className="mt-5 h-7 w-32 rounded bg-[#E1D3C0]" />
            <div className="mt-8 h-24 rounded bg-[#E1D3C0]" />
            <div className="mt-10 h-14 rounded-full bg-[#E1D3C0]" />
          </div>
        </div>
      </main>
    );
  }

  if (selectedProductError || !product) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F7F0E5] px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A45A3A]">
            Product unavailable
          </p>

          <h1 className="mt-4 font-serif text-4xl text-[#2A1810]">
            This carving could not be found.
          </h1>

          {selectedProductError && (
            <p className="mt-4 text-sm text-[#6F5A4E]">
              {selectedProductError}
            </p>
          )}

          <Link
            to="/products"
            className="mt-7 inline-flex rounded-full bg-[#2A1810] px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white"
          >
            Return to shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#F7F0E5]">
      {/* Breadcrumb */}

      <div className="border-b border-[#2A1810]/10 px-5 py-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A675C]">
          <Link to="/" className="transition hover:text-[#A45A3A]">
            Home
          </Link>

          <FiChevronRight />

          <Link to="/products" className="transition hover:text-[#A45A3A]">
            Shop
          </Link>

          <FiChevronRight />

          <span className="truncate text-[#2A1810]">{product.name}</span>
        </div>
      </div>

      {/* Main product */}

      <section className="px-5 py-10 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
          <ProductGallery images={product.images} productName={product.name} />

          <motion.div
            initial={{
              opacity: 0,
              x: 35,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.75,
            }}
            className="lg:sticky lg:top-32 lg:self-start"
          >
            <div className="flex flex-wrap gap-2">
              {product.isNewArrival && (
                <span className="rounded-full border border-[#A45A3A]/25 bg-[#A45A3A]/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#A45A3A]">
                  New arrival
                </span>
              )}

              {product.isBestseller && (
                <span className="rounded-full border border-[#B88A44]/30 bg-[#D9B477]/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#8A642D]">
                  Bestseller
                </span>
              )}
            </div>

            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#A45A3A]">
              {product.woodType}
            </p>

            <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-[#2A1810] sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            {/* Rating */}

            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center gap-1 text-[#B88A44]">
                {Array.from({
                  length: 5,
                }).map((_, index) => (
                  <FiStar
                    key={index}
                    className={
                      index < Math.round(product.ratingsAverage || 0)
                        ? "fill-current"
                        : ""
                    }
                    size={15}
                  />
                ))}
              </div>

              <span className="text-xs text-[#7A675C]">
                {Number(product.ratingsAverage || 0).toFixed(1)} (
                {product.ratingsCount || 0} reviews)
              </span>
            </div>

            {/* Price */}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="font-serif text-3xl text-[#2A1810]">
                {formatPrice(effectivePrice)}
              </span>

              {hasSalePrice && (
                <>
                  <span className="text-base text-[#8C7A6E] line-through">
                    {formatPrice(regularPrice)}
                  </span>

                  <span className="rounded-full bg-[#A45A3A] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                    Save {discountPercentage}%
                  </span>
                </>
              )}
            </div>

            <p className="mt-2 text-xs text-[#7A675C]">
              Inclusive of applicable pricing. Shipping calculated during
              checkout.
            </p>

            <p className="mt-7 text-sm leading-7 text-[#5F4A3F] sm:text-base">
              {product.shortDescription}
            </p>

            {/* Stock */}

            <div className="mt-7">
              {isInStock ? (
                <p className="flex items-center gap-2 text-sm font-semibold text-[#52724B]">
                  <FiCheck />
                  In stock and ready to order
                </p>
              ) : (
                <p className="text-sm font-semibold text-[#A45A3A]">
                  Currently sold out
                </p>
              )}

              {product.isLowStock && (
                <p className="mt-2 text-xs font-semibold text-[#A45A3A]">
                  Only {product.stock} pieces remaining
                </p>
              )}
            </div>

            {/* Quantity and actions */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-14 items-center justify-between rounded-full border border-[#2A1810]/15 bg-[#FFF9EF] px-2 sm:w-36">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || !isInStock}
                  aria-label="Decrease quantity"
                  className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#2A1810]/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <FiMinus />
                </button>

                <span className="text-sm font-bold text-[#2A1810]">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= maximumQuantity || !isInStock}
                  aria-label="Increase quantity"
                  className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#2A1810]/5 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <FiPlus />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="h-14 flex-1 rounded-full bg-[#2A1810] px-8 text-xs font-bold uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-0.5 hover:bg-[#A45A3A] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isInStock ? "Add to cart" : "Sold out"}
              </button>

              <motion.button
                type="button"
                onClick={handleWishlist}
                whileTap={{
                  scale: 0.82,
                }}
                animate={
                  isWishlisted
                    ? {
                        scale: [1, 1.16, 1],
                      }
                    : {
                        scale: 1,
                      }
                }
                transition={{
                  duration: 0.3,
                }}
                aria-label={
                  isWishlisted
                    ? `Remove ${product.name} from wishlist`
                    : `Add ${product.name} to wishlist`
                }
                aria-pressed={isWishlisted}
                className={`flex h-14 w-full items-center justify-center gap-2 rounded-full border transition sm:w-14 ${
                  isWishlisted
                    ? "border-[#A45A3A] bg-[#A45A3A] text-white"
                    : "border-[#2A1810]/15 bg-[#FFF9EF] text-[#2A1810] hover:border-[#A45A3A] hover:text-[#A45A3A]"
                }`}
              >
                <FiHeart
                  size={19}
                  fill={isWishlisted ? "currentColor" : "none"}
                />

                <span className="text-xs font-bold uppercase tracking-[0.13em] sm:hidden">
                  {isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                </span>
              </motion.button>
            </div>

            {/* Benefits */}

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#2A1810]/10 bg-[#FFF9EF] p-4">
                <FiTruck className="text-[#A45A3A]" />

                <p className="mt-3 text-xs font-semibold text-[#2A1810]">
                  Safe delivery
                </p>
              </div>

              <div className="rounded-2xl border border-[#2A1810]/10 bg-[#FFF9EF] p-4">
                <FiShield className="text-[#A45A3A]" />

                <p className="mt-3 text-xs font-semibold text-[#2A1810]">
                  Secure payment
                </p>
              </div>

              <div className="rounded-2xl border border-[#2A1810]/10 bg-[#FFF9EF] p-4">
                <FiPackage className="text-[#A45A3A]" />

                <p className="mt-3 text-xs font-semibold text-[#2A1810]">
                  Careful packing
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product information */}

      <section className="border-t border-[#2A1810]/10 bg-[#FFF9EF] px-5 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-14 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A45A3A]">
              About this piece
            </p>

            <h2 className="mt-4 font-serif text-4xl text-[#2A1810]">
              Details and craftsmanship
            </h2>

            <p className="mt-6 whitespace-pre-line text-sm leading-8 text-[#5F4A3F] sm:text-base">
              {product.description}
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-2xl text-[#2A1810]">
                Product details
              </h3>

              <dl className="mt-5 divide-y divide-[#2A1810]/10 border-y border-[#2A1810]/10">
                <div className="flex justify-between gap-4 py-4 text-sm">
                  <dt className="text-[#7A675C]">Wood</dt>

                  <dd className="font-semibold text-[#2A1810]">
                    {product.woodType}
                  </dd>
                </div>

                <div className="flex justify-between gap-4 py-4 text-sm">
                  <dt className="text-[#7A675C]">Finish</dt>

                  <dd className="text-right font-semibold text-[#2A1810]">
                    {product.finish}
                  </dd>
                </div>

                {product.carvingStyle && (
                  <div className="flex justify-between gap-4 py-4 text-sm">
                    <dt className="text-[#7A675C]">Style</dt>

                    <dd className="text-right font-semibold text-[#2A1810]">
                      {product.carvingStyle}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between gap-4 py-4 text-sm">
                  <dt className="text-[#7A675C]">Dimensions</dt>

                  <dd className="text-right font-semibold text-[#2A1810]">
                    {product.dimensions?.height || 0} ×{" "}
                    {product.dimensions?.width || 0} ×{" "}
                    {product.dimensions?.depth || 0}{" "}
                    {product.dimensions?.unit || "inch"}
                  </dd>
                </div>

                <div className="flex justify-between gap-4 py-4 text-sm">
                  <dt className="text-[#7A675C]">SKU</dt>

                  <dd className="font-semibold text-[#2A1810]">
                    {product.sku}
                  </dd>
                </div>
              </dl>
            </div>

            {product.careInstructions?.length > 0 && (
              <div>
                <h3 className="font-serif text-2xl text-[#2A1810]">
                  Care instructions
                </h3>

                <ul className="mt-5 space-y-3">
                  {product.careInstructions.map((instruction, index) => (
                    <li
                      key={`${instruction}-${index}`}
                      className="flex gap-3 text-sm leading-6 text-[#5F4A3F]"
                    >
                      <FiCheck className="mt-1 shrink-0 text-[#A45A3A]" />

                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetails;
