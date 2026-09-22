import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiArrowRight,
  FiAward,
  FiHeart,
  FiPackage,
  FiTool,
} from "react-icons/fi";

import { fetchCategories } from "../../features/categories/categorySlice.js";

const values = [
  {
    icon: FiTool,
    title: "Made by hand",
    description:
      "Every piece is shaped, detailed and finished by skilled artisans rather than mass-produced.",
  },
  {
    icon: FiHeart,
    title: "Created with meaning",
    description:
      "Our carvings are designed to carry cultural, spiritual and personal meaning into your space.",
  },
  {
    icon: FiAward,
    title: "Built to endure",
    description:
      "We select quality wood and careful finishes so each carving can be treasured for years.",
  },
  {
    icon: FiPackage,
    title: "Packed with care",
    description:
      "Every order is securely packed to protect delicate craftsmanship throughout its journey.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Selecting the wood",
    description:
      "The right wood is selected based on its grain, strength and suitability for the intended carving.",
  },
  {
    number: "02",
    title: "Shaping the form",
    description:
      "The artisan gradually reveals the basic composition using traditional carving tools.",
  },
  {
    number: "03",
    title: "Adding the details",
    description:
      "Fine expressions, textures and ornamental details are carefully carved by hand.",
  },
  {
    number: "04",
    title: "Finishing the piece",
    description:
      "The carving is polished and finished to protect the wood while preserving its natural character.",
  },
];

const getCategoryImage = (category) => {
  if (typeof category?.image === "string") {
    return category.image;
  }

  return category?.image?.url || category?.thumbnail?.url || "";
};

const About = () => {
  const dispatch = useDispatch();

  const { categories, fetched } = useSelector((state) => state.categories);

  useEffect(() => {
    if (!fetched) {
      dispatch(fetchCategories());
    }
  }, [dispatch, fetched]);

  const categoryImages = useMemo(() => {
    return categories.map(getCategoryImage).filter(Boolean);
  }, [categories]);

  const primaryImage = categoryImages[0] || "";
  const secondaryImage = categoryImages[1] || primaryImage;

  return (
    <main className="overflow-hidden bg-[#F7F0E5]">
      {/* Hero */}

      <section className="relative min-h-[78vh] overflow-hidden bg-[#21130E] text-[#FFF9EF]">
        {primaryImage && (
          <motion.img
            initial={{
              scale: 1.08,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              duration: 1.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            src={primaryImage}
            alt="Devkar Wood handcrafted carving"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}

        <div className="absolute inset-0 bg-linear-to-r from-[#160C08] via-[#21130E]/85 to-[#21130E]/30" />
        <div className="absolute inset-0 bg-linear-to-t from-[#160C08] via-transparent to-[#160C08]/20" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-[1440px] items-end px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
          <motion.div
            initial={{
              opacity: 0,
              y: 35,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            className="max-w-4xl"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9B477] sm:text-xs">
              Our story
            </p>

            <h1 className="mt-5 font-serif text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-8xl">
              Wood shaped into
              <span className="italic text-[#D9B477]"> timeless stories.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-sm leading-7 text-[#D8C9B8] sm:text-base">
              Devkar Wood Carvings brings traditional Indian craftsmanship into
              contemporary homes through carefully handcrafted wooden art.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}

      <section className="px-5 py-20 sm:px-6 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-2 lg:items-center lg:gap-24">
          <motion.div
            initial={{
              opacity: 0,
              x: -35,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.75,
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A45A3A]">
              Rooted in craftsmanship
            </p>

            <h2 className="mt-5 font-serif text-4xl leading-tight text-[#2A1810] sm:text-5xl lg:text-6xl">
              Celebrating the beauty already present in wood
            </h2>

            <div className="mt-7 space-y-5 text-sm leading-8 text-[#5F4A3F] sm:text-base">
              <p>
                We believe a beautiful carving begins with respect for its
                material. Every grain, tone and natural variation becomes part
                of the finished work.
              </p>

              <p>
                Our collections bring together devotional sculptures, decorative
                wall art and architectural details created through patient
                handwork.
              </p>

              <p>
                No two pieces of natural wood are exactly alike. Those subtle
                differences give every Devkar creation its own character.
              </p>
            </div>

            <Link
              to="/collections"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2A1810] px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#A45A3A]"
            >
              Explore collections
              <FiArrowRight />
            </Link>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 35,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.75,
            }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-linear-to-br from-[#D8C4A9] to-[#8C6449]">
              {secondaryImage ? (
                <img
                  src={secondaryImage}
                  alt="Traditional wooden carving"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-8 text-center">
                  <p className="font-serif text-4xl text-[#FFF9EF]">
                    Crafted slowly.
                    <br />
                    Treasured deeply.
                  </p>
                </div>
              )}
            </div>

            <div className="absolute -bottom-7 -left-4 max-w-56 rounded-3xl bg-[#A45A3A] p-6 text-[#FFF9EF] shadow-xl sm:-left-8">
              <p className="font-serif text-3xl">Handcrafted</p>

              <p className="mt-2 text-xs leading-5 text-[#F0D7C9]">
                Created with patience, precision and respect for Indian craft
                traditions.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}

      <section className="bg-[#FFF9EF] px-5 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A45A3A]">
              What guides us
            </p>

            <h2 className="mt-4 font-serif text-4xl text-[#2A1810] sm:text-5xl">
              Values behind every carving
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <motion.article
                  key={value.title}
                  initial={{
                    opacity: 0,
                    y: 25,
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
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className="rounded-[1.75rem] border border-[#2A1810]/10 bg-[#F7F0E5] p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#A45A3A]/10 text-[#A45A3A]">
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-6 font-serif text-2xl text-[#2A1810]">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#6F5A4E]">
                    {value.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}

      <section className="bg-[#21130E] px-5 py-20 text-[#FFF9EF] sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D9B477]">
                From timber to art
              </p>

              <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
                The making of a Devkar piece
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-[#C8B6A3] sm:text-base">
              Hand carving cannot be rushed. Every stage requires a balance of
              experience, precision and patience.
            </p>
          </div>

          <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
            {processSteps.map((step, index) => (
              <motion.article
                key={step.number}
                initial={{
                  opacity: 0,
                  x: -25,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.3,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.07,
                }}
                className="grid gap-4 py-7 sm:grid-cols-[80px_1fr_1.3fr] sm:items-center"
              >
                <span className="font-serif text-2xl text-[#D9B477]">
                  {step.number}
                </span>

                <h3 className="font-serif text-2xl">{step.title}</h3>

                <p className="text-sm leading-7 text-[#C8B6A3]">
                  {step.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="px-5 py-20 sm:px-6 lg:px-10 lg:py-28">
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          className="mx-auto max-w-[1200px] rounded-[2.5rem] bg-[#A45A3A] px-6 py-14 text-center text-[#FFF9EF] sm:px-10 lg:py-20"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F0D1C1]">
            Created for you
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
            Have a meaningful carving in mind?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#F5DDD1]">
            Share your idea or reference with us and begin a conversation about
            a custom wooden creation.
          </p>

          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FFF9EF] px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2A1810] transition hover:bg-[#D9B477]"
          >
            Start an enquiry
            <FiArrowRight />
          </Link>
        </motion.div>
      </section>
    </main>
  );
};

export default About;
