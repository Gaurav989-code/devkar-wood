const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN = /^[6-9]\d{9}$/;

const POSTAL_CODE_PATTERN = /^[1-9]\d{5}$/;

const cleanString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

export const validateCheckoutForm = (formData) => {
  const errors = {};

  const name = cleanString(formData.customer.name);

  const email = cleanString(formData.customer.email).toLowerCase();

  const phone = cleanString(formData.customer.phone).replace(/\D/g, "");

  const addressLine1 = cleanString(formData.shippingAddress.addressLine1);

  const city = cleanString(formData.shippingAddress.city);

  const state = cleanString(formData.shippingAddress.state);

  const postalCode = cleanString(formData.shippingAddress.postalCode);

  if (name.length < 2) {
    errors.name = "Please enter your full name";
  }

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!PHONE_PATTERN.test(phone)) {
    errors.phone = "Enter a valid 10-digit Indian phone number";
  }

  if (!addressLine1) {
    errors.addressLine1 = "Delivery address is required";
  }

  if (!city) {
    errors.city = "City is required";
  }

  if (!state) {
    errors.state = "State is required";
  }

  if (!POSTAL_CODE_PATTERN.test(postalCode)) {
    errors.postalCode = "Enter a valid 6-digit postal code";
  }

  if (!["cod", "razorpay"].includes(formData.paymentMethod)) {
    errors.paymentMethod = "Select a payment method";
  }

  return {
    isValid: Object.keys(errors).length === 0,

    errors,

    cleanedData: {
      customer: {
        name,
        email,
        phone,
      },

      shippingAddress: {
        addressLine1,

        addressLine2: cleanString(formData.shippingAddress.addressLine2),

        landmark: cleanString(formData.shippingAddress.landmark),

        city,
        state,
        postalCode,

        country: cleanString(formData.shippingAddress.country) || "India",
      },

      paymentMethod: formData.paymentMethod,

      customerNote: cleanString(formData.customerNote),
    },
  };
};
