import mongoose from "mongoose";

import Order from "../models/Order.js";
import Product from "../models/Product.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendOrderNotifications } from "../utils/sendOrderNotifications.js";

/*
|--------------------------------------------------------------------------
| Checkout configuration
|--------------------------------------------------------------------------
*/

const DEFAULT_SHIPPING_CHARGE = 0;
const MAX_QUANTITY_PER_PRODUCT = 10;

const roundMoney = (amount) => {
  return Math.round((Number(amount) + Number.EPSILON) * 100) / 100;
};

/*
|--------------------------------------------------------------------------
| Normalize Indian phone number
|--------------------------------------------------------------------------
*/

const normalizePhone = (value = "") => {
  const digits = String(value).replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return digits;
};

/*
|--------------------------------------------------------------------------
| Normalize customer information
|--------------------------------------------------------------------------
*/

const normalizeCustomer = (customer = {}) => {
  return {
    name: typeof customer.name === "string" ? customer.name.trim() : "",

    email:
      typeof customer.email === "string"
        ? customer.email.trim().toLowerCase()
        : "",

    phone: normalizePhone(customer.phone),
  };
};

/*
|--------------------------------------------------------------------------
| Trigger order notifications safely
|--------------------------------------------------------------------------
| This function intentionally does not await the notification request.
| Email failure must never cancel a successfully created order.
|--------------------------------------------------------------------------
*/

