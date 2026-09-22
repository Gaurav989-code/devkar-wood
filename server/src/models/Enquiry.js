import crypto from "crypto";
import mongoose from "mongoose";

const referenceImageSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: [true, "Reference image file ID is required"],
      trim: true,
    },

    url: {
      type: String,
      required: [true, "Reference image URL is required"],
      trim: true,
    },

    thumbnailUrl: {
      type: String,
      trim: true,
      default: "",
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const enquiryHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ["new", "contacted", "quoted", "accepted", "completed", "closed"],
    },

    message: {
      type: String,
      trim: true,
      maxlength: [300, "History message cannot exceed 300 characters"],
      default: "",
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const enquirySchema = new mongoose.Schema(
  {
    enquiryNumber: {
      type: String,
      unique: true,
      index: true,

      default: () =>
        `DWE-${Date.now()}-${crypto
          .randomBytes(3)
          .toString("hex")
          .toUpperCase()}`,
    },

    customer: {
      name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
        maxlength: [100, "Customer name cannot exceed 100 characters"],
      },

      email: {
        type: String,
        required: [true, "Customer email is required"],
        trim: true,
        lowercase: true,
        match: [
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          "Please provide a valid email address",
        ],
      },

      phone: {
        type: String,
        required: [true, "Customer phone number is required"],
        trim: true,
        match: [
          /^[6-9]\d{9}$/,
          "Please provide a valid 10-digit Indian phone number",
        ],
      },

      city: {
        type: String,
        trim: true,
        maxlength: [100, "City cannot exceed 100 characters"],
        default: "",
      },

      state: {
        type: String,
        trim: true,
        maxlength: [100, "State cannot exceed 100 characters"],
        default: "Maharashtra",
      },
    },

    carvingType: {
      type: String,
      required: [true, "Carving type is required"],
      trim: true,
      maxlength: [100, "Carving type cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Enquiry description is required"],
      trim: true,
      minlength: [20, "Please provide at least 20 characters"],
      maxlength: [3000, "Description cannot exceed 3000 characters"],
    },

    preferredWood: {
      type: String,
      trim: true,
      maxlength: [100, "Preferred wood cannot exceed 100 characters"],
      default: "",
    },

    approximateDimensions: {
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
        enum: ["inch", "cm", "feet"],
        default: "inch",
      },
    },

    budgetRange: {
      type: String,
      enum: [
        "",
        "under-10000",
        "10000-25000",
        "25000-50000",
        "50000-100000",
        "above-100000",
        "not-sure",
      ],
      default: "not-sure",
    },

    requiredBy: {
      type: Date,
      default: null,
    },

    referenceImages: {
      type: [referenceImageSchema],

      validate: {
        validator(images) {
          return images.length <= 5;
        },

        message: "A maximum of 5 reference images is allowed",
      },

      default: [],
    },

    preferredContactMethod: {
      type: String,
      enum: ["phone", "email", "whatsapp"],
      default: "whatsapp",
    },

    status: {
      type: String,
      enum: ["new", "contacted", "quoted", "accepted", "completed", "closed"],
      default: "new",
      index: true,
    },

    quotedAmount: {
      type: Number,
      min: [0, "Quoted amount cannot be negative"],
      default: null,
    },

    customerNote: {
      type: String,
      trim: true,
      maxlength: [500, "Customer note cannot exceed 500 characters"],
      default: "",
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: [2000, "Admin note cannot exceed 2000 characters"],
      default: "",
      select: false,
    },

    statusHistory: {
      type: [enquiryHistorySchema],
      default: [],
    },

    source: {
      type: String,
      enum: ["website", "whatsapp", "phone", "instagram", "admin"],
      default: "website",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

enquirySchema.index({
  createdAt: -1,
});

enquirySchema.index({
  status: 1,
  createdAt: -1,
});

enquirySchema.index({
  "customer.email": 1,
  createdAt: -1,
});

enquirySchema.index({
  "customer.phone": 1,
  createdAt: -1,
});

const Enquiry = mongoose.model("Enquiry", enquirySchema);

export default Enquiry;
