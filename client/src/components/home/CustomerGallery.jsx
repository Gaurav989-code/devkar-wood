import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { FiArrowUpRight, FiInstagram } from "react-icons/fi";

const galleryImages = [
  {
    id: 1,
    image: "/images/gallery/gallery-1.jpg",
    alt: "Handcrafted wooden carving displayed in an Indian home",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    id: 2,
    image: "/images/gallery/gallery-2.jpg",
    alt: "Detailed handmade wood carving",
    className: "",
  },
  {
    id: 3,
    image: "/images/gallery/gallery-3.jpg",
    alt: "Wood artisan working on a carving",
    className: "",
  },
  {
    id: 4,
    image: "/images/gallery/gallery-4.jpg",
    alt: "Traditional wooden sculpture",
    className: "",
  },
  {
    id: 5,
    image: "/images/gallery/gallery-4.jpg",
    alt: "Decorative wood panel installed in an interior",
    className: "",
  },
];

const CustomerGallery = () => {
  return (
    <section className="overflow-hidden bg-[#FFF9EF] px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
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
                Crafted spaces
              </p>
            </div>

            <h2 className="mt-5 font-serif text-4xl leading-tight tracking-tight text-[#2A1810] sm:text-5xl lg:text-6xl">
              Made by hand,
              <span className="block italic text-[#A45A3A]">
                living in your story.
              </span>
            </h2>
          </motion.div>

          <Link
            to="/gallery"
            className="group inline-flex w-fit items-center gap-3 border-b border-[#2A1810] pb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2A1810] transition-colors hover:border-[#A45A3A] hover:text-[#A45A3A]"
          >
            View customer gallery
            <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>

        <div className="mt-14 grid auto-rows-[240px] grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[280px] lg:mt-20 lg:grid-cols-4 lg:gap-5">
          {galleryImages.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.65,
                delay: Math.min(index, 4) * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`group relative overflow-hidden rounded-[1.5rem] bg-[#E1D3C0] ${item.className}`}
            >
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#160C08]/60 via-transparent to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-80" />

              <div className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-[#F7F0E5]/95 text-[#2A1810] opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <FiInstagram size={17} />
              </div>
            </motion.article>
          ))}
        </div>

        <motion.p
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          className="mx-auto mt-10 max-w-2xl text-center text-sm leading-7 text-[#6F5A4E]"
        >
          Have a Devkar carving in your space? Share your photograph with us to
          be featured in our community gallery.
        </motion.p>
      </div>
    </section>
  );
};

export default CustomerGallery;
