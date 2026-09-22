import ApiError from "../utils/ApiError.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[6-9]\d{9}$/;
const postalCodePattern = /^[1-9]\d{5}$/;
const mongoIdPattern = /^[a-f\d]{24}$/i;

const cleanString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

export const validateGuestOrder = (req, res, next) => {
  const { customer, shippingAddress, items, paymentMethod, customerNote } =
    req.body;

  const errors = [];

  /*
  |--------------------------------------------------------------------------
  | Customer validation
  |--------------------------------------------------------------------------
  */

  if (!customer || typeof customer !== "object") {
    errors.push({
      field: "customer",
      message: "Customer information is required",
    });
  } else {
    const name = cleanString(customer.name);
    const email = cleanString(customer.email).toLowerCase();
    const phone = cleanString(customer.phone).replace(/\D/g, "");

    if (name.length < 2) {
      errors.push({
        field: "customer.name",
        message: "Customer name must contain at least 2 characters",
      });
    }

    if (name.length > 100) {
      errors.push({
        field: "customer.name",
        message: "Customer name cannot exceed 100 characters",
      });
    }

    if (!emailPattern.test(email)) {
      errors.push({
        field: "customer.email",
        message: "Please provide a valid email address",
      });
    }

    if (!phonePattern.test(phone)) {
      errors.push({
        field: "customer.phone",
        message: "Please provide a valid 10-digit Indian phone number",
      });
    }

    customer.name = name;
    customer.email = email;
    customer.phone = phone;
  }

  /*
  |--------------------------------------------------------------------------
  | Shipping-address validation
  |--------------------------------------------------------------------------
  */

  if (!shippingAddress || typeof shippingAddress !== "object") {
    errors.push({
      field: "shippingAddress",
      message: "Shipping address is required",
    });
  } else {
    const requiredAddressFields = [
      "addressLine1",
      "city",
      "state",
      "postalCode",
    ];

    requiredAddressFields.forEach((field) => {
      const value = cleanString(shippingAddress[field]);

      if (!value) {
        errors.push({
          field: `shippingAddress.${field}`,
          message: `${field} is required`,
        });
      }

      shippingAddress[field] = value;
    });

    shippingAddress.addressLine2 = cleanString(shippingAddress.addressLine2);

    shippingAddress.landmark = cleanString(shippingAddress.landmark);

    shippingAddress.country = cleanString(shippingAddress.country) || "India";

    if (
      shippingAddress.postalCode &&
      !postalCodePattern.test(shippingAddress.postalCode)
    ) {
      errors.push({
        field: "shippingAddress.postalCode",
        message: "Please provide a valid 6-digit Indian postal code",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Cart-item validation
  |--------------------------------------------------------------------------
  */

  if (!Array.isArray(items) || items.length === 0) {
    errors.push({
      field: "items",
      message: "Your cart must contain at least one product",
    });
  } else {
    if (items.length > 20) {
      errors.push({
        field: "items",
        message: "An order cannot contain more than 20 different products",
      });
    }

    items.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push({
          field: `items.${index}`,
          message: "Invalid cart item",
        });

        return;
      }

      const productId = cleanString(item.product);
      const quantity = Number(item.quantity);

      if (!mongoIdPattern.test(productId)) {
        errors.push({
          field: `items.${index}.product`,
          message: "A valid product ID is required",
        });
      }

      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        errors.push({
          field: `items.${index}.quantity`,
          message: "Quantity must be an integer between 1 and 10",
        });
      }

      // Keep only data that the server needs.
      item.product = productId;
      item.quantity = quantity;

      delete item.price;
      delete item.salePrice;
      delete item.subtotal;
      delete item.name;
      delete item.image;
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Payment validation
  |--------------------------------------------------------------------------
  */

  const allowedPaymentMethods = ["cod", "razorpay"];

  if (!allowedPaymentMethods.includes(paymentMethod)) {
    errors.push({
      field: "paymentMethod",
      message: "Payment method must be cod or razorpay",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Optional note
  |--------------------------------------------------------------------------
  */

  if (customerNote !== undefined) {
    const cleanedNote = cleanString(customerNote);

    if (cleanedNote.length > 500) {
      errors.push({
        field: "customerNote",
        message: "Customer note cannot exceed 500 characters",
      });
    }

    req.body.customerNote = cleanedNote;
  }

  /*
  |--------------------------------------------------------------------------
  | Send validation errors
  |--------------------------------------------------------------------------
  */

  if (errors.length > 0) {
    return next(
      new ApiError(400, "Please correct the checkout information", errors),
    );
  }

  next();
};
