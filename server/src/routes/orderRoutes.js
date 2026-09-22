import express from "express";

import {
  createGuestOrder,
  trackGuestOrder,
} from "../controllers/orderController.js";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/razorpayOrderController.js";

import {
  getAdminOrderById,
  getAdminOrders,
  updateOrderStatus,
  updateOrderTracking,
} from "../controllers/adminOrderController.js";

import { validateGuestOrder } from "../middlewares/orderValidationMiddleware.js";
import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin routes
|--------------------------------------------------------------------------
| Keep admin routes before routes containing dynamic parameters.
*/

router.get("/admin/all", protectAdmin, getAdminOrders);

router.get("/admin/:id", protectAdmin, getAdminOrderById);

router.patch("/admin/:id/status", protectAdmin, updateOrderStatus);

router.patch("/admin/:id/tracking", protectAdmin, updateOrderTracking);

/*
|--------------------------------------------------------------------------
| Public Razorpay routes
|--------------------------------------------------------------------------
*/

router.post("/razorpay/create", validateGuestOrder, createRazorpayOrder);

router.post("/razorpay/verify", verifyRazorpayPayment);

/*
|--------------------------------------------------------------------------
| Public guest-checkout route
|--------------------------------------------------------------------------
*/

router.post("/track", trackGuestOrder);

router.post("/", validateGuestOrder, createGuestOrder);

export default router;
