import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: [true, "ImageKit file ID is required"],
    },

    thumbnailUrl: {
      type: String,
      trim: true,
      default: "",
    },

    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },

    altText: {
      type: String,
      trim: true,
      default: "",
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const dimensionSchema = new mongoose.Schema(
  {
    height: {
      type: Number,
      min: [0, "Height cannot be negative"],
      default: 0,
    },

    width: {
      type: Number,
      min: [0, "Width cannot be negative"],
      default: 0,
    },

    depth: {
      type: Number,
      min: [0, "Depth cannot be negative"],
      default: 0,
    },

    unit: {
      type: String,
      enum: {
        values: ["cm", "inch"],
        message: "Dimension unit must be cm or inch",
      },
      default: "inch",
    },
  },
  {
    _id: false,
  },
);

const weightSchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      min: [0, "Weight cannot be negative"],
      default: 0,
    },

    unit: {
      type: String,
      enum: {
        values: ["kg", "g"],
        message: "Weight unit must be kg or g",
      },
      default: "kg",
    },
  },
  {
    _id: false,
  },
);

const seoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [70, "SEO title cannot exceed 70 characters"],
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [170, "SEO description cannot exceed 170 characters"],
      default: "",
    },

    keywords: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must contain at least 3 characters"],
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },

    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    sku: {
      type: String,
      required: [true, "Product SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [5000, "Product description cannot exceed 5000 characters"],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
      index: true,
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price cannot be negative"],
    },

    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
      default: null,

      validate: {
        validator(value) {
          if (value === null || value === undefined) {
            return true;
          }

          return value < this.price;
        },

        message: "Sale price must be lower than the regular price",
      },
    },

    taxRate: {
      type: Number,
      min: [0, "Tax rate cannot be negative"],
      max: [100, "Tax rate cannot exceed 100"],
      default: 0,
    },

    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      min: [0, "Low-stock threshold cannot be negative"],
      default: 5,
    },

    trackInventory: {
      type: Boolean,
      default: true,
    },

    woodType: {
      type: String,
      required: [true, "Wood type is required"],
      trim: true,
      maxlength: [60, "Wood type cannot exceed 60 characters"],
    },

    finish: {
      type: String,
      required: [true, "Product finish is required"],
      trim: true,
      maxlength: [100, "Product finish cannot exceed 100 characters"],
    },

    carvingStyle: {
      type: String,
      trim: true,
      maxlength: [100, "Carving style cannot exceed 100 characters"],
      default: "",
    },

    dimensions: {
      type: dimensionSchema,

      default: () => ({
        height: 0,
        width: 0,
        depth: 0,
        unit: "inch",
      }),
    },

    weight: {
      type: weightSchema,

      default: () => ({
        value: 0,
        unit: "kg",
      }),
    },

    images: {
      type: [imageSchema],

      validate: [
        {
          validator(images) {
            return images.length <= 10;
          },

          message: "A product cannot have more than 10 images",
        },

        {
          validator(images) {
            const primaryImages = images.filter((image) => image.isPrimary);

            return primaryImages.length <= 1;
          },

          message: "A product can have only one primary image",
        },
      ],

      default: [],
    },

    careInstructions: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    isBestseller: {
      type: Boolean,
      default: false,
    },

    allowCashOnDelivery: {
      type: Boolean,
      default: true,
    },

    freeShipping: {
      type: Boolean,
      default: false,
    },

    ratingsAverage: {
      type: Number,
      min: [0, "Rating cannot be below 0"],
      max: [5, "Rating cannot exceed 5"],
      default: 0,
    },

    ratingsCount: {
      type: Number,
      min: [0, "Ratings count cannot be negative"],
      default: 0,
    },

    soldCount: {
      type: Number,
      min: [0, "Sold count cannot be negative"],
      default: 0,
    },

    status: {
      type: String,

      enum: {
        values: ["draft", "active", "archived"],
        message: "Product status must be draft, active or archived",
      },

      default: "draft",
      index: true,
    },

    seo: {
      type: seoSchema,

      default: () => ({
        title: "",
        description: "",
        keywords: [],
      }),
    },
  },
  {
    timestamps: true,
    versionKey: false,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  },
);

/*
|--------------------------------------------------------------------------
| Product middleware
|--------------------------------------------------------------------------
*/

productSchema.pre("validate", function () {
  if (this.name && this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  if (this.sku) {
    this.sku = this.sku.trim().toUpperCase();
  }

  if (Array.isArray(this.tags)) {
    this.tags = [
      ...new Set(
        this.tags
          .map((tag) => String(tag).trim().toLowerCase())
          .filter(Boolean),
      ),
    ];
  }

  if (Array.isArray(this.careInstructions)) {
    this.careInstructions = this.careInstructions
      .map((instruction) => String(instruction).trim())
      .filter(Boolean);
  }

  if (Array.isArray(this.seo?.keywords)) {
    this.seo.keywords = [
      ...new Set(
        this.seo.keywords
          .map((keyword) => String(keyword).trim().toLowerCase())
          .filter(Boolean),
      ),
    ];
  }

  if (
    Array.isArray(this.images) &&
    this.images.length > 0 &&
    !this.images.some((image) => image.isPrimary)
  ) {
    this.images[0].isPrimary = true;
  }
});

/*
|--------------------------------------------------------------------------
| Virtual properties
|--------------------------------------------------------------------------
*/

productSchema.virtual("effectivePrice").get(function () {
  return this.salePrice ?? this.price;
});

productSchema.virtual("discountPercentage").get(function () {
  if (
    this.salePrice === null ||
    this.salePrice === undefined ||
    this.salePrice >= this.price
  ) {
    return 0;
  }

  return Math.round(((this.price - this.salePrice) / this.price) * 100);
});

productSchema.virtual("isInStock").get(function () {
  if (!this.trackInventory) {
    return true;
  }

  return this.stock > 0;
});

productSchema.virtual("isLowStock").get(function () {
  if (!this.trackInventory) {
    return false;
  }

  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

productSchema.virtual("primaryImage").get(function () {
  if (!Array.isArray(this.images)) {
    return null;
  }

  return this.images.find((image) => image.isPrimary) || this.images[0] || null;
});

/*
|--------------------------------------------------------------------------
| Database indexes
|--------------------------------------------------------------------------
*/

productSchema.index({
  status: 1,
  category: 1,
  createdAt: -1,
});

productSchema.index({
  status: 1,
  isFeatured: 1,
  createdAt: -1,
});

productSchema.index({
  status: 1,
  isNewArrival: 1,
  createdAt: -1,
});

productSchema.index({
  status: 1,
  isBestseller: 1,
  soldCount: -1,
});

productSchema.index({
  status: 1,
  price: 1,
});

productSchema.index({
  stock: 1,
  lowStockThreshold: 1,
});

productSchema.index({
  name: "text",
  shortDescription: "text",
  description: "text",
  tags: "text",
  woodType: "text",
});

/*
|--------------------------------------------------------------------------
| Product model
|--------------------------------------------------------------------------
*/

const Product = mongoose.model("Product", productSchema);

export default Product;
