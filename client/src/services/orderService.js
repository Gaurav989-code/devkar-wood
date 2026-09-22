import api from "./api.js";

/*
|--------------------------------------------------------------------------
| Create cash-on-delivery order
|--------------------------------------------------------------------------
*/

export const createCodOrder = async (checkoutData) => {
  const response = await api.post("/orders", {
    ...checkoutData,
    paymentMethod: "cod",
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Create Razorpay order
|--------------------------------------------------------------------------
*/

export const createRazorpayOrder = async (checkoutData) => {
  const response = await api.post("/orders/razorpay/create", {
    ...checkoutData,
    paymentMethod: "razorpay",
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Verify Razorpay payment
|--------------------------------------------------------------------------
*/

export const verifyRazorpayPayment = async ({
  localOrderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const response = await api.post("/orders/razorpay/verify", {
    localOrderId,

    razorpay_order_id: razorpayOrderId,

    razorpay_payment_id: razorpayPaymentId,

    razorpay_signature: razorpaySignature,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Track guest order
|--------------------------------------------------------------------------
*/

export const trackGuestOrder = async ({ orderNumber, email, phone }) => {
  const response = await api.post("/orders/track", {
    orderNumber,
    email,
    phone,
  });

  return response.data;
};
