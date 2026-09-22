import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiBox,
  FiDollarSign,
  FiMessageSquare,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingUp,
} from "react-icons/fi";

import {
  fetchAdminDashboard,
  selectDashboardError,
  selectDashboardLoaded,
  selectDashboardLoading,
  selectDashboardOverview,
  selectDashboardRefreshing,
  selectLowStockItems,
  selectMonthlySales,
  selectOrderStatusSummary,
  selectRecentEnquiries,
  selectRecentOrders,
} from "../../features/adminDashboard/adminDashboardSlice.js";

import { selectCurrentAdmin } from "../../features/adminAuth/adminAuthSlice.js";

const formatPrice = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const getStatusClass = (status) => {
  const classes = {
    placed: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-violet-100 text-violet-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    returned: "bg-orange-100 text-orange-700",

    new: "bg-amber-100 text-amber-700",
    contacted: "bg-blue-100 text-blue-700",
    quoted: "bg-violet-100 text-violet-700",
    accepted: "bg-emerald-100 text-emerald-700",
    completed: "bg-green-100 text-green-700",
    closed: "bg-stone-200 text-stone-700",
  };

  return classes[status] || "bg-stone-100 text-stone-700";
};

const AdminDashboard = () => {
  const dispatch = useDispatch();

  const admin = useSelector(selectCurrentAdmin);

  const overview = useSelector(selectDashboardOverview);

  const orderStatuses = useSelector(selectOrderStatusSummary);

  const monthlySales = useSelector(selectMonthlySales);

  const recentOrders = useSelector(selectRecentOrders);

  const recentEnquiries = useSelector(selectRecentEnquiries);

  const lowStockItems = useSelector(selectLowStockItems);

  const loading = useSelector(selectDashboardLoading);

  const refreshing = useSelector(selectDashboardRefreshing);

  const loaded = useSelector(selectDashboardLoaded);

  const error = useSelector(selectDashboardError);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchAdminDashboard());
    }
  }, [dispatch, loaded]);

  const maximumMonthlyRevenue = useMemo(() => {
    return Math.max(
      ...monthlySales.map((item) => Number(item.revenue) || 0),
      1,
    );
  }, [monthlySales]);

  const statCards = [
    {
      label: "Total revenue",
      value: formatPrice(overview.totalRevenue),
      note: `${overview.paidOrders} paid orders`,
      icon: FiDollarSign,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Total orders",
      value: overview.totalOrders,
      note: `${overview.todayOrders} received today`,
      icon: FiShoppingBag,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Active products",
      value: overview.activeProducts,
      note: `${overview.totalProducts} total products`,
      icon: FiPackage,
      color: "bg-violet-100 text-violet-700",
    },
    {
      label: "New enquiries",
      value: overview.newEnquiries,
      note: `${overview.totalEnquiries} total enquiries`,
      icon: FiMessageSquare,
      color: "bg-amber-100 text-amber-700",
    },
  ];

  if (loading && !loaded) {
    return (
      <div className="p-5 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-9 w-64 rounded bg-[#DED2C2]" />
          <div className="mt-3 h-4 w-80 rounded bg-[#E7DCCD]" />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div key={index} className="h-40 rounded-2xl bg-[#E6DACB]" />
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="h-96 rounded-2xl bg-[#E6DACB]" />
            <div className="h-96 rounded-2xl bg-[#E6DACB]" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !loaded) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-5">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center">
          <FiAlertTriangle size={32} className="mx-auto text-red-600" />

          <h2 className="mt-5 font-serif text-3xl text-[#2A1810]">
            Dashboard unavailable
          </h2>

          <p className="mt-3 text-sm text-[#6F5A4E]">{error}</p>

          <button
            type="button"
            onClick={() => dispatch(fetchAdminDashboard())}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2A1810] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white"
          >
            <FiRefreshCw />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 lg:p-8">
      {/* Heading */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#A45A3A]">
            Business overview
          </p>

          <h2 className="mt-2 font-serif text-3xl text-[#2A1810] sm:text-4xl">
            Welcome back, {admin?.name?.split(" ")[0] || "Admin"}
          </h2>

          <p className="mt-2 text-sm text-[#78665A]">
            Here is what is happening with Devkar Wood today.
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(fetchAdminDashboard())}
          disabled={refreshing}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2A1810]/15 bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A] disabled:opacity-50"
        >
          <FiRefreshCw className={refreshing ? "animate-spin" : ""} />

          {refreshing ? "Refreshing" : "Refresh data"}
        </button>
      </div>

      {error && loaded && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          <FiAlertTriangle />
          {error}
        </div>
      )}

      {/* Statistics */}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.article
              key={card.label}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.06,
              }}
              className="rounded-2xl border border-[#2A1810]/8 bg-white p-6 shadow-[0_10px_35px_rgba(42,24,16,0.05)]"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}
                >
                  <Icon size={19} />
                </div>

                <FiTrendingUp className="text-[#AFA093]" />
              </div>

              <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.16em] text-[#8A7668]">
                {card.label}
              </p>

              <p className="mt-2 font-serif text-3xl font-semibold text-[#2A1810]">
                {card.value}
              </p>

              <p className="mt-2 text-xs text-[#8A7668]">{card.note}</p>
            </motion.article>
          );
        })}
      </div>

      {/* Monthly sales and status */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-[#2A1810]/8 bg-white p-6 shadow-[0_10px_35px_rgba(42,24,16,0.05)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#A45A3A]">
                Revenue
              </p>

              <h3 className="mt-2 font-serif text-2xl text-[#2A1810]">
                Six-month sales
              </h3>
            </div>

            <p className="text-xs text-[#8A7668]">Paid orders only</p>
          </div>

          <div className="mt-8 flex h-64 items-end gap-3 sm:gap-5">
            {monthlySales.map((month, index) => {
              const revenue = Number(month.revenue) || 0;

              const barHeight =
                revenue > 0
                  ? Math.max((revenue / maximumMonthlyRevenue) * 100, 7)
                  : 2;

              return (
                <div
                  key={`${month.year}-${month.month}`}
                  className="flex h-full flex-1 flex-col justify-end"
                >
                  <div className="group relative flex h-full items-end">
                    <motion.div
                      initial={{
                        height: 0,
                      }}
                      animate={{
                        height: `${barHeight}%`,
                      }}
                      transition={{
                        duration: 0.7,
                        delay: index * 0.08,
                      }}
                      className="w-full rounded-t-xl bg-linear-to-t from-[#A45A3A] to-[#D9B477]"
                    />

                    <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#21130E] px-3 py-2 text-[10px] text-white group-hover:block">
                      {formatPrice(revenue)}
                    </div>
                  </div>

                  <p className="mt-3 text-center text-[10px] font-semibold text-[#7A675C]">
                    {month.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#2A1810]/8 bg-white p-6 shadow-[0_10px_35px_rgba(42,24,16,0.05)]">
          <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#A45A3A]">
            Fulfilment
          </p>

          <h3 className="mt-2 font-serif text-2xl text-[#2A1810]">
            Order status
          </h3>

          <div className="mt-7 space-y-4">
            {[
              "placed",
              "confirmed",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
              "returned",
            ].map((status) => {
              const count = orderStatuses[status] || 0;

              const percentage =
                overview.totalOrders > 0
                  ? (count / overview.totalOrders) * 100
                  : 0;

              return (
                <div key={status}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold capitalize text-[#5F4A3F]">
                      {status}
                    </span>

                    <span className="text-xs font-bold text-[#2A1810]">
                      {count}
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EDE4D8]">
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${percentage}%`,
                      }}
                      className="h-full rounded-full bg-[#A45A3A]"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/admin/orders"
            className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A45A3A]"
          >
            Manage orders
            <FiArrowRight />
          </Link>
        </section>
      </div>

      {/* Recent orders */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-[#2A1810]/8 bg-white shadow-[0_10px_35px_rgba(42,24,16,0.05)]">
        <div className="flex items-center justify-between border-b border-[#2A1810]/8 p-6">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#A45A3A]">
              Latest activity
            </p>

            <h3 className="mt-2 font-serif text-2xl text-[#2A1810]">
              Recent orders
            </h3>
          </div>

          <Link
            to="/admin/orders"
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A45A3A]"
          >
            View all
            <FiArrowRight />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#7A675C]">
            No orders have been placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-[#2A1810]/8 bg-[#FBF8F3] text-left">
                  {[
                    "Order",
                    "Customer",
                    "Total",
                    "Payment",
                    "Status",
                    "Date",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.14em] text-[#887568]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2A1810]/8">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="transition hover:bg-[#FBF8F3]">
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="text-xs font-bold text-[#A45A3A]"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#2A1810]">
                        {order.customer?.name}
                      </p>

                      <p className="mt-1 text-[10px] text-[#8A7668]">
                        {order.customer?.phone}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-[#2A1810]">
                      {formatPrice(order.pricing?.total)}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs uppercase text-[#5F4A3F]">
                        {order.paymentMethod}
                      </p>

                      <p className="mt-1 text-[9px] uppercase text-[#8A7668]">
                        {order.paymentStatus}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase ${getStatusClass(
                          order.orderStatus,
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#7A675C]">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Enquiries and inventory */}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#2A1810]/8 bg-white p-6 shadow-[0_10px_35px_rgba(42,24,16,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#A45A3A]">
                Custom work
              </p>

              <h3 className="mt-2 font-serif text-2xl text-[#2A1810]">
                Recent enquiries
              </h3>
            </div>

            <FiMessageSquare className="text-[#A45A3A]" />
          </div>

          <div className="mt-6 divide-y divide-[#2A1810]/8">
            {recentEnquiries.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#7A675C]">
                No enquiries received.
              </p>
            ) : (
              recentEnquiries.map((enquiry) => (
                <Link
                  key={enquiry._id}
                  to={`/admin/enquiries/${enquiry._id}`}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#2A1810]">
                      {enquiry.customer?.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#7A675C]">
                      {enquiry.carvingType}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase ${getStatusClass(
                      enquiry.status,
                    )}`}
                  >
                    {enquiry.status}
                  </span>
                </Link>
              ))
            )}
          </div>

          <Link
            to="/admin/enquiries"
            className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A45A3A]"
          >
            View enquiries
            <FiArrowRight />
          </Link>
        </section>

        <section className="rounded-2xl border border-[#2A1810]/8 bg-white p-6 shadow-[0_10px_35px_rgba(42,24,16,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#A45A3A]">
                Inventory
              </p>

              <h3 className="mt-2 font-serif text-2xl text-[#2A1810]">
                Low-stock products
              </h3>
            </div>

            <FiAlertTriangle className="text-amber-600" />
          </div>

          <div className="mt-6 divide-y divide-[#2A1810]/8">
            {lowStockItems.length === 0 ? (
              <div className="py-8 text-center">
                <FiBox className="mx-auto text-emerald-600" />

                <p className="mt-3 text-sm text-[#7A675C]">
                  Inventory levels look good.
                </p>
              </div>
            ) : (
              lowStockItems.map((product) => {
                const image =
                  product.images?.find((item) => item.isPrimary) ||
                  product.images?.[0];

                return (
                  <Link
                    key={product._id}
                    to={`/admin/products/${product._id}`}
                    className="flex items-center gap-4 py-4"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#E9DDCC]">
                      {image?.url ? (
                        <img
                          src={image.url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <FiPackage className="text-[#A45A3A]" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#2A1810]">
                        {product.name}
                      </p>

                      <p className="mt-1 text-[10px] text-[#8A7668]">
                        SKU: {product.sku}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase ${
                        product.stock <= 0
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {product.stock} left
                    </span>
                  </Link>
                );
              })
            )}
          </div>

          <Link
            to="/admin/products"
            className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A45A3A]"
          >
            Manage inventory
            <FiArrowRight />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
