import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiImage,
  FiMessageCircle,
  FiSearch,
  FiTool,
} from "react-icons/fi";

import { trackGuestEnquiry } from "../../services/enquiryService.js";

const statusSteps = [
  {
    status: "new",
    label: "Received",
  },
  {
    status: "contacted",
    label: "Contacted",
  },
  {
    status: "quoted",
    label: "Quoted",
  },
  {
    status: "accepted",
    label: "Accepted",
  },
  {
    status: "completed",
    label: "Completed",
  },
];

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

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
};

const TrackEnquiry = () => {
  const location = useLocation();

  const [form, setForm] = useState(() => ({
    enquiryNumber: location.state?.enquiryNumber || "",

    email: location.state?.email || "",

    phone: location.state?.phone || "",
  }));

  const [enquiry, setEnquiry] = useState(null);

  const [loading, setLoading] = useState(false);

  const [formError, setFormError] = useState("");

  const wasPrefilled = Boolean(
    location.state?.enquiryNumber &&
    location.state?.email &&
    location.state?.phone,
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    let cleanedValue = value;

    if (name === "phone") {
      cleanedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "enquiryNumber") {
      cleanedValue = value.toUpperCase();
    }

    setForm((current) => ({
      ...current,
      [name]: cleanedValue,
    }));

    setFormError("");
  };

  const validateForm = () => {
    if (!form.enquiryNumber.trim()) {
      return "Enquiry number is required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Enter a valid email address";
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      return "Enter a valid 10-digit Indian phone number";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setLoading(true);
      setFormError("");
      setEnquiry(null);

      const response = await trackGuestEnquiry({
        enquiryNumber: form.enquiryNumber.trim().toUpperCase(),

        email: form.email.trim().toLowerCase(),

        phone: form.phone,
      });

      const foundEnquiry = response?.data?.enquiry;

      if (!foundEnquiry) {
        throw new Error("Enquiry information was not returned");
      }

      setEnquiry(foundEnquiry);

      toast.success("Enquiry found");

      setTimeout(() => {
        document.getElementById("enquiry-tracking-result")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to find your enquiry";

      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      enquiryNumber: "",
      email: "",
      phone: "",
    });

    setEnquiry(null);
    setFormError("");
  };

  const currentStatusIndex = statusSteps.findIndex(
    (step) => step.status === enquiry?.status,
  );

  const isClosed = enquiry?.status === "closed";

  return (
    <main className="min-h-screen bg-[#F7F0E5] px-5 py-14 sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{
            opacity: 0,
            y: 22,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A45A3A]">
            Custom-carving assistance
          </p>

          <h1 className="mt-4 font-serif text-5xl text-[#2A1810] sm:text-6xl">
            Track your enquiry
          </h1>

          <p className="mt-5 text-sm leading-7 text-[#6F5A4E]">
            Enter the details used while submitting your custom-carving request.
          </p>
        </motion.div>

        {/* Tracking form */}

        <motion.form
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
            duration: 0.5,
          }}
          onSubmit={handleSubmit}
          className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-[#2A1810]/10 bg-[#FFF9EF] p-6 shadow-[0_20px_60px_rgba(42,24,16,0.08)] sm:p-8"
        >
          {wasPrefilled && !enquiry && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <FiCheckCircle className="mt-0.5 shrink-0" />

              <p>
                Your enquiry details have been filled automatically. Select
                Track Enquiry to view the latest status.
              </p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                Enquiry number
              </span>

              <input
                name="enquiryNumber"
                value={form.enquiryNumber}
                onChange={handleChange}
                placeholder="DWE-1789118989035-D4E07F"
                autoComplete="off"
                className="h-13 w-full rounded-xl border border-[#2A1810]/15 bg-white px-4 text-sm uppercase text-[#2A1810] outline-none transition focus:border-[#A45A3A]"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                Email address
              </span>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-13 w-full rounded-xl border border-[#2A1810]/15 bg-white px-4 text-sm text-[#2A1810] outline-none transition focus:border-[#A45A3A]"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                Phone number
              </span>

              <input
                type="tel"
                name="phone"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit phone number"
                autoComplete="tel"
                className="h-13 w-full rounded-xl border border-[#2A1810]/15 bg-white px-4 text-sm text-[#2A1810] outline-none transition focus:border-[#A45A3A]"
              />
            </label>
          </div>

          {formError && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <FiAlertCircle className="mt-0.5 shrink-0" />
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#2A1810] text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#A45A3A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Finding enquiry...
              </>
            ) : (
              <>
                <FiSearch />
                Track enquiry
              </>
            )}
          </button>

          <div className="mt-5 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-[#7A675C] transition hover:text-[#A45A3A]"
            >
              Clear details
            </button>

            <span className="hidden text-[#BBAA99] sm:inline">•</span>

            <Link
              to="/contact"
              className="text-xs font-semibold text-[#A45A3A] transition hover:text-[#7D422B]"
            >
              Submit a new enquiry
            </Link>
          </div>
        </motion.form>

        {/* Tracking result */}

        {enquiry && (
          <motion.section
            id="enquiry-tracking-result"
            initial={{
              opacity: 0,
              y: 28,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
            }}
            className="mt-10 scroll-mt-32 overflow-hidden rounded-[2rem] border border-[#2A1810]/10 bg-[#FFF9EF] shadow-[0_20px_60px_rgba(42,24,16,0.08)]"
          >
            <div className="flex flex-col gap-5 bg-[#21130E] px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#D9B477]">
                  Enquiry number
                </p>

                <h2 className="mt-2 break-all font-serif text-2xl">
                  {enquiry.enquiryNumber}
                </h2>

                <p className="mt-2 text-xs text-[#C8B6A3]">
                  Submitted {formatDate(enquiry.createdAt)}
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                  isClosed
                    ? "bg-red-100 text-red-700"
                    : enquiry.status === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-[#D9B477] text-[#21130E]"
                }`}
              >
                {enquiry.status}
              </span>
            </div>

            <div className="p-6 sm:p-8">
              {/* Status timeline */}

              {!isClosed ? (
                <div className="overflow-x-auto pb-3">
                  <div className="flex min-w-[650px]">
                    {statusSteps.map((step, index) => {
                      const completed = index <= currentStatusIndex;

                      return (
                        <div
                          key={step.status}
                          className="relative flex flex-1 flex-col items-center"
                        >
                          {index < statusSteps.length - 1 && (
                            <div
                              className={`absolute left-1/2 top-5 h-0.5 w-full ${
                                index < currentStatusIndex
                                  ? "bg-[#A45A3A]"
                                  : "bg-[#DED0BD]"
                              }`}
                            />
                          )}

                          <div
                            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                              completed
                                ? "border-[#A45A3A] bg-[#A45A3A] text-white"
                                : "border-[#D8C7AA] bg-[#FFF9EF] text-[#9C8979]"
                            }`}
                          >
                            {completed ? <FiCheckCircle /> : <FiClock />}
                          </div>

                          <p
                            className={`mt-3 text-[9px] font-bold uppercase tracking-[0.12em] ${
                              completed ? "text-[#2A1810]" : "text-[#9C8979]"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  This enquiry has been closed. Contact us if you require
                  further assistance.
                </div>
              )}

              {/* Summary */}

              <div className="mt-9 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#F4E9D8] p-5">
                  <FiTool className="text-[#A45A3A]" />

                  <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7465]">
                    Carving type
                  </p>

                  <p className="mt-1 font-serif text-xl text-[#2A1810]">
                    {enquiry.carvingType}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F4E9D8] p-5">
                  <FiMessageCircle className="text-[#A45A3A]" />

                  <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7465]">
                    Preferred contact
                  </p>

                  <p className="mt-1 font-serif text-xl capitalize text-[#2A1810]">
                    {enquiry.preferredContactMethod}
                  </p>
                </div>
              </div>

              {/* Quotation */}

              {enquiry.quotedAmount !== null &&
                enquiry.quotedAmount !== undefined && (
                  <div className="mt-6 rounded-2xl border border-[#D9B477]/40 bg-[#D9B477]/10 p-6">
                    <div className="flex items-center gap-3">
                      <FiDollarSign className="text-[#A45A3A]" />

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8A642D]">
                          Estimated quotation
                        </p>

                        <p className="mt-1 font-serif text-3xl text-[#2A1810]">
                          {formatPrice(enquiry.quotedAmount)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-6 text-[#6F5A4E]">
                      Contact our team to confirm the final design, materials,
                      timeline and payment details.
                    </p>
                  </div>
                )}

              {/* Request */}

              <div className="mt-7">
                <h3 className="font-serif text-2xl text-[#2A1810]">
                  Your request
                </h3>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#5F4A3F]">
                  {enquiry.description}
                </p>
              </div>

              {/* Reference images */}

              {enquiry.referenceImages?.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2">
                    <FiImage className="text-[#A45A3A]" />

                    <h3 className="font-serif text-2xl text-[#2A1810]">
                      Reference images
                    </h3>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                    {enquiry.referenceImages.map((image) => (
                      <a
                        key={image.fileId}
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group aspect-square overflow-hidden rounded-xl bg-[#E9DDCC]"
                      >
                        <img
                          src={image.thumbnailUrl || image.url}
                          alt={image.name || "Enquiry reference"}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status history */}

              {enquiry.statusHistory?.length > 0 && (
                <div className="mt-9">
                  <h3 className="font-serif text-2xl text-[#2A1810]">
                    Status history
                  </h3>

                  <div className="mt-5 space-y-4">
                    {[...enquiry.statusHistory]
                      .reverse()
                      .map((history, index) => (
                        <div
                          key={`${history.status}-${history.changedAt}-${index}`}
                          className="flex gap-4 border-l-2 border-[#D9B477] pl-4"
                        >
                          <div>
                            <p className="text-sm font-semibold capitalize text-[#2A1810]">
                              {history.status}
                            </p>

                            {history.message && (
                              <p className="mt-1 text-sm text-[#6F5A4E]">
                                {history.message}
                              </p>
                            )}

                            <p className="mt-1 text-[10px] text-[#927F70]">
                              {formatDate(history.changedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
};

export default TrackEnquiry;
