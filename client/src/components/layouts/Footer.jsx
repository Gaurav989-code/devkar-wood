import { Link } from "react-router-dom";
import { FiInstagram, FiMail, FiMapPin, FiMessageCircle } from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#21130E] text-[#EADCC8]">
      <div className="mx-auto grid max-w-360 gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-10 lg:py-20">
        {/* Brand information */}

        <div>
          <Link
            to="/"
            aria-label="Go to Devkar Wood Carvings homepage"
            className="inline-flex"
          >
            <img
              src="/brand/devkar-logo.png"
              alt="Devkar Wood Carvings"
              width="240"
              height="120"
              loading="lazy"
              className="h-auto w-52 object-contain object-left sm:w-56"
            />
          </Link>

          <p className="mt-6 max-w-xs text-sm leading-7 text-[#C8B6A3]">
            Timeless wooden carvings created by skilled Indian artisans for
            beautiful and meaningful spaces.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Devkar Wood Carvings on Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EADCC8]/20 transition duration-300 hover:border-[#D9B477] hover:bg-[#D9B477] hover:text-[#21130E]"
            >
              <FiInstagram size={17} />
            </a>

            <a
              href="https://wa.me/919689839561"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact Devkar Wood Carvings on WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EADCC8]/20 transition duration-300 hover:border-[#D9B477] hover:bg-[#D9B477] hover:text-[#21130E]"
            >
              <FiMessageCircle size={17} />
            </a>
          </div>
        </div>

        {/* Explore links */}

        <div>
          <h3 className="font-serif text-xl text-[#FFF9EF]">Explore</h3>

          <div className="mt-6 flex flex-col items-start gap-4 text-sm text-[#C8B6A3]">
            <Link
              to="/collections"
              className="transition duration-300 hover:translate-x-1 hover:text-[#D9B477]"
            >
              Collections
            </Link>

            <Link
              to="/products"
              className="transition duration-300 hover:translate-x-1 hover:text-[#D9B477]"
            >
              Shop all
            </Link>

            <Link
              to="/about"
              className="transition duration-300 hover:translate-x-1 hover:text-[#D9B477]"
            >
              Our story
            </Link>

            <Link
              to="/contact"
              className="transition duration-300 hover:translate-x-1 hover:text-[#D9B477]"
            >
              Custom carving
            </Link>
          </div>
        </div>

        {/* Customer care links */}

        <div>
          <h3 className="font-serif text-xl text-[#FFF9EF]">Customer care</h3>

          <div className="mt-6 flex flex-col items-start gap-4 text-sm text-[#C8B6A3]">
            <Link
              to="/track-order"
              className="transition duration-300 hover:translate-x-1 hover:text-[#D9B477]"
            >
              Track order
            </Link>

            <Link
              to="/my-orders"
              className="transition duration-300 hover:translate-x-1 hover:text-[#D9B477]"
            >
              My orders
            </Link>

            <Link
              to="/track-enquiry"
              className="transition duration-300 hover:translate-x-1 hover:text-[#D9B477]"
            >
              Track custom enquiry
            </Link>

            <Link
              to="/shipping"
              className="transition duration-300 hover:translate-x-1 hover:text-[#D9B477]"
            >
              Shipping and returns
            </Link>

            <Link
              to="/care-guide"
              className="transition duration-300 hover:translate-x-1 hover:text-[#D9B477]"
            >
              Wood care guide
            </Link>

            <Link
              to="/faq"
              className="transition duration-300 hover:translate-x-1 hover:text-[#D9B477]"
            >
              Frequently asked questions
            </Link>
          </div>
        </div>

        {/* Contact information */}

        <div>
          <h3 className="font-serif text-xl text-[#FFF9EF]">Contact</h3>

          <div className="mt-6 space-y-5 text-sm text-[#C8B6A3]">
            <p className="flex items-start gap-3">
              <FiMapPin className="mt-1 shrink-0 text-[#D9B477]" />

              <span>Sangamner, Maharashtra, India</span>
            </p>

            <a
              href="mailto:hello@devkarwood.com"
              className="flex items-center gap-3 transition duration-300 hover:text-[#D9B477]"
            >
              <FiMail className="shrink-0 text-[#D9B477]" />

              <span className="break-all">hello@devkarwood.com</span>
            </a>

            <a
              href="https://wa.me/919689839561"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 transition duration-300 hover:text-[#D9B477]"
            >
              <FiMessageCircle className="shrink-0 text-[#D9B477]" />
              WhatsApp support
            </a>
          </div>
        </div>
      </div>

      {/* Bottom footer */}

      <div className="border-t border-[#FFF9EF]/10">
        <div className="mx-auto flex max-w-360 flex-col gap-4 px-6 py-6 text-xs text-[#9F8C7A] lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {currentYear} <Link to="/admin/dashboard"> Devkar</Link> Wood
              Carvings. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                to="/privacy"
                className="transition duration-300 hover:text-[#D9B477]"
              >
                Privacy
              </Link>

              <Link
                to="/terms"
                className="transition duration-300 hover:text-[#D9B477]"
              >
                Terms
              </Link>
            </div>
          </div>

          <div className="border-t border-[#FFF9EF]/10 pt-4 text-center sm:text-left">
            <p>
              Designed and developed by{" "}
              <a
                href="https://gtech-solutions.onrender.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#D9B477] transition duration-300 hover:text-[#FFF9EF] hover:underline hover:underline-offset-4"
              >
                GTech Solutions Pvt Ltd
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
