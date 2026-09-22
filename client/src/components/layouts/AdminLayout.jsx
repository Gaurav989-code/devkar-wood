import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import {
  FiBox,
  FiChevronDown,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiPackage,
  FiSettings,
  FiShoppingBag,
  FiTag,
  FiX,
} from "react-icons/fi";

import {
  logoutAdmin,
  selectAdminLogoutLoading,
  selectCurrentAdmin,
} from "../../features/adminAuth/adminAuthSlice.js";

const navigation = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: FiGrid,
  },
  {
    name: "Products",
    path: "/admin/products",
    icon: FiPackage,
  },
  {
    name: "Categories",
    path: "/admin/categories",
    icon: FiTag,
  },
  {
    name: "Orders",
    path: "/admin/orders",
    icon: FiShoppingBag,
  },
  {
    name: "Enquiries",
    path: "/admin/enquiries",
    icon: FiMessageSquare,
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: FiSettings,
  },
];

const getPageTitle = (pathname) => {
  const matchedItem = navigation.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  );

  return matchedItem?.name || "Administration";
};

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const admin = useSelector(selectCurrentAdmin);

  const logoutLoading = useSelector(selectAdminLogoutLoading);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);

  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    setMobileSidebarOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileSidebarOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileSidebarOpen]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setMobileSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    if (logoutLoading) {
      return;
    }

    try {
      await dispatch(logoutAdmin()).unwrap();

      toast.success("Logged out successfully");

      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      toast.error(error || "Unable to log out");
    }
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-24 items-center border-b border-white/10 px-6">
        <NavLink to="/admin/dashboard" className="block">
          <p className="font-serif text-3xl leading-none text-[#FFF9EF]">
            Devkar
          </p>

          <p className="mt-2 text-[7px] font-bold uppercase tracking-[0.32em] text-[#D9B477]">
            Wood Administration
          </p>
        </NavLink>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-3 text-[9px] font-bold uppercase tracking-[0.22em] text-[#75675E]">
          Management
        </p>

        <div className="mt-4 space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#D9B477] text-[#21130E]"
                      : "text-[#BFAF9F] hover:bg-white/5 hover:text-[#FFF9EF]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? "text-[#21130E]"
                          : "text-[#8C796C] transition group-hover:text-[#D9B477]"
                      }
                    />

                    {item.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#BFAF9F] transition hover:bg-white/5 hover:text-white"
        >
          <FiHome size={18} />
          View storefront
        </a>

        <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#A45A3A] font-serif text-lg text-white">
            {admin?.avatar?.url ? (
              <img
                src={admin.avatar.url}
                alt={admin.name}
                className="h-full w-full object-cover"
              />
            ) : (
              admin?.name?.charAt(0)?.toUpperCase() || "A"
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#FFF9EF]">
              {admin?.name || "Administrator"}
            </p>

            <p className="truncate text-[10px] text-[#8C796C]">
              {admin?.email}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      {/* Desktop sidebar */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-[#1D120E] lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close admin navigation"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-[#100906]/60 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
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
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="fixed inset-y-0 left-0 z-[60] flex w-[86%] max-w-72 flex-col bg-[#1D120E] shadow-2xl lg:hidden"
            >
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close admin menu"
                className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[#FFF9EF]"
              >
                <FiX size={20} />
              </button>

              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main admin area */}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#2A1810]/10 bg-[#FFF9EF]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open admin navigation"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#2A1810]/10 text-[#2A1810] lg:hidden"
            >
              <FiMenu size={21} />
            </button>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#A45A3A]">
                Admin workspace
              </p>

              <h1 className="mt-1 font-serif text-2xl text-[#2A1810]">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((current) => !current)}
              aria-expanded={profileMenuOpen}
              className="flex items-center gap-3 rounded-full border border-[#2A1810]/10 bg-white py-1.5 pl-1.5 pr-3 transition hover:border-[#A45A3A]/40"
            >
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#A45A3A] font-serif text-white">
                {admin?.avatar?.url ? (
                  <img
                    src={admin.avatar.url}
                    alt={admin.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  admin?.name?.charAt(0)?.toUpperCase() || "A"
                )}
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-32 truncate text-xs font-semibold text-[#2A1810]">
                  {admin?.name}
                </p>

                <p className="text-[9px] capitalize text-[#8A7568]">
                  {admin?.role || "admin"}
                </p>
              </div>

              <FiChevronDown
                className={`text-[#8A7568] transition ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -8,
                    scale: 0.97,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                    scale: 0.97,
                  }}
                  className="absolute right-0 top-[calc(100%+12px)] w-64 overflow-hidden rounded-2xl border border-[#2A1810]/10 bg-[#FFF9EF] p-2 shadow-[0_18px_50px_rgba(42,24,16,0.16)]"
                >
                  <div className="border-b border-[#2A1810]/10 px-3 py-3">
                    <p className="truncate text-sm font-semibold text-[#2A1810]">
                      {admin?.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#7A675C]">
                      {admin?.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <FiLogOut />

                    {logoutLoading ? "Logging out..." : "Logout"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="min-h-[calc(100vh-80px)]">
          <motion.div
            key={location.pathname}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
            }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
