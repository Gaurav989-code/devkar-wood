import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiAlertCircle,
  FiArrowRight,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiTrash2,
  FiTruck,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { trackGuestOrder } from "../../services/orderService.js";
import {
  clearSavedGuestOrders,
  getSavedGuestOrders,
  removeSavedGuestOrder,
} from "../../utils/guestOrderStorage.js";

const formatPrice = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const getStatusClass = (status) => {
  const statusClasses = {
    placed: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-violet-100 text-violet-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    returned: "bg-orange-100 text-orange-700",
  };

  return statusClasses[status] || "bg-stone-100 text-stone-700";
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [unavailableOrders, setUnavailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedOrders = useCallback(async () => {
    const savedOrders = getSavedGuestOrders();

    if (savedOrders.length === 0) {
      setOrders([]);
      setUnavailableOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const results = await Promise.allSettled(
        savedOrders.map(async (savedOrder) => {
          const response = await trackGuestOrder({
            orderNumber: savedOrder.orderNumber,
            email: savedOrder.email,
            phone: savedOrder.phone,
          });

          return response?.data?.order;
        }),
      );

      const available = [];
      const unavailable = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          available.push(result.value);
        } else {
          unavailable.push(savedOrders[index]);
        }
      });

      setOrders(available);
      setUnavailableOrders(unavailable);
    } catch {
      toast.error("Unable to load your saved orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedOrders();
  }, [fetchSavedOrders]);

  const handleRemoveOrder = (orderNumber) => {
    removeSavedGuestOrder(orderNumber);

    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.orderNumber !== orderNumber),
    );

    setUnavailableOrders((currentOrders) =>
      currentOrders.filter((order) => order.orderNumber !== orderNumber),
    );

    toast.success("Order removed from this device");
  };

  const handleClearHistory = () => {
    clearSavedGuestOrders();
    setOrders([]);
    setUnavailableOrders([]);

    toast.success("Order history cleared from this device");
  };

  const hasSavedOrders = orders.length > 0 || unavailableOrders.length > 0;

  return (
    <main className="min-h-[75vh] bg-[#F7F0E5] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A45A3A]">
              Guest purchases
            </p>

            <h1 className="mt-3 font-serif text-4xl text-[#2A1810] sm:text-5xl">
              My orders
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-[#6F5A4E]">
              Orders placed from this browser appear here automatically. No
              account or login is required.
            </p>
          </div>

          {hasSavedOrders && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={fetchSavedOrders}
                disabled={loading}
                className="flex items-center gap-2 rounded-full border border-[#2A1810]/20 px-4 py-2.5 text-sm font-semibold text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A] disabled:opacity-50"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                type="button"
                onClick={handleClearHistory}
                className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                <FiTrash2 />
                Clear
              </button>
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="text-center">
              <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-[#A45A3A]/25 border-t-[#A45A3A]" />

              <p className="mt-4 text-sm text-[#6F5A4E]">
                Loading your orders...
              </p>
            </div>
          </div>
        ) : !hasSavedOrders ? (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="mt-12 rounded-3xl border border-[#2A1810]/10 bg-[#FFF9EF] px-6 py-14 text-center shadow-[0_20px_60px_rgba(42,24,16,0.07)]"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EEE0CC] text-[#A45A3A]">
              <FiShoppingBag size={30} />
            </div>

            <h2 className="mt-6 font-serif text-3xl text-[#2A1810]">
              No saved orders
            </h2>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-[#6F5A4E]">
              Orders you place from this browser will automatically appear here.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2A1810] px-6 py-3 font-semibold text-[#FFF9EF] transition hover:bg-[#48291C]"
              >
                Explore products
                <FiArrowRight />
              </Link>

              <Link
                to="/track-order"
                className="inline-flex items-center justify-center rounded-full border border-[#2A1810]/20 px-6 py-3 font-semibold text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A]"
              >
                Track another order
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="mt-10 space-y-5">
            {orders.map((order, index) => (
              <motion.article
                key={order.orderNumber}
                initial={{
                  opacity: 0,
                  y: 22,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.07,
                  duration: 0.45,
                }}
                className="overflow-hidden rounded-3xl border border-[#2A1810]/10 bg-[#FFF9EF] shadow-[0_16px_50px_rgba(42,24,16,0.07)]"
              >
                <div className="flex flex-col gap-4 border-b border-[#2A1810]/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-[#8E7666]">
                      Order number
                    </p>

                    <h2 className="mt-1 font-serif text-xl font-semibold text-[#2A1810]">
                      {order.orderNumber}
                    </h2>

                    <p className="mt-1 text-sm text-[#806B5D]">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${getStatusClass(
                      order.orderStatus,
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                <div className="grid gap-6 px-6 py-6 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFE2CF] text-[#A45A3A]">
                        {order.orderStatus === "shipped" ? (
                          <FiTruck />
                        ) : (
                          <FiPackage />
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-[#806B5D]">
                          {order.items?.length || 0} product
                          {order.items?.length === 1 ? "" : "s"}
                        </p>

                        <p className="font-serif text-xl font-semibold text-[#2A1810]">
                          {formatPrice(order.pricing?.total)}
                        </p>
                      </div>
                    </div>

                    {order.items?.length > 0 && (
                      <p className="mt-4 line-clamp-1 text-sm text-[#6F5A4E]">
                        {order.items
                          .map((item) => `${item.name} × ${item.quantity}`)
                          .join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/track-order"
                      className="inline-flex items-center gap-2 rounded-full bg-[#2A1810] px-5 py-2.5 text-sm font-semibold text-[#FFF9EF] transition hover:bg-[#48291C]"
                    >
                      View tracking
                      <FiArrowRight />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemoveOrder(order.orderNumber)}
                      aria-label={`Remove ${order.orderNumber} from this device`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-red-200 text-red-600 transition hover:bg-red-50"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}

            {unavailableOrders.map((savedOrder) => (
              <article
                key={savedOrder.orderNumber}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="mt-1 shrink-0 text-amber-700" />

                    <div>
                      <p className="font-semibold text-amber-900">
                        {savedOrder.orderNumber}
                      </p>

                      <p className="mt-1 text-sm text-amber-700">
                        This order could not be refreshed. Check your connection
                        and try again.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveOrder(savedOrder.orderNumber)}
                    className="w-fit text-sm font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyOrders;
