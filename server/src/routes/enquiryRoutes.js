import express from "express";

import {
  createGuestEnquiry,
  trackGuestEnquiry,
} from "../controllers/enquiryController.js";

import {
  getAdminEnquiries,
  getAdminEnquiryById,
  updateEnquiryAdminNote,
  updateEnquiryCustomer,
  updateEnquiryQuote,
  updateEnquiryStatus,
} from "../controllers/adminEnquiryController.js";

import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";

import { uploadEnquiryImages } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public guest routes
|--------------------------------------------------------------------------
*/

router.post("/", uploadEnquiryImages, createGuestEnquiry);

router.post("/track", trackGuestEnquiry);

/*
|--------------------------------------------------------------------------
| Protected admin routes
|--------------------------------------------------------------------------
| Keep these before any future dynamic public route
|--------------------------------------------------------------------------
*/

router.get("/admin/all", protectAdmin, getAdminEnquiries);

router.get("/admin/:id", protectAdmin, getAdminEnquiryById);

router.patch("/admin/:id/status", protectAdmin, updateEnquiryStatus);

router.patch("/admin/:id/quote", protectAdmin, updateEnquiryQuote);

router.patch("/admin/:id/note", protectAdmin, updateEnquiryAdminNote);

router.patch("/admin/:id/customer", protectAdmin, updateEnquiryCustomer);

export default router;
