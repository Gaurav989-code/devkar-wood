import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import {
  fetchCurrentAdmin,
  selectAdminInitialized,
  selectAdminSessionLoading,
} from "../../features/adminAuth/adminAuthSlice.js";

const AdminAuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const requestStarted = useRef(false);

  const initialized = useSelector(selectAdminInitialized);

  const sessionLoading = useSelector(selectAdminSessionLoading);

  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!isAdminRoute) {
      return;
    }

    if (initialized || sessionLoading || requestStarted.current) {
      return;
    }

    requestStarted.current = true;

    dispatch(fetchCurrentAdmin());
  }, [dispatch, initialized, sessionLoading, isAdminRoute]);

  return children;
};

export default AdminAuthInitializer;
