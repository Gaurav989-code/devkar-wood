import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  selectAdminAuthenticated,
  selectAdminInitialized,
  selectAdminSessionLoading,
} from "../../features/adminAuth/adminAuthSlice.js";

const AdminGuestRoute = () => {
  const authenticated = useSelector(selectAdminAuthenticated);

  const initialized = useSelector(selectAdminInitialized);

  const sessionLoading = useSelector(selectAdminSessionLoading);

  if (!initialized || sessionLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#17100D]">
        <div className="text-center">
          <span className="mx-auto block h-11 w-11 animate-spin rounded-full border-2 border-[#D9B477]/20 border-t-[#D9B477]" />

          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D9B477]">
            Loading
          </p>
        </div>
      </main>
    );
  }

  if (authenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default AdminGuestRoute;
