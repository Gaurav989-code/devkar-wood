import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheck,
  FiCreditCard,
  FiExternalLink,
  FiMail,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiRefreshCw,
  FiSave,
  FiTruck,
  FiUser,
} from "react-icons/fi";

import {
  clearAdminOrderMutationError,
  clearSelectedAdminOrder,
  fetchAdminOrderById,
  updateOrderStatusForAdmin,
  updateOrderTrackingForAdmin,
} from "../../features/adminOrders/adminOrderSlice.js";

const STATUS_MESSAGES = {
  placed: "The order has been placed",
  confirmed: "The order has been confirmed",
  processing: "The order is being prepared",
  shipped: "The order has been shipped",
  delivered: "The order has been delivered",
  cancelled: "The order has been cancelled",
  returned: "The order has been returned",
};

const ALLOWED_TRANSITIONS = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const getOrderStatusClasses = (status) => {
  const classes = {
    placed: "bg-blue-100 text-blue-700",
    confirmed: "bg-indigo-100 text-indigo-700",
    processing: "bg-amber-100 text-amber-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    returned: "bg-orange-100 text-orange-700",
  };

  return classes[status] || "bg-stone-100 text-stone-600";
};

const getPaymentStatusClasses = (status) => {
  const classes = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-purple-100 text-purple-700",
  };

  return classes[status] || "bg-stone-100 text-stone-600";
};

const getItemImage = (item) => {
  if (typeof item.image === "string") {
    return item.image;
  }

  return item.image?.url || "";
};

const AdminOrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const {
    selectedOrder: order,
    selectedOrderLoading,
    selectedOrderError,
    updatingStatus,
    updatingTracking,
    mutationError,
  } = useSelector((state) => state.adminOrders);

  const [nextStatus, setNextStatus] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");

  const [trackingForm, setTrackingForm] = useState({
    courierName: "",
    trackingNumber: "",
    trackingUrl: "",
  });

  const [trackingErrors, setTrackingErrors] = useState({});

  /*
  |--------------------------------------------------------------------------
  | Load order
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(fetchAdminOrderById(id));

    return () => {
      dispatch(clearSelectedAdminOrder());
    };
  }, [dispatch, id]);

  /*
  |--------------------------------------------------------------------------
  | Initialize forms
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!order) {
      return;
    }

    const transitions = ALLOWED_TRANSITIONS[order.orderStatus] || [];

    setNextStatus(transitions[0] || "");

    setCancellationReason(order.cancellationReason || "");

    setTrackingForm({
      courierName: order.tracking?.courierName || "",
      trackingNumber: order.tracking?.trackingNumber || "",
      trackingUrl: order.tracking?.trackingUrl || "",
    });
  }, [order]);

  /*
  |--------------------------------------------------------------------------
  | Mutation error
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!mutationError) {
      return;
    }

    toast.error(mutationError);
    dispatch(clearAdminOrderMutationError());
  }, [dispatch, mutationError]);

  const allowedTransitions = useMemo(() => {
    return ALLOWED_TRANSITIONS[order?.orderStatus] || [];
  }, [order?.orderStatus]);

  /*
  |--------------------------------------------------------------------------
  | Status update
  |--------------------------------------------------------------------------
  */

  const handleStatusUpdate = async (event) => {
    event.preventDefault();

    if (!nextStatus || updatingStatus) {
      return;
    }

    if (nextStatus === "cancelled" && cancellationReason.trim().length < 3) {
      toast.error("Please enter a cancellation reason");
      return;
    }

    try {
      await dispatch(
        updateOrderStatusForAdmin({
          orderId: order._id,
          orderStatus: nextStatus,
          cancellationReason:
            nextStatus === "cancelled" ? cancellationReason.trim() : "",
        }),
      ).unwrap();

      toast.success(`Order status updated to ${nextStatus}`);
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to update order status",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Tracking update
  |--------------------------------------------------------------------------
  */

  const handleTrackingChange = (event) => {
    const { name, value } = event.target;

    setTrackingForm((current) => ({
      ...current,
      [name]: value,
    }));

    setTrackingErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateTrackingForm = () => {
    const errors = {};

    if (!trackingForm.courierName.trim()) {
      errors.courierName = "Courier name is required";
    }

    if (!trackingForm.trackingNumber.trim()) {
      errors.trackingNumber = "Tracking number is required";
    }

    if (
      trackingForm.trackingUrl.trim() &&
      !/^https?:\/\/.+/i.test(trackingForm.trackingUrl.trim())
    ) {
      errors.trackingUrl =
        "Enter a valid URL beginning with http:// or https://";
    }

    setTrackingErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleTrackingUpdate = async (event) => {
    event.preventDefault();

    if (updatingTracking || !validateTrackingForm()) {
      return;
    }

    try {
      await dispatch(
        updateOrderTrackingForAdmin({
          orderId: order._id,
          courierName: trackingForm.courierName.trim(),
          trackingNumber: trackingForm.trackingNumber.trim(),
          trackingUrl: trackingForm.trackingUrl.trim(),
        }),
      ).unwrap();

      toast.success("Order tracking updated successfully");
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to update tracking information",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (selectedOrderLoading) {
    return (
      <main className="animate-pulse">
        <div className="h-4 w-36 rounded bg-[#DED0BD]" />

        <div className="mt-6 h-12 w-80 rounded bg-[#DED0BD]" />

        <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="h-72 rounded-[1.75rem] bg-white" />
            <div className="h-96 rounded-[1.75rem] bg-white" />
          </div>

          <div className="space-y-6">
            <div className="h-80 rounded-[1.75rem] bg-white" />
            <div className="h-72 rounded-[1.75rem] bg-white" />
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (selectedOrderError || !order) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <FiAlertCircle size={28} />
          </div>

          <h1 className="mt-5 font-serif text-4xl text-[#2A1810]">
            Order not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#756157]">
            {selectedOrderError || "This order could not be loaded."}
          </p>

          <Link
            to="/admin/orders"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
          >
            <FiArrowLeft />
            Back to orders
          </Link>
        </div>
      </main>
    );
  }

  const shippingAddress = order.shippingAddress || {};

  const trackingLocked = ["cancelled", "returned", "delivered"].includes(
    order.orderStatus,
  );

  const subtotal = order.pricing?.subtotal || 0;

  const shipping =
    order.pricing?.shipping ?? order.pricing?.shippingCharge ?? 0;

  const discount = order.pricing?.discount || 0;

  const tax = order.pricing?.tax || 0;

  return (
    <main className="p-4">
      {/* Heading */}

      <section className="flex flex-col gap-5 border-b border-[#2A1810]/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#A45A3A] transition hover:text-[#7D422B]"
          >
            <FiArrowLeft />
            Back to orders
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-4xl text-[#2A1810] sm:text-5xl">
              {order.orderNumber}
            </h1>

            <span
              className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${getOrderStatusClasses(
                order.orderStatus,
              )}`}
            >
              {order.orderStatus}
            </span>
          </div>

          <p className="mt-3 text-sm text-[#756157]">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(fetchAdminOrderById(id))}
          disabled={selectedOrderLoading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#2A1810]/15 bg-white px-5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A]"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_370px]">
        <div className="space-y-8">
          {/* Products */}

          <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 shadow-[0_16px_45px_rgba(42,24,16,0.04)] sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#A45A3A]/10 text-[#A45A3A]">
                <FiPackage />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#A45A3A]">
                  Order contents
                </p>

                <h2 className="font-serif text-2xl text-[#2A1810]">
                  Ordered products
                </h2>
              </div>
            </div>

            <div className="mt-7 divide-y divide-[#2A1810]/10">
              {order.items?.map((item, index) => {
                const itemImage = getItemImage(item);

                return (
                  <motion.article
                    key={item._id || `${item.product}-${index}`}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="flex gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#E9DDCC]">
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FiPackage className="text-[#9A8476]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-xl text-[#2A1810]">
                        {item.name}
                      </h3>

                      {item.variant?.attributes &&
                        Object.keys(item.variant.attributes).length > 0 && (
                          <p className="mt-1 text-xs text-[#756157]">
                            {Object.entries(item.variant.attributes)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(" · ")}
                          </p>
                        )}

                      <p className="mt-3 text-xs text-[#756157]">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-[#2A1810]">
                      {formatPrice(Number(item.price) * Number(item.quantity))}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </section>

          {/* Customer and address */}

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6">
              <div className="flex items-center gap-3">
                <FiUser className="text-[#A45A3A]" />

                <h2 className="font-serif text-2xl text-[#2A1810]">Customer</h2>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <p className="font-semibold text-[#2A1810]">
                  {order.customer?.name || "Guest customer"}
                </p>

                <a
                  href={`mailto:${order.customer?.email}`}
                  className="flex items-center gap-3 text-[#756157] transition hover:text-[#A45A3A]"
                >
                  <FiMail className="shrink-0 text-[#A45A3A]" />
                  <span className="break-all">
                    {order.customer?.email || "—"}
                  </span>
                </a>

                <a
                  href={`tel:${order.customer?.phone}`}
                  className="flex items-center gap-3 text-[#756157] transition hover:text-[#A45A3A]"
                >
                  <FiPhone className="shrink-0 text-[#A45A3A]" />
                  {order.customer?.phone || "—"}
                </a>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6">
              <div className="flex items-center gap-3">
                <FiMapPin className="text-[#A45A3A]" />

                <h2 className="font-serif text-2xl text-[#2A1810]">
                  Shipping address
                </h2>
              </div>

              <address className="mt-6 not-italic text-sm leading-7 text-[#756157]">
                <span className="block font-semibold text-[#2A1810]">
                  {order.customer?.name}
                </span>

                <span className="block">{shippingAddress.addressLine1}</span>

                {shippingAddress.addressLine2 && (
                  <span className="block">{shippingAddress.addressLine2}</span>
                )}

                {shippingAddress.landmark && (
                  <span className="block">
                    Landmark: {shippingAddress.landmark}
                  </span>
                )}

                <span className="block">
                  {shippingAddress.city}, {shippingAddress.state}{" "}
                  {shippingAddress.postalCode || shippingAddress.pincode}
                </span>

                <span className="block">
                  {shippingAddress.country || "India"}
                </span>
              </address>
            </div>
          </section>

          {/* Status history */}

          <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <FiRefreshCw className="text-[#A45A3A]" />

              <h2 className="font-serif text-2xl text-[#2A1810]">
                Status history
              </h2>
            </div>

            {order.statusHistory?.length > 0 ? (
              <div className="mt-7 space-y-0">
                {[...order.statusHistory]
                  .reverse()
                  .map((history, index, historyItems) => (
                    <div
                      key={
                        history._id ||
                        `${history.status}-${history.changedAt}-${index}`
                      }
                      className="relative flex gap-4 pb-7 last:pb-0"
                    >
                      {index < historyItems.length - 1 && (
                        <span className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-[#2A1810]/10" />
                      )}

                      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A45A3A] text-white">
                        <FiCheck size={14} />
                      </span>

                      <div>
                        <p className="text-sm font-semibold capitalize text-[#2A1810]">
                          {history.status}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#756157]">
                          {history.message || STATUS_MESSAGES[history.status]}
                        </p>

                        <p className="mt-2 text-[10px] text-[#9A8476]">
                          {formatDate(history.changedAt || history.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-[#756157]">
                No status history is available.
              </p>
            )}
          </section>
        </div>

        {/* Sidebar */}

        <aside className="space-y-6">
          {/* Pricing */}

          <section className="rounded-[1.75rem] bg-[#21130E] p-6 text-[#FFF9EF]">
            <div className="flex items-center gap-3">
              <FiCreditCard className="text-[#D9B477]" />

              <h2 className="font-serif text-2xl">Payment</h2>
            </div>

            <div className="mt-6 space-y-4 border-b border-white/15 pb-6 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#C8B6A3]">Subtotal</span>

                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[#C8B6A3]">Shipping</span>

                <span>{formatPrice(shipping)}</span>
              </div>

              {tax > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-[#C8B6A3]">Tax</span>

                  <span>{formatPrice(tax)}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between gap-4 text-[#D9B477]">
                  <span>Discount</span>

                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="font-serif text-xl">Total</span>

              <span className="font-serif text-2xl text-[#D9B477]">
                {formatPrice(order.pricing?.total)}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em]">
                {order.paymentMethod}
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] ${getPaymentStatusClasses(
                  order.paymentStatus,
                )}`}
              >
                {order.paymentStatus}
              </span>
            </div>

            {order.paymentDetails?.razorpayPaymentId && (
              <p className="mt-5 break-all text-[10px] leading-5 text-[#C8B6A3]">
                Payment ID: {order.paymentDetails.razorpayPaymentId}
              </p>
            )}
          </section>

          {/* Update status */}

          <form
            onSubmit={handleStatusUpdate}
            className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6"
          >
            <div className="flex items-center gap-3">
              <FiPackage className="text-[#A45A3A]" />

              <h2 className="font-serif text-2xl text-[#2A1810]">
                Update status
              </h2>
            </div>

            {allowedTransitions.length > 0 ? (
              <>
                <label className="mt-6 block">
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Next order status
                  </span>

                  <select
                    value={nextStatus}
                    onChange={(event) => setNextStatus(event.target.value)}
                    className="h-12 w-full rounded-xl border border-[#2A1810]/15 bg-[#FFFCF7] px-4 text-sm capitalize text-[#2A1810] outline-none focus:border-[#A45A3A]"
                  >
                    {allowedTransitions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                {nextStatus === "cancelled" && (
                  <label className="mt-4 block">
                    <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                      Cancellation reason *
                    </span>

                    <textarea
                      rows={4}
                      maxLength={500}
                      value={cancellationReason}
                      onChange={(event) =>
                        setCancellationReason(event.target.value)
                      }
                      placeholder="Explain why this order is being cancelled..."
                      className="w-full resize-none rounded-xl border border-[#2A1810]/15 bg-[#FFFCF7] p-4 text-sm text-[#2A1810] outline-none focus:border-[#A45A3A]"
                    />
                  </label>
                )}

                <button
                  type="submit"
                  disabled={updatingStatus || !nextStatus}
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#2A1810] px-5 text-[9px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#A45A3A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingStatus ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Update to {nextStatus}
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="mt-6 rounded-2xl bg-[#F4ECE0] p-4">
                <p className="text-xs leading-6 text-[#756157]">
                  This order is currently{" "}
                  <strong className="capitalize text-[#2A1810]">
                    {order.orderStatus}
                  </strong>{" "}
                  and has no further available status transitions.
                </p>
              </div>
            )}
          </form>

          {/* Tracking */}

          <form
            onSubmit={handleTrackingUpdate}
            className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6"
          >
            <div className="flex items-center gap-3">
              <FiTruck className="text-[#A45A3A]" />

              <h2 className="font-serif text-2xl text-[#2A1810]">
                Shipping tracking
              </h2>
            </div>

            {trackingLocked && (
              <div className="mt-5 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-700">
                Tracking cannot be changed for a {order.orderStatus} order.
              </div>
            )}

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Courier name *
                </span>

                <input
                  type="text"
                  name="courierName"
                  disabled={trackingLocked}
                  value={trackingForm.courierName}
                  onChange={handleTrackingChange}
                  placeholder="Blue Dart"
                  className={`h-12 w-full rounded-xl border bg-[#FFFCF7] px-4 text-sm text-[#2A1810] outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    trackingErrors.courierName
                      ? "border-red-500"
                      : "border-[#2A1810]/15 focus:border-[#A45A3A]"
                  }`}
                />

                {trackingErrors.courierName && (
                  <span className="mt-1 block text-xs text-red-600">
                    {trackingErrors.courierName}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Tracking number *
                </span>

                <input
                  type="text"
                  name="trackingNumber"
                  disabled={trackingLocked}
                  value={trackingForm.trackingNumber}
                  onChange={handleTrackingChange}
                  placeholder="AWB123456789"
                  className={`h-12 w-full rounded-xl border bg-[#FFFCF7] px-4 text-sm text-[#2A1810] outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    trackingErrors.trackingNumber
                      ? "border-red-500"
                      : "border-[#2A1810]/15 focus:border-[#A45A3A]"
                  }`}
                />

                {trackingErrors.trackingNumber && (
                  <span className="mt-1 block text-xs text-red-600">
                    {trackingErrors.trackingNumber}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Tracking URL
                </span>

                <input
                  type="url"
                  name="trackingUrl"
                  disabled={trackingLocked}
                  value={trackingForm.trackingUrl}
                  onChange={handleTrackingChange}
                  placeholder="https://courier.example/track/..."
                  className={`h-12 w-full rounded-xl border bg-[#FFFCF7] px-4 text-sm text-[#2A1810] outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    trackingErrors.trackingUrl
                      ? "border-red-500"
                      : "border-[#2A1810]/15 focus:border-[#A45A3A]"
                  }`}
                />

                {trackingErrors.trackingUrl && (
                  <span className="mt-1 block text-xs text-red-600">
                    {trackingErrors.trackingUrl}
                  </span>
                )}
              </label>
            </div>

            {!trackingLocked && (
              <button
                type="submit"
                disabled={updatingTracking}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#2A1810] px-5 text-[9px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#A45A3A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingTracking ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave />
                    Save tracking
                  </>
                )}
              </button>
            )}

            {order.tracking?.trackingUrl && (
              <a
                href={order.tracking.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#2A1810]/15 text-[9px] font-bold uppercase tracking-[0.13em] text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A]"
              >
                <FiExternalLink />
                Open tracking page
              </a>
            )}
          </form>

          {/* Customer note */}

          {order.customerNote && (
            <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6">
              <h2 className="font-serif text-2xl text-[#2A1810]">
                Customer note
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#756157]">
                {order.customerNote}
              </p>
            </section>
          )}

          {/* Cancellation */}

          {order.orderStatus === "cancelled" && order.cancellationReason && (
            <section className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6">
              <h2 className="font-serif text-2xl text-red-800">Cancellation</h2>

              <p className="mt-4 text-sm leading-7 text-red-700">
                {order.cancellationReason}
              </p>

              {order.cancelledAt && (
                <p className="mt-3 text-[10px] text-red-600">
                  {formatDate(order.cancelledAt)}
                </p>
              )}
            </section>
          )}
        </aside>
      </div>
    </main>
  );
};

export default AdminOrderDetails;
