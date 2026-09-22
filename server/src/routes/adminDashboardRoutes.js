import express from "express";

import { getAdminDashboard } from "../controllers/adminDashboardController.js";

import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.get("/", protectAdmin, getAdminDashboard);

export default router;
