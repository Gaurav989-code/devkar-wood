import { motion } from "motion/react";

const AnnouncementBar = () => {
  return (
    <div className="overflow-hidden bg-[#2A1810] px-4 py-2.5 text-center text-[#FFF9EF]">
      <motion.p
        initial={{
          opacity: 0,
          y: -8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="text-[10px] font-medium uppercase tracking-[0.2em] sm:text-xs"
      >
        Complimentary shipping on selected handcrafted pieces
      </motion.p>
    </div>
  );
};

export default AnnouncementBar;
