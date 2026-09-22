import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiArrowRight,
  FiMinus,
  FiPackage,
  FiPlus,
  FiShield,
  FiTrash2,
  FiTruck,
} from "react-icons/fi";

import {
  clearCart,
  removeFromCart,
  selectCartItems,
  selectCartSubtotal,
  updateCartQuantity,
} from "../../features/cart/cartSlice.js";

const MAX_QUANTITY = 10;

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
};

const Cart = () => {
  const dispatch = useDispatch();

  const items = useSelector(selectCartItems);

  const subtotal = useSelector(selectCartSubtotal);

  const increaseQuantity = (item) => {
    const maximumQuantity =
      item.trackInventory === false
        ? MAX_QUANTITY
        : Math.min(Number(item.stock) || 1, MAX_QUANTITY);

    if (item.quantity >= maximumQuantity) {
      toast.error(`Only ${maximumQuantity} unit(s) available`);

      return;
    }

    dispatch(
      updateCartQuantity({
        productId: item.productId,
        quantity: item.quantity + 1,
      }),
    );
  };

  const decreaseQuantity = (item) => {
    if (item.quantity <= 1) {
      return;
    }

    dispatch(
      updateCartQuantity({
        productId: item.productId,
        quantity: item.quantity - 1,
      }),
    );
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart(item.productId));

    toast.success(`${item.name} removed from cart`);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success("Cart cleared");
  };

  /*
  |--------------------------------------------------------------------------
  | Empty cart
  |--------------------------------------------------------------------------
  */

  if (items.length === 0) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#F7F0E5] px-5 py-20">
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="max-w-lg text-center"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#E9DDCC] text-[#A45A3A]">
            <FiPackage size={35} />
          </div>

          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.25em] text-[#A45A3A]">
            Your selection
          </p>

          <h1 className="mt-4 font-serif text-4xl text-[#2A1810] sm:text-5xl">
            Your cart is empty.
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#6F5A4E]">
            Explore our handcrafted collection and find a piece made for your
            space.
          </p>

          <Link
            to="/products"
            className="group mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#2A1810] px-8 text-xs font-bold uppercase tracking-[0.17em] text-white transition-all hover:-translate-y-0.5 hover:bg-[#A45A3A]"
          >
            Explore carvings
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F0E5]">
      {/* Heading */}

      <section className="border-b border-[#2A1810]/10 px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mx-auto max-w-[1440px]"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A45A3A]"
          >
            <FiArrowLeft />
            Continue shopping
          </Link>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A45A3A]">
                Your selection
              </p>

              <h1 className="mt-3 font-serif text-5xl text-[#2A1810] sm:text-6xl">
                Shopping cart
              </h1>
            </div>

            <p className="text-sm text-[#6F5A4E]">
              {items.length} unique {items.length === 1 ? "piece" : "pieces"}
            </p>
          </div>
        </motion.div>
      </section>

      <section className="px-5 py-12 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1fr_390px] xl:gap-20">
          {/* Cart items */}

          <div>
            <div className="hidden border-b border-[#2A1810]/10 pb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A675C] sm:grid sm:grid-cols-[1fr_150px_130px]">
              <span>Product</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Total</span>
            </div>

            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const itemTotal = Number(item.price) * item.quantity;

                const maximumQuantity =
                  item.trackInventory === false
                    ? MAX_QUANTITY
                    : Math.min(Number(item.stock) || 1, MAX_QUANTITY);

                return (
                  <motion.article
                    key={item.productId}
                    layout
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -30,
                    }}
                    transition={{
                      duration: 0.35,
                    }}
                    className="grid gap-5 border-b border-[#2A1810]/10 py-7 sm:grid-cols-[1fr_150px_130px] sm:items-center"
                  >
                    {/* Product */}

                    <div className="flex gap-4 sm:gap-5">
                      <Link
                        to={`/products/${item.slug}`}
                        className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#E9DDCC] sm:h-32 sm:w-28"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-2 text-center font-serif text-sm text-[#6F5A4E]">
                            Devkar Wood
                          </div>
                        )}
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col py-1">
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#A45A3A]">
                          {item.woodType || "Handcrafted wood"}
                        </p>

                        <Link
                          to={`/products/${item.slug}`}
                          className="mt-2 font-serif text-xl leading-snug text-[#2A1810] transition hover:text-[#A45A3A]"
                        >
                          {item.name}
                        </Link>

                        <p className="mt-2 text-sm font-semibold text-[#2A1810]">
                          {formatPrice(item.price)}
                        </p>

                        {item.trackInventory !== false &&
                          maximumQuantity <= 3 && (
                            <p className="mt-2 text-[10px] font-semibold text-[#A45A3A]">
                              Only {maximumQuantity} remaining
                            </p>
                          )}

                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          className="mt-auto flex w-fit items-center gap-2 pt-3 text-[10px] font-bold uppercase tracking-[0.13em] text-[#7A675C] transition hover:text-[#A45A3A] sm:hidden"
                        >
                          <FiTrash2 />
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity */}

                    <div className="flex items-center justify-between sm:justify-center">
                      <span className="text-xs font-semibold text-[#6F5A4E] sm:hidden">
                        Quantity
                      </span>

                      <div className="flex h-11 w-32 items-center justify-between rounded-full border border-[#2A1810]/15 bg-[#FFF9EF] px-1">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item)}
                          disabled={item.quantity <= 1}
                          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#2A1810]/5 disabled:opacity-30"
                        >
                          <FiMinus size={14} />
                        </button>

                        <span className="text-sm font-bold text-[#2A1810]">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item)}
                          disabled={item.quantity >= maximumQuantity}
                          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#2A1810]/5 disabled:opacity-30"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Total */}

                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-7">
                      <span className="text-xs font-semibold text-[#6F5A4E] sm:hidden">
                        Item total
                      </span>

                      <p className="font-serif text-xl text-[#2A1810]">
                        {formatPrice(itemTotal)}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#7A675C] transition hover:text-[#A45A3A] sm:flex"
                      >
                        <FiTrash2 />
                        Remove
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>

            <button
              type="button"
              onClick={handleClearCart}
              className="mt-7 text-[10px] font-bold uppercase tracking-[0.15em] text-[#7A675C] underline decoration-[#7A675C]/40 underline-offset-4 transition hover:text-[#A45A3A]"
            >
              Clear shopping cart
            </button>
          </div>

          {/* Order summary */}

          <aside>
            <div className="sticky top-32 rounded-[2rem] bg-[#21130E] p-6 text-[#FFF9EF] sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.23em] text-[#D9B477]">
                Order summary
              </p>

              <h2 className="mt-3 font-serif text-3xl">Your total</h2>

              <div className="mt-8 space-y-4 border-y border-white/15 py-6 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#C8B6A3]">Subtotal</span>

                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#C8B6A3]">Shipping</span>

                  <span className="text-right text-xs text-[#E5C68F]">
                    Calculated at checkout
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#C8B6A3]">Tax</span>

                  <span className="text-right text-xs text-[#E5C68F]">
                    Calculated securely
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between gap-4">
                <span className="font-serif text-xl">Estimated subtotal</span>

                <span className="font-serif text-3xl text-[#D9B477]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-[#AFA092]">
                Final product prices, availability, shipping and taxes are
                verified by the server during checkout.
              </p>

              <Link
                to="/checkout"
                className="group mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#D9B477] px-6 text-xs font-bold uppercase tracking-[0.17em] text-[#21130E] transition-all hover:-translate-y-0.5 hover:bg-[#E7C98F]"
              >
                Continue to checkout
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>

              <div className="mt-7 grid grid-cols-3 gap-2 border-t border-white/15 pt-6 text-center">
                <div>
                  <FiShield className="mx-auto text-[#D9B477]" />

                  <p className="mt-2 text-[9px] leading-4 text-[#C8B6A3]">
                    Secure payment
                  </p>
                </div>

                <div>
                  <FiTruck className="mx-auto text-[#D9B477]" />

                  <p className="mt-2 text-[9px] leading-4 text-[#C8B6A3]">
                    Safe delivery
                  </p>
                </div>

                <div>
                  <FiPackage className="mx-auto text-[#D9B477]" />

                  <p className="mt-2 text-[9px] leading-4 text-[#C8B6A3]">
                    Careful packing
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Cart;
