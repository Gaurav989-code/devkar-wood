import mongoose from "mongoose";

import Category from "../models/Category.js";
import Product from "../models/Product.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const PRODUCT_EDITABLE_FIELDS = [
  "name",
  "sku",
  "shortDescription",
  "description",
  "category",
  "price",
  "salePrice",
  "taxRate",
  "stock",
  "lowStockThreshold",
  "trackInventory",
  "woodType",
  "finish",
  "carvingStyle",
  "dimensions",
  "weight",
  "careInstructions",
  "tags",
  "isFeatured",
  "isNewArrival",
  "isBestseller",
  "allowCashOnDelivery",
  "freeShipping",
  "status",
  "seo",
];

/*
|--------------------------------------------------------------------------
| Assign permitted product fields
|--------------------------------------------------------------------------
*/

const assignProductFields = (product, requestBody) => {
  PRODUCT_EDITABLE_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(requestBody, field)) {
      product[field] = requestBody[field];
    }
  });
};

/*
|--------------------------------------------------------------------------
| Escape regular-expression characters
|--------------------------------------------------------------------------
*/

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
*/

const getPagination = (query) => {
  const requestedPage = Number(query.page);
  const requestedLimit = Number(query.limit);

  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const limit =
    Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 50)
      : 12;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

/*
|--------------------------------------------------------------------------
| Product sorting
|--------------------------------------------------------------------------
| Supports both backend and frontend sort names.
*/

const getSortOptions = (sort) => {
  const sortOptions = {
    newest: {
      createdAt: -1,
      _id: -1,
    },

    oldest: {
      createdAt: 1,
      _id: 1,
    },

    price_asc: {
      price: 1,
      _id: 1,
    },

    "price-low": {
      price: 1,
      _id: 1,
    },

    priceLowToHigh: {
      price: 1,
      _id: 1,
    },

    price_desc: {
      price: -1,
      _id: -1,
    },

    "price-high": {
      price: -1,
      _id: -1,
    },

    priceHighToLow: {
      price: -1,
      _id: -1,
    },

    stockLowToHigh: {
      stock: 1,
      _id: 1,
    },

    stockHighToLow: {
      stock: -1,
      _id: -1,
    },

    rating: {
      ratingsAverage: -1,
      ratingsCount: -1,
      _id: -1,
    },

    popular: {
      soldCount: -1,
      _id: -1,
    },

    name_asc: {
      name: 1,
      _id: 1,
    },

    name_desc: {
      name: -1,
      _id: -1,
    },
  };

  return sortOptions[sort] || sortOptions.newest;
};

/*
|--------------------------------------------------------------------------
| Resolve category ID
|--------------------------------------------------------------------------
| Accepts either:
| - MongoDB category ID
| - Category slug
*/

const resolveCategoryId = async (categoryValue, { activeOnly = true } = {}) => {
  if (typeof categoryValue !== "string" || !categoryValue.trim()) {
    return null;
  }

  const normalizedCategory = categoryValue.trim();

  const categoryFilter = activeOnly
    ? {
        isActive: true,
      }
    : {};

  let categoryDocument;

  if (mongoose.Types.ObjectId.isValid(normalizedCategory)) {
    categoryDocument = await Category.findOne({
      _id: normalizedCategory,
      ...categoryFilter,
    }).select("_id");
  } else {
    categoryDocument = await Category.findOne({
      slug: normalizedCategory.toLowerCase(),
      ...categoryFilter,
    }).select("_id");
  }

  return categoryDocument?._id || null;
};

/*
|--------------------------------------------------------------------------
| Public product catalogue
|--------------------------------------------------------------------------
| GET /api/v1/products
*/

