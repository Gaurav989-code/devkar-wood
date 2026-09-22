import { useState } from "react";
import { motion } from "motion/react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPackage,
  FiSearch,
  FiTruck,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { trackGuestOrder } from "../../services/orderService.js";

const initialForm = {
  orderNumber: "",
  email: "",
  phone: "",
};

const statusSteps = [
  {
    status: "placed",
    label: "Placed",
    icon: FiPackage,
  },
  {
    status: "confirmed",
    label: "Confirmed",
    icon: FiCheckCircle,
  },
  {
    status: "processing",
    label: "Processing",
    icon: FiClock,
  },
  {
    status: "shipped",
    label: "Shipped",
    icon: FiTruck,
  },
  {
    status: "delivered",
    label: "Delivered",
    icon: FiMapPin,
  },
];

const formatPrice = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
};

const TrackOrder = () => {
  const [form, setForm] = useState(initialForm);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    let cleanedValue = value;

    if (name === "phone") {
      cleanedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "orderNumber") {
      cleanedValue = value.toUpperCase();
    }

    setForm((previous) => ({
      ...previous,
      [name]: cleanedValue,
    }));

    setFormError("");
  };

  const validateForm = () => {
    if (!form.orderNumber.trim()) {
      return "Order number is required";
    }

    if (!form.email.trim()) {
      return "Email address is required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Please enter a valid email address";
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      return "Please enter a valid 10-digit Indian phone number";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setLoading(true);
      setFormError("");
      setOrder(null);

      const response = await trackGuestOrder({
        orderNumber: form.orderNumber.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
      });

      const foundOrder = response?.data?.order;

      if (!foundOrder) {
        throw new Error("Order details were not returned");
      }

      setOrder(foundOrder);
      toast.success("Order found successfully");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to find your order";

      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.status === order?.orderStatus,
  );

  const isTerminalStatus =
    order?.orderStatus === "cancelled" || order?.orderStatus === "returned";

  return (
    <main className="min-h-screen bg-[#f8f3e9] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a06432]">
            Order assistance
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#2c1810] sm:text-5xl">
            Track your order
          </h1>

          <p className="mt-4 leading-7 text-[#705648]">
            Enter the same details you provided during checkout to see the
            latest status of your order.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="mx-auto mt-10 max-w-3xl rounded-3xl border border-[#dfd0b8] bg-[#fffaf0] p-6 shadow-[0_20px_60px_rgba(52,29,18,0.1)] sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="orderNumber"
                className="mb-2 block text-sm font-medium text-[#3a2116]"
              >
                Order number
              </label>

              <input
                id="orderNumber"
                name="orderNumber"
                type="text"
                value={form.orderNumber}
                onChange={handleChange}
                placeholder="Example: DW-1788800000000-A1B2C3"
                autoComplete="off"
                className="w-full rounded-xl border border-[#d9c7aa] bg-white px-4 py-3 text-[#2c1810] outline-none transition placeholder:text-[#aa9786] focus:border-[#a06432] focus:ring-2 focus:ring-[#a06432]/15"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#3a2116]"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-[#d9c7aa] bg-white px-4 py-3 text-[#2c1810] outline-none transition placeholder:text-[#aa9786] focus:border-[#a06432] focus:ring-2 focus:ring-[#a06432]/15"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-[#3a2116]"
              >
                Phone number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit phone number"
                autoComplete="tel"
                className="w-full rounded-xl border border-[#d9c7aa] bg-white px-4 py-3 text-[#2c1810] outline-none transition placeholder:text-[#aa9786] focus:border-[#a06432] focus:ring-2 focus:ring-[#a06432]/15"
              />
            </div>
          </div>

          {formError && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <FiAlertCircle className="mt-0.5 shrink-0" />
              <p>{formError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#2c1810] px-6 py-3.5 font-semibold text-[#fffaf0] transition hover:bg-[#48291c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Finding order...
              </>
            ) : (
              <>
                <FiSearch />
                Track order
              </>
            )}
          </button>
        </motion.form>

        {order && (
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mt-10 overflow-hidden rounded-3xl border border-[#dfd0b8] bg-[#fffaf0] shadow-[0_20px_60px_rgba(52,29,18,0.1)]"
          >
            <div className="flex flex-col justify-between gap-5 bg-[#2c1810] px-6 py-7 text-[#fffaf0] sm:flex-row sm:items-center sm:px-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b777]">
                  Order number
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  {order.orderNumber}
                </h2>

                <p className="mt-1 text-sm text-[#d9cabc]">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                  order.orderStatus === "delivered"
                    ? "bg-emerald-100 text-emerald-700"
                    : isTerminalStatus
                      ? "bg-red-100 text-red-700"
                      : "bg-[#d7a849] text-[#2c1810]"
                }`}
              >
                {order.orderStatus}
              </span>
            </div>

            <div className="p-6 sm:p-8">
              {!isTerminalStatus ? (
                <div className="overflow-x-auto pb-2">
                  <div className="flex min-w-[650px] items-start">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      const completed = index <= currentStepIndex;

                      return (
                        <div
                          key={step.status}
                          className="relative flex flex-1 flex-col items-center"
                        >
                          {index < statusSteps.length - 1 && (
                            <div
                              className={`absolute left-1/2 top-5 h-0.5 w-full ${
                                index < currentStepIndex
                                  ? "bg-[#a06432]"
                                  : "bg-[#dfd0b8]"
                              }`}
                            />
                          )}

                          <div
                            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                              completed
                                ? "border-[#a06432] bg-[#a06432] text-white"
                                : "border-[#d8c7aa] bg-[#fffaf0] text-[#a89481]"
                            }`}
                          >
                            <Icon />
                          </div>

                          <p
                            className={`mt-3 text-xs font-semibold uppercase tracking-wide ${
                              completed ? "text-[#2c1810]" : "text-[#a89481]"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                  <div className="flex items-center gap-2 font-semibold">
                    <FiAlertCircle />
                    Order {order.orderStatus}
                  </div>

                  {order.cancellationReason && (
                    <p className="mt-2 text-sm">
                      Reason: {order.cancellationReason}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-9">
                <h3 className="font-serif text-2xl text-[#2c1810]">
                  Order items
                </h3>

                <div className="mt-4 divide-y divide-[#eadfcd]">
                  {order.items?.map((item, index) => (
                    <div
                      key={`${item.product}-${index}`}
                      className="flex gap-4 py-5 first:pt-0"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#eadfcd]">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#8c745f]">
                            <FiPackage className="text-2xl" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-[#2c1810]">
                          {item.name}
                        </h4>

                        <p className="mt-1 text-sm text-[#806958]">
                          SKU: {item.sku}
                        </p>

                        <p className="mt-1 text-sm text-[#806958]">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="font-semibold text-[#2c1810]">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 ml-auto max-w-sm space-y-3 border-t border-[#eadfcd] pt-6">
                <div className="flex justify-between text-sm text-[#715443]">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.pricing?.subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm text-[#715443]">
                  <span>Shipping</span>
                  <span>
                    {order.pricing?.shippingCharge === 0
                      ? "Free"
                      : formatPrice(order.pricing?.shippingCharge)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-[#715443]">
                  <span>Tax</span>
                  <span>{formatPrice(order.pricing?.tax)}</span>
                </div>

                {order.pricing?.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-700">
                    <span>Discount</span>
                    <span>-{formatPrice(order.pricing.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-[#eadfcd] pt-4 font-serif text-xl font-semibold text-[#2c1810]">
                  <span>Total</span>
                  <span>{formatPrice(order.pricing?.total)}</span>
                </div>
              </div>

              {order.tracking?.trackingNumber && (
                <div className="mt-8 rounded-2xl border border-[#dfd0b8] bg-[#f7efe2] p-5">
                  <div className="flex items-center gap-2 font-semibold text-[#2c1810]">
                    <FiTruck />
                    Shipping details
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-[#715443]">
                    <p>Courier: {order.tracking.courierName}</p>
                    <p>Tracking number: {order.tracking.trackingNumber}</p>

                    {order.tracking.trackingUrl && (
                      <a
                        href={order.tracking.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block pt-2 font-semibold text-[#9d642d] underline underline-offset-4"
                      >
                        Track on courier website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
};

export default TrackOrder;
