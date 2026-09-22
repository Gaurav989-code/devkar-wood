import crypto from "crypto";
import mongoose from "mongoose";

import razorpay from "../configs/razorpay.js";
import { env } from "../configs/env.js";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendOrderNotifications } from "../utils/sendOrderNotifications.js";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const DEFAULT_SHIPPING_CHARGE = 0;
const MAX_QUANTITY_PER_PRODUCT = 10;
const RESERVATION_MINUTES = 15;

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const roundMoney = (amount) => {
  return Math.round((Number(amount) + Number.EPSILON) * 100) / 100;
};

const convertRupeesToPaise = (amount) => {
  return Math.round(roundMoney(amount) * 100);
};

const cleanErrorMessage = (error) => {
  const message =
    error?.error?.description ||
    error?.description ||
    error?.message ||
    "Razorpay operation failed";

  return String(message).slice(0, 500);
};

const triggerOrderNotifications = (order) => {
  if (!order) {
    return;
  }

  void sendOrderNotifications(order).catch((error) => {
    console.error(
      `Unexpected notification error for order ${order.orderNumber || order._id}:`,
      error,
    );
  });
};

/*
|--------------------------------------------------------------------------
| Normalize duplicate cart items
|--------------------------------------------------------------------------
*/

const normalizeCartItems = (items) => {
  const combinedItems = new Map();

  items.forEach((item) => {
    const productId = item.product.toString();

    const existingQuantity = combinedItems.get(productId) || 0;

    combinedItems.set(productId, existingQuantity + item.quantity);
  });

  return Array.from(combinedItems.entries()).map(([product, quantity]) => ({
    product,
    quantity,
  }));
};

/*
|--------------------------------------------------------------------------
| Verify Razorpay signature
|--------------------------------------------------------------------------
*/

const verifyRazorpaySignature = ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const generatedSignature = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const receivedBuffer = Buffer.from(razorpaySignature, "utf8");

  const generatedBuffer = Buffer.from(generatedSignature, "utf8");

  if (receivedBuffer.length !== generatedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, generatedBuffer);
};

/*
|--------------------------------------------------------------------------
| Record payment verification error
|--------------------------------------------------------------------------
*/

const recordPaymentError = async (orderId, message) => {
  await Order.findByIdAndUpdate(orderId, {
    $inc: {
      "paymentDetails.paymentAttempts": 1,
    },

    $set: {
      "paymentDetails.lastPaymentError": String(message).slice(0, 500),
    },
  });
};

/*
|--------------------------------------------------------------------------
| Release reserved inventory
|--------------------------------------------------------------------------
*/

const releaseReservedInventory = async (orderId, errorMessage) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: orderId,
        inventoryStatus: "reserved",
        paymentStatus: "pending",
      }).session(session);

      if (!order) {
        return;
      }

      /*
        |--------------------------------------------------------------------------
        | Restore product stock
        |--------------------------------------------------------------------------
        */

      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);

        if (!product || !product.trackInventory) {
          continue;
        }

        product.stock += item.quantity;

        await product.save({
          session,
        });
      }

      /*
        |--------------------------------------------------------------------------
        | Mark payment and reservation as failed
        |--------------------------------------------------------------------------
        */

      order.inventoryStatus = "restored";

      order.reservationExpiresAt = null;

      order.paymentStatus = "failed";

      order.paymentDetails.lastPaymentError = String(errorMessage).slice(
        0,
        500,
      );

      order.orderStatus = "cancelled";

      order.cancelledAt = new Date();

      order.cancellationReason = "Unable to initialize Razorpay payment";

      order.statusHistory.push({
        status: "cancelled",
        message:
          "Payment could not be initialized. Reserved stock was released",
        changedAt: new Date(),
      });

      await order.save({
        session,
      });
    });
  } finally {
    await session.endSession();
  }
};

