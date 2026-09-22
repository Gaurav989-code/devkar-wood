import { motion } from "motion/react";
import { FiFeather, FiPackage, FiShield, FiTool } from "react-icons/fi";

const benefits = [
  {
    icon: FiTool,
    title: "Handcrafted",
    description: "Every piece is shaped and finished by skilled artisans.",
  },
  {
    icon: FiFeather,
    title: "Natural wood",
    description: "Selected for its strength, grain and individual character.",
  },
  {
    icon: FiShield,
    title: "Secure checkout",
    description: "Protected online payments with cash-on-delivery options.",
  },
  {
    icon: FiPackage,
    title: "Careful delivery",
    description: "Thoughtfully packed to protect every handcrafted detail.",
  },
];

const TrustBenefits = () => {
  return (
    <section className="border-y border-[#2A1810]/10 bg-[#F7F0E5] px-5 py-16 sm:px-6 lg:px-10 lg:py-20">
      <div className="mx-auto grid max-w-[1440px] gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
        {benefits.map(({ icon: Icon, title, description }, index) => (
          <motion.article
            key={title}
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
              amount: 0.5,
            }}
            transition={{
              duration: 0.6,
              delay: index * 0.08,
            }}
            className="group flex gap-4 lg:border-r lg:border-[#2A1810]/10 lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#A45A3A]/25 text-[#A45A3A] transition-all duration-300 group-hover:bg-[#A45A3A] group-hover:text-white">
              <Icon size={19} />
            </div>

            <div>
              <h3 className="font-serif text-xl text-[#2A1810]">{title}</h3>

              <p className="mt-2 text-sm leading-6 text-[#6F5A4E]">
                {description}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default TrustBenefits;
