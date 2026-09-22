import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { FiArrowUpRight, FiHeart } from "react-icons/fi";
import {
  selectIsProductWishlisted,
  toggleWishlist,
} from "../../features/wishlist/wishlistSlice";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
};

const ProductCard = ({ product, index = 0 }) => {
  const dispatch = useDispatch();

  const productId = product?._id || product?.id || product?.productId || "";

  const isWishlisted = useSelector((state) =>
    selectIsProductWishlisted(state, productId),
  );

  const primaryImage =
    product.images?.find((image) => image.isPrimary) || product.images?.[0];

  const regularPrice = Number(product.price) || 0;

  const hasSalePrice =
    product.salePrice !== null &&
    product.salePrice !== undefined &&
    Number(product.salePrice) < regularPrice;

  const effectivePrice = hasSalePrice
    ? Number(product.salePrice)
    : regularPrice;

  const discountPercentage =
    hasSalePrice && regularPrice > 0
      ? Math.round(((regularPrice - effectivePrice) / regularPrice) * 100)
      : 0;

  const isInStock =
    product.trackInventory === false || Number(product.stock) > 0;

  const productPath = `/products/${product.slug}`;

  const handleWishlist = () => {
    if (!productId) {
      toast.error("Unable to save this product");
      return;
    }

    dispatch(toggleWishlist(product));

    if (isWishlisted) {
      toast.success(`${product.name} removed from wishlist`);
    } else {
      toast.success(`${product.name} added to wishlist`);
    }
  };

  return (
    <motion.article
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
        delay: Math.min(index, 3) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-3xl bg-[#E9DDCC]">
        <Link
          to={productPath}
          aria-label={`View ${product.name}`}
          className="block aspect-4/5"
        >
          {primaryImage?.url ? (
            <motion.img
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              loading="lazy"
              whileHover={{
                scale: 1.06,
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#E9DDCC] to-[#CDB99F] px-6 text-center">
              <span className="font-serif text-2xl text-[#6F5A4E]">
                Devkar Wood
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-[#21130E]/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </Link>

        {/* Product badges */}

        <div className="pointer-events-none absolute left-4 top-4 flex flex-col items-start gap-2">
          {product.isNewArrival && (
            <span className="rounded-full bg-[#F7F0E5]/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#2A1810] backdrop-blur-md">
              New
            </span>
          )}

          {discountPercentage > 0 && (
            <span className="rounded-full bg-[#A45A3A] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white">
              {discountPercentage}% off
            </span>
          )}

          {!isInStock && (
            <span className="rounded-full bg-[#2A1810] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white">
              Sold out
            </span>
          )}
        </div>

        {/* Wishlist button */}

        <motion.button
          type="button"
          onClick={handleWishlist}
          whileTap={{
            scale: 0.82,
          }}
          animate={
            isWishlisted
              ? {
                  scale: [1, 1.18, 1],
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
          className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-colors duration-300 ${
            isWishlisted
              ? "bg-[#A45A3A] text-white"
              : "bg-[#F7F0E5]/90 text-[#2A1810] hover:bg-[#A45A3A] hover:text-white"
          }`}
        >
          <FiHeart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </motion.button>

        {/* View-product button */}

        <Link
          to={productPath}
          className="absolute bottom-4 left-4 right-4 flex translate-y-5 items-center justify-between rounded-full bg-[#F7F0E5]/95 px-5 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[#2A1810] opacity-0 shadow-lg backdrop-blur-md transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100"
        >
          View piece
          <FiArrowUpRight size={17} />
        </Link>
      </div>

      {/* Product information */}

      <div className="px-1 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A45A3A]">
              {product.woodType || "Handcrafted wood"}
            </p>

            <Link to={productPath} className="mt-2 block">
              <h3 className="font-serif text-xl leading-snug text-[#2A1810] transition-colors duration-300 hover:text-[#A45A3A] sm:text-2xl">
                {product.name}
              </h3>
            </Link>
          </div>

          {product.isBestseller && (
            <span className="shrink-0 rounded-full border border-[#B88A44]/40 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#8A642D]">
              Bestseller
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <span className="text-sm font-bold text-[#2A1810] sm:text-base">
            {formatPrice(effectivePrice)}
          </span>

          {hasSalePrice && (
            <span className="text-xs text-[#8C7A6E] line-through sm:text-sm">
              {formatPrice(regularPrice)}
            </span>
          )}
        </div>

        {product.finish && (
          <p className="mt-2 text-xs text-[#7A675C]">{product.finish}</p>
        )}
      </div>
    </motion.article>
  );
};

export default ProductCard;
