import mongoose from "mongoose";

const categoryImageSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      trim: true,
      default: "",
    },

    url: {
      type: String,
      trim: true,
      default: "",
    },

    thumbnailUrl: {
      type: String,
      trim: true,
      default: "",
    },

    altText: {
      type: String,
      trim: true,
      maxlength: [150, "Image alt text cannot exceed 150 characters"],
      default: "",
    },
  },
  {
    _id: false,
  },
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must contain at least 2 characters"],
      maxlength: [60, "Category name cannot exceed 60 characters"],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Category description cannot exceed 500 characters"],
      default: "",
    },

    image: {
      type: categoryImageSchema,
      default: () => ({
        fileId: "",
        url: "",
        thumbnailUrl: "",
        altText: "",
      }),
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    displayOrder: {
      type: Number,
      default: 0,
      min: [0, "Display order cannot be negative"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

categorySchema.pre("validate", function () {
  if (!this.name || !this.isModified("name")) {
    return;
  }

  this.slug = this.name
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
});

categorySchema.index({
  isActive: 1,
  displayOrder: 1,
});

categorySchema.index({
  isFeatured: 1,
  isActive: 1,
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
