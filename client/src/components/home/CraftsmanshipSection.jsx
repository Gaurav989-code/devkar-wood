import { useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(
  ScrollTrigger,
  useGSAP,
);

const processSteps = [
  {
    number: "01",
    title: "Selecting the wood",
    description:
      "Every piece begins with carefully selected wood chosen for its grain, strength and natural character.",
  },
  {
    number: "02",
    title: "Carving by hand",
    description:
      "Our artisans shape every curve and detail slowly, using traditional tools and patient hands.",
  },
  {
    number: "03",
    title: "Finishing the story",
    description:
      "The final surface is refined and finished to protect the wood while preserving its warmth.",
  },
];

const CraftsmanshipSection = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const secondaryImageRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.fromTo(
            imageRef.current,
            {
              yPercent: -5,
              scale: 1.08,
            },
            {
              yPercent: 5,
              scale: 1,
              ease: "none",

              scrollTrigger: {
                trigger:
                  sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
              },
            },
          );

          gsap.fromTo(
            secondaryImageRef.current,
            {
              y: 80,
              rotate: 3,
            },
            {
              y: -30,
              rotate: 0,
              ease: "none",

              scrollTrigger: {
                trigger:
                  sectionRef.current,
                start: "top 80%",
                end: "bottom 20%",
                scrub: 1,
              },
            },
          );

          gsap.from(
            contentRef.current.children,
            {
              opacity: 0,
              y: 45,
              stagger: 0.12,
              duration: 0.9,
              ease: "power3.out",

              scrollTrigger: {
                trigger:
                  contentRef.current,
                start: "top 75%",
                once: true,
              },
            },
          );

          gsap.from(
            ".craft-process-item",
            {
              opacity: 0,
              x: 35,
              stagger: 0.14,
              duration: 0.8,
              ease: "power3.out",

              scrollTrigger: {
                trigger:
                  ".craft-process-list",
                start: "top 78%",
                once: true,
              },
            },
          );
        },
      );

      return () => {
        media.revert();
      };
    },
    {
      scope: sectionRef,
    },
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#21130E] px-5 py-24 text-[#FFF9EF] sm:px-6 lg:px-10 lg:py-36"
    >
      {/* Decorative background */}

      <div className="pointer-events-none absolute -right-52 top-0 h-[600px] w-[600px] rounded-full bg-[#A45A3A]/15 blur-[150px]" />

      <div className="pointer-events-none absolute -bottom-60 -left-40 h-[500px] w-[500px] rounded-full bg-[#D9B477]/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-24">
        {/* Images */}

        <div className="relative">
          <div className="relative h-[520px] overflow-hidden rounded-[2rem] sm:h-[650px] lg:h-[760px]">
            <img
              ref={imageRef}
              src="/images/artisan-carving.jpg"
              alt="Indian artisan hand carving wood"
              loading="lazy"
              className="absolute -inset-y-[8%] h-[116%] w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#160C08]/55 via-transparent to-transparent" />

            <div className="absolute left-6 top-6 rounded-full border border-white/25 bg-[#21130E]/30 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#FFF9EF] backdrop-blur-md">
              Shaped by hand
            </div>
          </div>

          <div
            ref={secondaryImageRef}
            className="absolute -bottom-10 right-3 hidden w-[42%] overflow-hidden rounded-[1.5rem] border-[6px] border-[#21130E] shadow-2xl sm:block lg:-right-12 lg:bottom-4"
          >
            <img
              src="/images/wood-detail.jpg"
              alt="Detailed handcrafted wood carving"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>

          <div className="absolute -bottom-7 left-6 flex h-28 w-28 items-center justify-center rounded-full bg-[#D9B477] text-center text-[#21130E] sm:left-10 sm:h-32 sm:w-32">
            <div>
              <p className="font-serif text-2xl italic">
                Made
              </p>

              <p className="mt-1 text-[8px] font-bold uppercase leading-4 tracking-[0.18em]">
                Slowly
                <br />
                With care
              </p>
            </div>
          </div>
        </div>

        {/* Content */}

        <div className="lg:pl-4">
          <div ref={contentRef}>
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-[#D9B477]" />

              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9B477] sm:text-xs">
                The art of making
              </p>
            </div>

            <h2 className="mt-6 max-w-xl font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Crafted with
              <span className="block italic text-[#D9B477]">
                patience and purpose.
              </span>
            </h2>

            <p className="mt-7 max-w-xl text-sm leading-7 text-[#D8C9B8] sm:text-base sm:leading-8">
              Wood carving cannot be rushed.
              Every cut follows the grain,
              every detail carries the touch
              of its maker and every finished
              piece keeps the natural story
              of the wood alive.
            </p>

            <Link
              to="/about"
              className="group mt-9 inline-flex items-center gap-3 border-b border-[#D9B477] pb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D9B477] transition-colors hover:text-[#FFF9EF]"
            >
              Discover our story

              <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>

          {/* Process */}

          <div className="craft-process-list mt-14 border-t border-white/15">
            {processSteps.map((step) => (
              <div
                key={step.number}
                className="craft-process-item grid grid-cols-[42px_1fr] gap-4 border-b border-white/15 py-7 sm:grid-cols-[55px_1fr]"
              >
                <span className="pt-1 text-[10px] font-bold tracking-[0.18em] text-[#D9B477]">
                  {step.number}
                </span>

                <div>
                  <h3 className="font-serif text-2xl text-[#FFF9EF]">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-[#BFAE9D]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CraftsmanshipSection;