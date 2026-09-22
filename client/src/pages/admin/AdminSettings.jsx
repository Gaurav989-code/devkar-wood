import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiCheckCircle,
  FiCreditCard,
  FiDatabase,
  FiExternalLink,
  FiGlobe,
  FiImage,
  FiLock,
  FiLogOut,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiServer,
  FiShield,
  FiUser,
} from "react-icons/fi";

import {
  fetchCurrentAdmin,
  logoutAdmin,
  selectAdminAuthenticated,
  selectAdminLogoutLoading,
  selectAdminSessionLoading,
  selectCurrentAdmin,
} from "../../features/adminAuth/adminAuthSlice.js";

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
};

const AdminSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const admin = useSelector(selectCurrentAdmin);

  const authenticated = useSelector(selectAdminAuthenticated);

  const sessionLoading = useSelector(selectAdminSessionLoading);

  const logoutLoading = useSelector(selectAdminLogoutLoading);

  /*
  |--------------------------------------------------------------------------
  | Refresh admin session
  |--------------------------------------------------------------------------
  */

  const handleRefreshSession = async () => {
    if (sessionLoading) {
      return;
    }

    try {
      await dispatch(fetchCurrentAdmin()).unwrap();

      toast.success("Admin session refreshed");
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to refresh admin session",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

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
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to log out",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Admin initials
  |--------------------------------------------------------------------------
  */

  const adminInitials =
    admin?.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
    <main className="py-4">
      {/* Page heading */}

      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A45A3A]">
          Administration
        </p>

        <h1 className="mt-2 font-serif text-4xl text-[#2A1810] sm:text-5xl">
          Settings
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756157]">
          Review your administrator account, authentication session and
          application configuration.
        </p>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Admin profile */}

          <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 shadow-[0_16px_45px_rgba(42,24,16,0.04)] sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2A1810] font-serif text-3xl text-[#D9B477]">
                {admin?.avatar?.url ? (
                  <img
                    src={admin.avatar.url}
                    alt={admin.name || "Administrator"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  adminInitials
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-serif text-3xl text-[#2A1810]">
                    {admin?.name || "Administrator"}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] ${
                      admin?.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {admin?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#A45A3A]">
                  {admin?.role || "Admin"}
                </p>

                <p className="mt-3 text-sm text-[#756157]">
                  Administrator account for Devkar Wood Carvings.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#2A1810]/10 bg-[#FAF6EF] p-5">
                <div className="flex items-center gap-3">
                  <FiMail className="text-[#A45A3A]" />

                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7569]">
                    Email
                  </p>
                </div>

                <p className="mt-3 break-all text-sm font-semibold text-[#2A1810]">
                  {admin?.email || "Not available"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#2A1810]/10 bg-[#FAF6EF] p-5">
                <div className="flex items-center gap-3">
                  <FiPhone className="text-[#A45A3A]" />

                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7569]">
                    Phone
                  </p>
                </div>

                <p className="mt-3 text-sm font-semibold text-[#2A1810]">
                  {admin?.phone || "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#2A1810]/10 bg-[#FAF6EF] p-5">
                <div className="flex items-center gap-3">
                  <FiRefreshCw className="text-[#A45A3A]" />

                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7569]">
                    Last login
                  </p>
                </div>

                <p className="mt-3 text-sm font-semibold text-[#2A1810]">
                  {formatDate(admin?.lastLoginAt)}
                </p>
              </div>

              <div className="rounded-2xl border border-[#2A1810]/10 bg-[#FAF6EF] p-5">
                <div className="flex items-center gap-3">
                  <FiUser className="text-[#A45A3A]" />

                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7569]">
                    Account created
                  </p>
                </div>

                <p className="mt-3 text-sm font-semibold text-[#2A1810]">
                  {formatDate(admin?.createdAt)}
                </p>
              </div>
            </div>
          </section>

          {/* Application configuration */}

          <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 shadow-[0_16px_45px_rgba(42,24,16,0.04)] sm:p-8">
            <div className="flex items-center gap-3">
              <FiServer className="text-[#A45A3A]" />

              <h2 className="font-serif text-3xl text-[#2A1810]">
                Application
              </h2>
            </div>

            <div className="mt-7 divide-y divide-[#2A1810]/10 border-y border-[#2A1810]/10">
              <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2A1810]">
                    Storefront
                  </p>

                  <p className="mt-1 text-xs text-[#756157]">
                    Open the customer-facing storefront.
                  </p>
                </div>

                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.13em] text-[#A45A3A]"
                >
                  Open storefront
                  <FiExternalLink />
                </a>
              </div>

              <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2A1810]">
                    Environment
                  </p>

                  <p className="mt-1 text-xs text-[#756157]">
                    Current frontend application mode.
                  </p>
                </div>

                <span className="rounded-full bg-[#F4ECE0] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#5F4A3F]">
                  {import.meta.env.MODE}
                </span>
              </div>

              <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2A1810]">
                    API server
                  </p>

                  <p className="mt-1 break-all text-xs text-[#756157]">
                    {import.meta.env.VITE_API_URL ||
                      "Configured through the Axios API client"}
                  </p>
                </div>

                <span className="inline-flex shrink-0 items-center gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                  <FiCheckCircle />
                  Configured
                </span>
              </div>
            </div>
          </section>

          {/* Integrations */}

          {/* <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 shadow-[0_16px_45px_rgba(42,24,16,0.04)] sm:p-8">
            <div className="flex items-center gap-3">
              <FiGlobe className="text-[#A45A3A]" />

              <h2 className="font-serif text-3xl text-[#2A1810]">
                Integrations
              </h2>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: FiDatabase,
                  name: "MongoDB",
                  description: "Products, categories, orders and enquiries.",
                },
                {
                  icon: FiImage,
                  name: "ImageKit",
                  description: "Product, category and enquiry images.",
                },
                {
                  icon: FiCreditCard,
                  name: "Razorpay",
                  description: "Secure customer online payments.",
                },
              ].map((integration) => {
                const Icon = integration.icon;

                return (
                  <div
                    key={integration.name}
                    className="rounded-2xl border border-[#2A1810]/10 bg-[#FAF6EF] p-5"
                  >
                    <Icon className="text-[#A45A3A]" />

                    <p className="mt-4 text-sm font-semibold text-[#2A1810]">
                      {integration.name}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#756157]">
                      {integration.description}
                    </p>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                      <FiCheckCircle />
                      Server integration
                    </span>
                  </div>
                );
              })}
            </div>
          </section> */}
        </div>

        {/* Sidebar */}

        <aside className="space-y-6">
          {/* Session information */}

          <section className="rounded-[1.75rem] bg-[#21130E] p-6 text-[#FFF9EF]">
            <FiShield size={25} className="text-[#D9B477]" />

            <h2 className="mt-5 font-serif text-3xl">Admin session</h2>

            <p className="mt-3 text-sm leading-7 text-[#C8B6A3]">
              Your authentication is protected by a secure, HTTP-only admin
              cookie.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                <span className="text-xs text-[#C8B6A3]">Authentication</span>

                <span
                  className={`text-[9px] font-bold uppercase tracking-[0.12em] ${
                    authenticated ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {authenticated ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                <span className="text-xs text-[#C8B6A3]">Account</span>

                <span
                  className={`text-[9px] font-bold uppercase tracking-[0.12em] ${
                    admin?.isActive ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {admin?.isActive ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefreshSession}
              disabled={sessionLoading}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#D9B477] px-5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#21130E] transition hover:bg-[#E7C98F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw className={sessionLoading ? "animate-spin" : ""} />

              {sessionLoading ? "Refreshing..." : "Refresh session"}
            </button>
          </section>

          {/* Security */}

          <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6">
            <div className="flex items-center gap-3">
              <FiLock className="text-[#A45A3A]" />

              <h2 className="font-serif text-2xl text-[#2A1810]">Security</h2>
            </div>

            <ul className="mt-5 space-y-4">
              {[
                "Authentication cookie is HTTP-only.",
                "Protected API routes verify the admin token.",
                "Password changes invalidate older sessions.",
                "Inactive administrators cannot access the dashboard.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-xs leading-5 text-[#756157]"
                >
                  <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Logout */}

          <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6">
            <h2 className="font-serif text-2xl text-red-800">End session</h2>

            <p className="mt-3 text-xs leading-6 text-red-700">
              Log out when you finish managing the store, especially when using
              a shared device.
            </p>

            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-red-600 px-5 text-[9px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {logoutLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Logging out...
                </>
              ) : (
                <>
                  <FiLogOut />
                  Log out
                </>
              )}
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
};

export default AdminSettings;
