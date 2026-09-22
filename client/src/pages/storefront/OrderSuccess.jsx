import { motion } from "motion/react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiCreditCard,
  FiHome,
  FiPackage,
} from "react-icons/fi";
import { Link, useLocation, useParams } from "react-router-dom";

const formatPrice = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const location = useLocation();

  // Navigation state exists immediately after checkout.
  // It disappears after manually refreshing the page.
  const order = location.state?.order;

  const displayedOrderNumber = order?.orderNumber || orderNumber;
  const total = order?.pricing?.total ?? order?.total;
  const paymentMethod = order?.paymentMethod;
  const paymentStatus = order?.paymentStatus;
  const customerEmail = order?.customer?.email;

  const paymentMethodLabel =
    paymentMethod === "razorpay"
      ? "Online payment"
      : paymentMethod === "cod"
        ? "Cash on delivery"
        : "";

  return (
    <main className="min-h-[75vh] bg-[#f8f3e9] px-4 py-14 sm:px-6 sm:py-20">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl"
      >
        <div className="overflow-hidden rounded-3xl border border-[#d9c8aa] bg-[#fffaf0] shadow-[0_24px_70px_rgba(52,29,18,0.12)]">
          <div className="bg-[#2c1810] px-6 py-12 text-center text-[#fffaf0] sm:px-10">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.15,
                duration: 0.45,
                type: "spring",
                stiffness: 180,
              }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#b88936]"
            >
              <FiCheckCircle className="text-4xl" />
            </motion.div>

            <h1 className="mt-6 font-serif text-3xl sm:text-4xl">
              Order placed successfully
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#e8dbc6] sm:text-base">
              Thank you for choosing Devkar Wood Carvings. We have received your
              order and will begin preparing it carefully.
            </p>
          </div>

          <div className="px-6 py-8 sm:px-10">
            <div className="rounded-2xl border border-[#ded0b8] bg-[#f4ead8] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a5b30]">
                Your order number
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <FiPackage className="text-xl text-[#9d642d]" />

                <p className="break-all font-serif text-xl font-semibold text-[#2c1810] sm:text-2xl">
                  {displayedOrderNumber}
                </p>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#6d5546]">
                Save this number. You will need it along with your email and
                phone number to track the order.
              </p>
            </div>

            {order && (
              <div className="mt-7 divide-y divide-[#eadfcd] border-y border-[#eadfcd]">
                {paymentMethodLabel && (
                  <div className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3 text-[#715443]">
                      <FiCreditCard />
                      <span>Payment method</span>
                    </div>

                    <span className="font-medium text-[#2c1810]">
                      {paymentMethodLabel}
                    </span>
                  </div>
                )}

                {paymentStatus && (
                  <div className="flex items-center justify-between gap-4 py-4">
                    <span className="text-[#715443]">Payment status</span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        paymentStatus === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {paymentStatus}
                    </span>
                  </div>
                )}

                {total !== undefined && (
                  <div className="flex items-center justify-between gap-4 py-4">
                    <span className="text-[#715443]">Order total</span>

                    <span className="font-serif text-xl font-semibold text-[#2c1810]">
                      {formatPrice(total)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-7 rounded-xl bg-[#f8f1e5] p-4 text-sm leading-6 text-[#715443]">
              {customerEmail ? (
                <p>
                  Your order is registered using{" "}
                  <strong className="text-[#2c1810]">{customerEmail}</strong>.
                </p>
              ) : (
                <p>
                  Your order has been recorded successfully. Use the order
                  number above to check its latest status.
                </p>
              )}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                to="/track-order"
                className="group flex items-center justify-center gap-2 rounded-full bg-[#2c1810] px-6 py-3.5 text-sm font-semibold text-[#fffaf0] transition hover:bg-[#48291c]"
              >
                Track your order
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/products"
                className="flex items-center justify-center gap-2 rounded-full border border-[#2c1810] px-6 py-3.5 text-sm font-semibold text-[#2c1810] transition hover:bg-[#2c1810] hover:text-[#fffaf0]"
              >
                <FiHome />
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
};

export default OrderSuccess;
