import transporter from "../configs/email.js";
import { env } from "../configs/env.js";

import { createOrderConfirmationEmail } from "../templates/orderConfirmationEmail.js";

export const sendOrderConfirmationEmail = async (order) => {
  const customerEmail = order?.customer?.email;

  if (!customerEmail) {
    throw new Error("Customer email address is missing");
  }

  const clientUrl = env.clientUrl || "http://localhost:5173";

  const emailContent = createOrderConfirmationEmail({
    order,
    clientUrl,
  });

  const result = await transporter.sendMail({
    from: {
      name: env.emailFromName || "Devkar Wood Carvings",
      address: env.email,
    },

    to: customerEmail,

    subject: emailContent.subject,

    text: emailContent.text,

    html: emailContent.html,
  });

  return {
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected,
  };
};