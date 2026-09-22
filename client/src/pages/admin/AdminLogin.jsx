import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
} from "react-icons/fi";

import {
  clearAdminAuthError,
  loginAdmin,
  selectAdminAuthError,
  selectAdminLoginLoading,
} from "../../features/adminAuth/adminAuthSlice.js";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const loginLoading = useSelector(selectAdminLoginLoading);

  const authError = useSelector(selectAdminAuthError);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearAdminAuthError());
  }, [dispatch]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    if (authError) {
      dispatch(clearAdminAuthError());
    }
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      validationErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      validationErrors.password = "Password is required";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loginLoading || !validateForm()) {
      return;
    }

    try {
      await dispatch(
        loginAdmin({
          email: formData.email.trim().toLowerCase(),

          password: formData.password,
        }),
      ).unwrap();

      toast.success("Welcome to Devkar Wood Admin");

      const requestedPath = location.state?.from?.pathname;

      const destination =
        requestedPath?.startsWith("/admin") && requestedPath !== "/admin/login"
          ? requestedPath
          : "/admin/dashboard";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      toast.error(error || "Unable to log in");
    }
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#17100D]">
      {/* Decorative background */}

      <div className="pointer-events-none absolute -left-48 -top-48 h-[500px] w-[500px] rounded-full bg-[#A45A3A]/20 blur-[150px]" />

      <div className="pointer-events-none absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-[#D9B477]/15 blur-[150px]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[1.05fr_0.95fr]">
        {/* Brand panel */}

        <section className="relative hidden overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9B477] transition hover:text-white"
          >
            <FiArrowLeft />
            Return to storefront
          </Link>

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
            className="max-w-xl"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D9B477]/30 bg-[#D9B477]/10 text-[#D9B477]">
              <FiShield size={28} />
            </div>

            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9B477]">
              Devkar Wood Carvings
            </p>

            <h1 className="mt-5 font-serif text-6xl leading-[0.95] text-[#FFF9EF] xl:text-7xl">
              Crafted with care.
              <span className="italic text-[#D9B477]">
                {" "}
                Managed with precision.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-sm leading-7 text-[#BFAF9F]">
              Manage products, orders, inventory, categories and custom-carving
              enquiries from one secure workspace.
            </p>
          </motion.div>

          <p className="text-xs text-[#776A60]">
            © {new Date().getFullYear()} Devkar Wood Carvings
          </p>
        </section>

        {/* Login panel */}

        <section className="flex items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
          <motion.div
            initial={{
              opacity: 0,
              x: 30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full max-w-md"
          >
            <Link
              to="/"
              className="mb-10 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D9B477] lg:hidden"
            >
              <FiArrowLeft />
              Storefront
            </Link>

            <div className="lg:hidden">
              <p className="font-serif text-3xl text-[#FFF9EF]">Devkar</p>

              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.3em] text-[#A45A3A]">
                Wood Carvings
              </p>
            </div>

            <p className="mt-10 text-[10px] font-bold uppercase tracking-[0.24em] text-[#D9B477] lg:mt-0">
              Secure administration
            </p>

            <h2 className="mt-4 font-serif text-4xl text-[#FFF9EF] sm:text-5xl">
              Admin login
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#9F9186]">
              Enter your administrator credentials to continue.
            </p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-[#D8C9B8]">
                  Email address
                </span>

                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D7B6E]" />

                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    className={`h-14 w-full rounded-xl border bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#665A52] ${
                      errors.email
                        ? "border-red-500"
                        : "border-white/10 focus:border-[#D9B477]"
                    }`}
                  />
                </div>

                {errors.email && (
                  <span className="mt-2 block text-xs text-red-400">
                    {errors.email}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-[#D8C9B8]">
                  Password
                </span>

                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D7B6E]" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className={`h-14 w-full rounded-xl border bg-white/5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-[#665A52] ${
                      errors.password
                        ? "border-red-500"
                        : "border-white/10 focus:border-[#D9B477]"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8D7B6E] transition hover:text-[#D9B477]"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {errors.password && (
                  <span className="mt-2 block text-xs text-red-400">
                    {errors.password}
                  </span>
                )}
              </label>

              {authError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#D9B477] px-6 text-xs font-bold uppercase tracking-[0.17em] text-[#21130E] transition hover:bg-[#E9CD98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#21130E]/30 border-t-[#21130E]" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <FiShield />
                    Sign in securely
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-[10px] leading-5 text-[#74675E]">
              This area is restricted to authorized Devkar Wood administrators.
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  );
};

export default AdminLogin;
