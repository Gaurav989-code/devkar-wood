import crypto from "crypto";
import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| Customer schema
|--------------------------------------------------------------------------
*/

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Customer name must contain at least 2 characters"],
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
  },
  {
    _id: false,
  },
);

/*
|--------------------------------------------------------------------------
| Shipping address schema
|--------------------------------------------------------------------------
*/

const addressSchema = new mongoose.Schema(
  {
    addressLine1: {
      type: String,
      required: [true, "Address line 1 is required"],
      trim: true,
      maxlength: [200, "Address line 1 cannot exceed 200 characters"],
    },

    addressLine2: {
      type: String,
      trim: true,
      maxlength: [200, "Address line 2 cannot exceed 200 characters"],
      default: "",
    },

    landmark: {
      type: String,
      trim: true,
      maxlength: [150, "Landmark cannot exceed 150 characters"],
      default: "",
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [100, "State cannot exceed 100 characters"],
    },

    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
      match: [/^[1-9]\d{5}$/, "Please provide a valid Indian postal code"],
    },

    country: {
      type: String,
      trim: true,
      default: "India",
    },
  },
  {
    _id: false,
  },
);

/*
|--------------------------------------------------------------------------
| Order-item schema
|--------------------------------------------------------------------------
*/

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    slug: {
      type: String,
      required: [true, "Product slug is required"],
      trim: true,
    },

    sku: {
      type: String,
      required: [true, "Product SKU is required"],
      trim: true,
      uppercase: true,
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    woodType: {
      type: String,
      trim: true,
      default: "",
    },

    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      min: [1, "Quantity must be at least 1"],
      max: [10, "Quantity cannot exceed 10"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },

    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },

    subtotal: {
      type: Number,
      required: [true, "Item subtotal is required"],
      min: [0, "Item subtotal cannot be negative"],
    },
  },
  {
    _id: false,
  },
);

/*
|--------------------------------------------------------------------------
| Status-history schema
|--------------------------------------------------------------------------
*/

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: [true, "Order status is required"],
      enum: [
        "placed",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
    },

    message: {
      type: String,
      required: [true, "Status message is required"],
      trim: true,
      maxlength: [300, "Status message cannot exceed 300 characters"],
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

/*
|--------------------------------------------------------------------------
| Order schema
|--------------------------------------------------------------------------
*/

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      uppercase: true,
      default: () =>
        `DW-${Date.now()}-${crypto
          .randomBytes(4)
          .toString("hex")
          .toUpperCase()}`,
    },

    customer: {
      type: customerSchema,
      required: [true, "Customer information is required"],
    },

    shippingAddress: {
      type: addressSchema,
      required: [true, "Shipping address is required"],
    },

    items: {
      type: [orderItemSchema],
      required: [true, "Order items are required"],
      validate: [
        {
          validator(items) {
            return Array.isArray(items) && items.length > 0;
          },
          message: "Order must contain at least one product",
        },
        {
          validator(items) {
            return Array.isArray(items) && items.length <= 20;
          },
          message: "Order cannot contain more than 20 different products",
        },
      ],
    },

    /*
    |--------------------------------------------------------------------------
    | Inventory reservation
    |--------------------------------------------------------------------------
    */

    inventoryStatus: {
      type: String,
      enum: ["reserved", "committed", "restored"],
      default: "committed",
      index: true,
    },

    reservationExpiresAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Pricing
    |--------------------------------------------------------------------------
    */

    pricing: {
      currency: {
        type: String,
        enum: ["INR"],
        default: "INR",
      },

      subtotal: {
        type: Number,
        required: [true, "Order subtotal is required"],
        min: [0, "Order subtotal cannot be negative"],
      },

      discount: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"],
      },

      shippingCharge: {
        type: Number,
        default: 0,
        min: [0, "Shipping charge cannot be negative"],
      },

      tax: {
        type: Number,
        default: 0,
        min: [0, "Tax cannot be negative"],
      },

      total: {
        type: Number,
        required: [true, "Order total is required"],
        min: [0, "Order total cannot be negative"],
      },
    },

    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | Payment
    |--------------------------------------------------------------------------
    */

    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: ["cod", "razorpay"],
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    paymentDetails: {
      razorpayOrderId: {
        type: String,
        trim: true,
        default: "",
      },

      razorpayPaymentId: {
        type: String,
        trim: true,
        default: "",
      },

      razorpaySignature: {
        type: String,
        trim: true,
        default: "",
        select: false,
      },

      paidAt: {
        type: Date,
        default: null,
      },

      paymentAttempts: {
        type: Number,
        min: [0, "Payment attempts cannot be negative"],
        default: 0,
      },

      lastPaymentError: {
        type: String,
        trim: true,
        maxlength: [500, "Payment error cannot exceed 500 characters"],
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Order status
    |--------------------------------------------------------------------------
    */

    orderStatus: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "placed",
      index: true,
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | Shipping tracking
    |--------------------------------------------------------------------------
    */

    tracking: {
      courierName: {
        type: String,
        trim: true,
        maxlength: [100, "Courier name cannot exceed 100 characters"],
        default: "",
      },

      trackingNumber: {
        type: String,
        trim: true,
        maxlength: [150, "Tracking number cannot exceed 150 characters"],
        default: "",
      },

      trackingUrl: {
        type: String,
        trim: true,
        maxlength: [500, "Tracking URL cannot exceed 500 characters"],
        default: "",
      },

      shippedAt: {
        type: Date,
        default: null,
      },

      deliveredAt: {
        type: Date,
        default: null,
      },
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
      maxlength: [1000, "Admin note cannot exceed 1000 characters"],
      default: "",
      select: false,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,

    toJSON: {
      transform(doc, returnedObject) {
        if (returnedObject.paymentDetails) {
          delete returnedObject.paymentDetails.razorpaySignature;
        }

        return returnedObject;
      },
    },

    toObject: {
      transform(doc, returnedObject) {
        if (returnedObject.paymentDetails) {
          delete returnedObject.paymentDetails.razorpaySignature;
        }

        return returnedObject;
      },
    },
  },
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

orderSchema.index({
  createdAt: -1,
});

orderSchema.index({
  orderStatus: 1,
  createdAt: -1,
});

orderSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});

orderSchema.index({
  paymentMethod: 1,
  createdAt: -1,
});

orderSchema.index({
  "customer.phone": 1,
  createdAt: -1,
});

orderSchema.index({
  "customer.email": 1,
  createdAt: -1,
});

orderSchema.index({
  paymentStatus: 1,
  inventoryStatus: 1,
  reservationExpiresAt: 1,
});

/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

const Order = mongoose.model("Order", orderSchema);

export default Order;
