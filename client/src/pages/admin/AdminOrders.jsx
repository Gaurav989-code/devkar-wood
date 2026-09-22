import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiEye,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiX,
} from "react-icons/fi";

import { fetchAdminOrders } from "../../features/adminOrders/adminOrderSlice.js";

const ORDER_STATUS_OPTIONS = [
  {
    value: "",
    label: "All order statuses",
  },
  {
    value: "placed",
    label: "Placed",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "shipped",
    label: "Shipped",
  },
  {
    value: "delivered",
    label: "Delivered",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
  {
    value: "returned",
    label: "Returned",
  },
];

const PAYMENT_STATUS_OPTIONS = [
  {
    value: "",
    label: "All payment statuses",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "paid",
    label: "Paid",
  },
  {
    value: "failed",
    label: "Failed",
  },
  {
    value: "refunded",
    label: "Refunded",
  },
];

const PAYMENT_METHOD_OPTIONS = [
  {
    value: "",
    label: "All payment methods",
  },
  {
    value: "cod",
    label: "Cash on delivery",
  },
  {
    value: "razorpay",
    label: "Razorpay",
  },
];

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest first",
  },
  {
    value: "oldest",
    label: "Oldest first",
  },
  {
    value: "totalHighToLow",
    label: "Total: High to low",
  },
  {
    value: "totalLowToHigh",
    label: "Total: Low to high",
  },
];

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
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