const triggerOrderNotifications = (order) => {
  if (!order) {
    return;
  }

  void sendOrderNotifications(order).catch((error) => {
    console.error(
      `Unexpected notification error for order ${
        order.orderNumber || order._id
      }:`,
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
    const productId = String(item.product);

    const quantity = Number(item.quantity);

    const existingQuantity = combinedItems.get(productId) || 0;

    combinedItems.set(productId, existingQuantity + quantity);
  });

  return Array.from(combinedItems.entries()).map(([product, quantity]) => ({
    product,
    quantity,
  }));
};

/*
|--------------------------------------------------------------------------
| Create guest cash-on-delivery order
|--------------------------------------------------------------------------
| POST /api/v1/orders
| Public route
|--------------------------------------------------------------------------
*/

export const createGuestOrder = asyncHandler(async (req, res) => {
  const {
    customer,
    shippingAddress,
    items,
    paymentMethod,
    customerNote = "",
  } = req.body;

  /*
  |--------------------------------------------------------------------------
  | Payment-method validation
  |--------------------------------------------------------------------------
  */

  if (paymentMethod !== "cod") {
    throw new ApiError(
      400,
      "Razorpay orders must be created through the payment endpoint",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Validate customer information
  |--------------------------------------------------------------------------
  */

  const normalizedCustomer = normalizeCustomer(customer);

  if (!normalizedCustomer.name) {
    throw new ApiError(400, "Customer name is required");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedCustomer.email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (!/^[6-9]\d{9}$/.test(normalizedCustomer.phone)) {
    throw new ApiError(
      400,
      "Please provide a valid 10-digit Indian phone number",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Validate cart
  |--------------------------------------------------------------------------
  */

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  for (const item of items) {
    if (!item?.product) {
      throw new ApiError(400, "Every cart item must contain a product ID");
    }

    const quantity = Number(item.quantity);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY_PER_PRODUCT
    ) {
      throw new ApiError(
        400,
        `Product quantity must be between 1 and ${MAX_QUANTITY_PER_PRODUCT}`,
      );
    }

    if (!mongoose.isValidObjectId(item.product)) {
      throw new ApiError(400, "A cart product ID is invalid");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize duplicate cart items
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

  /*
  |--------------------------------------------------------------------------
  | Start MongoDB transaction
  |--------------------------------------------------------------------------
  */

  const session = await mongoose.startSession();

  let createdOrder = null;

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
      | Verify products and calculate trusted prices
      |--------------------------------------------------------------------------
      */

      for (const cartItem of normalizedItems) {
        const product = productMap.get(cartItem.product);

        if (!product) {
          throw new ApiError(400, "A product in your cart is unavailable");
        }

        if (!product.allowCashOnDelivery) {
          throw new ApiError(
            400,
            `Cash on delivery is unavailable for ${product.name}`,
          );
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
        | Calculate item price and tax
        |--------------------------------------------------------------------------
        */

        const unitPrice =
          product.salePrice !== null && product.salePrice !== undefined
            ? product.salePrice
            : product.price;

        const itemSubtotal = roundMoney(unitPrice * cartItem.quantity);

        const taxRate = Number(product.taxRate) || 0;

        const itemTax = roundMoney(itemSubtotal * (taxRate / 100));

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
        | Update product inventory
        |--------------------------------------------------------------------------
        */

        if (product.trackInventory) {
          product.stock -= cartItem.quantity;
        }

        product.soldCount = (product.soldCount || 0) + cartItem.quantity;

        await product.save({
          session,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Calculate final order totals
      |--------------------------------------------------------------------------
      */

      subtotal = roundMoney(subtotal);

      tax = roundMoney(tax);

      const shippingCharge = allProductsHaveFreeShipping
        ? 0
        : DEFAULT_SHIPPING_CHARGE;

      const discount = 0;

      const total = roundMoney(subtotal + tax + shippingCharge - discount);

      /*
      |--------------------------------------------------------------------------
      | Create COD order
      |--------------------------------------------------------------------------
      */

      const orders = await Order.create(
        [
          {
            customer: normalizedCustomer,

            shippingAddress,

            items: orderItems,

            inventoryStatus: "committed",

            reservationExpiresAt: null,

            pricing: {
              currency: "INR",

              subtotal,

              discount,

              shippingCharge,

              tax,

              total,
            },

            couponCode: "",

            paymentMethod: "cod",

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

                message: "Your order has been placed successfully",

                changedAt: new Date(),
              },
            ],

            customerNote:
              typeof customerNote === "string" ? customerNote.trim() : "",
          },
        ],
        {
          session,
        },
      );

      createdOrder = orders[0];
    });
  } finally {
    await session.endSession();
  }

  /*
  |--------------------------------------------------------------------------
  | Confirm that transaction produced an order
  |--------------------------------------------------------------------------
  */

  if (!createdOrder) {
    throw new ApiError(500, "The order could not be created");
  }

  /*
  |--------------------------------------------------------------------------
  | Trigger notifications after successful transaction
  |--------------------------------------------------------------------------
  | The transaction has already committed when withTransaction resolves.
  |--------------------------------------------------------------------------
  */

  triggerOrderNotifications(createdOrder);

  /*
  |--------------------------------------------------------------------------
  | Return order immediately
  |--------------------------------------------------------------------------
  */

  return res.status(201).json({
    success: true,

    message: "Order placed successfully",

    data: {
      order: createdOrder,
    },
  });
});

/*
|--------------------------------------------------------------------------
| Track guest order
|--------------------------------------------------------------------------
| POST /api/v1/orders/track
| Public route
|--------------------------------------------------------------------------
*/

export const trackGuestOrder = asyncHandler(async (req, res) => {
  const { orderNumber, email, phone } = req.body;

  /*
    |--------------------------------------------------------------------------
    | Normalize tracking information
    |--------------------------------------------------------------------------
    */

  const cleanedOrderNumber =
    typeof orderNumber === "string" ? orderNumber.trim().toUpperCase() : "";

  const cleanedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";

  const cleanedPhone = normalizePhone(phone);

  /*
    |--------------------------------------------------------------------------
    | Validate tracking information
    |--------------------------------------------------------------------------
    */

  if (!cleanedOrderNumber || !cleanedEmail || !cleanedPhone) {
    throw new ApiError(
      400,
      "Order number, email and phone number are required",
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
    throw new ApiError(
      400,
      "Please provide a valid 10-digit Indian phone number",
    );
  }

  /*
    |--------------------------------------------------------------------------
    | Find order using all three credentials
    |--------------------------------------------------------------------------
    */

  const order = await Order.findOne({
    orderNumber: cleanedOrderNumber,

    "customer.email": cleanedEmail,

    "customer.phone": cleanedPhone,
  }).select(
    [
      "orderNumber",
      "customer.name",
      "items",
      "pricing",
      "paymentMethod",
      "paymentStatus",
      "orderStatus",
      "statusHistory",
      "tracking",
      "cancelledAt",
      "cancellationReason",
      "createdAt",
      "updatedAt",
    ].join(" "),
  );

  if (!order) {
    throw new ApiError(404, "Order not found. Please check your order details");
  }

  return res.status(200).json({
    success: true,

    message: "Order tracking details fetched successfully",

    data: {
      order,
    },
  });
});
