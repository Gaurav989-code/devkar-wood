import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiAlertCircle,
  FiArrowRight,
  FiBox,
  FiCheck,
  FiClock,
  FiHelpCircle,
  FiMapPin,
  FiPackage,
  FiRefreshCcw,
  FiShield,
  FiTruck,
} from "react-icons/fi";

const shippingSteps = [
  {
    number: "01",
    icon: FiCheck,
    title: "Order confirmed",
    description:
      "After your order is placed, you will receive an order number and confirmation details.",
  },
  {
    number: "02",
    icon: FiPackage,
    title: "Carefully prepared",
    description:
      "Our team inspects and securely packs each handcrafted piece before dispatch.",
  },
  {
    number: "03",
    icon: FiTruck,
    title: "Order dispatched",
    description:
      "Tracking information becomes available after your order is handed to the delivery partner.",
  },
  {
    number: "04",
    icon: FiMapPin,
    title: "Delivered safely",
    description:
      "The delivery partner brings your order to the shipping address provided during checkout.",
  },
];

const shippingInformation = [
  {
    title: "Order processing",
    value: "2–5 business days",
    description:
      "Ready products are inspected, packed and prepared for dispatch after order confirmation.",
  },
  {
    title: "Standard delivery",
    value: "5–10 business days",
    description:
      "Delivery time begins after dispatch and may vary depending on the destination.",
  },
  {
    title: "Custom carvings",
    value: "Timeline provided separately",
    description:
      "Production and delivery estimates are confirmed after the design and quotation are approved.",
  },
];

const returnConditions = [
  "The return request must be submitted within 7 days of delivery.",
  "The product must be unused and in its original condition.",
  "The original packaging, invoice and accessories must be retained.",
  "Clear photographs and an unpacking video may be required.",
  "The product must be securely repacked for return transportation.",
];

const nonReturnableItems = [
  "Custom-made or personalised carvings",
  "Products damaged after delivery through misuse or improper care",
  "Products showing normal variations in wood grain, tone or texture",
  "Items returned without their original packaging or accessories",
  "Products purchased during a final clearance sale, where specified",
];

