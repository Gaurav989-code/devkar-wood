import express from "express";

import {
  archiveProduct,
  createProduct,
  getAdminProductById,
  getAdminProducts,
  getPublicProductBySlug,
  getPublicProducts,
  updateProduct,
} from "../controllers/productController.js";

import {
  addProductImages,
  removeProductImage,
  setPrimaryProductImage,
} from "../controllers/productImageController.js";

import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";

import { uploadProductImages } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public product catalogue
|--------------------------------------------------------------------------
*/

router.get("/", getPublicProducts);

/*
|--------------------------------------------------------------------------
| Admin product list and details
|--------------------------------------------------------------------------
| These routes must appear before /:slug
*/

router.get("/admin/all", protectAdmin, getAdminProducts);

router.get("/admin/:id", protectAdmin, getAdminProductById);

/*
|--------------------------------------------------------------------------
| Admin product creation
|--------------------------------------------------------------------------
*/

router.post("/", protectAdmin, createProduct);

/*
|--------------------------------------------------------------------------
| Admin product image management
|--------------------------------------------------------------------------
| Keep specific image routes before general /:id routes
*/

router.post("/:id/images", protectAdmin, uploadProductImages, addProductImages);

router.patch("/:id/images/primary", protectAdmin, setPrimaryProductImage);

router.delete("/:id/images", protectAdmin, removeProductImage);

/*
|--------------------------------------------------------------------------
| Admin product update and archive
|--------------------------------------------------------------------------
*/

router.patch("/:id", protectAdmin, updateProduct);

router.delete("/:id", protectAdmin, archiveProduct);

/*
|--------------------------------------------------------------------------
| Public product details
|--------------------------------------------------------------------------
| This dynamic route must remain last
*/

router.get("/:slug", getPublicProductBySlug);

export default router;
