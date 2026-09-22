import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { FiArrowUpRight, FiImage } from "react-icons/fi";

const CustomCarvingCTA = () => {
  return (
    <section className="bg-[#FFF9EF] px-5 py-20 sm:px-6 lg:px-10 lg:py-28">
      <motion.div
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
          duration: 0.85,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative mx-auto min-h-[620px] max-w-[1440px] overflow-hidden rounded-[2rem] bg-[#21130E] sm:min-h-[680px] lg:min-h-[720px]"
      >
        <motion.img
          src="/images/custom-carving.jpg"
          alt="Custom handcrafted wood carving"
          loading="lazy"
          whileInView={{
            scale: [1.07, 1],
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 1.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-[#160C08]/50" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#160C08]/95 via-[#21130E]/70 to-[#160C08]/20" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#160C08]/70 via-transparent to-transparent" />

        <div className="relative flex min-h-[620px] items-center px-6 py-16 sm:min-h-[680px] sm:px-10 lg:min-h-[720px] lg:px-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.4,
            }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
            className="max-w-3xl"
          >
            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  y: 20,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                },
              }}
              className="flex items-center gap-4"
            >
              <span className="h-px w-12 bg-[#D9B477]" />

              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9B477] sm:text-xs">
                Commission a unique piece
              </p>
            </motion.div>

            <motion.h2
              variants={{
                hidden: {
                  opacity: 0,
                  y: 30,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.8,
                  },
                },
              }}
              className="mt-6 font-serif text-4xl leading-[1] tracking-tight text-[#FFF9EF] sm:text-6xl lg:text-7xl"
            >
              Your vision,
              <span className="block italic text-[#D9B477]">
                carved in wood.
              </span>
            </motion.h2>

            <motion.p
              variants={{
                hidden: {
                  opacity: 0,
                  y: 20,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                },
              }}
              className="mt-7 max-w-xl text-sm leading-7 text-[#EADCC8]/85 sm:text-base sm:leading-8"
            >
              Share your idea, dimensions and reference image with us. Our
              artisans will help shape it into a handcrafted piece made
              especially for your space.
            </motion.p>

            <motion.div
              variants={{
                hidden: {
                  opacity: 0,
                  y: 20,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                },
              }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                to="/contact?type=custom-carving"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#D9B477] px-8 text-xs font-bold uppercase tracking-[0.17em] text-[#21130E] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E7C98F]"
              >
                Request a carving
                <FiArrowUpRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>

              <div className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/25 px-7 text-xs font-semibold uppercase tracking-[0.14em] text-[#FFF9EF] backdrop-blur-sm">
                <FiImage size={17} className="text-[#D9B477]" />
                Reference upload available
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-6 right-6 hidden rounded-full border border-white/20 bg-[#21130E]/35 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md sm:block">
          Made exclusively for you
        </div>
      </motion.div>
    </section>
  );
};

export default CustomCarvingCTA;