const ShippingReturns = () => {
  return (
    <main className="min-h-screen bg-[#F7F0E5] text-[#2A1810]">
      {/* Hero */}

      <section className="relative overflow-hidden bg-[#21130E] px-5 py-20 text-[#FFF9EF] sm:px-6 lg:px-10 lg:py-28">
        <div className="absolute -right-36 top-0 h-96 w-96 rounded-full bg-[#A45A3A]/20 blur-[120px]" />

        <div className="absolute -bottom-44 -left-32 h-96 w-96 rounded-full bg-[#D9B477]/10 blur-[120px]" />

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mx-auto max-w-[1440px]"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9B477] sm:text-xs">
            Delivery with care
          </p>

          <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[0.98] sm:text-6xl lg:text-8xl">
            Shipping &<span className="italic text-[#D9B477]"> returns.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-[#D8C9B8] sm:text-base">
            Learn how we prepare, dispatch and deliver your handcrafted wooden
            pieces—and what to do if something is not right.
          </p>
        </motion.div>
      </section>

      {/* Shipping summary */}

      <section className="px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A45A3A]">
              Shipping information
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
              From our workshop to your home
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#6F5A4E] sm:text-base">
              Every order is inspected and packed carefully to protect the
              carving, finish and delicate details during transportation.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {shippingInformation.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.08,
                }}
                className="rounded-[1.75rem] border border-[#2A1810]/10 bg-[#FFF9EF] p-7"
              >
                <FiClock size={21} className="text-[#A45A3A]" />

                <h3 className="mt-6 font-serif text-2xl">{item.title}</h3>

                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-[#A45A3A]">
                  {item.value}
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5A4E]">
                  {item.description}
                </p>
              </motion.article>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-[#D9B477]/40 bg-[#D9B477]/10 px-6 py-5">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="mt-1 shrink-0 text-[#8A642D]" />

              <p className="text-sm leading-6 text-[#6F5A4E]">
                Delivery estimates are approximate. Remote locations, public
                holidays, weather conditions and courier interruptions may
                affect delivery time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping journey */}

      <section className="border-y border-[#2A1810]/10 bg-[#FFF9EF] px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A45A3A]">
              Your order journey
            </p>

            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
              What happens after checkout?
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {shippingSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.article
                  key={step.title}
                  initial={{
                    opacity: 0,
                    y: 24,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.08,
                  }}
                  className="relative rounded-[1.75rem] bg-[#F7F0E5] p-7"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#21130E] text-[#D9B477]">
                      <Icon size={20} />
                    </div>

                    <span className="font-serif text-2xl text-[#A45A3A]/40">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-7 font-serif text-2xl">{step.title}</h3>

                  <p className="mt-4 text-sm leading-7 text-[#6F5A4E]">
                    {step.description}
                  </p>
                </motion.article>
              );
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              to="/track-order"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[#21130E] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.17em] text-white transition hover:bg-[#A45A3A]"
            >
              Track your order
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Delivery charges */}

      <section className="px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
          <motion.div
            initial={{
              opacity: 0,
              x: -24,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#21130E] text-[#D9B477]">
              <FiTruck size={23} />
            </div>

            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.24em] text-[#A45A3A]">
              Shipping charges
            </p>

            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
              Calculated for safe delivery
            </h2>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 24,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            className="rounded-[2rem] border border-[#2A1810]/10 bg-[#FFF9EF] p-7 sm:p-9"
          >
            <p className="text-sm leading-7 text-[#6F5A4E]">
              Shipping charges are shown during checkout before you place your
              order. Charges may depend on the order value, product dimensions,
              weight and delivery destination.
            </p>

            <div className="mt-6 border-t border-[#2A1810]/10 pt-6">
              <p className="text-sm leading-7 text-[#6F5A4E]">
                Large sculptures, fragile panels and oversized architectural
                pieces may require specialised packaging or transportation. If
                an additional charge applies, our team will contact you before
                dispatch.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Receiving an order */}

      <section className="bg-[#EDE1D0] px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-20">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A45A3A]">
                Upon delivery
              </p>

              <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
                Inspect your package carefully
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#6F5A4E]">
                A quick inspection and unpacking video help us resolve any
                delivery issue fairly and promptly.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Inspect the outer packaging before accepting the delivery.",
                "Record a continuous video while opening the package.",
                "Check the product and all included accessories immediately.",
                "Report visible damage or a wrong item within 48 hours.",
                "Keep the packaging until you are satisfied with the product.",
              ].map((instruction, index) => (
                <motion.div
                  key={instruction}
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: index * 0.06,
                  }}
                  className="flex items-start gap-4 rounded-2xl bg-[#F7F0E5] p-5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A45A3A] text-[10px] font-bold text-white">
                    {index + 1}
                  </span>

                  <p className="pt-1 text-sm leading-6 text-[#5F4A3F]">
                    {instruction}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Returns */}

      <section className="px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A45A3A]">
              Return policy
            </p>

            <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
              If your order is not right
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#6F5A4E] sm:text-base">
              Contact us before returning any product. Our team will review the
              request and provide return instructions when the item is eligible.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <motion.article
              initial={{
                opacity: 0,
                y: 24,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              className="rounded-[2rem] border border-[#2A1810]/10 bg-[#FFF9EF] p-7 sm:p-10"
            >
              <div className="flex h-13 w-13 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <FiRefreshCcw size={21} />
              </div>

              <h3 className="mt-6 font-serif text-3xl">Return eligibility</h3>

              <div className="mt-7 space-y-4">
                {returnConditions.map((condition) => (
                  <div key={condition} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <FiCheck size={13} />
                    </span>

                    <p className="text-sm leading-6 text-[#6F5A4E]">
                      {condition}
                    </p>
                  </div>
                ))}
              </div>
            </motion.article>

            <motion.article
              initial={{
                opacity: 0,
                y: 24,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.1,
              }}
              className="rounded-[2rem] bg-[#21130E] p-7 text-[#FFF9EF] sm:p-10"
            >
              <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[#A45A3A]/25 text-[#D9B477]">
                <FiAlertCircle size={21} />
              </div>

              <h3 className="mt-6 font-serif text-3xl">Non-returnable items</h3>

              <div className="mt-7 space-y-4">
                {nonReturnableItems.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A45A3A]/25 text-[#D9B477]">
                      <span className="text-sm leading-none">×</span>
                    </span>

                    <p className="text-sm leading-6 text-[#C8B6A3]">{item}</p>
                  </div>
                ))}
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Damaged products */}

      <section className="px-5 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <div className="mx-auto max-w-[1440px] rounded-[2rem] border border-[#A45A3A]/20 bg-[#A45A3A]/5 p-7 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <FiShield size={24} className="text-[#A45A3A]" />

              <h2 className="mt-5 font-serif text-3xl sm:text-4xl">
                Received a damaged or incorrect product?
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#6F5A4E]">
                Contact us within 48 hours of delivery. Include your order
                number, photographs of the product and packaging, and the
                unpacking video. We will review the issue and arrange an
                appropriate resolution.
              </p>
            </div>

            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#21130E] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.17em] text-white transition hover:bg-[#A45A3A]"
            >
              Report an issue
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Refunds */}

      <section className="border-y border-[#2A1810]/10 bg-[#FFF9EF] px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <FiRefreshCcw size={24} className="text-[#A45A3A]" />

            <h2 className="mt-5 font-serif text-4xl sm:text-5xl">
              Refund processing
            </h2>
          </div>

          <div>
            <p className="text-sm leading-7 text-[#6F5A4E]">
              Once an approved return is received and inspected, we will notify
              you about the refund decision. Approved refunds are sent to the
              original payment method wherever possible.
            </p>

            <p className="mt-5 text-sm leading-7 text-[#6F5A4E]">
              Refund processing usually takes 5–10 business days after approval.
              Your bank or payment provider may require additional time before
              the amount appears in your account.
            </p>

            <p className="mt-5 text-sm leading-7 text-[#6F5A4E]">
              Original shipping charges and return transportation charges may be
              non-refundable unless the item was damaged, defective or
              incorrectly supplied by us.
            </p>
          </div>
        </div>
      </section>

      {/* Help */}

      <section className="px-5 py-16 sm:px-6 lg:px-10 lg:py-24">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.98,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2.25rem] bg-[#21130E] px-6 py-14 text-center text-[#FFF9EF] sm:px-10 lg:py-20"
        >
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#D9B477]/10 blur-[90px]" />

          <div className="relative">
            <FiHelpCircle className="mx-auto text-[#D9B477]" size={29} />

            <h2 className="mx-auto mt-6 max-w-2xl font-serif text-4xl sm:text-5xl">
              Need help with an order?
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#C8B6A3]">
              Keep your order number ready and contact our team. We will help
              with tracking, delivery concerns or an eligible return.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D9B477] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#21130E] transition hover:bg-[#FFF9EF]"
              >
                Contact support
                <FiArrowRight />
              </Link>

              <Link
                to="/faq"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:border-[#D9B477] hover:text-[#D9B477]"
              >
                Read FAQs
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Policy notice */}

      <section className="px-5 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <div className="mx-auto max-w-[1440px] border-t border-[#2A1810]/10 pt-7">
          <div className="flex items-start gap-3">
            <FiBox className="mt-1 shrink-0 text-[#A45A3A]" />

            <p className="text-xs leading-6 text-[#7A675C]">
              This page provides general shipping and return information.
              Product-specific conditions shown on the product page or agreed
              upon for custom orders will also apply.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ShippingReturns;
