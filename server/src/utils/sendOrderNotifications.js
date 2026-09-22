import { sendOrderConfirmationEmail } from "../services/emailService.js";

/*
|--------------------------------------------------------------------------
| Safe error message
|--------------------------------------------------------------------------
*/

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message || error?.message || "Email delivery failed"
  );
};

/*
|--------------------------------------------------------------------------
| Send order notifications
|--------------------------------------------------------------------------
| Notification failures are logged and returned, but never thrown.
| Therefore, a successfully placed order is never cancelled because an
| email provider is unavailable.
*/

export const sendOrderNotifications = async (order) => {
  if (!order) {
    console.error("Order notifications skipped: order information is missing");

    return {
      email: {
        success: false,
        skipped: true,
        result: null,
        error: "Order information is missing",
      },
    };
  }

  const orderNumber = order.orderNumber || order._id || "unknown-order";
  const customerEmail = order.customer?.email?.trim()?.toLowerCase();

  if (!customerEmail) {
    console.error(
      `Order confirmation email skipped for ${orderNumber}: customer email is missing`,
    );

    return {
      email: {
        success: false,
        skipped: true,
        result: null,
        error: "Customer email is missing",
      },
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Promise.allSettled keeps this ready for WhatsApp/SMS notifications later.
  |--------------------------------------------------------------------------
  */

  const [emailResult] = await Promise.allSettled([
    sendOrderConfirmationEmail(order),
  ]);

  if (emailResult.status === "rejected") {
    const errorMessage = getErrorMessage(emailResult.reason);

    console.error(
      `Order confirmation email failed for ${orderNumber}:`,
      errorMessage,
    );

    return {
      email: {
        success: false,
        skipped: false,
        result: null,
        error: errorMessage,
      },
    };
  }

  console.log(
    `✅ Order confirmation email sent for ${orderNumber} to ${customerEmail}`,
  );

  return {
    email: {
      success: true,
      skipped: false,
      result: emailResult.value,
      error: null,
    },
  };
};
