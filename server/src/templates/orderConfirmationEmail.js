const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
};

const formatPaymentMethod = (paymentMethod) => {
  if (paymentMethod === "cod") {
    return "Cash on Delivery";
  }

  if (paymentMethod === "razorpay") {
    return "Online payment";
  }

  return paymentMethod || "Not available";
};

const createProductRows = (items = []) => {
  return items
    .map((item) => {
      const productName = escapeHtml(item.name || "Wooden carving");

      const imageUrl = escapeHtml(item.image?.url || item.image || "");

      const quantity = Number(item.quantity) || 1;

      const price = Number(item.price) || 0;

      const lineTotal = price * quantity;

      return `
        <tr>
          <td
            style="
              padding: 16px 0;
              border-bottom: 1px solid #E5D8C6;
              vertical-align: middle;
            "
          >
            <table
              role="presentation"
              width="100%"
              cellspacing="0"
              cellpadding="0"
              border="0"
            >
              <tr>
                ${
                  imageUrl
                    ? `
                      <td
                        width="76"
                        style="
                          width: 76px;
                          padding-right: 16px;
                          vertical-align: middle;
                        "
                      >
                        <img
                          src="${imageUrl}"
                          alt="${productName}"
                          width="64"
                          height="64"
                          style="
                            display: block;
                            width: 64px;
                            height: 64px;
                            border-radius: 10px;
                            object-fit: cover;
                            background-color: #E9DDCC;
                          "
                        />
                      </td>
                    `
                    : ""
                }

                <td style="vertical-align: middle;">
                  <p
                    style="
                      margin: 0;
                      color: #2A1810;
                      font-family: Georgia, 'Times New Roman', serif;
                      font-size: 17px;
                      line-height: 24px;
                      font-weight: bold;
                    "
                  >
                    ${productName}
                  </p>

                  <p
                    style="
                      margin: 5px 0 0;
                      color: #7A675C;
                      font-family: Arial, sans-serif;
                      font-size: 13px;
                      line-height: 20px;
                    "
                  >
                    Quantity: ${quantity}
                  </p>
                </td>

                <td
                  align="right"
                  style="
                    padding-left: 12px;
                    color: #2A1810;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    line-height: 22px;
                    font-weight: bold;
                    vertical-align: middle;
                    white-space: nowrap;
                  "
                >
                  ${formatCurrency(lineTotal)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");
};

export const createOrderConfirmationEmail = ({ order, clientUrl }) => {
  const customerName = escapeHtml(order.customer?.name || "Customer");

  const orderNumber = escapeHtml(order.orderNumber || "");

  const paymentMethod = formatPaymentMethod(order.paymentMethod);

  const paymentStatus = escapeHtml(order.paymentStatus || "pending");

  const subtotal = order.pricing?.subtotal || 0;

  const shipping = order.pricing?.shipping || 0;

  const discount = order.pricing?.discount || 0;

  const total = order.pricing?.total || 0;

  const address = order.shippingAddress || order.address || {};

  const addressLines = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ]
    .filter(Boolean)
    .map(escapeHtml);

  const trackingUrl = `${clientUrl.replace(/\/$/, "")}/track-order`;

  const productRows = createProductRows(order.items);

  const subject = `Order confirmed – ${orderNumber}`;

  const text = `
Hello ${customerName},

Thank you for choosing Devkar Wood Carvings.

Your order has been placed successfully.

Order number: ${orderNumber}
Payment method: ${paymentMethod}
Payment status: ${paymentStatus}
Order total: ${formatCurrency(total)}

Track your order:
${trackingUrl}

Please keep your order number safe. You will need it along with your email and phone number to track the order.

Devkar Wood Carvings
Sangamner, Maharashtra, India
  `.trim();

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>${subject}</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #F1E9DE;
        "
      >
        <div
          style="
            display: none;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
          "
        >
          Your Devkar Wood Carvings order ${orderNumber} has been placed
          successfully.
        </div>

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            background-color: #F1E9DE;
          "
        >
          <tr>
            <td align="center" style="padding: 24px 12px;">
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  max-width: 680px;
                  background-color: #FFF9EF;
                  border: 1px solid #E1D3C0;
                  border-radius: 18px;
                  overflow: hidden;
                "
              >
                <!-- Header -->

                <tr>
                  <td
                    align="center"
                    style="
                      padding: 34px 24px 28px;
                      background-color: #21130E;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        color: #FFF9EF;
                        font-family: Georgia, 'Times New Roman', serif;
                        font-size: 38px;
                        line-height: 42px;
                        font-weight: bold;
                      "
                    >
                      Devkar
                    </p>

                    <p
                      style="
                        margin: 6px 0 0;
                        color: #D9B477;
                        font-family: Arial, sans-serif;
                        font-size: 9px;
                        line-height: 15px;
                        font-weight: bold;
                        letter-spacing: 4px;
                        text-transform: uppercase;
                      "
                    >
                      Wood Carvings
                    </p>
                  </td>
                </tr>

                <!-- Success section -->

                <tr>
                  <td
                    align="center"
                    style="
                      padding: 40px 32px;
                      background-color: #321A11;
                    "
                  >
                    <div
                      style="
                        width: 58px;
                        height: 58px;
                        margin: 0 auto 22px;
                        border-radius: 50%;
                        background-color: #C99532;
                        color: #FFFFFF;
                        font-family: Arial, sans-serif;
                        font-size: 30px;
                        line-height: 58px;
                        text-align: center;
                      "
                    >
                      ✓
                    </div>

                    <h1
                      style="
                        margin: 0;
                        color: #FFF9EF;
                        font-family: Georgia, 'Times New Roman', serif;
                        font-size: 34px;
                        line-height: 43px;
                        font-weight: normal;
                      "
                    >
                      Order placed successfully
                    </h1>

                    <p
                      style="
                        max-width: 520px;
                        margin: 16px auto 0;
                        color: #E6D7C6;
                        font-family: Arial, sans-serif;
                        font-size: 15px;
                        line-height: 25px;
                      "
                    >
                      Thank you, ${customerName}. We have received your order
                      and will begin preparing it carefully.
                    </p>
                  </td>
                </tr>

                <!-- Order details -->

                <tr>
                  <td style="padding: 34px 28px;">
                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      <tr>
                        <td
                          style="
                            padding: 24px;
                            background-color: #F3E7D4;
                            border: 1px solid #DDC9AA;
                            border-radius: 14px;
                          "
                        >
                          <p
                            style="
                              margin: 0;
                              color: #A45A3A;
                              font-family: Arial, sans-serif;
                              font-size: 10px;
                              line-height: 16px;
                              font-weight: bold;
                              letter-spacing: 3px;
                              text-transform: uppercase;
                            "
                          >
                            Your order number
                          </p>

                          <p
                            style="
                              margin: 9px 0 0;
                              color: #2A1810;
                              font-family: Georgia, 'Times New Roman', serif;
                              font-size: 26px;
                              line-height: 34px;
                              font-weight: bold;
                              overflow-wrap: anywhere;
                            "
                          >
                            ${orderNumber}
                          </p>

                          <p
                            style="
                              margin: 12px 0 0;
                              color: #6F5A4E;
                              font-family: Arial, sans-serif;
                              font-size: 13px;
                              line-height: 21px;
                            "
                          >
                            Save this number. You will need it along with your
                            email and phone number to track the order.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Products -->

                    <h2
                      style="
                        margin: 34px 0 8px;
                        color: #2A1810;
                        font-family: Georgia, 'Times New Roman', serif;
                        font-size: 24px;
                        line-height: 32px;
                      "
                    >
                      Your order
                    </h2>

                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      ${productRows}
                    </table>

                    <!-- Pricing -->

                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      style="margin-top: 24px;"
                    >
                      <tr>
                        <td
                          style="
                            padding: 8px 0;
                            color: #6F5A4E;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                          "
                        >
                          Subtotal
                        </td>

                        <td
                          align="right"
                          style="
                            padding: 8px 0;
                            color: #2A1810;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                          "
                        >
                          ${formatCurrency(subtotal)}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding: 8px 0;
                            color: #6F5A4E;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                          "
                        >
                          Shipping
                        </td>

                        <td
                          align="right"
                          style="
                            padding: 8px 0;
                            color: #2A1810;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                          "
                        >
                          ${shipping > 0 ? formatCurrency(shipping) : "Free"}
                        </td>
                      </tr>

                      ${
                        Number(discount) > 0
                          ? `
                            <tr>
                              <td
                                style="
                                  padding: 8px 0;
                                  color: #6F5A4E;
                                  font-family: Arial, sans-serif;
                                  font-size: 14px;
                                "
                              >
                                Discount
                              </td>

                              <td
                                align="right"
                                style="
                                  padding: 8px 0;
                                  color: #15803D;
                                  font-family: Arial, sans-serif;
                                  font-size: 14px;
                                "
                              >
                                -${formatCurrency(discount)}
                              </td>
                            </tr>
                          `
                          : ""
                      }

                      <tr>
                        <td
                          style="
                            padding: 16px 0 8px;
                            border-top: 1px solid #DCCBB7;
                            color: #2A1810;
                            font-family: Georgia, 'Times New Roman', serif;
                            font-size: 20px;
                            font-weight: bold;
                          "
                        >
                          Order total
                        </td>

                        <td
                          align="right"
                          style="
                            padding: 16px 0 8px;
                            border-top: 1px solid #DCCBB7;
                            color: #2A1810;
                            font-family: Georgia, 'Times New Roman', serif;
                            font-size: 22px;
                            font-weight: bold;
                          "
                        >
                          ${formatCurrency(total)}
                        </td>
                      </tr>
                    </table>

                    <!-- Payment and address -->

                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      style="
                        margin-top: 30px;
                        background-color: #F8F0E5;
                        border-radius: 14px;
                      "
                    >
                      <tr>
                        <td style="padding: 22px;">
                          <p
                            style="
                              margin: 0;
                              color: #A45A3A;
                              font-family: Arial, sans-serif;
                              font-size: 10px;
                              line-height: 16px;
                              font-weight: bold;
                              letter-spacing: 2px;
                              text-transform: uppercase;
                            "
                          >
                            Payment
                          </p>

                          <p
                            style="
                              margin: 8px 0 0;
                              color: #2A1810;
                              font-family: Arial, sans-serif;
                              font-size: 14px;
                              line-height: 22px;
                            "
                          >
                            ${escapeHtml(paymentMethod)}
                            ·
                            ${paymentStatus.toUpperCase()}
                          </p>

                          ${
                            addressLines.length > 0
                              ? `
                                <p
                                  style="
                                    margin: 22px 0 0;
                                    color: #A45A3A;
                                    font-family: Arial, sans-serif;
                                    font-size: 10px;
                                    line-height: 16px;
                                    font-weight: bold;
                                    letter-spacing: 2px;
                                    text-transform: uppercase;
                                  "
                                >
                                  Delivery address
                                </p>

                                <p
                                  style="
                                    margin: 8px 0 0;
                                    color: #2A1810;
                                    font-family: Arial, sans-serif;
                                    font-size: 14px;
                                    line-height: 23px;
                                  "
                                >
                                  ${addressLines.join("<br />")}
                                </p>
                              `
                              : ""
                          }
                        </td>
                      </tr>
                    </table>

                    <!-- Track button -->

                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                      style="margin-top: 30px;"
                    >
                      <tr>
                        <td align="center">
                          <a
                            href="${trackingUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                              display: inline-block;
                              padding: 15px 28px;
                              border-radius: 999px;
                              background-color: #2A1810;
                              color: #FFFFFF;
                              font-family: Arial, sans-serif;
                              font-size: 12px;
                              font-weight: bold;
                              letter-spacing: 2px;
                              text-decoration: none;
                              text-transform: uppercase;
                            "
                          >
                            Track your order
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->

                <tr>
                  <td
                    align="center"
                    style="
                      padding: 28px 24px;
                      background-color: #21130E;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        color: #D9B477;
                        font-family: Georgia, 'Times New Roman', serif;
                        font-size: 20px;
                      "
                    >
                      Devkar Wood Carvings
                    </p>

                    <p
                      style="
                        margin: 10px 0 0;
                        color: #A99784;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 20px;
                      "
                    >
                      Sangamner, Maharashtra, India
                    </p>

                    <p
                      style="
                        margin: 8px 0 0;
                        color: #A99784;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                      "
                    >
                      hello@devkarwood.com
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return {
    subject,
    text,
    html,
  };
};
