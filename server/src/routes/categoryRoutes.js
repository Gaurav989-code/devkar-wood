import express from "express";

import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getCategoryBySlug,
  getPublicCategories,
  updateCategory,
} from "../controllers/categoryController.js";

import {
  removeCategoryCoverImage,
  uploadCategoryCoverImage,
} from "../controllers/categoryImageController.js";

import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";

import { uploadCategoryImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

router.get("/", getPublicCategories);

/*
|--------------------------------------------------------------------------
| Admin routes
|--------------------------------------------------------------------------
| Keep admin routes before /:slug
|--------------------------------------------------------------------------
*/

router.get("/admin/all", protectAdmin, getAdminCategories);

router.post("/", protectAdmin, createCategory);

router.patch("/:id", protectAdmin, updateCategory);

router.delete("/:id", protectAdmin, deleteCategory);

router.post(
  "/:id/image",
  protectAdmin,
  uploadCategoryImage,
  uploadCategoryCoverImage,
);

router.delete("/:id/image", protectAdmin, removeCategoryCoverImage);

/*
|--------------------------------------------------------------------------
| Dynamic public route
|--------------------------------------------------------------------------
*/

router.get("/:slug", getCategoryBySlug);

export default router;
