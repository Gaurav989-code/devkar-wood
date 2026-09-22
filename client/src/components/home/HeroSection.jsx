import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { FiArrowDown, FiArrowUpRight } from "react-icons/fi";

const containerVariants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 28,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const HeroSection = () => {
  const scrollToContent = () => {
    const nextSection = document.querySelector("#homepage-content");

    nextSection?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section className="relative isolate min-h-[calc(100svh-112px)] overflow-hidden bg-[#21130E]">
      {/* Background image */}

      <motion.img
        src="/images/hero-wood-carving.png"
        alt="Handcrafted wooden carving by Devkar Wood"
        initial={{
          opacity: 0,
          scale: 1.08,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          opacity: {
            duration: 1,
          },
          scale: {
            duration: 2,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
        className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
      />

      {/* Cinematic overlays */}

      <div className="absolute inset-0 -z-20 bg-[#160C08]/45" />

      <div className="absolute inset-0 -z-20 bg-linear-to-r from-[#160C08]/95 via-[#21130E]/70 to-[#160C08]/15" />

      <div className="absolute inset-0 -z-20 bg-linear-to-t from-[#160C08]/75 via-transparent to-[#160C08]/20" />

      {/* Subtle decorative glow */}

      <div className="absolute -left-40 top-1/2 -z-10 h-125 w-125 -translate-y-1/2 rounded-full bg-[#A45A3A]/20 blur-[120px]" />

      {/* Main content */}

      <div className="mx-auto flex min-h-[calc(100svh-112px)] max-w-360 items-center px-6 py-20 lg:px-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4"
          >
            <span className="h-px w-10 bg-[#D9B477] sm:w-16" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#E5C68F] sm:text-xs">
              Handcrafted in Maharashtra
            </p>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mt-7 max-w-4xl font-serif text-[clamp(3.2rem,8vw,7.8rem)] font-medium leading-[0.88] tracking-[-0.045em] text-[#FFF9EF]"
          >
            Wood shaped
            <span className="block italic text-[#D9B477]">into legacy.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-8 max-w-xl text-sm leading-7 text-[#EADCC8]/85 sm:text-base sm:leading-8 lg:text-lg"
          >
            Discover timeless wooden sculptures and architectural carvings
            shaped by skilled hands, natural materials and generations of Indian
            craftsmanship.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Link
              to="/products"
              className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#D9B477] px-8 text-xs font-bold uppercase tracking-[0.18em] text-[#21130E] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E7C98F] hover:shadow-[0_16px_40px_rgba(217,180,119,0.25)]"
            >
              Explore carvings
              <FiArrowUpRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>

            <Link
              to="/contact"
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#FFF9EF]/35 px-8 text-xs font-bold uppercase tracking-[0.18em] text-[#FFF9EF] backdrop-blur-sm transition-all duration-300 hover:border-[#D9B477] hover:bg-[#D9B477]/10 hover:text-[#E5C68F]"
            >
              Request custom work
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Craftsmanship badge */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.85,
          rotate: -10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          rotate: 0,
        }}
        transition={{
          duration: 0.8,
          delay: 1,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute bottom-8 right-8 hidden h-32 w-32 items-center justify-center rounded-full border border-[#FFF9EF]/25 bg-[#21130E]/35 text-center backdrop-blur-md lg:flex xl:bottom-12 xl:right-12 xl:h-36 xl:w-36"
      >
        <div>
          <p className="font-serif text-xl italic text-[#D9B477]">Made</p>

          <p className="mt-1 text-[9px] font-semibold uppercase leading-4 tracking-[0.18em] text-[#FFF9EF]">
            Slowly
            <br />
            By hand
          </p>
        </div>
      </motion.div>

      {/* Scroll button */}

      <motion.button
        type="button"
        onClick={scrollToContent}
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.7,
          delay: 1.2,
        }}
        aria-label="Scroll to homepage content"
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[#FFF9EF]/75 transition hover:text-[#D9B477] lg:left-10 lg:translate-x-0"
      >
        <span className="hidden text-[9px] font-semibold uppercase tracking-[0.25em] lg:block">
          Scroll to discover
        </span>

        <motion.span
          animate={{
            y: [0, 6, 0],
          }}
          transition={{
            duration: 1.7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <FiArrowDown size={18} />
        </motion.span>
      </motion.button>
    </section>
  );
};

export default HeroSection;