/*
|--------------------------------------------------------------------------
| Create Razorpay order
|--------------------------------------------------------------------------
| POST /api/v1/orders/razorpay/create
| Public route
*/

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const {
    customer,
    shippingAddress,
    items,
    paymentMethod,
    customerNote = "",
  } = req.body;

  /*
    |--------------------------------------------------------------------------
    | Validate payment method
    |--------------------------------------------------------------------------
    */

  if (paymentMethod !== "razorpay") {
    throw new ApiError(400, "Payment method must be razorpay");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Your cart must contain at least one product");
  }

  /*
    |--------------------------------------------------------------------------
    | Normalize cart items
    |--------------------------------------------------------------------------
    */

  const normalizedItems = normalizeCartItems(items);

  for (const item of normalizedItems) {
    if (item.quantity > MAX_QUANTITY_PER_PRODUCT) {
      throw new ApiError(
        400,
        `A maximum of ${MAX_QUANTITY_PER_PRODUCT} units of one product can be ordered`,
      );
    }
  }

  const productIds = normalizedItems.map((item) => item.product);

  const reservationExpiresAt = new Date(
    Date.now() + RESERVATION_MINUTES * 60 * 1000,
  );

  /*
    |--------------------------------------------------------------------------
    | Reserve inventory and create local order
    |--------------------------------------------------------------------------
    */

  const session = await mongoose.startSession();

  let localOrder;

  try {
    await session.withTransaction(async () => {
      /*
          |--------------------------------------------------------------------------
          | Fetch active products
          |--------------------------------------------------------------------------
          */

      const products = await Product.find({
        _id: {
          $in: productIds,
        },
        status: "active",
      }).session(session);

      if (products.length !== productIds.length) {
        throw new ApiError(400, "One or more products are unavailable");
      }

      const productMap = new Map(
        products.map((product) => [product._id.toString(), product]),
      );

      const orderItems = [];

      let subtotal = 0;
      let tax = 0;
      let allProductsHaveFreeShipping = true;

      /*
          |--------------------------------------------------------------------------
          | Verify products and calculate prices
          |--------------------------------------------------------------------------
          */

      for (const cartItem of normalizedItems) {
        const product = productMap.get(cartItem.product);

        if (!product) {
          throw new ApiError(400, "A product in your cart is unavailable");
        }

        /*
            |--------------------------------------------------------------------------
            | Verify inventory
            |--------------------------------------------------------------------------
            */

        if (product.trackInventory && product.stock < cartItem.quantity) {
          throw new ApiError(
            400,
            product.stock === 0
              ? `${product.name} is out of stock`
              : `Only ${product.stock} unit(s) of ${product.name} are available`,
          );
        }

        /*
            |--------------------------------------------------------------------------
            | Calculate trusted product price
            |--------------------------------------------------------------------------
            */

        const unitPrice =
          product.salePrice !== null && product.salePrice !== undefined
            ? product.salePrice
            : product.price;

        const itemSubtotal = roundMoney(unitPrice * cartItem.quantity);

        const itemTax = roundMoney(itemSubtotal * (product.taxRate / 100));

        const primaryImage =
          product.images.find((image) => image.isPrimary) || product.images[0];

        orderItems.push({
          product: product._id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          image: primaryImage?.url || "",
          woodType: product.woodType,
          quantity: cartItem.quantity,
          unitPrice: roundMoney(unitPrice),
          subtotal: itemSubtotal,
        });

        subtotal += itemSubtotal;
        tax += itemTax;

        if (!product.freeShipping) {
          allProductsHaveFreeShipping = false;
        }

        /*
            |--------------------------------------------------------------------------
            | Reserve inventory
            |--------------------------------------------------------------------------
            */

        if (product.trackInventory) {
          product.stock -= cartItem.quantity;

          await product.save({
            session,
          });
        }
      }

      /*
          |--------------------------------------------------------------------------
          | Calculate order totals
          |--------------------------------------------------------------------------
          */

      subtotal = roundMoney(subtotal);

      tax = roundMoney(tax);

      const shippingCharge = allProductsHaveFreeShipping
        ? 0
        : DEFAULT_SHIPPING_CHARGE;

      const discount = 0;

      const total = roundMoney(subtotal + tax + shippingCharge - discount);

      if (total <= 0) {
        throw new ApiError(400, "Order total must be greater than zero");
      }

      /*
          |--------------------------------------------------------------------------
          | Create pending local Razorpay order
          |--------------------------------------------------------------------------
          */

      const orders = await Order.create(
        [
          {
            customer,

            shippingAddress,

            items: orderItems,

            inventoryStatus: "reserved",

            reservationExpiresAt,

            pricing: {
              currency: "INR",
              subtotal,
              discount,
              shippingCharge,
              tax,
              total,
            },

            couponCode: "",

            paymentMethod: "razorpay",

            paymentStatus: "pending",

            paymentDetails: {
              razorpayOrderId: "",
              razorpayPaymentId: "",
              razorpaySignature: "",
              paidAt: null,
              paymentAttempts: 0,
              lastPaymentError: "",
            },

            orderStatus: "placed",

            statusHistory: [
              {
                status: "placed",
                message: "Order created and awaiting payment",
                changedAt: new Date(),
              },
            ],

            customerNote,
          },
        ],
        {
          session,
        },
      );

      localOrder = orders[0];
    });
  } finally {
    await session.endSession();
  }

  /*
    |--------------------------------------------------------------------------
    | Create Razorpay order
    |--------------------------------------------------------------------------
    */

  let razorpayOrder;

  try {
    razorpayOrder = await razorpay.orders.create({
      amount: convertRupeesToPaise(localOrder.pricing.total),

      currency: "INR",

      receipt: localOrder.orderNumber,

      notes: {
        localOrderId: localOrder._id.toString(),

        orderNumber: localOrder.orderNumber,

        customerName: localOrder.customer.name,

        customerPhone: localOrder.customer.phone,
      },
    });

    /*
      |--------------------------------------------------------------------------
      | Save Razorpay order ID
      |--------------------------------------------------------------------------
      */

    localOrder.paymentDetails.razorpayOrderId = razorpayOrder.id;

    localOrder.paymentDetails.paymentAttempts = 1;

    localOrder.paymentDetails.lastPaymentError = "";

    await localOrder.save();
  } catch (error) {
    const safeErrorMessage = cleanErrorMessage(error);

    await releaseReservedInventory(localOrder._id, safeErrorMessage);

    throw new ApiError(502, "Unable to initialize payment. Please try again");
  }

  /*
    |--------------------------------------------------------------------------
    | Return safe checkout information
    |--------------------------------------------------------------------------
    */

  res.status(201).json({
    success: true,
    message: "Razorpay order created successfully",

    data: {
      keyId: env.razorpayKeyId,

      localOrder: {
        id: localOrder._id,

        orderNumber: localOrder.orderNumber,

        total: localOrder.pricing.total,

        currency: localOrder.pricing.currency,

        reservationExpiresAt: localOrder.reservationExpiresAt,
      },

      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },

      customer: {
        name: localOrder.customer.name,

        email: localOrder.customer.email,

        phone: localOrder.customer.phone,
      },
    },
  });
});

