import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCheck,
  FiCreditCard,
  FiLock,
  FiMapPin,
  FiPackage,
  FiTruck,
  FiUser,
} from "react-icons/fi";

import {
  clearCart,
  selectCartItems,
  selectCartSubtotal,
} from "../../features/cart/cartSlice.js";

import {
  createCodOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../services/orderService.js";

import loadRazorpay from "../../utils/loadRazorpay.js";
import { validateCheckoutForm } from "../../utils/checkoutValidation.js";
import { saveGuestOrder } from "../../utils/guestOrderStorage.js";

const initialFormData = {
  customer: {
    name: "",
    email: "",
    phone: "",
  },

  shippingAddress: {
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "Maharashtra",
    postalCode: "",
    country: "India",
  },

  paymentMethod: "cod",
  customerNote: "",
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
};

const inputClass = (hasError) => {
  return `h-13 w-full rounded-xl border bg-[#FFF9EF] px-4 text-sm text-[#2A1810] outline-none transition ${
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-[#2A1810]/15 focus:border-[#A45A3A]"
  }`;
};

const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Form changes
  |--------------------------------------------------------------------------
  */

  const handleCustomerChange = (event) => {
    const { name, value } = event.target;

    let updatedValue = value;

    if (name === "phone") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((current) => ({
      ...current,

      customer: {
        ...current.customer,
        [name]: updatedValue,
      },
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    let updatedValue = value;

    if (name === "postalCode") {
      updatedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData((current) => ({
      ...current,

      shippingAddress: {
        ...current.shippingAddress,
        [name]: updatedValue,
      },
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const handlePaymentChange = (paymentMethod) => {
    setFormData((current) => ({
      ...current,
      paymentMethod,
    }));

    setErrors((current) => ({
      ...current,
      paymentMethod: "",
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Checkout payload
  |--------------------------------------------------------------------------
  */

  const buildCheckoutPayload = (cleanedData) => {
    return {
      ...cleanedData,

      items: items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
    };
  };

  /*
  |--------------------------------------------------------------------------
  | Save order reference in this browser
  |--------------------------------------------------------------------------
  */

  const saveOrderToBrowser = (order, checkoutPayload) => {
    if (!order?.orderNumber) {
      return;
    }

    saveGuestOrder({
      orderNumber: order.orderNumber,
      email: checkoutPayload.customer.email,
      phone: checkoutPayload.customer.phone,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | COD checkout
  |--------------------------------------------------------------------------
  */

  const placeCodOrder = async (checkoutPayload) => {
    const response = await createCodOrder(checkoutPayload);
    const order = response?.data?.order;

    if (!order?.orderNumber) {
      throw new Error("Order information was not returned");
    }

    saveOrderToBrowser(order, checkoutPayload);

    dispatch(clearCart());

    toast.success("Order placed successfully");

    navigate(`/order-success/${order.orderNumber}`, {
      replace: true,
      state: {
        order,
      },
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Razorpay checkout
  |--------------------------------------------------------------------------
  */

  const placeRazorpayOrder = async (checkoutPayload) => {
    const loaded = await loadRazorpay();

    if (!loaded) {
      throw new Error("Unable to load Razorpay Checkout");
    }

    const response = await createRazorpayOrder(checkoutPayload);
    const checkout = response?.data;

    if (
      !checkout?.keyId ||
      !checkout?.localOrder?.id ||
      !checkout?.localOrder?.orderNumber ||
      !checkout?.razorpayOrder?.id
    ) {
      throw new Error("Incomplete Razorpay checkout information");
    }

    const customer = checkout.customer || checkoutPayload.customer;

    const options = {
      key: checkout.keyId,

      amount: checkout.razorpayOrder.amount,

      currency: checkout.razorpayOrder.currency || "INR",

      name: "Devkar Wood Carvings",

      description: `Order ${checkout.localOrder.orderNumber}`,

      order_id: checkout.razorpayOrder.id,

      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },

      notes: {
        localOrderId: checkout.localOrder.id,
        orderNumber: checkout.localOrder.orderNumber,
      },

      theme: {
        color: "#A45A3A",
      },

      modal: {
        backdropclose: false,
        escape: true,

        ondismiss: () => {
          setProcessing(false);

          toast("Payment window closed. You can try placing the order again.");
        },
      },

      handler: async (paymentResponse) => {
        try {
          const verification = await verifyRazorpayPayment({
            localOrderId: checkout.localOrder.id,
            razorpayOrderId: paymentResponse.razorpay_order_id,
            razorpayPaymentId: paymentResponse.razorpay_payment_id,
            razorpaySignature: paymentResponse.razorpay_signature,
          });

          const order = verification?.data?.order;

          if (!order?.orderNumber) {
            throw new Error("Verified order information was not returned");
          }

          saveOrderToBrowser(order, checkoutPayload);

          dispatch(clearCart());

          toast.success("Payment verified successfully");

          navigate(`/order-success/${order.orderNumber}`, {
            replace: true,
            state: {
              order,
            },
          });
        } catch (error) {
          setProcessing(false);

          toast.error(
            getErrorMessage(
              error,
              "Payment verification failed. Contact support if payment was deducted.",
            ),
          );
        }
      },
    };

    const razorpayCheckout = new window.Razorpay(options);

    razorpayCheckout.on("payment.failed", (response) => {
      setProcessing(false);

      toast.error(
        response.error?.description || "Payment failed. Please try again.",
      );
    });

    razorpayCheckout.open();
  };

  /*
  |--------------------------------------------------------------------------
  | Submit checkout
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (processing || items.length === 0) {
      return;
    }

    const validation = validateCheckoutForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);

      toast.error("Please correct the checkout form");

      return;
    }

    const checkoutPayload = buildCheckoutPayload(validation.cleanedData);

    setProcessing(true);
    setErrors({});

    try {
      if (formData.paymentMethod === "cod") {
        await placeCodOrder(checkoutPayload);
        return;
      }

      await placeRazorpayOrder(checkoutPayload);
    } catch (error) {
      setProcessing(false);

      toast.error(getErrorMessage(error, "Unable to complete checkout"));
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Empty cart
  |--------------------------------------------------------------------------
  */

  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F7F0E5] px-5">
        <div className="text-center">
          <FiPackage size={38} className="mx-auto text-[#A45A3A]" />

          <h1 className="mt-6 font-serif text-4xl text-[#2A1810]">
            Your cart is empty
          </h1>

          <p className="mt-3 text-sm text-[#6F5A4E]">
            Add a handcrafted product before continuing to checkout.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex rounded-full bg-[#2A1810] px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#48291C]"
          >
            Explore products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F0E5]">
      <section className="border-b border-[#2A1810]/10 px-5 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[1440px]">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A45A3A] transition hover:text-[#7D422B]"
          >
            <FiArrowLeft />
            Return to cart
          </Link>

          <h1 className="mt-6 font-serif text-5xl text-[#2A1810] sm:text-6xl">
            Secure checkout
          </h1>

          <p className="mt-4 text-sm text-[#6F5A4E]">
            No account is required to complete your order.
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="px-5 py-12 sm:px-6 lg:px-10 lg:py-20"
      >
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-20">
          <div className="space-y-8">
            {/* Customer information */}

            <motion.section
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="rounded-[2rem] bg-[#FFF9EF] p-6 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#A45A3A]/10 text-[#A45A3A]">
                  <FiUser />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#A45A3A]">
                    Step 01
                  </p>

                  <h2 className="font-serif text-2xl text-[#2A1810]">
                    Contact information
                  </h2>
                </div>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Full name *
                  </span>

                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={formData.customer.name}
                    onChange={handleCustomerChange}
                    className={inputClass(errors.name)}
                  />

                  {errors.name && (
                    <span className="mt-1.5 block text-xs text-red-600">
                      {errors.name}
                    </span>
                  )}
                </label>

                <label>
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Email address *
                  </span>

                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.customer.email}
                    onChange={handleCustomerChange}
                    className={inputClass(errors.email)}
                  />

                  {errors.email && (
                    <span className="mt-1.5 block text-xs text-red-600">
                      {errors.email}
                    </span>
                  )}
                </label>

                <label>
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Phone number *
                  </span>

                  <input
                    type="tel"
                    name="phone"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    value={formData.customer.phone}
                    onChange={handleCustomerChange}
                    className={inputClass(errors.phone)}
                  />

                  {errors.phone && (
                    <span className="mt-1.5 block text-xs text-red-600">
                      {errors.phone}
                    </span>
                  )}
                </label>
              </div>
            </motion.section>

            {/* Address */}

            <motion.section
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.08,
              }}
              className="rounded-[2rem] bg-[#FFF9EF] p-6 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#A45A3A]/10 text-[#A45A3A]">
                  <FiMapPin />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#A45A3A]">
                    Step 02
                  </p>

                  <h2 className="font-serif text-2xl text-[#2A1810]">
                    Shipping address
                  </h2>
                </div>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Address line 1 *
                  </span>

                  <input
                    type="text"
                    name="addressLine1"
                    autoComplete="address-line1"
                    value={formData.shippingAddress.addressLine1}
                    onChange={handleAddressChange}
                    className={inputClass(errors.addressLine1)}
                  />

                  {errors.addressLine1 && (
                    <span className="mt-1.5 block text-xs text-red-600">
                      {errors.addressLine1}
                    </span>
                  )}
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Address line 2
                  </span>

                  <input
                    type="text"
                    name="addressLine2"
                    autoComplete="address-line2"
                    value={formData.shippingAddress.addressLine2}
                    onChange={handleAddressChange}
                    className={inputClass(false)}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Landmark
                  </span>

                  <input
                    type="text"
                    name="landmark"
                    value={formData.shippingAddress.landmark}
                    onChange={handleAddressChange}
                    className={inputClass(false)}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    City *
                  </span>

                  <input
                    type="text"
                    name="city"
                    autoComplete="address-level2"
                    value={formData.shippingAddress.city}
                    onChange={handleAddressChange}
                    className={inputClass(errors.city)}
                  />

                  {errors.city && (
                    <span className="mt-1.5 block text-xs text-red-600">
                      {errors.city}
                    </span>
                  )}
                </label>

                <label>
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    State *
                  </span>

                  <input
                    type="text"
                    name="state"
                    autoComplete="address-level1"
                    value={formData.shippingAddress.state}
                    onChange={handleAddressChange}
                    className={inputClass(errors.state)}
                  />

                  {errors.state && (
                    <span className="mt-1.5 block text-xs text-red-600">
                      {errors.state}
                    </span>
                  )}
                </label>

                <label>
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Postal code *
                  </span>

                  <input
                    type="text"
                    name="postalCode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    value={formData.shippingAddress.postalCode}
                    onChange={handleAddressChange}
                    className={inputClass(errors.postalCode)}
                  />

                  {errors.postalCode && (
                    <span className="mt-1.5 block text-xs text-red-600">
                      {errors.postalCode}
                    </span>
                  )}
                </label>
              </div>
            </motion.section>

            {/* Payment */}

            <motion.section
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.16,
              }}
              className="rounded-[2rem] bg-[#FFF9EF] p-6 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#A45A3A]/10 text-[#A45A3A]">
                  <FiCreditCard />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#A45A3A]">
                    Step 03
                  </p>

                  <h2 className="font-serif text-2xl text-[#2A1810]">
                    Payment method
                  </h2>
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handlePaymentChange("cod")}
                  className={`rounded-2xl border p-5 text-left transition ${
                    formData.paymentMethod === "cod"
                      ? "border-[#A45A3A] bg-[#A45A3A]/5"
                      : "border-[#2A1810]/10 hover:border-[#A45A3A]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <FiTruck className="text-[#A45A3A]" />

                    {formData.paymentMethod === "cod" && (
                      <FiCheck className="text-[#A45A3A]" />
                    )}
                  </div>

                  <p className="mt-4 font-serif text-xl text-[#2A1810]">
                    Cash on delivery
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#6F5A4E]">
                    Pay when your order arrives.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentChange("razorpay")}
                  className={`rounded-2xl border p-5 text-left transition ${
                    formData.paymentMethod === "razorpay"
                      ? "border-[#A45A3A] bg-[#A45A3A]/5"
                      : "border-[#2A1810]/10 hover:border-[#A45A3A]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <FiCreditCard className="text-[#A45A3A]" />

                    {formData.paymentMethod === "razorpay" && (
                      <FiCheck className="text-[#A45A3A]" />
                    )}
                  </div>

                  <p className="mt-4 font-serif text-xl text-[#2A1810]">
                    Pay online
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#6F5A4E]">
                    UPI, cards, net banking and wallets.
                  </p>
                </button>
              </div>

              {errors.paymentMethod && (
                <p className="mt-3 text-xs text-red-600">
                  {errors.paymentMethod}
                </p>
              )}

              <label className="mt-6 block">
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Order note
                </span>

                <textarea
                  rows={4}
                  maxLength={500}
                  value={formData.customerNote}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      customerNote: event.target.value,
                    }))
                  }
                  placeholder="Packing or delivery instructions..."
                  className="w-full resize-none rounded-xl border border-[#2A1810]/15 bg-[#FFF9EF] p-4 text-sm text-[#2A1810] outline-none transition focus:border-[#A45A3A]"
                />

                <span className="mt-1 block text-right text-[10px] text-[#8C786A]">
                  {formData.customerNote.length}/500
                </span>
              </label>
            </motion.section>
          </div>

          {/* Order summary */}

          <aside>
            <div className="sticky top-32 rounded-[2rem] bg-[#21130E] p-6 text-white sm:p-8">
              <h2 className="font-serif text-3xl">Order summary</h2>

              <div className="mt-7 max-h-80 space-y-5 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[#E9DDCC]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#A45A3A]">
                          <FiPackage />
                        </div>
                      )}

                      <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#A45A3A] px-1 text-[9px] font-bold">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-base leading-snug">
                        {item.name}
                      </p>

                      {item.woodType && (
                        <p className="mt-1 text-[10px] text-[#C8B6A3]">
                          {item.woodType}
                        </p>
                      )}
                    </div>

                    <p className="text-sm font-semibold">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7 border-y border-white/15 py-5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#C8B6A3]">Estimated subtotal</span>

                  <span>{formatPrice(subtotal)}</span>
                </div>

                <p className="mt-3 text-xs leading-5 text-[#AFA092]">
                  Final tax, shipping, availability and pricing are calculated
                  securely by the server.
                </p>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#D9B477] px-6 text-xs font-bold uppercase tracking-[0.16em] text-[#21130E] transition hover:bg-[#E7C98F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#21130E]/30 border-t-[#21130E]" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiLock />

                    {formData.paymentMethod === "cod"
                      ? "Place order"
                      : "Proceed to payment"}
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-[10px] leading-5 text-[#AFA092]">
                Your payment and personal information are transmitted securely.
              </p>
            </div>
          </aside>
        </div>
      </form>
    </main>
  );
};

export default Checkout;
