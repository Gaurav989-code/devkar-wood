import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiArrowRight,
  FiDatabase,
  FiEye,
  FiLock,
  FiMail,
  FiRefreshCcw,
  FiShield,
  FiUserCheck,
} from "react-icons/fi";

const sections = [
  {
    id: "information",
    number: "01",
    title: "Information we collect",
    content: (
      <>
        <p>
          We collect information that you provide while placing an order,
          submitting a custom-carving enquiry, contacting support or using other
          features of our website.
        </p>

        <p>This information may include:</p>

        <ul>
          <li>Your name, email address and phone number.</li>
          <li>Your billing and delivery address.</li>
          <li>Order, payment and transaction information.</li>
          <li>Custom-carving descriptions and reference images.</li>
          <li>Messages sent through contact or enquiry forms.</li>
          <li>
            Technical information such as browser type, device type, IP address
            and website activity.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "usage",
    number: "02",
    title: "How we use your information",
    content: (
      <>
        <p>We may use your information to:</p>

        <ul>
          <li>Process, dispatch and deliver your order.</li>
          <li>Confirm payments and provide transaction updates.</li>
          <li>Respond to enquiries and customer-support requests.</li>
          <li>Prepare quotations for custom carvings.</li>
          <li>Prevent fraudulent or unauthorised transactions.</li>
          <li>Improve our products, website and customer experience.</li>
          <li>Comply with applicable legal and accounting obligations.</li>
        </ul>
      </>
    ),
  },
  {
    id: "payments",
    number: "03",
    title: "Payments",
    content: (
      <>
        <p>
          Online payments may be processed through Razorpay or another
          authorised payment provider displayed during checkout.
        </p>

        <p>
          We do not directly store complete card numbers, CVV details, UPI PINs
          or internet-banking passwords. Payment providers process this
          information according to their own privacy and security policies.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    number: "04",
    title: "Information sharing",
    content: (
      <>
        <p>
          We do not sell or rent your personal information. We may share
          necessary information with trusted service providers, including:
        </p>

        <ul>
          <li>Payment-processing providers.</li>
          <li>Courier and logistics partners.</li>
          <li>Image and cloud-storage providers.</li>
          <li>Email and communication providers.</li>
          <li>Website hosting, analytics and security providers.</li>
          <li>
            Government or legal authorities when disclosure is legally required.
          </li>
        </ul>

        <p>
          These providers receive only the information reasonably required to
          perform their services.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    number: "05",
    title: "Cookies and local storage",
    content: (
      <>
        <p>
          Our website may use cookies and browser storage to remember cart
          items, wishlist selections, administrative sessions and website
          preferences.
        </p>

        <p>
          You can restrict cookies through your browser settings. Some website
          features may not operate correctly when cookies or local storage are
          disabled.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    number: "06",
    title: "Data retention",
    content: (
      <>
        <p>
          We retain personal information only for as long as reasonably
          necessary to provide our services, resolve disputes, maintain
          transaction records and satisfy legal, tax or accounting obligations.
        </p>

        <p>
          Reference images submitted for custom enquiries may be retained while
          the enquiry is active and for a reasonable period afterward.
        </p>
      </>
    ),
  },
  {
    id: "security",
    number: "07",
    title: "Information security",
    content: (
      <>
        <p>
          We use reasonable administrative and technical safeguards designed to
          protect information from unauthorised access, alteration, loss or
          disclosure.
        </p>

        <p>
          No internet transmission or storage system is completely secure.
          Therefore, absolute security cannot be guaranteed.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    number: "08",
    title: "Your choices and rights",
    content: (
      <>
        <p>
          Subject to applicable law, you may contact us to request access,
          correction or deletion of personal information associated with you.
          You may also withdraw consent where processing is based on consent.
        </p>

        <p>
          We may request reasonable information to verify your identity before
          completing a request. Certain information may need to be retained when
          required by law or for legitimate transaction records.
        </p>
      </>
    ),
  },
  {
    id: "children",
    number: "09",
    title: "Children’s privacy",
    content: (
      <p>
        Our website is not intended for independent use by children. Orders
        placed on behalf of a child should be completed by a parent or legal
        guardian.
      </p>
    ),
  },
  {
    id: "updates",
    number: "10",
    title: "Policy updates",
    content: (
      <p>
        We may update this Privacy Policy when our services, technology or legal
        obligations change. The latest version will be published on this page
        with its effective date.
      </p>
    ),
  },
];

const summaryCards = [
  {
    icon: FiDatabase,
    title: "Limited collection",
    description:
      "We collect information needed to process orders and provide support.",
  },
  {
    icon: FiEye,
    title: "No sale of data",
    description:
      "We do not sell or rent your personal information to third parties.",
  },
  {
    icon: FiLock,
    title: "Secure processing",
    description:
      "Payments are processed by authorised payment-service providers.",
  },
  {
    icon: FiUserCheck,
    title: "Your choices",
    description:
      "You may contact us regarding access, correction or deletion requests.",
  },
];

const Privacy = () => {
  return (
    <main className="min-h-screen bg-[#F7F0E5] text-[#2A1810]">
      <section className="relative overflow-hidden bg-[#21130E] px-5 py-20 text-[#FFF9EF] sm:px-6 lg:px-10 lg:py-28">
        <div className="absolute -right-36 top-0 h-96 w-96 rounded-full bg-[#A45A3A]/20 blur-[120px]" />

        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#D9B477]/10 blur-[120px]" />

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
            Your information matters
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.98] sm:text-6xl lg:text-8xl">
            Privacy
            <span className="italic text-[#D9B477]"> policy.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-[#D8C9B8] sm:text-base">
            This policy explains what information Devkar Wood Carvings collects,
            why we use it and how we protect it.
          </p>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9F8C7A]">
            Effective date: 18 September 2026
          </p>
        </motion.div>
      </section>

      <section className="px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="rounded-[1.5rem] border border-[#2A1810]/10 bg-[#FFF9EF] p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#21130E] text-[#D9B477]">
                  <Icon size={18} />
                </div>

                <h2 className="mt-5 font-serif text-2xl">{card.title}</h2>

                <p className="mt-3 text-sm leading-6 text-[#6F5A4E]">
                  {card.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[260px_1fr] xl:gap-20">
          <aside className="hidden lg:block">
            <nav className="sticky top-32 rounded-[1.5rem] border border-[#2A1810]/10 bg-[#FFF9EF] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A45A3A]">
                On this page
              </p>

              <div className="mt-5 space-y-3">
                {sections.map((section) => (
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
            {sections.map((section, index) => (
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
          <FiShield className="mx-auto text-[#D9B477]" size={28} />

          <h2 className="mt-5 font-serif text-4xl">Have a privacy question?</h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#C8B6A3]">
            Contact us with your request and include enough information for us
            to identify the relevant order or enquiry.
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
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:border-[#D9B477] hover:text-[#D9B477]"
            >
              Contact page
              <FiArrowRight />
            </Link>
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-[#8F7D6B]">
            <FiRefreshCcw />
            This policy may be updated when our practices change.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Privacy;
