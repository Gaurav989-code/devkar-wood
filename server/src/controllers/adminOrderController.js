import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const PAYMENT_METHODS = ["cod", "razorpay"];

const STATUS_MESSAGES = {
  confirmed: "Your order has been confirmed",
  processing: "Your order is being prepared",
  shipped: "Your order has been shipped",
  delivered: "Your order has been delivered",
  cancelled: "Your order has been cancelled",
  returned: "Your order has been returned",
};

const ALLOWED_STATUS_TRANSITIONS = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

const SORT_OPTIONS = {
  newest: {
    createdAt: -1,
  },

  oldest: {
    createdAt: 1,
  },

  totalHighToLow: {
    "pricing.total": -1,
  },

  totalLowToHigh: {
    "pricing.total": 1,
  },
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const cleanString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getAdminId = (req) => {
  return req.admin?._id || req.user?._id || null;
};

/*
|--------------------------------------------------------------------------
| Get all orders
|--------------------------------------------------------------------------
| GET /api/v1/orders/admin/all
| Admin only
*/

export const getAdminOrders = asyncHandler(async (req, res) => {
  const pageNumber = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

  const limitNumber = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
    100,
  );

  const search = cleanString(req.query.search);
  const orderStatus = cleanString(req.query.orderStatus).toLowerCase();

  const paymentStatus = cleanString(req.query.paymentStatus).toLowerCase();

  const paymentMethod = cleanString(req.query.paymentMethod).toLowerCase();

  const sort = cleanString(req.query.sort) || "newest";

  const skip = (pageNumber - 1) * limitNumber;

  const filter = {};

  /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

  if (orderStatus && ORDER_STATUSES.includes(orderStatus)) {
    filter.orderStatus = orderStatus;
  }

  if (paymentStatus && PAYMENT_STATUSES.includes(paymentStatus)) {
    filter.paymentStatus = paymentStatus;
  }

  if (paymentMethod && PAYMENT_METHODS.includes(paymentMethod)) {
    filter.paymentMethod = paymentMethod;
  }

  /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

  if (search) {
    const safeSearch = escapeRegex(search);
    const searchRegex = new RegExp(safeSearch, "i");

    filter.$or = [
      {
        orderNumber: searchRegex,
      },
      {
        "customer.name": searchRegex,
      },
      {
        "customer.email": searchRegex,
      },
      {
        "customer.phone": searchRegex,
      },
    ];
  }

  const selectedSort = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

  /*
    |--------------------------------------------------------------------------
    | Fetch orders and pagination count
    |--------------------------------------------------------------------------
    */

  const [orders, totalOrders] = await Promise.all([
    Order.find(filter)
      .select("+adminNote")
      .sort(selectedSort)
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Order.countDocuments(filter),
  ]);

  const totalPages =
    totalOrders === 0 ? 0 : Math.ceil(totalOrders / limitNumber);

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    data: {
      orders,

      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalOrders,
        limit: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    },
  });
});

/*
|--------------------------------------------------------------------------
| Get one order
|--------------------------------------------------------------------------
| GET /api/v1/orders/admin/:id
| Admin only
|--------------------------------------------------------------------------
| Supports MongoDB ID or order number
*/

export const getAdminOrderById = asyncHandler(async (req, res) => {
  const identifier = cleanString(req.params.id);

  if (!identifier) {
    throw new ApiError(400, "Order identifier is required");
  }

  const query = mongoose.Types.ObjectId.isValid(identifier)
    ? Order.findById(identifier)
    : Order.findOne({
        orderNumber: identifier.toUpperCase(),
      });

  const order = await query
    .select("+adminNote")
    .populate({
      path: "items.product",
      select: [
        "name",
        "slug",
        "sku",
        "status",
        "stock",
        "trackInventory",
        "images",
      ].join(" "),
    })
    .populate({
      path: "statusHistory.changedBy",
      select: "name email",
    });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res.status(200).json({
    success: true,
    message: "Order fetched successfully",
    data: {
      order,
    },
  });
});