export const getPublicProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    woodType,
    minPrice,
    maxPrice,
    featured,
    newArrival,
    bestseller,
    inStock,
    sort,
  } = req.query;

  const filter = {
    status: "active",
  };

  /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

  if (typeof search === "string" && search.trim()) {
    const safeSearch = escapeRegex(search.trim());

    filter.$or = [
      {
        name: {
          $regex: safeSearch,
          $options: "i",
        },
      },

      {
        shortDescription: {
          $regex: safeSearch,
          $options: "i",
        },
      },

      {
        woodType: {
          $regex: safeSearch,
          $options: "i",
        },
      },

      {
        carvingStyle: {
          $regex: safeSearch,
          $options: "i",
        },
      },

      {
        tags: {
          $regex: safeSearch,
          $options: "i",
        },
      },
    ];
  }

  /*
    |--------------------------------------------------------------------------
    | Category
    |--------------------------------------------------------------------------
    | This now supports both the category slug sent by Collections.jsx
    | and the MongoDB ID resolved by Products.jsx.
    */

  if (typeof category === "string" && category.trim()) {
    const categoryId = await resolveCategoryId(category, {
      activeOnly: true,
    });

    if (!categoryId) {
      const { page, limit } = getPagination(req.query);

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            products: [],

            pagination: {
              page,
              currentPage: page,
              limit,
              totalProducts: 0,
              totalItems: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          },
          "Products fetched successfully",
        ),
      );
    }

    filter.category = categoryId;
  }

  /*
    |--------------------------------------------------------------------------
    | Wood type
    |--------------------------------------------------------------------------
    */

  if (typeof woodType === "string" && woodType.trim()) {
    filter.woodType = {
      $regex: `^${escapeRegex(woodType.trim())}$`,
      $options: "i",
    };
  }

  /*
    |--------------------------------------------------------------------------
    | Price range
    |--------------------------------------------------------------------------
    */

  const parsedMinPrice = Number(minPrice);
  const parsedMaxPrice = Number(maxPrice);

  const hasMinimumPrice =
    minPrice !== undefined &&
    minPrice !== "" &&
    Number.isFinite(parsedMinPrice) &&
    parsedMinPrice >= 0;

  const hasMaximumPrice =
    maxPrice !== undefined &&
    maxPrice !== "" &&
    Number.isFinite(parsedMaxPrice) &&
    parsedMaxPrice >= 0;

  if (hasMinimumPrice || hasMaximumPrice) {
    filter.price = {};

    if (hasMinimumPrice) {
      filter.price.$gte = parsedMinPrice;
    }

    if (hasMaximumPrice) {
      filter.price.$lte = parsedMaxPrice;
    }
  }

  /*
    |--------------------------------------------------------------------------
    | Product labels
    |--------------------------------------------------------------------------
    */

  if (featured === "true") {
    filter.isFeatured = true;
  }

  if (newArrival === "true") {
    filter.isNewArrival = true;
  }

  if (bestseller === "true") {
    filter.isBestseller = true;
  }

  /*
    |--------------------------------------------------------------------------
    | Stock
    |--------------------------------------------------------------------------
    */

  if (inStock === "true") {
    filter.$and = [
      ...(filter.$and || []),

      {
        $or: [
          {
            trackInventory: false,
          },

          {
            stock: {
              $gt: 0,
            },
          },
        ],
      },
    ];
  }

  const { page, limit, skip } = getPagination(req.query);

  const productSort = getSortOptions(sort);

  const [products, totalProducts] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug image")
      .sort(productSort)
      .skip(skip)
      .limit(limit),

    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalProducts / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,

        pagination: {
          page,
          currentPage: page,
          limit,
          totalProducts,
          totalItems: totalProducts,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      "Products fetched successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Public product details
|--------------------------------------------------------------------------
| GET /api/v1/products/:slug
*/

export const getPublicProductBySlug = asyncHandler(async (req, res) => {
  const slug = String(req.params.slug || "")
    .trim()
    .toLowerCase();

  if (!slug) {
    throw new ApiError(400, "Product slug is required");
  }

  const product = await Product.findOne({
    slug,
    status: "active",
  }).populate("category", "name slug image description");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        product,
      },
      "Product fetched successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Admin product list
|--------------------------------------------------------------------------
| GET /api/v1/products/admin/all
*/

export const getAdminProducts = asyncHandler(async (req, res) => {
  const { search, category, status, sort } = req.query;

  const filter = {};

  /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

  if (typeof search === "string" && search.trim()) {
    const safeSearch = escapeRegex(search.trim());

    filter.$or = [
      {
        name: {
          $regex: safeSearch,
          $options: "i",
        },
      },

      {
        sku: {
          $regex: safeSearch,
          $options: "i",
        },
      },

      {
        woodType: {
          $regex: safeSearch,
          $options: "i",
        },
      },
    ];
  }

  /*
    |--------------------------------------------------------------------------
    | Category
    |--------------------------------------------------------------------------
    */

  if (typeof category === "string" && category.trim()) {
    const categoryId = await resolveCategoryId(category, {
      activeOnly: false,
    });

    if (!categoryId) {
      const { page, limit } = getPagination(req.query);

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            products: [],

            pagination: {
              page,
              currentPage: page,
              limit,
              totalProducts: 0,
              totalItems: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          },
          "Admin products fetched successfully",
        ),
      );
    }

    filter.category = categoryId;
  }

  /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

  if (["draft", "active", "archived"].includes(status)) {
    filter.status = status;
  }

  const { page, limit, skip } = getPagination(req.query);

  const [products, totalProducts] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug image isActive")
      .sort(getSortOptions(sort))
      .skip(skip)
      .limit(limit),

    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalProducts / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,

        pagination: {
          page,
          currentPage: page,
          limit,
          totalProducts,
          totalItems: totalProducts,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      "Admin products fetched successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Admin product details
|--------------------------------------------------------------------------
| GET /api/v1/products/admin/:id
*/

export const getAdminProductById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findById(req.params.id).populate(
    "category",
    "name slug image isActive",
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        product,
      },
      "Admin product fetched successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Create product
|--------------------------------------------------------------------------
| POST /api/v1/products
*/

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    shortDescription,
    description,
    category,
    price,
    stock,
    woodType,
    finish,
  } = req.body;

  if (
    !name ||
    !sku ||
    !shortDescription ||
    !description ||
    !category ||
    price === undefined ||
    stock === undefined ||
    !woodType ||
    !finish
  ) {
    throw new ApiError(
      400,
      "Name, SKU, descriptions, category, price, stock, wood type and finish are required",
    );
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const categoryDocument = await Category.findById(category);

  if (!categoryDocument) {
    throw new ApiError(404, "Selected category does not exist");
  }

  const product = new Product();

  assignProductFields(product, req.body);

  const regularPrice = Number(product.price);

  const salePrice =
    product.salePrice === null ||
    product.salePrice === undefined ||
    product.salePrice === ""
      ? null
      : Number(product.salePrice);

  if (!Number.isFinite(regularPrice) || regularPrice < 0) {
    throw new ApiError(400, "Please provide a valid product price");
  }

  if (salePrice !== null && salePrice >= regularPrice) {
    throw new ApiError(400, "Sale price must be lower than the regular price");
  }

  product.price = regularPrice;
  product.salePrice = salePrice;

  await product.save();

  await product.populate("category", "name slug image isActive");

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        product,
      },
      "Product created successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Update product
|--------------------------------------------------------------------------
| PATCH /api/v1/products/:id
*/

export const updateProduct = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (req.body.category !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
      throw new ApiError(400, "Invalid category ID");
    }

    const categoryDocument = await Category.findById(req.body.category);

    if (!categoryDocument) {
      throw new ApiError(404, "Selected category does not exist");
    }
  }

  assignProductFields(product, req.body);

  const finalPrice = Number(product.price);

  const finalSalePrice =
    product.salePrice === null ||
    product.salePrice === undefined ||
    product.salePrice === ""
      ? null
      : Number(product.salePrice);

  if (!Number.isFinite(finalPrice) || finalPrice < 0) {
    throw new ApiError(400, "Please provide a valid product price");
  }

  if (finalSalePrice !== null && finalSalePrice >= finalPrice) {
    throw new ApiError(400, "Sale price must be lower than the regular price");
  }

  product.price = finalPrice;
  product.salePrice = finalSalePrice;

  await product.save();

  await product.populate("category", "name slug image isActive");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        product,
      },
      "Product updated successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Archive product
|--------------------------------------------------------------------------
| DELETE /api/v1/products/:id
*/

export const archiveProduct = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.status === "archived") {
    throw new ApiError(400, "Product is already archived");
  }

  product.status = "archived";

  await product.save();

  await product.populate("category", "name slug image isActive");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        product,
      },
      "Product archived successfully",
    ),
  );
});