/*
|--------------------------------------------------------------------------
| Verify Razorpay payment
|--------------------------------------------------------------------------
| POST /api/v1/orders/razorpay/verify
| Public route
*/

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    localOrderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  /*
    |--------------------------------------------------------------------------
    | Validate required payment values
    |--------------------------------------------------------------------------
    */

  if (
    !localOrderId ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    throw new ApiError(
      400,
      "Complete Razorpay payment information is required",
    );
  }

  if (!mongoose.Types.ObjectId.isValid(localOrderId)) {
    throw new ApiError(400, "Invalid local order ID");
  }

  /*
    |--------------------------------------------------------------------------
    | Find local order
    |--------------------------------------------------------------------------
    */

  const localOrder = await Order.findById(localOrderId);

  if (!localOrder) {
    throw new ApiError(404, "Order not found");
  }

  if (localOrder.paymentMethod !== "razorpay") {
    throw new ApiError(400, "This is not a Razorpay order");
  }

  /*
    |--------------------------------------------------------------------------
    | Handle previously verified payment
    |--------------------------------------------------------------------------
    */

  if (
    localOrder.paymentStatus === "paid" &&
    localOrder.paymentDetails.razorpayPaymentId === razorpay_payment_id
  ) {
    return res.status(200).json({
      success: true,
      message: "Payment was already verified",

      data: {
        order: {
          id: localOrder._id,

          orderNumber: localOrder.orderNumber,

          paymentStatus: localOrder.paymentStatus,

          orderStatus: localOrder.orderStatus,

          total: localOrder.pricing.total,

          currency: localOrder.pricing.currency,

          paidAt: localOrder.paymentDetails.paidAt,
        },
      },
    });
  }

  if (localOrder.paymentStatus === "paid") {
    throw new ApiError(
      409,
      "This order was already paid using another payment",
    );
  }

  if (localOrder.inventoryStatus === "restored") {
    throw new ApiError(
      409,
      "This payment session has expired. Please contact support if money was deducted",
    );
  }

  /*
    |--------------------------------------------------------------------------
    | Validate Razorpay order ID
    |--------------------------------------------------------------------------
    */

  const storedRazorpayOrderId = localOrder.paymentDetails.razorpayOrderId;

  if (!storedRazorpayOrderId || storedRazorpayOrderId !== razorpay_order_id) {
    await recordPaymentError(localOrder._id, "Razorpay order ID mismatch");

    throw new ApiError(400, "Payment verification failed");
  }

  /*
    |--------------------------------------------------------------------------
    | Verify HMAC signature
    |--------------------------------------------------------------------------
    */

  const signatureIsValid = verifyRazorpaySignature({
    razorpayOrderId: storedRazorpayOrderId,

    razorpayPaymentId: razorpay_payment_id,

    razorpaySignature: razorpay_signature,
  });

  if (!signatureIsValid) {
    await recordPaymentError(
      localOrder._id,
      "Invalid Razorpay payment signature",
    );

    throw new ApiError(400, "Payment signature verification failed");
  }

  /*
    |--------------------------------------------------------------------------
    | Fetch payment from Razorpay
    |--------------------------------------------------------------------------
    */

  let razorpayPayment;

  try {
    razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
  } catch (error) {
    await recordPaymentError(
      localOrder._id,
      "Unable to fetch payment from Razorpay",
    );

    throw new ApiError(502, "Unable to confirm payment with Razorpay");
  }

  /*
    |--------------------------------------------------------------------------
    | Verify order, amount, currency and capture status
    |--------------------------------------------------------------------------
    */

  const expectedAmount = convertRupeesToPaise(localOrder.pricing.total);

  if (razorpayPayment.order_id !== storedRazorpayOrderId) {
    await recordPaymentError(
      localOrder._id,
      "Payment does not belong to this order",
    );

    throw new ApiError(400, "Payment order verification failed");
  }

  if (Number(razorpayPayment.amount) !== expectedAmount) {
    await recordPaymentError(localOrder._id, "Payment amount mismatch");

    throw new ApiError(400, "Payment amount verification failed");
  }

  if (razorpayPayment.currency !== "INR") {
    await recordPaymentError(localOrder._id, "Payment currency mismatch");

    throw new ApiError(400, "Payment currency verification failed");
  }

  if (razorpayPayment.status !== "captured") {
    await recordPaymentError(
      localOrder._id,
      `Payment status is ${razorpayPayment.status}`,
    );

    throw new ApiError(409, "Payment has not been captured yet");
  }

  /*
    |--------------------------------------------------------------------------
    | Commit successful payment
    |--------------------------------------------------------------------------
    */

  const session = await mongoose.startSession();

  let verifiedOrder;
  let shouldSendNotifications = false;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(localOrderId).session(session);

      if (!order) {
        throw new ApiError(404, "Order not found");
      }

      /*
          |--------------------------------------------------------------------------
          | Prevent duplicate processing
          |--------------------------------------------------------------------------
          */

      if (order.paymentStatus === "paid") {
        if (order.paymentDetails.razorpayPaymentId !== razorpay_payment_id) {
          throw new ApiError(
            409,
            "Order was already paid using another payment",
          );
        }

        verifiedOrder = order;
        return;
      }

      if (order.inventoryStatus !== "reserved") {
        throw new ApiError(409, "Reserved inventory is no longer available");
      }

      /*
          |--------------------------------------------------------------------------
          | Stock was reduced during reservation.
          | Increase sold count only after successful payment.
          |--------------------------------------------------------------------------
          */

      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);

        if (!product) {
          continue;
        }

        product.soldCount = (product.soldCount || 0) + item.quantity;

        await product.save({
          session,
        });
      }

      /*
          |--------------------------------------------------------------------------
          | Save payment result
          |--------------------------------------------------------------------------
          */

      order.paymentStatus = "paid";

      order.inventoryStatus = "committed";

      order.reservationExpiresAt = null;

      order.paymentDetails.razorpayPaymentId = razorpay_payment_id;

      // Signature is verified but not stored.
      order.paymentDetails.razorpaySignature = "";

      order.paymentDetails.paidAt = new Date();

      order.paymentDetails.lastPaymentError = "";

      /*
          |--------------------------------------------------------------------------
          | Add order timeline entry
          |--------------------------------------------------------------------------
          */

      order.statusHistory.push({
        status: "placed",
        message: "Payment received and order placed successfully",
        changedAt: new Date(),
      });

      verifiedOrder = await order.save({
        session,
      });

      shouldSendNotifications = true;
    });
  } finally {
    await session.endSession();
  }

  /*
  |--------------------------------------------------------------------------
  | Notify only after the successful payment transaction has committed.
  | Notification failures must never cancel or delay the placed order.
  |--------------------------------------------------------------------------
  */

  if (shouldSendNotifications) {
    triggerOrderNotifications(verifiedOrder);
  }

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",

    data: {
      order: {
        id: verifiedOrder._id,

        orderNumber: verifiedOrder.orderNumber,

        paymentStatus: verifiedOrder.paymentStatus,

        orderStatus: verifiedOrder.orderStatus,

        total: verifiedOrder.pricing.total,

        currency: verifiedOrder.pricing.currency,

        paidAt: verifiedOrder.paymentDetails.paidAt,
      },
    },
  });
});
