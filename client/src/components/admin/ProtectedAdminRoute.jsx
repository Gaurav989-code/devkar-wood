import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";

import { useSelector } from "react-redux";

import {
  selectAdminAuthenticated,
  selectAdminInitialized,
  selectAdminSessionLoading,
} from "../../features/adminAuth/adminAuthSlice.js";

const AdminLoadingScreen = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#17100D] px-5">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="text-center"
      >
        <div className="relative mx-auto h-14 w-14">
          <div className="absolute inset-0 rounded-full border-2 border-[#D9B477]/20" />

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#D9B477]"
          />
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#D9B477]">
          Verifying admin session
        </p>
      </motion.div>
    </main>
  );
};

const ProtectedAdminRoute = () => {
  const location = useLocation();

  const authenticated = useSelector(selectAdminAuthenticated);

  const initialized = useSelector(selectAdminInitialized);

  const sessionLoading = useSelector(selectAdminSessionLoading);

  if (!initialized || sessionLoading) {
    return <AdminLoadingScreen />;
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
