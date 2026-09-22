import { Link } from "react-router-dom";
import { motion } from "motion/react";

const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F0E5] px-6">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#A45A3A]">
          Error 404
        </p>

        <h1 className="mt-4 font-serif text-5xl font-semibold text-[#2A1810]">
          Page not found
        </h1>

        <p className="mt-4 text-[#6F5A4E]">
          The page you are looking for does
          not exist.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-[#2A1810] px-7 py-3 text-sm font-semibold text-[#FFF9EF] transition-colors hover:bg-[#A45A3A]"
        >
          Return home
        </Link>
      </motion.div>
    </main>
  );
};

export default NotFound;