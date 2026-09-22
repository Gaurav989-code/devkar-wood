import express from "express";

import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
} from "../controllers/adminAuthController.js";

import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);

router.get("/me", protectAdmin, getCurrentAdmin);

router.post("/logout", protectAdmin, logoutAdmin);

export default router;
