import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  FiArrowRight,
  FiChevronDown,
  FiMail,
  FiMessageCircle,
  FiPackage,
  FiSearch,
  FiShield,
  FiTool,
  FiTruck,
  FiX,
} from "react-icons/fi";

const faqCategories = [
  {
    id: "orders",
    name: "Orders",
    icon: FiPackage,
  },
  {
    id: "shipping",
    name: "Shipping",
    icon: FiTruck,
  },
  {
    id: "products",
    name: "Products",
    icon: FiTool,
  },
  {
    id: "payments",
    name: "Payments",
    icon: FiShield,
  },
  {
    id: "custom",
    name: "Custom carvings",
    icon: FiMessageCircle,
  },
];

const faqItems = [
  {
    id: 1,
    category: "orders",
    question: "Do I need an account to place an order?",
    answer:
      "No. Devkar Wood Carvings provides a simple guest checkout experience. You can place an order using your name, email address, phone number and shipping address without creating an account.",
  },
  {
    id: 2,
    category: "orders",
    question: "How can I check my previous orders?",
    answer:
      "Open the My Orders page and enter the same email address and phone number used during checkout. Orders saved on your current device may also appear automatically.",
  },
  {
    id: 3,
    category: "orders",
    question: "How can I track my order?",
    answer:
      "Use the Track Order page and enter your order number together with the email address or phone number used at checkout. Once your order is shipped, courier and tracking information will appear there.",
  },
  {
    id: 4,
    category: "orders",
    question: "Can I change or cancel my order?",
    answer:
      "Contact us as soon as possible after placing your order. Cancellation or address changes are possible only before production, packing or shipment has progressed. Custom-made items may have different cancellation conditions.",
  },
  {
    id: 5,
    category: "shipping",
    question: "Where do you deliver?",
    answer:
      "We deliver across serviceable locations in India. Availability and final shipping charges are confirmed during checkout based on the product and destination.",
  },
  {
    id: 6,
    category: "shipping",
    question: "How long does delivery take?",
    answer:
      "Ready products are generally dispatched after order confirmation and careful packing. Delivery time depends on the destination, courier service and product size. Custom carvings have a separate production timeline confirmed during quotation.",
  },
  {
    id: 7,
    category: "shipping",
    question: "How are delicate carvings packed?",
    answer:
      "Each carving is inspected and packed using protective wrapping, cushioning and a suitably strong outer package. Larger or highly detailed pieces may receive additional reinforced packaging.",
  },
  {
    id: 8,
    category: "shipping",
    question: "What should I do if my order arrives damaged?",
    answer:
      "Take clear photographs and an unboxing video immediately after receiving the package. Contact us without unnecessary delay and keep all original packaging while we review the issue.",
  },
  {
    id: 9,
    category: "products",
    question: "Are all products handmade?",
    answer:
      "Our pieces are created and finished by skilled artisans. Because wood is a natural material and much of the work is performed by hand, slight variations in grain, shade and carving details are expected and make every piece unique.",
  },
  {
    id: 10,
    category: "products",
    question: "Will the product look exactly like its photograph?",
    answer:
      "The overall design will remain consistent, but natural wood grain, colour and handcrafted details can vary slightly. Screen settings and lighting can also influence how colours appear.",
  },
  {
    id: 11,
    category: "products",
    question: "How should I care for a wooden carving?",
    answer:
      "Dust it gently with a clean, soft and dry cloth. Avoid direct moisture, harsh chemicals and prolonged exposure to strong sunlight. Product-specific care instructions are shown on the product page whenever available.",
  },
  {
    id: 12,
    category: "products",
    question: "What happens when a product is sold out?",
    answer:
      "Sold-out products cannot be added to the cart while inventory is unavailable. You may contact us to ask whether a similar piece can be produced as a custom order.",
  },
  {
    id: 13,
    category: "payments",
    question: "Which payment methods are accepted?",
    answer:
      "You can pay online securely through Razorpay using supported UPI, cards, net banking and wallets. Cash on Delivery is available for eligible products and serviceable locations.",
  },
  {
    id: 14,
    category: "payments",
    question: "Is online payment secure?",
    answer:
      "Yes. Online payments are processed through Razorpay. Payment verification is completed securely by the server, and Devkar Wood Carvings does not store your card or UPI credentials.",
  },
  {
    id: 15,
    category: "payments",
    question: "What happens if my payment fails?",
    answer:
      "A failed payment does not mark the order as paid. You can return to checkout and try again. If money was deducted but the payment was not confirmed, contact your bank or payment provider and share the payment details with us.",
  },
  {
    id: 16,
    category: "payments",
    question: "When is Cash on Delivery payment collected?",
    answer:
      "For Cash on Delivery orders, payment is collected when the order reaches you. Please keep the payable amount or an accepted courier payment method ready.",
  },
  {
    id: 17,
    category: "custom",
    question: "Can you create a carving from my reference image?",
    answer:
      "Yes. Use the Custom Carving page to describe your idea and upload up to five reference images. Our team will review the subject, dimensions, preferred wood, budget and required timeline.",
  },
  {
    id: 18,
    category: "custom",
    question: "How do I track a custom-carving enquiry?",
    answer:
      "After submitting your enquiry, save the enquiry number shown on the confirmation page. Use it with your email address or phone number on the Track Enquiry page.",
  },
  {
    id: 19,
    category: "custom",
    question: "How is the price of a custom carving calculated?",
    answer:
      "Pricing depends on size, wood type, carving complexity, finishing, material availability, packing and expected completion time. A quotation is provided after the artisan team reviews your requirements.",
  },
  {
    id: 20,
    category: "custom",
    question: "When does work on a custom carving begin?",
    answer:
      "Work begins after the design requirements, estimated price and timeline are discussed and approved. Any advance-payment requirement will be communicated clearly before production starts.",
  },
];

