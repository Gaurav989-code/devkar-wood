import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  FiHeart,
  FiMenu,
  FiPackage,
  FiSearch,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";
import { useSelector } from "react-redux";

import Logo from "../common/Logo.jsx";

import { selectCartItemCount } from "../../features/cart/cartSlice.js";

import { selectWishlistItemCount } from "../../features/wishlist/wishlistSlice.js";

const navigation = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Collections",
    path: "/collections",
  },
  {
    name: "Shop",
    path: "/products",
  },
  {
    name: "About",
    path: "/about",
  },
  {
    name: "Contact",
    path: "/contact",
  },
  {
    name: "Track Order",
    path: "/track-order",
  },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();

  const cartItemCount = useSelector(selectCartItemCount);
  const wishlistItemCount = useSelector(selectWishlistItemCount);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Close mobile menu after route change
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  /*
  |--------------------------------------------------------------------------
  | Lock body scroll while mobile menu is open
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  /*
  |--------------------------------------------------------------------------
  | Close mobile menu with Escape key
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const getDesktopLinkClass = ({ isActive }) => {
    return [
      "relative py-3 text-xs font-semibold uppercase",
      "tracking-[0.16em] transition-colors duration-300",
      "after:absolute after:bottom-1 after:left-0",
      "after:h-px after:bg-[#A45A3A]",
      "after:transition-all after:duration-300",
      isActive
        ? "text-[#A45A3A] after:w-full"
        : "text-[#4C382E] after:w-0 hover:text-[#A45A3A] hover:after:w-full",
    ].join(" ");
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#2A1810]/10 bg-[#F7F0E5]/90 shadow-[0_8px_30px_rgba(42,24,16,0.04)] backdrop-blur-xl">
        <div className="mx-auto grid h-[76px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:h-[86px] lg:px-10">
          {/* Mobile menu button */}

          <div className="flex items-center justify-start lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[#2A1810] transition-colors duration-300 hover:bg-[#2A1810]/5"
            >
              <FiMenu size={23} />
            </button>
          </div>

          {/* Desktop left navigation */}

          <nav className="hidden items-center justify-start gap-6 lg:flex xl:gap-9">
            {navigation.slice(0, 3).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={getDesktopLinkClass}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Center logo */}

          <div className="flex items-center justify-center">
            <Logo />
          </div>

          {/* Desktop right navigation and actions */}

          <div className="flex items-center justify-end">
            <nav className="hidden items-center gap-6 lg:flex xl:gap-9">
              {navigation.slice(3).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={getDesktopLinkClass}
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-0.5 sm:gap-1 lg:ml-6">
              {/* Search */}

              <NavLink
                to="/products"
                aria-label="Search products"
                className="hidden h-11 w-11 items-center justify-center rounded-full text-[#2A1810] transition-colors duration-300 hover:bg-[#2A1810]/5 hover:text-[#A45A3A] sm:flex"
              >
                <FiSearch size={19} />
              </NavLink>

              {/* Wishlist */}

              <NavLink
                to="/wishlist"
                aria-label={`Open wishlist with ${wishlistItemCount} items`}
                className={({ isActive }) =>
                  `relative hidden h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 sm:flex ${
                    isActive || wishlistItemCount > 0
                      ? "text-[#A45A3A]"
                      : "text-[#2A1810] hover:bg-[#2A1810]/5 hover:text-[#A45A3A]"
                  }`
                }
              >
                <FiHeart
                  size={19}
                  fill={wishlistItemCount > 0 ? "currentColor" : "none"}
                />

                <AnimatePresence mode="popLayout">
                  {wishlistItemCount > 0 && (
                    <motion.span
                      key={wishlistItemCount}
                      initial={{
                        opacity: 0,
                        scale: 0,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 22,
                      }}
                      className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#A45A3A] px-1 text-[9px] font-bold leading-none text-white"
                    >
                      {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>

              {/* Cart */}

              <NavLink
                to="/cart"
                aria-label={`Open shopping cart with ${cartItemCount} items`}
                className={({ isActive }) =>
                  `relative flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 ${
                    isActive
                      ? "text-[#A45A3A]"
                      : "text-[#2A1810] hover:bg-[#2A1810]/5 hover:text-[#A45A3A]"
                  }`
                }
              >
                <FiShoppingBag size={20} />

                <AnimatePresence mode="popLayout">
                  {cartItemCount > 0 && (
                    <motion.span
                      key={cartItemCount}
                      initial={{
                        opacity: 0,
                        scale: 0,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 22,
                      }}
                      className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#A45A3A] px-1 text-[9px] font-bold leading-none text-white"
                    >
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close mobile navigation"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
              }}
              onClick={closeMobileMenu}
              className="fixed inset-0 z-[60] cursor-default bg-[#160C08]/55 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              id="mobile-navigation"
              initial={{
                x: "-100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "-100%",
              }}
              transition={{
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="fixed inset-y-0 left-0 z-[70] flex w-[86%] max-w-sm flex-col overflow-y-auto bg-[#F7F0E5] p-6 shadow-[20px_0_60px_rgba(22,12,8,0.22)] lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-[#2A1810]/10 pb-5">
                <Logo />

                <button
                  type="button"
                  onClick={closeMobileMenu}
                  aria-label="Close navigation menu"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[#2A1810] transition-colors duration-300 hover:bg-[#2A1810]/5 hover:text-[#A45A3A]"
                >
                  <FiX size={23} />
                </button>
              </div>

              <nav className="mt-7 flex flex-col">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{
                      opacity: 0,
                      x: -24,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.45,
                      delay: 0.08 + index * 0.05,
                    }}
                  >
                    <NavLink
                      to={item.path}
                      end={item.path === "/"}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center justify-between border-b border-[#2A1810]/10 py-5 font-serif text-2xl transition-colors duration-300 ${
                          isActive
                            ? "text-[#A45A3A]"
                            : "text-[#2A1810] hover:text-[#A45A3A]"
                        }`
                      }
                    >
                      <span className="flex items-center gap-3">
                        {item.path === "/track-order" && (
                          <FiPackage className="text-lg" />
                        )}

                        {item.name}
                      </span>

                      <span className="font-sans text-sm text-[#A45A3A]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile-only actions */}

              <div className="mt-8 grid grid-cols-2 gap-3 sm:hidden">
                <NavLink
                  to="/products"
                  onClick={closeMobileMenu}
                  aria-label="Search products"
                  className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#2A1810]/15 text-sm font-semibold text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A]"
                >
                  <FiSearch />
                  Search
                </NavLink>

                <NavLink
                  to="/wishlist"
                  onClick={closeMobileMenu}
                  aria-label={`Open wishlist with ${wishlistItemCount} items`}
                  className={({ isActive }) =>
                    `relative flex h-11 items-center justify-center gap-2 rounded-full border text-sm font-semibold transition ${
                      isActive || wishlistItemCount > 0
                        ? "border-[#A45A3A] text-[#A45A3A]"
                        : "border-[#2A1810]/15 text-[#2A1810] hover:border-[#A45A3A] hover:text-[#A45A3A]"
                    }`
                  }
                >
                  <FiHeart
                    fill={wishlistItemCount > 0 ? "currentColor" : "none"}
                  />
                  Wishlist
                  {wishlistItemCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#A45A3A] px-1 text-[9px] font-bold text-white">
                      {wishlistItemCount > 99 ? "99+" : wishlistItemCount}
                    </span>
                  )}
                </NavLink>
              </div>

              <div className="mt-auto border-t border-[#2A1810]/10 pt-6">
                <NavLink
                  to="/track-order"
                  onClick={closeMobileMenu}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#A45A3A] transition hover:text-[#7D422B]"
                >
                  <FiPackage size={16} />
                  Track your order
                </NavLink>

                <p className="mt-4 max-w-xs text-sm leading-6 text-[#6F5A4E]">
                  Handcrafted wooden artistry shaped by Indian tradition.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
