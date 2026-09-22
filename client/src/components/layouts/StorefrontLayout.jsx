import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import AnnouncementBar from "./AnnouncementBar.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const StorefrontLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F0E5]">
      <AnnouncementBar />

      <Navbar />

      <div className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default StorefrontLayout;