/*
|--------------------------------------------------------------------------
| Update order status
|--------------------------------------------------------------------------
| PATCH /api/v1/orders/admin/:id/status
| Admin only
*/

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const orderStatus = cleanString(req.body.orderStatus).toLowerCase();

  const cancellationReason = cleanString(req.body.cancellationReason);

  /*
    |--------------------------------------------------------------------------
    | Validate requested status
    |--------------------------------------------------------------------------
    */

  if (!orderStatus) {
    throw new ApiError(400, "Order status is required");
  }

  if (!ORDER_STATUSES.includes(orderStatus)) {
    throw new ApiError(400, "Invalid order status");
  }

  if (orderStatus === "cancelled" && cancellationReason.length > 500) {
    throw new ApiError(400, "Cancellation reason cannot exceed 500 characters");
  }

  /*
    |--------------------------------------------------------------------------
    | Start transaction
    |--------------------------------------------------------------------------
    */

  const session = await mongoose.startSession();

  let updatedOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id)
        .select("+adminNote")
        .session(session);

      if (!order) {
        throw new ApiError(404, "Order not found");
      }

      if (order.orderStatus === orderStatus) {
        throw new ApiError(400, `Order is already ${orderStatus}`);
      }

      const permittedStatuses =
        ALLOWED_STATUS_TRANSITIONS[order.orderStatus] || [];

      if (!permittedStatuses.includes(orderStatus)) {
        throw new ApiError(
          400,
          `Order cannot be changed from ${order.orderStatus} to ${orderStatus}`,
        );
      }

      /*
          |--------------------------------------------------------------------------
          | Require tracking before shipping
          |--------------------------------------------------------------------------
          */

      if (
        orderStatus === "shipped" &&
        (!order.tracking.courierName || !order.tracking.trackingNumber)
      ) {
        throw new ApiError(
          400,
          "Add courier and tracking information before marking the order as shipped",
        );
      }

      /*
          |--------------------------------------------------------------------------
          | Restore inventory on cancellation or return
          |--------------------------------------------------------------------------
          */

      const shouldRestoreInventory =
        orderStatus === "cancelled" || orderStatus === "returned";

      if (shouldRestoreInventory) {
        for (const item of order.items) {
          const product = await Product.findById(item.product).session(session);

          if (!product) {
            continue;
          }

          if (product.trackInventory) {
            product.stock += item.quantity;
          }

          product.soldCount = Math.max(
            0,
            (product.soldCount || 0) - item.quantity,
          );

          await product.save({
            session,
          });
        }
      }

      /*
          |--------------------------------------------------------------------------
          | Status-specific fields
          |--------------------------------------------------------------------------
          */

      if (orderStatus === "shipped") {
        order.tracking.shippedAt = new Date();
      }

      if (orderStatus === "delivered") {
        order.tracking.deliveredAt = new Date();

        /*
            |--------------------------------------------------------------------------
            | COD becomes paid after delivery
            |--------------------------------------------------------------------------
            */

        if (order.paymentMethod === "cod") {
          order.paymentStatus = "paid";

          order.paymentDetails.paidAt = new Date();
        }
      }

      if (orderStatus === "cancelled") {
        order.cancelledAt = new Date();

        order.cancellationReason = cancellationReason || "Cancelled by admin";
      }

      /*
          |--------------------------------------------------------------------------
          | Update current status
          |--------------------------------------------------------------------------
          */

      order.orderStatus = orderStatus;

      /*
          |--------------------------------------------------------------------------
          | Add timeline entry
          |--------------------------------------------------------------------------
          */

      order.statusHistory.push({
        status: orderStatus,

        message:
          orderStatus === "cancelled"
            ? cancellationReason || STATUS_MESSAGES.cancelled
            : STATUS_MESSAGES[orderStatus],

        changedBy: getAdminId(req),

        changedAt: new Date(),
      });

      updatedOrder = await order.save({
        session,
      });
    });
  } finally {
    await session.endSession();
  }

  res.status(200).json({
    success: true,
    message: `Order status updated to ${orderStatus}`,
    data: {
      order: updatedOrder,
    },
  });
});

/*
|--------------------------------------------------------------------------
| Update shipping and tracking information
|--------------------------------------------------------------------------
| PATCH /api/v1/orders/admin/:id/tracking
| Admin only
*/

export const updateOrderTracking = asyncHandler(async (req, res) => {
  const courierName = cleanString(req.body.courierName);

  const trackingNumber = cleanString(req.body.trackingNumber);

  const trackingUrl = cleanString(req.body.trackingUrl);

  /*
    |--------------------------------------------------------------------------
    | Validate tracking information
    |--------------------------------------------------------------------------
    */

  if (!courierName) {
    throw new ApiError(400, "Courier name is required");
  }

  if (!trackingNumber) {
    throw new ApiError(400, "Tracking number is required");
  }

  if (courierName.length > 100) {
    throw new ApiError(400, "Courier name cannot exceed 100 characters");
  }

  if (trackingNumber.length > 150) {
    throw new ApiError(400, "Tracking number cannot exceed 150 characters");
  }

  if (trackingUrl.length > 500) {
    throw new ApiError(400, "Tracking URL cannot exceed 500 characters");
  }

  if (trackingUrl && !/^https?:\/\/.+/i.test(trackingUrl)) {
    throw new ApiError(400, "Please provide a valid tracking URL");
  }

  /*
    |--------------------------------------------------------------------------
    | Find order
    |--------------------------------------------------------------------------
    */

  const order = await Order.findById(req.params.id).select("+adminNote");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (["cancelled", "returned", "delivered"].includes(order.orderStatus)) {
    throw new ApiError(
      400,
      `Tracking cannot be updated for a ${order.orderStatus} order`,
    );
  }

  /*
    |--------------------------------------------------------------------------
    | Update tracking
    |--------------------------------------------------------------------------
    */

  order.tracking.courierName = courierName;

  order.tracking.trackingNumber = trackingNumber;

  order.tracking.trackingUrl = trackingUrl;

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order tracking updated successfully",
    data: {
      order,
    },
  });
});
