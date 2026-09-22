import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiDroplet,
  FiFeather,
  FiMail,
  FiShield,
  FiSun,
  FiThermometer,
} from "react-icons/fi";

const careSteps = [
  {
    number: "01",
    icon: FiFeather,
    title: "Dust gently",
    description:
      "Use a clean, dry microfiber cloth or a soft natural-bristle brush to remove dust from the surface and detailed carvings.",
  },
  {
    number: "02",
    icon: FiDroplet,
    title: "Clean carefully",
    description:
      "For stubborn marks, use a cloth that is only slightly damp. Wipe immediately afterward with a clean, dry cloth.",
  },
  {
    number: "03",
    icon: FiSun,
    title: "Avoid direct sunlight",
    description:
      "Keep wooden carvings away from prolonged direct sunlight, which may fade the finish or dry the wood unevenly.",
  },
  {
    number: "04",
    icon: FiThermometer,
    title: "Maintain a stable environment",
    description:
      "Avoid placing carvings near heaters, air conditioners or areas with sudden temperature and humidity changes.",
  },
];

const recommendedPractices = [
  "Dust the carving regularly with a soft, dry cloth.",
  "Use a small soft brush for grooves and delicate details.",
  "Lift sculptures from their base instead of projecting parts.",
  "Keep the item in a well-ventilated indoor space.",
  "Use coasters or protective pads beneath decorative pieces.",
  "Test any care product on a hidden area before full application.",
];

const practicesToAvoid = [
  "Do not soak the carving or wash it under running water.",
  "Do not use bleach, alcohol, glass cleaner or harsh chemicals.",
  "Do not scrub the surface with abrasive pads or rough fabrics.",
  "Do not place wooden pieces directly beside heat sources.",
  "Do not use edible oils such as coconut, mustard or cooking oil.",
  "Do not attempt to repair cracks or delicate carvings with household glue.",
];

const seasonalCare = [
  {
    season: "Summer",
    advice:
      "Protect the carving from harsh sunlight and very dry air. Move it away from hot windows and direct heat.",
  },
  {
    season: "Monsoon",
    advice:
      "Keep the carving in a dry, ventilated room. Avoid damp walls and inspect the piece occasionally for moisture.",
  },
  {
    season: "Winter",
    advice:
      "Keep the piece away from room heaters and fireplaces. Sudden drying may place unnecessary stress on the wood.",
  },
];