const Faq = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [openQuestion, setOpenQuestion] = useState(1);

  useEffect(() => {
    document.title = "Frequently Asked Questions | Devkar Wood Carvings";
  }, []);

  const filteredFaqs = useMemo(() => {
    const normalizedSearch = searchInput.trim().toLowerCase();

    return faqItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const matchesSearch =
        !normalizedSearch ||
        item.question.toLowerCase().includes(normalizedSearch) ||
        item.answer.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [searchInput, selectedCategory]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setOpenQuestion(null);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSelectedCategory("all");
    setOpenQuestion(1);
  };

  return (
    <main className="min-h-screen bg-[#F7F0E5]">
      {/* Hero */}

      <section className="relative overflow-hidden bg-[#21130E] px-5 py-20 text-[#FFF9EF] sm:px-6 lg:px-10 lg:py-28">
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#A45A3A]/25 blur-[120px]" />

        <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-[#D9B477]/10 blur-[110px]" />

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
            Help and guidance
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-8xl">
            Questions, answered
            <span className="italic text-[#D9B477]"> thoughtfully.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-[#D8C9B8] sm:text-base">
            Find information about our handcrafted products, ordering, delivery,
            secure payments and custom-carving process.
          </p>

          {/* Search */}

          <div className="relative mt-10 max-w-2xl">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8A7569]" />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setOpenQuestion(null);
              }}
              placeholder="Search your question..."
              aria-label="Search frequently asked questions"
              className="h-14 w-full rounded-full border border-white/15 bg-[#FFF9EF] pl-13 pr-14 text-sm text-[#2A1810] outline-none transition focus:border-[#D9B477]"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear FAQ search"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#756157] transition hover:bg-[#2A1810]/5 hover:text-[#A45A3A]"
              >
                <FiX />
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* FAQ content */}

      <section className="px-5 py-14 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[280px_1fr] xl:gap-16">
          {/* Categories */}

          <aside>
            <div className="lg:sticky lg:top-30">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A45A3A]">
                Browse by topic
              </p>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
                <button
                  type="button"
                  onClick={() => handleCategoryChange("all")}
                  className={`flex h-12 shrink-0 items-center justify-between gap-4 rounded-full border px-5 text-left text-xs font-semibold transition lg:w-full ${
                    selectedCategory === "all"
                      ? "border-[#2A1810] bg-[#2A1810] text-white"
                      : "border-[#2A1810]/10 bg-[#FFF9EF] text-[#5F4A3F] hover:border-[#A45A3A] hover:text-[#A45A3A]"
                  }`}
                >
                  <span>All questions</span>

                  <span
                    className={
                      selectedCategory === "all"
                        ? "text-[#D9B477]"
                        : "text-[#A45A3A]"
                    }
                  >
                    {faqItems.length}
                  </span>
                </button>

                {faqCategories.map((category) => {
                  const Icon = category.icon;

                  const categoryCount = faqItems.filter(
                    (item) => item.category === category.id,
                  ).length;

                  const active = selectedCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryChange(category.id)}
                      className={`flex h-12 shrink-0 items-center justify-between gap-4 rounded-full border px-5 text-left text-xs font-semibold transition lg:w-full ${
                        active
                          ? "border-[#2A1810] bg-[#2A1810] text-white"
                          : "border-[#2A1810]/10 bg-[#FFF9EF] text-[#5F4A3F] hover:border-[#A45A3A] hover:text-[#A45A3A]"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          className={
                            active ? "text-[#D9B477]" : "text-[#A45A3A]"
                          }
                        />

                        {category.name}
                      </span>

                      <span
                        className={active ? "text-[#D9B477]" : "text-[#A45A3A]"}
                      >
                        {categoryCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Questions */}

          <div>
            <div className="mb-7 flex flex-col gap-2 border-b border-[#2A1810]/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A45A3A]">
                  Frequently asked
                </p>

                <h2 className="mt-2 font-serif text-3xl text-[#2A1810] sm:text-4xl">
                  How can we help?
                </h2>
              </div>

              <p className="text-xs text-[#756157]">
                {filteredFaqs.length} question
                {filteredFaqs.length === 1 ? "" : "s"}
              </p>
            </div>

            {filteredFaqs.length > 0 ? (
              <div className="space-y-3">
                {filteredFaqs.map((item, index) => {
                  const isOpen = openQuestion === item.id;

                  return (
                    <motion.article
                      key={item.id}
                      initial={{
                        opacity: 0,
                        y: 14,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: Math.min(index, 6) * 0.04,
                      }}
                      className={`overflow-hidden rounded-2xl border transition ${
                        isOpen
                          ? "border-[#A45A3A]/35 bg-[#FFF9EF] shadow-[0_15px_45px_rgba(42,24,16,0.06)]"
                          : "border-[#2A1810]/10 bg-[#FFF9EF]/60"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenQuestion(isOpen ? null : item.id)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6 sm:py-6"
                      >
                        <span className="flex items-start gap-4">
                          <span
                            className={`mt-0.5 hidden text-[10px] font-bold sm:block ${
                              isOpen ? "text-[#A45A3A]" : "text-[#9A8476]"
                            }`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span
                            className={`font-serif text-lg leading-7 transition sm:text-xl ${
                              isOpen ? "text-[#A45A3A]" : "text-[#2A1810]"
                            }`}
                          >
                            {item.question}
                          </span>
                        </span>

                        <motion.span
                          animate={{
                            rotate: isOpen ? 180 : 0,
                          }}
                          transition={{
                            duration: 0.3,
                          }}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                            isOpen
                              ? "bg-[#A45A3A] text-white"
                              : "bg-[#2A1810]/5 text-[#2A1810]"
                          }`}
                        >
                          <FiChevronDown />
                        </motion.span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{
                              height: 0,
                              opacity: 0,
                            }}
                            animate={{
                              height: "auto",
                              opacity: 1,
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                            }}
                            transition={{
                              duration: 0.35,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <div className="border-t border-[#2A1810]/8 px-5 py-5 sm:ml-10 sm:px-6 sm:py-6">
                              <p className="max-w-3xl text-sm leading-7 text-[#6F5A4E] sm:text-base sm:leading-8">
                                {item.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.article>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="rounded-[2rem] border border-[#2A1810]/10 bg-[#FFF9EF] px-6 py-16 text-center"
              >
                <FiSearch size={30} className="mx-auto text-[#A45A3A]" />

                <h2 className="mt-5 font-serif text-3xl text-[#2A1810]">
                  No matching questions
                </h2>

                <p className="mt-3 text-sm text-[#756157]">
                  Try a different search or browse all topics.
                </p>

                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-6 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
                >
                  View all questions
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Contact callout */}

      <section className="border-t border-[#2A1810]/10 bg-[#FFF9EF] px-5 py-20 sm:px-6 lg:px-10 lg:py-28">
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          className="mx-auto grid max-w-[1200px] gap-10 rounded-[2.5rem] bg-[#21130E] px-6 py-12 text-[#FFF9EF] sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center lg:px-14 lg:py-16"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D9B477]">
              Still need assistance?
            </p>

            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
              We’re happy to help with your
              <span className="italic text-[#D9B477]"> questions.</span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#C8B6A3]">
              Contact us for product guidance, order support or a conversation
              about your custom-carving idea.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <a
              href="https://wa.me/919689839561"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#D9B477] px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-[#21130E] transition hover:bg-[#E7C98F]"
            >
              <FiMessageCircle />
              WhatsApp us
            </a>

            <Link
              to="/contact"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition hover:border-[#D9B477] hover:text-[#D9B477]"
            >
              Contact page
              <FiArrowRight />
            </Link>

            <a
              href="mailto:hello@devkarwood.com"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition hover:border-[#D9B477] hover:text-[#D9B477]"
            >
              <FiMail />
              Send email
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default Faq;
