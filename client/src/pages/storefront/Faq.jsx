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
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F0E5]">
      {/* Hero */}

      <section className="relative overflow-hidden bg-[#21130E] px-4 py-16 text-[#FFF9EF] sm:px-6 sm:py-20 lg:px-10 lg:py-28">
        <div className="pointer-events-none absolute -right-40 top-0 h-80 w-80 rounded-full bg-[#A45A3A]/25 blur-[100px] sm:h-96 sm:w-96" />

        <div className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-[#D9B477]/10 blur-[110px]" />

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
          className="relative mx-auto w-full max-w-[1440px]"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D9B477] sm:text-xs sm:tracking-[0.3em]">
            Help and guidance
          </p>

          <h1 className="mt-4 max-w-4xl font-serif text-[clamp(2.5rem,9vw,5rem)] leading-[1.02] tracking-tight">
            Questions, answered
            <span className="block italic text-[#D9B477] sm:inline">
              {" "}
              thoughtfully.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-[#D8C9B8] sm:mt-7 sm:text-base">
            Find information about our handcrafted products, ordering, delivery,
            secure payments and custom-carving process.
          </p>

          {/* Search */}

          <div className="relative mt-8 w-full max-w-2xl sm:mt-10">
            <FiSearch
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7569] sm:left-5"
              aria-hidden="true"
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setOpenQuestion(null);
              }}
              placeholder="Search your question..."
              aria-label="Search frequently asked questions"
              className="h-13 w-full rounded-full border border-white/15 bg-[#FFF9EF] pl-11 pr-12 text-sm text-[#2A1810] outline-none transition placeholder:text-[#8A7569] focus:border-[#D9B477] sm:h-14 sm:pl-13 sm:pr-14"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear FAQ search"
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#756157] transition hover:bg-[#2A1810]/5 hover:text-[#A45A3A] sm:right-3"
              >
                <FiX />
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* FAQ content */}

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-16">
          {/* Categories */}

          <aside className="min-w-0">
            <div className="lg:sticky lg:top-28">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A45A3A]">
                Browse by topic
              </p>

              <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max gap-2 lg:w-full lg:flex-col">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("all")}
                    className={`flex h-11 shrink-0 items-center justify-between gap-4 rounded-full border px-4 text-left text-xs font-semibold transition sm:h-12 sm:px-5 lg:w-full ${
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
                        className={`flex h-11 shrink-0 items-center justify-between gap-4 rounded-full border px-4 text-left text-xs font-semibold transition sm:h-12 sm:px-5 lg:w-full ${
                          active
                            ? "border-[#2A1810] bg-[#2A1810] text-white"
                            : "border-[#2A1810]/10 bg-[#FFF9EF] text-[#5F4A3F] hover:border-[#A45A3A] hover:text-[#A45A3A]"
                        }`}
                      >
                        <span className="flex items-center gap-2.5 whitespace-nowrap">
                          <Icon
                            className={
                              active ? "text-[#D9B477]" : "text-[#A45A3A]"
                            }
                          />

                          {category.name}
                        </span>

                        <span
                          className={
                            active ? "text-[#D9B477]" : "text-[#A45A3A]"
                          }
                        >
                          {categoryCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Questions */}

          <div className="min-w-0">
            <div className="mb-6 flex flex-col gap-3 border-b border-[#2A1810]/10 pb-5 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
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
              <motion.div
                key={`${selectedCategory}-${searchInput}`}
                className="space-y-3"
              >
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
                      className={`overflow-hidden rounded-xl border transition sm:rounded-2xl ${
                        isOpen
                          ? "border-[#A45A3A]/35 bg-[#FFF9EF] shadow-[0_15px_45px_rgba(42,24,16,0.06)]"
                          : "border-[#2A1810]/10 bg-[#FFF9EF]/60"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenQuestion(isOpen ? null : item.id)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${item.id}`}
                        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left sm:items-center sm:gap-5 sm:px-6 sm:py-6"
                      >
                        <span className="flex min-w-0 items-start gap-4">
                          <span
                            className={`mt-1 hidden shrink-0 text-[10px] font-bold sm:block ${
                              isOpen ? "text-[#A45A3A]" : "text-[#9A8476]"
                            }`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span
                            className={`min-w-0 break-words font-serif text-base leading-6 transition sm:text-xl sm:leading-7 ${
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
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition sm:h-9 sm:w-9 ${
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
                            id={`faq-answer-${item.id}`}
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
                            className="overflow-hidden"
                          >
                            <div className="border-t border-[#2A1810]/10 px-4 py-5 sm:ml-10 sm:px-6 sm:py-6">
                              <p className="max-w-3xl break-words text-sm leading-7 text-[#6F5A4E] sm:text-base sm:leading-8">
                                {item.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.article>
                  );
                })}
              </motion.div>
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
                className="rounded-2xl border border-[#2A1810]/10 bg-[#FFF9EF] px-5 py-12 text-center sm:rounded-[2rem] sm:px-6 sm:py-16"
              >
                <FiSearch size={30} className="mx-auto text-[#A45A3A]" />

                <h2 className="mt-5 font-serif text-2xl text-[#2A1810] sm:text-3xl">
                  No matching questions
                </h2>

                <p className="mt-3 text-sm text-[#756157]">
                  Try a different search or browse all topics.
                </p>

                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-6 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#A45A3A]"
                >
                  View all questions
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Contact callout */}

      <section className="border-t border-[#2A1810]/10 bg-[#FFF9EF] px-4 py-14 sm:px-6 sm:py-20 lg:px-10 lg:py-28">
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
            amount: 0.2,
          }}
          className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-8 overflow-hidden rounded-3xl bg-[#21130E] px-5 py-10 text-[#FFF9EF] sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12 lg:rounded-[2.5rem] lg:px-14 lg:py-16"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D9B477]">
              Still need assistance?
            </p>

            <h2 className="mt-4 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
              We’re happy to help with your
              <span className="italic text-[#D9B477]"> questions.</span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#C8B6A3]">
              Contact us for product guidance, order support or a conversation
              about your custom-carving idea.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:min-w-52 lg:flex-col">
            <a
              href="https://wa.me/919689839561"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#D9B477] px-6 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-[#21130E] transition hover:bg-[#E7C98F]"
            >
              <FiMessageCircle />
              WhatsApp us
            </a>

            <Link
              to="/contact"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-white transition hover:border-[#D9B477] hover:text-[#D9B477]"
            >
              Contact page
              <FiArrowRight />
            </Link>

            <a
              href="mailto:hello@devkarwood.com"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-white transition hover:border-[#D9B477] hover:text-[#D9B477]"
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
