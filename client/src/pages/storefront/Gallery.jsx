import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCamera,
  FiInstagram,
  FiMaximize2,
  FiX,
} from "react-icons/fi";

const galleryCategories = [
  {
    value: "all",
    label: "All work",
  },
  {
    value: "sculptures",
    label: "Sculptures",
  },
  {
    value: "panels",
    label: "Wall panels",
  },
  {
    value: "architectural",
    label: "Architectural",
  },
  {
    value: "craftsmanship",
    label: "Craftsmanship",
  },
];

const galleryImages = [
  {
    id: 1,
    src: "/images/divine-sculptures.jpg",
    title: "Divine wooden sculptures",
    description:
      "Sacred forms shaped with expressive details and traditional craftsmanship.",
    category: "sculptures",
    size: "large",
    alt: "Collection of handcrafted divine wooden sculptures",
  },
  {
    id: 2,
    src: "/images/artisan-carving.jpg",
    title: "Artisan at work",
    description:
      "Every detail is shaped patiently by the hands of an experienced artisan.",
    category: "craftsmanship",
    size: "standard",
    alt: "Indian artisan creating a detailed wooden carving",
  },
  {
    id: 3,
    src: "/images/custom-carving.jpg",
    title: "Custom divine carving",
    description:
      "A unique carving developed from an individual idea and specification.",
    category: "sculptures",
    size: "standard",
    alt: "Custom handcrafted divine wooden sculpture",
  },
  {
    id: 4,
    src: "/images/wall-panels.jpg",
    title: "Decorative wall panels",
    description:
      "Carved wooden patterns designed to give interior spaces warmth and depth.",
    category: "panels",
    size: "wide",
    alt: "Decorative handcrafted wooden wall panel",
  },
  {
    id: 5,
    src: "/images/architectural-carvings.jpg",
    title: "Architectural details",
    description:
      "Traditional wooden details created for entrances, walls and interiors.",
    category: "architectural",
    size: "standard",
    alt: "Traditional architectural wood carving",
  },
  {
    id: 6,
    src: "/images/wood-detail.jpg",
    title: "Details in every line",
    description:
      "A closer view of the textures, patterns and marks left by hand carving.",
    category: "craftsmanship",
    size: "standard",
    alt: "Close-up details of handcrafted wood carving",
  },
  {
    id: 7,
    src: "/images/hero-wood-carving.png",
    title: "Made to become an heirloom",
    description:
      "A statement carving created to remain meaningful across generations.",
    category: "sculptures",
    size: "wide",
    alt: "Premium handcrafted wooden carving by Devkar Wood Carvings",
  },
];