const AdminOrders = () => {
  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );

  const { orders, pagination, ordersLoading, ordersError } = useSelector(
    (state) => state.adminOrders,
  );

  const currentPage = Math.max(Number(searchParams.get("page")) || 1, 1);

  const orderStatus = searchParams.get("orderStatus") || "";

  const paymentStatus = searchParams.get("paymentStatus") || "";

  const paymentMethod = searchParams.get("paymentMethod") || "";

  const selectedSort = searchParams.get("sort") || "newest";

  /*
  |--------------------------------------------------------------------------
  | API parameters
  |--------------------------------------------------------------------------
  */

  const requestParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: 10,
      sort: selectedSort,
    };

    const search = searchParams.get("search");

    if (search) {
      params.search = search;
    }

    if (orderStatus) {
      params.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      params.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      params.paymentMethod = paymentMethod;
    }

    return params;
  }, [
    currentPage,
    orderStatus,
    paymentMethod,
    paymentStatus,
    searchParams,
    selectedSort,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Fetch orders
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(fetchAdminOrders(requestParams));
  }, [dispatch, requestParams]);

  /*
  |--------------------------------------------------------------------------
  | URL filters
  |--------------------------------------------------------------------------
  */

  const updateFilter = (key, value) => {
    const updatedParams = new URLSearchParams(searchParams);

    if (value === "" || value === null || value === undefined) {
      updatedParams.delete(key);
    } else {
      updatedParams.set(key, String(value));
    }

    if (key !== "page") {
      updatedParams.set("page", "1");
    }

    setSearchParams(updatedParams);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    updateFilter("search", searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const totalPages = Number(pagination?.totalPages) || 0;

  const totalOrders =
    pagination?.totalOrders ?? pagination?.totalItems ?? orders.length;

  const activeFilters = [
    searchParams.get("search"),
    orderStatus,
    paymentStatus,
    paymentMethod,
  ].filter(Boolean);

  return (
    <main className="p-4">
      {/* Heading */}

      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A45A3A]">
            Fulfilment management
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#2A1810] sm:text-5xl">
            Orders
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#756157]">
            Review purchases, payments, fulfilment and delivery information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(fetchAdminOrders(requestParams))}
          disabled={ordersLoading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#2A1810]/15 bg-white px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A] disabled:opacity-50"
        >
          <FiRefreshCw className={ordersLoading ? "animate-spin" : ""} />
          Refresh orders
        </button>
      </section>

      {/* Filters */}

      <section className="mt-8 rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-4 shadow-[0_16px_45px_rgba(42,24,16,0.05)] sm:p-5">
        <form onSubmit={handleSearch} className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7569]" />

          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search order number, customer, email or phone..."
            className="h-12 w-full rounded-full border border-[#2A1810]/10 bg-[#FAF6EF] pl-11 pr-24 text-sm text-[#2A1810] outline-none transition focus:border-[#A45A3A]"
          />

          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-[#2A1810] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white"
          >
            Search
          </button>
        </form>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <select
            value={orderStatus}
            onChange={(event) =>
              updateFilter("orderStatus", event.target.value)
            }
            className="h-11 rounded-full border border-[#2A1810]/10 bg-[#FAF6EF] px-4 text-xs font-semibold text-[#2A1810] outline-none focus:border-[#A45A3A]"
          >
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={paymentStatus}
            onChange={(event) =>
              updateFilter("paymentStatus", event.target.value)
            }
            className="h-11 rounded-full border border-[#2A1810]/10 bg-[#FAF6EF] px-4 text-xs font-semibold text-[#2A1810] outline-none focus:border-[#A45A3A]"
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={paymentMethod}
            onChange={(event) =>
              updateFilter("paymentMethod", event.target.value)
            }
            className="h-11 rounded-full border border-[#2A1810]/10 bg-[#FAF6EF] px-4 text-xs font-semibold text-[#2A1810] outline-none focus:border-[#A45A3A]"
          >
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={selectedSort}
            onChange={(event) => updateFilter("sort", event.target.value)}
            className="h-11 rounded-full border border-[#2A1810]/10 bg-[#FAF6EF] px-4 text-xs font-semibold text-[#2A1810] outline-none focus:border-[#A45A3A]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#2A1810]/8 pt-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7569]">
              Active filters
            </span>

            {searchParams.get("search") && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateFilter("search", "");
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#A45A3A]/10 px-3 py-1.5 text-[9px] font-semibold text-[#A45A3A]"
              >
                Search: {searchParams.get("search")}
                <FiX />
              </button>
            )}

            {orderStatus && (
              <button
                type="button"
                onClick={() => updateFilter("orderStatus", "")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#A45A3A]/10 px-3 py-1.5 text-[9px] font-semibold capitalize text-[#A45A3A]"
              >
                {orderStatus}
                <FiX />
              </button>
            )}

            {paymentStatus && (
              <button
                type="button"
                onClick={() => updateFilter("paymentStatus", "")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#A45A3A]/10 px-3 py-1.5 text-[9px] font-semibold capitalize text-[#A45A3A]"
              >
                Payment: {paymentStatus}
                <FiX />
              </button>
            )}

            {paymentMethod && (
              <button
                type="button"
                onClick={() => updateFilter("paymentMethod", "")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#A45A3A]/10 px-3 py-1.5 text-[9px] font-semibold uppercase text-[#A45A3A]"
              >
                {paymentMethod}
                <FiX />
              </button>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#756157] transition hover:text-[#A45A3A]"
            >
              Clear all
            </button>
          </div>
        )}
      </section>

      {/* Count */}

      <div className="mt-7 flex items-center justify-between">
        <p className="text-sm text-[#756157]">
          {ordersLoading
            ? "Loading orders..."
            : `${totalOrders} order${totalOrders === 1 ? "" : "s"} found`}
        </p>
      </div>

      {/* Loading */}

      {ordersLoading && (
        <section className="mt-5 overflow-hidden rounded-[1.75rem] border border-[#2A1810]/10 bg-white">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse items-center gap-4 border-b border-[#2A1810]/8 p-5 last:border-b-0"
            >
              <div className="h-12 w-12 rounded-full bg-[#E7D9C5]" />

              <div className="flex-1">
                <div className="h-4 w-44 rounded bg-[#E7D9C5]" />
                <div className="mt-3 h-3 w-28 rounded bg-[#EFE5D7]" />
              </div>

              <div className="hidden h-4 w-24 rounded bg-[#E7D9C5] sm:block" />
            </div>
          ))}
        </section>
      )}

      {/* Error */}

      {!ordersLoading && ordersError && (
        <section className="mt-5 rounded-[1.75rem] border border-red-200 bg-red-50 px-6 py-16 text-center">
          <FiShoppingBag size={32} className="mx-auto text-red-500" />

          <h2 className="mt-4 font-serif text-3xl text-[#2A1810]">
            Orders could not be loaded
          </h2>

          <p className="mt-3 text-sm text-red-700">{ordersError}</p>

          <button
            type="button"
            onClick={() => dispatch(fetchAdminOrders(requestParams))}
            className="mt-6 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
          >
            Try again
          </button>
        </section>
      )}

      {/* Desktop table */}

      {!ordersLoading && !ordersError && orders.length > 0 && (
        <section className="mt-5 hidden overflow-hidden rounded-[1.75rem] border border-[#2A1810]/10 bg-white shadow-[0_16px_45px_rgba(42,24,16,0.04)] lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-[#F4ECE0]">
                <tr className="text-left text-[9px] font-bold uppercase tracking-[0.16em] text-[#756157]">
                  <th className="px-6 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Order status</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-t border-[#2A1810]/8 transition hover:bg-[#FCF8F2]"
                  >
                    <td className="px-6 py-5">
                      <p className="font-serif text-lg font-semibold text-[#2A1810]">
                        {order.orderNumber}
                      </p>

                      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#8A7569]">
                        {order.items?.length || 0} item
                        {order.items?.length === 1 ? "" : "s"}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="max-w-48 truncate text-sm font-semibold text-[#2A1810]">
                        {order.customer?.name || "Guest"}
                      </p>

                      <p className="mt-1 max-w-48 truncate text-[10px] text-[#756157]">
                        {order.customer?.phone || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2">
                        <FiCreditCard className="shrink-0 text-[#A45A3A]" />

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[#2A1810]">
                            {order.paymentMethod}
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${getPaymentStatusClasses(
                              order.paymentStatus,
                            )}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] ${getOrderStatusClasses(
                          order.orderStatus,
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-sm font-bold text-[#2A1810]">
                        {formatPrice(order.pricing?.total)}
                      </p>
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-xs text-[#756157]">
                        {formatDate(order.createdAt)}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="flex h-10 items-center gap-2 rounded-full border border-[#2A1810]/10 px-4 text-[8px] font-bold uppercase tracking-[0.11em] text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A]"
                        >
                          <FiEye />
                          View order
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Mobile cards */}

      {!ordersLoading && !ordersError && orders.length > 0 && (
        <section className="mt-5 grid gap-4 lg:hidden">
          {orders.map((order, index) => (
            <motion.article
              key={order._id}
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: Math.min(index, 5) * 0.04,
              }}
              className="rounded-[1.5rem] border border-[#2A1810]/10 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-xl font-semibold text-[#2A1810]">
                    {order.orderNumber}
                  </p>

                  <p className="mt-1 text-[10px] text-[#756157]">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${getOrderStatusClasses(
                    order.orderStatus,
                  )}`}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 border-y border-[#2A1810]/8 py-4">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#8A7569]">
                    Customer
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-[#2A1810]">
                    {order.customer?.name || "Guest"}
                  </p>

                  <p className="mt-1 text-[10px] text-[#756157]">
                    {order.customer?.phone || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#8A7569]">
                    Total
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#2A1810]">
                    {formatPrice(order.pricing?.total)}
                  </p>

                  <p className="mt-1 text-[10px] uppercase text-[#756157]">
                    {order.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${getPaymentStatusClasses(
                    order.paymentStatus,
                  )}`}
                >
                  Payment {order.paymentStatus}
                </span>

                <Link
                  to={`/admin/orders/${order._id}`}
                  className="flex h-10 items-center gap-2 rounded-full bg-[#2A1810] px-4 text-[8px] font-bold uppercase tracking-[0.11em] text-white"
                >
                  <FiEye />
                  View order
                </Link>
              </div>
            </motion.article>
          ))}
        </section>
      )}

      {/* Empty state */}

      {!ordersLoading && !ordersError && orders.length === 0 && (
        <section className="mt-5 rounded-[1.75rem] border border-[#2A1810]/10 bg-white px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#A45A3A]/10 text-[#A45A3A]">
            {activeFilters.length > 0 ? (
              <FiSearch size={27} />
            ) : (
              <FiPackage size={27} />
            )}
          </div>

          <h2 className="mt-5 font-serif text-3xl text-[#2A1810]">
            No orders found
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756157]">
            {activeFilters.length > 0
              ? "No orders match the selected search and filters."
              : "New customer orders will appear here."}
          </p>

          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
            >
              Clear filters
            </button>
          )}
        </section>
      )}

      {/* Pagination */}

      {!ordersLoading && totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[1.5rem] border border-[#2A1810]/10 bg-white px-5 py-4 sm:flex-row">
          <p className="text-xs text-[#756157]">
            Page <strong className="text-[#2A1810]">{currentPage}</strong> of{" "}
            <strong className="text-[#2A1810]">{totalPages}</strong>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => updateFilter("page", currentPage - 1)}
              className="flex h-10 items-center gap-2 rounded-full border border-[#2A1810]/10 px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2A1810] transition hover:bg-[#2A1810] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiChevronLeft />
              Previous
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => updateFilter("page", currentPage + 1)}
              className="flex h-10 items-center gap-2 rounded-full border border-[#2A1810]/10 px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2A1810] transition hover:bg-[#2A1810] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminOrders;
