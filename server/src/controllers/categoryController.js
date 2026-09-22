import Category from "../models/Category.js";
import Product from "../models/Product.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/*
|--------------------------------------------------------------------------
| Get active categories
|--------------------------------------------------------------------------
| GET /api/v1/categories
| Public
*/

export const getPublicCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    isActive: true,
  }).sort({
    displayOrder: 1,
    name: 1,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        categories,
        count: categories.length,
      },
      "Categories fetched successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Get one active category by slug
|--------------------------------------------------------------------------
| GET /api/v1/categories/:slug
| Public
*/

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const slug = req.params.slug.trim().toLowerCase();

  const category = await Category.findOne({
    slug,
    isActive: true,
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        category,
      },
      "Category fetched successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Get all categories for admin
|--------------------------------------------------------------------------
| GET /api/v1/categories/admin/all
| Admin only
*/

export const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({
    displayOrder: 1,
    createdAt: -1,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        categories,
        count: categories.length,
      },
      "Admin categories fetched successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Create category
|--------------------------------------------------------------------------
| POST /api/v1/categories
| Admin only
*/

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, isActive, isFeatured, displayOrder } =
    req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, "Category name is required");
  }

  const normalizedName = name.trim();

  const existingCategory = await Category.findOne({
    name: {
      $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, "i"),
    },
  });

  if (existingCategory) {
    throw new ApiError(409, "A category with this name already exists");
  }

  const category = await Category.create({
    name: normalizedName,
    description: typeof description === "string" ? description.trim() : "",

    image: {
      publicId:
        typeof image?.publicId === "string" ? image.publicId.trim() : "",

      url: typeof image?.url === "string" ? image.url.trim() : "",

      altText:
        typeof image?.altText === "string"
          ? image.altText.trim()
          : normalizedName,
    },

    isActive: typeof isActive === "boolean" ? isActive : true,

    isFeatured: typeof isFeatured === "boolean" ? isFeatured : false,

    displayOrder: Number.isFinite(Number(displayOrder))
      ? Number(displayOrder)
      : 0,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        category,
      },
      "Category created successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Update category
|--------------------------------------------------------------------------
| PATCH /api/v1/categories/:id
| Admin only
*/

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const { name, description, image, isActive, isFeatured, displayOrder } =
    req.body;

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      throw new ApiError(400, "Category name cannot be empty");
    }

    const normalizedName = name.trim();

    const duplicateCategory = await Category.findOne({
      _id: {
        $ne: category._id,
      },

      name: {
        $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, "i"),
      },
    });

    if (duplicateCategory) {
      throw new ApiError(409, "A category with this name already exists");
    }

    category.name = normalizedName;
  }

  if (description !== undefined) {
    category.description =
      typeof description === "string" ? description.trim() : "";
  }

  if (image !== undefined) {
    category.image = {
      publicId:
        typeof image?.publicId === "string"
          ? image.publicId.trim()
          : category.image?.publicId || "",

      url:
        typeof image?.url === "string"
          ? image.url.trim()
          : category.image?.url || "",

      altText:
        typeof image?.altText === "string"
          ? image.altText.trim()
          : category.image?.altText || category.name,
    };
  }

  if (typeof isActive === "boolean") {
    category.isActive = isActive;
  }

  if (typeof isFeatured === "boolean") {
    category.isFeatured = isFeatured;
  }

  if (displayOrder !== undefined) {
    const parsedDisplayOrder = Number(displayOrder);

    if (!Number.isFinite(parsedDisplayOrder) || parsedDisplayOrder < 0) {
      throw new ApiError(400, "Display order must be a non-negative number");
    }

    category.displayOrder = parsedDisplayOrder;
  }

  await category.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        category,
      },
      "Category updated successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Delete category
|--------------------------------------------------------------------------
| DELETE /api/v1/categories/:id
| Admin only
*/

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const productCount = await Product.countDocuments({
    category: category._id,
  });

  if (productCount > 0) {
    throw new ApiError(
      409,
      `Cannot delete this category because it contains ${productCount} product(s). Deactivate it instead`,
    );
  }

  await category.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Category deleted successfully"));
});

/*
|--------------------------------------------------------------------------
| Escape regular-expression characters
|--------------------------------------------------------------------------
*/

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
