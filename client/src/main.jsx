import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { MotionConfig } from "motion/react";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import { store } from "./app/store.js";
import SmoothScroll from "./components/common/SmoothScroll.jsx";
import AdminAuthInitializer from "./components/admin/AdminAuthInitializer.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AdminAuthInitializer>
          <MotionConfig
            reducedMotion="user"
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <SmoothScroll>
              <App />
            </SmoothScroll>
          </MotionConfig>
        </AdminAuthInitializer>

        <Toaster position="top-right" />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
