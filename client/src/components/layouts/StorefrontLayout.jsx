import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import AnnouncementBar from "./AnnouncementBar.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import ScrollToTop from "../common/ScrollToTop.jsx";

const StorefrontLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#F7F0E5]">
      {/* Reset the page position whenever the route changes */}
      <ScrollToTop />

      <AnnouncementBar />

      <Navbar />

      <main className="min-w-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            className="min-h-full w-full"
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
      </main>

      <Footer />
    </div>
  );
};

export default StorefrontLayout;