const CareGuide = () => {
  return (
    <main className="min-h-screen bg-[#F7F0E5] text-[#2A1810]">
      {/* Hero */}

      <section className="relative overflow-hidden bg-[#21130E] px-5 py-20 text-[#FFF9EF] sm:px-6 lg:px-10 lg:py-28">
        <div className="absolute -right-36 top-0 h-96 w-96 rounded-full bg-[#A45A3A]/20 blur-[120px]" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#D9B477]/10 blur-[120px]" />

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
            Preserve the craftsmanship
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.98] sm:text-6xl lg:text-8xl">
            Wood care
            <span className="italic text-[#D9B477]"> guide.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-[#D8C9B8] sm:text-base">
            Simple care helps handcrafted wooden art retain its warmth, detail
            and character for generations.
          </p>
        </motion.div>
      </section>

      {/* Introduction */}

      <section className="px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
          <motion.div
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
              amount: 0.25,
            }}
            transition={{
              duration: 0.7,
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A45A3A]">
              Natural material
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              Every piece of wood continues to live
            </h2>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 25,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 0.7,
            }}
            className="border-l border-[#A45A3A]/30 pl-6 sm:pl-10"
          >
            <p className="text-sm leading-8 text-[#6F5A4E] sm:text-base">
              Wood naturally responds to light, moisture and temperature. Slight
              variations in grain, tone and texture are part of its
              character—not defects. With thoughtful placement and gentle
              cleaning, your carving can age beautifully.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Essential steps */}

      <section className="border-y border-[#2A1810]/10 bg-[#FFF9EF] px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A45A3A]">
              Essential care
            </p>

            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
              Four simple habits
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#6F5A4E]">
              Follow these basic steps to protect the surface, finish and fine
              details of your wooden carving.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {careSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.article
                  key={step.title}
                  initial={{
                    opacity: 0,
                    y: 24,
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
                    duration: 0.55,
                    delay: index * 0.08,
                  }}
                  className="group rounded-[1.75rem] border border-[#2A1810]/10 bg-[#F7F0E5] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#A45A3A]/30 hover:shadow-[0_20px_45px_rgba(42,24,16,0.08)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#21130E] text-[#D9B477]">
                      <Icon size={20} />
                    </div>

                    <span className="font-serif text-2xl text-[#A45A3A]/40">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-7 font-serif text-2xl">{step.title}</h3>

                  <p className="mt-4 text-sm leading-7 text-[#6F5A4E]">
                    {step.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dos and don'ts */}

      <section className="px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-6 lg:grid-cols-2">
          <motion.article
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
            className="rounded-[2rem] border border-[#2A1810]/10 bg-[#FFF9EF] p-7 sm:p-10"
          >
            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <FiShield size={22} />
            </div>

            <h2 className="mt-6 font-serif text-3xl sm:text-4xl">
              Recommended care
            </h2>

            <div className="mt-7 space-y-4">
              {recommendedPractices.map((practice) => (
                <div key={practice} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <FiCheck size={13} />
                  </span>

                  <p className="text-sm leading-6 text-[#6F5A4E]">{practice}</p>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
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
              delay: 0.1,
            }}
            className="rounded-[2rem] bg-[#21130E] p-7 text-[#FFF9EF] sm:p-10"
          >
            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#A45A3A]/20 text-[#D9B477]">
              <FiAlertCircle size={22} />
            </div>

            <h2 className="mt-6 font-serif text-3xl sm:text-4xl">
              What to avoid
            </h2>

            <div className="mt-7 space-y-4">
              {practicesToAvoid.map((practice) => (
                <div key={practice} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A45A3A]/25 text-[#D9B477]">
                    <span className="text-sm leading-none">×</span>
                  </span>

                  <p className="text-sm leading-6 text-[#C8B6A3]">{practice}</p>
                </div>
              ))}
            </div>
          </motion.article>
        </div>
      </section>

      {/* Seasonal care */}

      <section className="bg-[#EDE1D0] px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A45A3A]">
                Through the seasons
              </p>

              <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
                Seasonal care in India
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-[#6F5A4E]">
              Small changes in placement can protect your carving as weather
              conditions change.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {seasonalCare.map((item, index) => (
              <motion.article
                key={item.season}
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
                  delay: index * 0.1,
                }}
                className="rounded-[1.75rem] bg-[#F7F0E5] p-7"
              >
                <FiClock size={20} className="text-[#A45A3A]" />

                <h3 className="mt-5 font-serif text-2xl">{item.season}</h3>

                <p className="mt-3 text-sm leading-7 text-[#6F5A4E]">
                  {item.advice}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Polishing advice */}

      <section className="px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="rounded-[2rem] border border-[#A45A3A]/20 bg-[#A45A3A]/5 p-7 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A45A3A]">
                Waxing and polishing
              </p>

              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
                Ask before applying a product
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#6F5A4E]">
                Different finishes require different treatment. Wax, oil or
                polish that suits one carving may damage another. Contact us
                with a photograph before applying any restoration or finishing
                product.
              </p>
            </div>

            <Link
              to="/contact"
              className="mt-7 inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#21130E] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.17em] text-white transition hover:bg-[#A45A3A] lg:mt-0"
            >
              Ask our team
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Support callout */}

      <section className="px-5 pb-16 sm:px-6 lg:px-10 lg:pb-24">
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
            <FiMail className="mx-auto text-[#D9B477]" size={28} />

            <h2 className="mx-auto mt-6 max-w-2xl font-serif text-4xl sm:text-5xl">
              Unsure how to care for your piece?
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#C8B6A3]">
              Send us a clear photograph and a short description. We will help
              you choose the safest care method.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D9B477] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#21130E] transition hover:bg-[#FFF9EF]"
              >
                Contact us
                <FiArrowRight />
              </Link>

              <a
                href="https://wa.me/919689839561"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:border-[#D9B477] hover:text-[#D9B477]"
              >
                WhatsApp support
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default CareGuide;