const GalleryImage = ({ image, index, onOpen }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const sizeClass =
    image.size === "large"
      ? "md:col-span-2 md:row-span-2"
      : image.size === "wide"
        ? "md:col-span-2"
        : "";

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        scale: 0.96,
        y: 20,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.96,
      }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.05, 0.25),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative min-h-[320px] cursor-pointer overflow-hidden rounded-[1.75rem] bg-[#E6D8C5] ${
        image.size === "large" ? "md:min-h-[660px]" : "md:min-h-[320px]"
      } ${sizeClass}`}
      onClick={() => {
        if (!imageFailed) {
          onOpen(image);
        }
      }}
    >
      {!imageLoaded && !imageFailed && (
        <div className="absolute inset-0 animate-pulse bg-[#E1D3C0]" />
      )}

      {!imageFailed ? (
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#C8AE8C] to-[#6B4A38] px-6 text-center text-[#FFF9EF]">
          <FiCamera size={30} className="text-[#F1DDAB]" />

          <p className="mt-4 font-serif text-2xl">{image.title}</p>

          <p className="mt-2 text-xs text-[#F0E3D3]">
            Add image at {image.src}
          </p>
        </div>
      )}

      {!imageFailed && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-[#160C08]/90 via-[#160C08]/10 to-transparent opacity-80 transition duration-500 group-hover:opacity-100" />

          <div className="absolute inset-x-0 bottom-0 translate-y-3 p-6 text-[#FFF9EF] transition duration-500 group-hover:translate-y-0 sm:p-7">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D9B477]">
                  Devkar craftsmanship
                </p>

                <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
                  {image.title}
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-[#E1D3C4] opacity-0 transition duration-500 group-hover:opacity-100">
                  {image.description}
                </p>
              </div>

              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF9EF] text-[#21130E] opacity-0 transition duration-500 group-hover:opacity-100">
                <FiMaximize2 />
              </span>
            </div>
          </div>
        </>
      )}
    </motion.article>
  );
};

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredImages = useMemo(() => {
    if (selectedCategory === "all") {
      return galleryImages;
    }

    return galleryImages.filter((image) => image.category === selectedCategory);
  }, [selectedCategory]);

  const selectedImageIndex = selectedImage
    ? filteredImages.findIndex((image) => image.id === selectedImage.id)
    : -1;

  const openPreviousImage = () => {
    if (filteredImages.length === 0) {
      return;
    }

    const previousIndex =
      selectedImageIndex <= 0
        ? filteredImages.length - 1
        : selectedImageIndex - 1;

    setSelectedImage(filteredImages[previousIndex]);
  };

  const openNextImage = () => {
    if (filteredImages.length === 0) {
      return;
    }

    const nextIndex =
      selectedImageIndex >= filteredImages.length - 1
        ? 0
        : selectedImageIndex + 1;

    setSelectedImage(filteredImages[nextIndex]);
  };

  useEffect(() => {
    if (!selectedImage) {
      return undefined;
    }

    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }

      if (event.key === "ArrowLeft") {
        openPreviousImage();
      }

      if (event.key === "ArrowRight") {
        openNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage, selectedImageIndex, filteredImages]);

  return (
    <main className="min-h-screen bg-[#F7F0E5] text-[#2A1810]">
      {/* Hero */}

      <section className="relative overflow-hidden bg-[#21130E] px-5 py-20 text-[#FFF9EF] sm:px-6 lg:px-10 lg:py-28">
        <div className="absolute -right-36 top-0 h-96 w-96 rounded-full bg-[#A45A3A]/20 blur-[120px]" />

        <div className="absolute -bottom-44 -left-28 h-96 w-96 rounded-full bg-[#D9B477]/10 blur-[120px]" />

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
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mx-auto max-w-[1440px]"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9B477] sm:text-xs">
            Stories shaped by hand
          </p>

          <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[0.98] sm:text-6xl lg:text-8xl">
            The Devkar
            <span className="italic text-[#D9B477]"> gallery.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-[#D8C9B8] sm:text-base">
            Explore sacred sculptures, decorative panels, architectural details
            and the patient craftsmanship behind every wooden piece.
          </p>
        </motion.div>
      </section>

      {/* Gallery heading and filters */}

      <section className="px-5 pb-16 pt-14 sm:px-6 lg:px-10 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-8 border-b border-[#2A1810]/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A45A3A]">
                Selected work
              </p>

              <h2 className="mt-3 font-serif text-4xl sm:text-5xl">
                Carved for meaningful spaces
              </h2>
            </div>

            <p className="max-w-lg text-sm leading-7 text-[#6F5A4E]">
              Each creation begins with natural wood and becomes an individual
              expression of detail, heritage and artistry.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {galleryCategories.map((category) => {
              const selected = selectedCategory === category.value;

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`rounded-full border px-5 py-3 text-[9px] font-bold uppercase tracking-[0.15em] transition ${
                    selected
                      ? "border-[#21130E] bg-[#21130E] text-white"
                      : "border-[#2A1810]/15 bg-[#FFF9EF] text-[#5F4A3F] hover:border-[#A45A3A] hover:text-[#A45A3A]"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Gallery grid */}

          <motion.div
            layout
            className="mt-10 grid auto-rows-[320px] grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image, index) => (
                <GalleryImage
                  key={image.id}
                  image={image}
                  index={index}
                  onOpen={setSelectedImage}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Natural variations */}

      <section className="bg-[#EDE1D0] px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A45A3A]">
              Naturally individual
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              No two carvings are exactly alike
            </h2>
          </div>

          <div className="border-l border-[#A45A3A]/30 pl-6 sm:pl-10">
            <p className="text-sm leading-8 text-[#6F5A4E] sm:text-base">
              Natural grain, colour and texture vary from one piece of wood to
              another. These variations are part of the material’s character and
              give every handcrafted Devkar piece its own identity.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center gap-3 border-b border-[#2A1810] pb-2 text-[10px] font-bold uppercase tracking-[0.17em] transition hover:border-[#A45A3A] hover:text-[#A45A3A]"
            >
              Explore the collection
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Customer gallery callout */}

      <section className="px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.98,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2.25rem] bg-[#21130E] px-6 py-14 text-center text-[#FFF9EF] sm:px-10 lg:py-20"
        >
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#D9B477]/10 blur-[90px]" />

          <div className="relative">
            <FiCamera className="mx-auto text-[#D9B477]" size={30} />

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.24em] text-[#D9B477]">
              Living in your story
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl sm:text-5xl">
              Have a Devkar carving in your space?
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#C8B6A3]">
              Share a photograph of your carving with us for a chance to be
              featured in our customer gallery.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D9B477] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#21130E] transition hover:bg-[#FFF9EF]"
              >
                <FiInstagram />
                Follow on Instagram
              </a>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:border-[#D9B477] hover:text-[#D9B477]"
              >
                Share your photograph
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Lightbox */}

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#120906]/95 p-4 backdrop-blur-md sm:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              aria-label="Close gallery image"
              className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#D9B477] hover:text-[#21130E] sm:right-8 sm:top-8"
            >
              <FiX size={20} />
            </button>

            {filteredImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openPreviousImage();
                  }}
                  aria-label="Previous gallery image"
                  className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#D9B477] hover:text-[#21130E] sm:left-8"
                >
                  <FiArrowLeft />
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openNextImage();
                  }}
                  aria-label="Next gallery image"
                  className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#D9B477] hover:text-[#21130E] sm:right-8"
                >
                  <FiArrowRight />
                </button>
              </>
            )}

            <motion.div
              key={selectedImage.id}
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
              }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={(event) => event.stopPropagation()}
              className="relative flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.5rem] bg-[#21130E] shadow-2xl"
            >
              <div className="min-h-0 flex-1 bg-black">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="h-full max-h-[70vh] w-full object-contain"
                />
              </div>

              <div className="p-5 text-[#FFF9EF] sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-7">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D9B477]">
                    Devkar gallery
                  </p>

                  <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
                    {selectedImage.title}
                  </h2>
                </div>

                <p className="mt-3 max-w-lg text-sm leading-6 text-[#C8B6A3] sm:mt-0">
                  {selectedImage.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Gallery;
