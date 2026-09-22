import { Link } from "react-router-dom";

const Logo = ({ light = false }) => {
  return (
    <Link
      to="/"
      aria-label="Devkar Wood Carvings home"
      className="group inline-flex flex-col"
    >
      <span
        className={`font-serif text-2xl font-semibold leading-none tracking-tight sm:text-3xl ${
          light ? "text-[#FFF9EF]" : "text-[#2A1810]"
        }`}
      >
        Devkar
      </span>

      <span
        className={`mt-1 text-[9px] font-semibold uppercase tracking-[0.28em] ${
          light ? "text-[#D9B477]" : "text-[#A45A3A]"
        }`}
      >
        Wood Carvings
      </span>
    </Link>
  );
};

export default Logo;
