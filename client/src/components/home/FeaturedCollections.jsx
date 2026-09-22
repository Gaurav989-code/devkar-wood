import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { FiArrowUpRight } from "react-icons/fi";

const collections = [
  {
    id: 1,
    title: "Divine Sculptures",
    subtitle: "Sacred forms carved by hand",
    image: "/images/divine-sculptures.jpg",
    path: "/products?category=divine-sculptures",
    number: "01",
    size: "large",
  },
  {
    id: 2,
    title: "Wall Panels",
    subtitle: "Traditional detail for modern spaces",
    image: "/images/wall-panels.jpg",
    path: "/products?category=wall-panels",
    number: "02",
    size: "small",
  },
  {
    id: 3,
    title: "Architectural Carvings",
    subtitle: "Statement pieces built to endure",
    image: "/images/architectural-carvings.jpg",
    path: "/products?category=architectural-carvings",
    number: "03",
    size: "small",
  },
];

const CollectionCard = ({ collection, index }) => {
  const isLarge = collection.size === "large";

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 45,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.75,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={isLarge ? "md:row-span-2" : ""}
    >
      <Link
        to={collection.path}
        className={`group relative block overflow-hidden rounded-[1.75rem] bg-[#2A1810] ${
          isLarge ? "h-130 md:h-full md:min-h-190" : "h-105 md:min-h-92.5"
        }`}
      >
        <motion.img
          src={collection.image}
          alt={collection.title}
          loading="lazy"
          whileHover={{
            scale: 1.06,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-t from-[#160C08]/95 via-[#21130E]/20 to-transparent" />

        <div className="absolute inset-0 bg-[#A45A3A]/0 transition-colors duration-500 group-hover:bg-[#A45A3A]/10" />

        <span className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#21130E]/20 text-[10px] font-semibold tracking-[0.15em] text-white backdrop-blur-md">
          {collection.number}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#E5C68F]">
            {collection.subtitle}
          </p>

          <div className="mt-3 flex items-end justify-between gap-5">
            <h3
              className={`max-w-lg font-serif leading-tight text-[#FFF9EF] ${
                isLarge ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"
              }`}
            >
              {collection.title}
            </h3>

            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30 text-white transition-all duration-300 group-hover:rotate-45 group-hover:border-[#D9B477] group-hover:bg-[#D9B477] group-hover:text-[#21130E]">
              <FiArrowUpRight size={19} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

const FeaturedCollections = () => {
  return (
    <section className="overflow-hidden bg-[#F7F0E5] px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-360">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
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
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-[#A45A3A]" />

              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A45A3A] sm:text-xs">
                Explore our craft
              </p>
            </div>

            <h2 className="mt-5 max-w-xl font-serif text-4xl leading-[1.05] tracking-tight text-[#2A1810] sm:text-5xl lg:text-6xl">
              Made for spaces with
              <span className="italic text-[#A45A3A]"> soul.</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.5,
            }}
            transition={{
              duration: 0.7,
              delay: 0.1,
            }}
            className="max-w-2xl text-sm leading-7 text-[#6F5A4E] sm:text-base sm:leading-8 lg:justify-self-end"
          >
            From sacred sculptures to architectural statements, each collection
            celebrates the natural character of wood and the patience of
            handcrafted detail.
          </motion.p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 md:grid-rows-2 lg:mt-20 lg:gap-7">
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              index={index}
            />
          ))}
        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="mt-12 flex justify-center"
        >
          <Link
            to="/collections"
            className="group inline-flex items-center gap-3 border-b border-[#2A1810] pb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#2A1810] transition-colors hover:border-[#A45A3A] hover:text-[#A45A3A]"
          >
            View all collections
            <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
