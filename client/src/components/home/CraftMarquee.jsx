import {
  FiAward,
  FiBox,
  FiFeather,
  FiHeart,
  FiStar,
  FiTool,
} from "react-icons/fi";

const marqueeItems = [
  {
    text: "Devkar Wood Carvings",
    icon: FiAward,
  },
  {
    text: "Handcrafted in India",
    icon: FiTool,
  },
  {
    text: "Made by Skilled Artisans",
    icon: FiFeather,
  },
  {
    text: "Natural Solid Wood",
    icon: FiBox,
  },
  {
    text: "Crafted with Patience",
    icon: FiHeart,
  },
  {
    text: "Designed to Become an Heirloom",
    icon: FiStar,
  },
];

const MarqueeGroup = ({ hidden = false }) => {
  return (
    <div aria-hidden={hidden} className="flex shrink-0 items-center">
      {marqueeItems.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={`${hidden ? "copy" : "original"}-${item.text}`}
            className="flex shrink-0 items-center"
          >
            <div className="flex shrink-0 items-center gap-4 px-7 sm:px-10 lg:px-12">
              <Icon
                aria-hidden="true"
                size={17}
                className="shrink-0 text-[#D9B477]"
              />

              <span className="whitespace-nowrap font-serif text-lg italic tracking-wide text-[#FFF9EF] sm:text-xl lg:text-2xl">
                {item.text}
              </span>
            </div>

            {/* Small Devkar logo between items */}

            <div
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D9B477]/30 bg-[#FFF9EF]/5 p-1.5"
            >
              <img
                src="/brand/devkar-logo.png"
                alt=""
                width="32"
                height="32"
                draggable="false"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CraftMarquee = () => {
  return (
    <section
      aria-label="Devkar Wood Carvings craftsmanship highlights"
      className="relative w-full overflow-hidden border-y border-[#D9B477]/20 bg-[#21130E]"
    >
      {/* Left fade */}

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-linear-to-r from-[#21130E] to-transparent sm:w-28" />

      {/* Right fade */}

      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-linear-to-l from-[#21130E] to-transparent sm:w-28" />

      {/* Background glow */}

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A45A3A]/10 blur-3xl" />

      <div className="relative py-5 sm:py-6">
        <div className="devkar-marquee-track flex w-max items-center">
          <MarqueeGroup />

          <MarqueeGroup hidden />
        </div>
      </div>
    </section>
  );
};

export default CraftMarquee;
