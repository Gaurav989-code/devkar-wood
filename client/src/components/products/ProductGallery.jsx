import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ProductGallery = ({ images = [], productName = "" }) => {
  const sortedImages = [...images].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  const selectedImage = sortedImages[selectedIndex];

  const showPrevious = () => {
    setSelectedIndex((current) =>
      current === 0 ? sortedImages.length - 1 : current - 1,
    );
  };

  const showNext = () => {
    setSelectedIndex((current) =>
      current === sortedImages.length - 1 ? 0 : current + 1,
    );
  };

  if (sortedImages.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#E9DDCC] to-[#CDB99F]">
        <p className="font-serif text-3xl text-[#6F5A4E]">Devkar Wood</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[82px_1fr]">
      {/* Thumbnails */}

      <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
        {sortedImages.map((image, index) => (
          <button
            key={image.fileId || index}
            type="button"
            onClick={() => setSelectedIndex(index)}
            aria-label={`View image ${index + 1}`}
            className={`h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-full ${
              selectedIndex === index
                ? "border-[#A45A3A]"
                : "border-transparent opacity-65 hover:opacity-100"
            }`}
          >
            <img
              src={image.thumbnailUrl || image.url}
              alt={image.altText || `${productName} thumbnail`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}

      <div className="order-1 sm:order-2">
        <div className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#E9DDCC]">
          <motion.img
            key={selectedImage.fileId || selectedImage.url}
            src={selectedImage.url}
            alt={selectedImage.altText || productName}
            initial={{
              opacity: 0,
              scale: 1.03,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.45,
            }}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />

          {sortedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#F7F0E5]/90 text-[#2A1810] opacity-100 backdrop-blur-md transition hover:bg-[#A45A3A] hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
              >
                <FiChevronLeft />
              </button>

              <button
                type="button"
                onClick={showNext}
                aria-label="Next image"
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#F7F0E5]/90 text-[#2A1810] opacity-100 backdrop-blur-md transition hover:bg-[#A45A3A] hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
              >
                <FiChevronRight />
              </button>
            </>
          )}

          <span className="absolute bottom-4 right-4 rounded-full bg-[#21130E]/60 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md">
            {selectedIndex + 1} / {sortedImages.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
