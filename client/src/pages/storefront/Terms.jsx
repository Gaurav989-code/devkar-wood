import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiCreditCard,
  FiFileText,
  FiMail,
  FiPackage,
  FiShoppingBag,
  FiTool,
  FiTruck,
} from "react-icons/fi";

const termsSections = [
  {
    id: "acceptance",
    number: "01",
    title: "Acceptance of these terms",
    content: (
      <p>
        By accessing this website, placing an order or submitting an enquiry,
        you agree to these Terms and Conditions. If you do not accept these
        terms, please do not use the website or place an order.
      </p>
    ),
  },
  {
    id: "products",
    number: "02",
    title: "Products and natural variations",
    content: (
      <>
        <p>
          Our products are handcrafted using natural wood. Grain patterns,
          colour, texture, small knots and minor tonal variations are natural
          characteristics and make each piece unique.
        </p>

        <p>
          Product photographs are provided as accurately as reasonably possible.
          Colours may appear different depending on lighting, photography and
          screen settings.
        </p>
      </>
    ),
  },
  {
    id: "orders",
    number: "03",
    title: "Orders and acceptance",
    content: (
      <>
        <p>
          Submitting an order does not automatically guarantee acceptance. An
          order is accepted after availability, pricing, payment and delivery
          information have been verified.
        </p>

        <p>
          We may contact you when clarification is required or cancel an order
          affected by incorrect pricing, unavailable stock, suspected fraud or
          an undeliverable address.
        </p>
      </>
    ),
  },
  {
    id: "pricing",
    number: "04",
    title: "Pricing and payment",
    content: (
      <>
        <p>
          Prices are displayed in Indian Rupees unless otherwise stated.
          Shipping charges and other applicable amounts are shown during
          checkout.
        </p>

        <p>
          Available payment methods may include Cash on Delivery and Razorpay.
          Online payment is subject to confirmation from the payment provider.
        </p>

        <p>
          If payment is deducted but the order is not confirmed, contact your
          payment provider and our support team with the transaction details.
        </p>
      </>
    ),
  },
  {
    id: "custom",
    number: "05",
    title: "Custom-carving orders",
    content: (
      <>
        <p>
          A custom-carving enquiry is not a confirmed order. Work begins only
          after the design, materials, dimensions, price, timeline and payment
          terms are approved.
        </p>

        <p>
          Custom products may differ slightly from sketches or reference images
          because every piece is individually handcrafted. Customised and
          personalised products are generally non-returnable unless damaged,
          defective or materially different from the approved details.
        </p>
      </>
    ),
  },
  {
    id: "shipping",
    number: "06",
    title: "Shipping and delivery",
    content: (
      <>
        <p>
          Delivery dates are estimates and may be affected by destination,
          courier availability, weather, public holidays and circumstances
          outside our reasonable control.
        </p>

        <p>
          Customers are responsible for providing a complete and accurate
          delivery address and an available phone number. Additional charges
          caused by an incorrect address or repeated delivery failure may be
          payable by the customer.
        </p>
      </>
    ),
  },
  {
    id: "returns",
    number: "07",
    title: "Returns, damage and refunds",
    content: (
      <>
        <p>
          Return eligibility and refund processing are governed by our Shipping
          and Returns Policy. Contact us before returning any item.
        </p>

        <p>
          Visible transit damage, missing items or an incorrect product should
          be reported within 48 hours of delivery with photographs and an
          unpacking video wherever possible.
        </p>
      </>
    ),
  },
  {
    id: "care",
    number: "08",
    title: "Product care",
    content: (
      <p>
        Customers are responsible for following the supplied care instructions.
        Damage caused by water, direct sunlight, unsuitable chemicals,
        accidental impact, improper storage or unauthorised repair is not
        considered a manufacturing defect.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    number: "09",
    title: "Intellectual property",
    content: (
      <p>
        Website content—including branding, product photographs, written
        material, designs and graphics—belongs to Devkar Wood Carvings or its
        respective licensors. It may not be copied, reproduced, sold or used
        commercially without written permission.
      </p>
    ),
  },
  {
    id: "website-use",
    number: "10",
    title: "Acceptable website use",
    content: (
      <>
        <p>You must not:</p>

        <ul>
          <li>Use the website for unlawful or fraudulent purposes.</li>
          <li>Attempt to access protected administrative areas.</li>
          <li>Upload malicious files, scripts or harmful material.</li>
          <li>Interfere with website security or availability.</li>
          <li>Provide false payment, identity or delivery information.</li>
        </ul>
      </>
    ),
  },
  {
    id: "liability",
    number: "11",
    title: "Limitation of liability",
    content: (
      <p>
        To the extent permitted by applicable law, Devkar Wood Carvings will not
        be liable for indirect or consequential loss arising from website use,
        delivery delays or improper use of a product. Nothing in these terms
        excludes rights or remedies that cannot legally be excluded.
      </p>
    ),
  },
  {
    id: "law",
    number: "12",
    title: "Governing law and disputes",
    content: (
      <p>
        These terms are governed by the laws of India. The parties should first
        attempt to resolve a dispute by contacting each other in good faith.
        Subject to applicable consumer rights, unresolved disputes will be
        subject to the jurisdiction of the competent courts in Maharashtra,
        India.
      </p>
    ),
  },
  {
    id: "changes",
    number: "13",
    title: "Changes to these terms",
    content: (
      <p>
        We may update these terms when our products, services or legal
        obligations change. The revised version becomes effective when published
        on this page.
      </p>
    ),
  },
];

const highlights = [
  {
    icon: FiShoppingBag,
    title: "Handcrafted products",
    description:
      "Natural grain and colour variations are part of each unique piece.",
  },
  {
    icon: FiCreditCard,
    title: "Secure payments",
    description:
      "Online payments are completed through authorised payment providers.",
  },
  {
    icon: FiTruck,
    title: "Careful delivery",
    description:
      "Delivery estimates may vary according to location and product size.",
  },
  {
    icon: FiTool,
    title: "Custom work",
    description:
      "Custom work begins only after specifications and pricing are approved.",
  },
];

const Terms = () => {
  return (
    <main className="min-h-screen bg-[#F7F0E5] text-[#2A1810]">
      <section className="relative overflow-hidden bg-[#21130E] px-5 py-20 text-[#FFF9EF] sm:px-6 lg:px-10 lg:py-28">
        <div className="absolute -right-36 top-0 h-96 w-96 rounded-full bg-[#A45A3A]/20 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mx-auto max-w-[1440px]"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9B477] sm:text-xs">
            Using our website
          </p>

          <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[0.98] sm:text-6xl lg:text-8xl">
            Terms &<span className="italic text-[#D9B477]"> conditions.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-[#D8C9B8] sm:text-base">
            These terms explain the conditions that apply when you browse our
            website, purchase a product or request a custom carving.
          </p>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9F8C7A]">
            Effective date: 18 September 2026
          </p>
        </motion.div>
      </section>

      <section className="px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="rounded-[1.5rem] border border-[#2A1810]/10 bg-[#FFF9EF] p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#21130E] text-[#D9B477]">
                  <Icon size={18} />
                </div>

                <h2 className="mt-5 font-serif text-2xl">{item.title}</h2>

                <p className="mt-3 text-sm leading-6 text-[#6F5A4E]">
                  {item.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[270px_1fr] xl:gap-20">
          <aside className="hidden lg:block">
            <nav className="sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-[1.5rem] border border-[#2A1810]/10 bg-[#FFF9EF] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A45A3A]">
                On this page
              </p>

              <div className="mt-5 space-y-3">
                {termsSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-sm text-[#6F5A4E] transition hover:translate-x-1 hover:text-[#A45A3A]"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </nav>
          </aside>

          <div className="space-y-5">
            <div className="rounded-[1.5rem] border border-[#D9B477]/40 bg-[#D9B477]/10 p-6">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="mt-1 shrink-0 text-[#8A642D]" />

                <p className="text-sm leading-7 text-[#6F5A4E]">
                  Please read these terms before placing an order. Product,
                  quotation or custom-order terms specifically agreed with you
                  will also apply.
                </p>
              </div>
            </div>

            {termsSections.map((section, index) => (
              <motion.article
                id={section.id}
                key={section.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: Math.min(index * 0.03, 0.15) }}
                className="scroll-mt-32 rounded-[1.75rem] border border-[#2A1810]/10 bg-[#FFF9EF] p-6 sm:p-8"
              >
                <div className="flex items-start gap-5">
                  <span className="font-serif text-2xl text-[#A45A3A]/50">
                    {section.number}
                  </span>

                  <div className="min-w-0">
                    <h2 className="font-serif text-2xl sm:text-3xl">
                      {section.title}
                    </h2>

                    <div className="mt-4 space-y-4 text-sm leading-7 text-[#6F5A4E] [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.7rem] [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-[#A45A3A] [&_ul]:space-y-2">
                      {section.content}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <div className="mx-auto max-w-[1440px] rounded-[2rem] bg-[#21130E] px-6 py-12 text-center text-[#FFF9EF] sm:px-10">
          <FiFileText className="mx-auto text-[#D9B477]" size={28} />

          <h2 className="mt-5 font-serif text-4xl">
            Questions about these terms?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#C8B6A3]">
            Contact our team before ordering if you need clarification about a
            product, delivery or custom-carving condition.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="mailto:hello@devkarwood.com"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D9B477] px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#21130E]"
            >
              <FiMail />
              Email us
            </a>

            <Link
              to="/shipping"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:border-[#D9B477] hover:text-[#D9B477]"
            >
              Shipping and returns
              <FiArrowRight />
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#8F7D6B]">
            <FiCheckCircle />
            Placing an order confirms acceptance of these terms.
          </div>
        </div>
      </section>
    </main>
  );
};

export default Terms;
