import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiExternalLink,
  FiImage,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiRefreshCw,
  FiSave,
  FiTool,
  FiUser,
} from "react-icons/fi";

import {
  clearAdminEnquiryMutationError,
  clearSelectedAdminEnquiry,
  fetchAdminEnquiryById,
  updateEnquiryCustomerForAdmin,
  updateEnquiryNoteForAdmin,
  updateEnquiryQuoteForAdmin,
  updateEnquiryStatusForAdmin,
} from "../../features/adminEnquiries/adminEnquirySlice.js";

const ENQUIRY_STATUSES = [
  "new",
  "contacted",
  "reviewing",
  "quoted",
  "approved",
  "in-progress",
  "completed",
  "rejected",
  "closed",
];

const inputClass = (hasError = false) => {
  return `h-12 w-full rounded-xl border bg-[#FFFCF7] px-4 text-sm text-[#2A1810] outline-none transition ${
    hasError ? "border-red-500" : "border-[#2A1810]/15 focus:border-[#A45A3A]"
  }`;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
};

const formatDate = (date) => {
  if (!date) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const getStatusClasses = (status) => {
  const classes = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-indigo-100 text-indigo-700",
    reviewing: "bg-amber-100 text-amber-700",
    quoted: "bg-purple-100 text-purple-700",
    approved: "bg-emerald-100 text-emerald-700",
    "in-progress": "bg-orange-100 text-orange-700",
    completed: "bg-teal-100 text-teal-700",
    rejected: "bg-red-100 text-red-700",
    closed: "bg-stone-200 text-stone-600",
  };

  return classes[status] || "bg-stone-100 text-stone-600";
};

const AdminEnquiryDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const {
    selectedEnquiry: enquiry,
    selectedEnquiryLoading,
    selectedEnquiryError,
    updatingStatus,
    updatingQuote,
    updatingNote,
    updatingCustomer,
    mutationError,
  } = useSelector((state) => state.adminEnquiries);

  const [statusForm, setStatusForm] = useState({
    status: "",
    message: "",
  });

  const [quoteForm, setQuoteForm] = useState({
    estimatedPrice: "",
    estimatedCompletionDays: "",
    quoteMessage: "",
    validUntil: "",
  });

  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [adminNote, setAdminNote] = useState("");
  const [customerErrors, setCustomerErrors] = useState({});
  const [quoteErrors, setQuoteErrors] = useState({});

  /*
  |--------------------------------------------------------------------------
  | Load enquiry
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(fetchAdminEnquiryById(id));

    return () => {
      dispatch(clearSelectedAdminEnquiry());
    };
  }, [dispatch, id]);

  /*
  |--------------------------------------------------------------------------
  | Fill forms
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!enquiry) {
      return;
    }

    setStatusForm({
      status: enquiry.status || "new",
      message: "",
    });

    setCustomerForm({
      name: enquiry.customer?.name || "",
      email: enquiry.customer?.email || "",
      phone: enquiry.customer?.phone || "",
    });

    setQuoteForm({
      estimatedPrice: String(
        enquiry.quote?.estimatedPrice ??
          enquiry.quotation?.estimatedPrice ??
          "",
      ),

      estimatedCompletionDays: String(
        enquiry.quote?.estimatedCompletionDays ??
          enquiry.quotation?.estimatedCompletionDays ??
          "",
      ),

      quoteMessage:
        enquiry.quote?.quoteMessage ?? enquiry.quotation?.quoteMessage ?? "",

      validUntil:
        enquiry.quote?.validUntil || enquiry.quotation?.validUntil
          ? new Date(enquiry.quote?.validUntil || enquiry.quotation?.validUntil)
              .toISOString()
              .split("T")[0]
          : "",
    });

    setAdminNote(enquiry.adminNote || "");
  }, [enquiry]);

  useEffect(() => {
    if (!mutationError) {
      return;
    }

    toast.error(mutationError);
    dispatch(clearAdminEnquiryMutationError());
  }, [dispatch, mutationError]);

  /*
  |--------------------------------------------------------------------------
  | Status
  |--------------------------------------------------------------------------
  */

  const handleStatusSubmit = async (event) => {
    event.preventDefault();

    if (!statusForm.status) {
      return;
    }

    try {
      await dispatch(
        updateEnquiryStatusForAdmin({
          enquiryId: enquiry._id,
          status: statusForm.status,
          message: statusForm.message.trim(),
        }),
      ).unwrap();

      setStatusForm((current) => ({
        ...current,
        message: "",
      }));

      toast.success("Enquiry status updated");
    } catch (error) {
      toast.error(error || "Unable to update status");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Quote
  |--------------------------------------------------------------------------
  */

  const handleQuoteChange = (event) => {
    const { name, value } = event.target;

    setQuoteForm((current) => ({
      ...current,
      [name]: ["estimatedPrice", "estimatedCompletionDays"].includes(name)
        ? value.replace(/\D/g, "")
        : value,
    }));

    setQuoteErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const handleQuoteSubmit = async (event) => {
    event.preventDefault();

    const errors = {};

    if (!quoteForm.estimatedPrice || Number(quoteForm.estimatedPrice) <= 0) {
      errors.estimatedPrice = "Enter a valid estimated price";
    }

    if (
      !quoteForm.estimatedCompletionDays ||
      Number(quoteForm.estimatedCompletionDays) <= 0
    ) {
      errors.estimatedCompletionDays = "Enter valid completion days";
    }

    setQuoteErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await dispatch(
        updateEnquiryQuoteForAdmin({
          enquiryId: enquiry._id,
          estimatedPrice: Number(quoteForm.estimatedPrice),
          estimatedCompletionDays: Number(quoteForm.estimatedCompletionDays),
          quoteMessage: quoteForm.quoteMessage.trim(),
          validUntil: quoteForm.validUntil,
        }),
      ).unwrap();

      toast.success("Quotation updated successfully");
    } catch (error) {
      toast.error(error || "Unable to update quotation");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Customer
  |--------------------------------------------------------------------------
  */

  const handleCustomerChange = (event) => {
    const { name, value } = event.target;

    setCustomerForm((current) => ({
      ...current,
      [name]: name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));

    setCustomerErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const handleCustomerSubmit = async (event) => {
    event.preventDefault();

    const errors = {};

    if (!customerForm.name.trim()) {
      errors.name = "Customer name is required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (!/^[6-9]\d{9}$/.test(customerForm.phone)) {
      errors.phone = "Enter a valid 10-digit phone number";
    }

    setCustomerErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await dispatch(
        updateEnquiryCustomerForAdmin({
          enquiryId: enquiry._id,

          customerData: {
            name: customerForm.name.trim(),
            email: customerForm.email.trim().toLowerCase(),
            phone: customerForm.phone,
          },
        }),
      ).unwrap();

      toast.success("Customer details updated");
    } catch (error) {
      toast.error(error || "Unable to update customer");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Note
  |--------------------------------------------------------------------------
  */

  const handleNoteSubmit = async (event) => {
    event.preventDefault();

    try {
      await dispatch(
        updateEnquiryNoteForAdmin({
          enquiryId: enquiry._id,
          adminNote: adminNote.trim(),
        }),
      ).unwrap();

      toast.success("Private admin note saved");
    } catch (error) {
      toast.error(error || "Unable to update admin note");
    }
  };

  if (selectedEnquiryLoading) {
    return (
      <main className="animate-pulse">
        <div className="h-4 w-36 rounded bg-[#DED0BD]" />
        <div className="mt-6 h-12 w-80 rounded bg-[#DED0BD]" />

        <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_370px]">
          <div className="space-y-6">
            <div className="h-80 rounded-[1.75rem] bg-white" />
            <div className="h-96 rounded-[1.75rem] bg-white" />
          </div>

          <div className="space-y-6">
            <div className="h-80 rounded-[1.75rem] bg-white" />
            <div className="h-72 rounded-[1.75rem] bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (selectedEnquiryError || !enquiry) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <FiTool size={36} className="mx-auto text-[#A45A3A]" />

          <h1 className="mt-5 font-serif text-4xl text-[#2A1810]">
            Enquiry not found
          </h1>

          <p className="mt-3 text-sm text-[#756157]">{selectedEnquiryError}</p>

          <Link
            to="/admin/enquiries"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
          >
            <FiArrowLeft />
            Back to enquiries
          </Link>
        </div>
      </main>
    );
  }

  const images = Array.isArray(enquiry.referenceImages)
    ? enquiry.referenceImages
    : [];

  const dimensions = enquiry.dimensions || {};

  return (
    <main>
      {/* Header */}

      <section className="flex flex-col gap-5 border-b border-[#2A1810]/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/admin/enquiries"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#A45A3A]"
          >
            <FiArrowLeft />
            Back to enquiries
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-4xl text-[#2A1810] sm:text-5xl">
              {enquiry.enquiryNumber}
            </h1>

            <span
              className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${getStatusClasses(
                enquiry.status,
              )}`}
            >
              {enquiry.status}
            </span>
          </div>

          <p className="mt-3 text-sm text-[#756157]">
            Submitted on {formatDate(enquiry.createdAt)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(fetchAdminEnquiryById(id))}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#2A1810]/15 bg-white px-5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#2A1810]"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_370px]">
        <div className="space-y-8">
          {/* Idea */}

          <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <FiTool className="text-[#A45A3A]" />

              <h2 className="font-serif text-3xl text-[#2A1810]">
                Carving request
              </h2>
            </div>

            <dl className="mt-7 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7569]">
                  Carving type
                </dt>

                <dd className="mt-2 text-sm font-semibold text-[#2A1810]">
                  {enquiry.carvingType || "Not specified"}
                </dd>
              </div>

              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7569]">
                  Preferred wood
                </dt>

                <dd className="mt-2 text-sm font-semibold text-[#2A1810]">
                  {enquiry.preferredWood || "Artisan suggestion"}
                </dd>
              </div>

              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7569]">
                  Budget
                </dt>

                <dd className="mt-2 text-sm font-semibold text-[#2A1810]">
                  {enquiry.budgetRange || "Not specified"}
                </dd>
              </div>

              <div>
                <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7569]">
                  Required by
                </dt>

                <dd className="mt-2 text-sm font-semibold text-[#2A1810]">
                  {formatDate(enquiry.requiredBy)}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7569]">
                  Approximate dimensions
                </dt>

                <dd className="mt-2 text-sm font-semibold text-[#2A1810]">
                  {dimensions.height || "—"} × {dimensions.width || "—"} ×{" "}
                  {dimensions.depth || "—"} {dimensions.unit || ""}
                </dd>
              </div>
            </dl>

            <div className="mt-7 border-t border-[#2A1810]/10 pt-7">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#2A1810]">
                Customer description
              </h3>

              <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#756157]">
                {enquiry.description}
              </p>
            </div>

            {enquiry.customerNote && (
              <div className="mt-6 rounded-2xl bg-[#F4ECE0] p-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A642D]">
                  Additional note
                </p>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#5F4A3F]">
                  {enquiry.customerNote}
                </p>
              </div>
            )}
          </section>

          {/* Images */}

          <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <FiImage className="text-[#A45A3A]" />

              <h2 className="font-serif text-3xl text-[#2A1810]">
                Reference images
              </h2>
            </div>

            {images.length > 0 ? (
              <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3">
                {images.map((image, index) => (
                  <a
                    key={image.fileId || image.url}
                    href={image.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-2xl bg-[#E9DDCC]"
                  >
                    <img
                      src={image.url}
                      alt={image.altText || `Reference ${index + 1}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#21130E]/80 text-white">
                      <FiExternalLink />
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-[#756157]">
                No reference images were submitted.
              </p>
            )}
          </section>

          {/* Customer */}

          <form
            onSubmit={handleCustomerSubmit}
            className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <FiUser className="text-[#A45A3A]" />

              <h2 className="font-serif text-3xl text-[#2A1810]">
                Customer details
              </h2>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Name
                </span>

                <input
                  name="name"
                  value={customerForm.name}
                  onChange={handleCustomerChange}
                  className={inputClass(customerErrors.name)}
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Email
                </span>

                <input
                  type="email"
                  name="email"
                  value={customerForm.email}
                  onChange={handleCustomerChange}
                  className={inputClass(customerErrors.email)}
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Phone
                </span>

                <input
                  name="phone"
                  value={customerForm.phone}
                  onChange={handleCustomerChange}
                  className={inputClass(customerErrors.phone)}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={updatingCustomer}
              className="mt-6 flex h-11 items-center gap-2 rounded-full bg-[#2A1810] px-6 text-[9px] font-bold uppercase tracking-[0.13em] text-white disabled:opacity-60"
            >
              <FiSave />
              {updatingCustomer ? "Saving..." : "Save customer"}
            </button>
          </form>
        </div>

        <aside className="space-y-6">
          {/* Contact */}

          <section className="rounded-[1.75rem] bg-[#21130E] p-6 text-white">
            <h2 className="font-serif text-2xl">Contact customer</h2>

            <div className="mt-6 space-y-3">
              <a
                href={`tel:${enquiry.customer?.phone}`}
                className="flex h-11 items-center gap-3 rounded-full bg-white/10 px-5 text-xs transition hover:bg-white/15"
              >
                <FiPhone className="text-[#D9B477]" />
                {enquiry.customer?.phone}
              </a>

              <a
                href={`mailto:${enquiry.customer?.email}`}
                className="flex h-11 items-center gap-3 rounded-full bg-white/10 px-5 text-xs transition hover:bg-white/15"
              >
                <FiMail className="text-[#D9B477]" />
                <span className="truncate">{enquiry.customer?.email}</span>
              </a>

              <a
                href={`https://wa.me/91${enquiry.customer?.phone}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center gap-3 rounded-full bg-emerald-600 px-5 text-xs"
              >
                <FiMessageCircle />
                Open WhatsApp
              </a>
            </div>

            {(enquiry.city || enquiry.state) && (
              <p className="mt-6 flex items-center gap-3 text-sm text-[#C8B6A3]">
                <FiMapPin className="text-[#D9B477]" />
                {[enquiry.city, enquiry.state].filter(Boolean).join(", ")}
              </p>
            )}
          </section>

          {/* Status */}

          <form
            onSubmit={handleStatusSubmit}
            className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6"
          >
            <h2 className="font-serif text-2xl text-[#2A1810]">
              Enquiry status
            </h2>

            <select
              value={statusForm.status}
              onChange={(event) =>
                setStatusForm((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              className={`${inputClass()} mt-5 capitalize`}
            >
              {ENQUIRY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace("-", " ")}
                </option>
              ))}
            </select>

            <textarea
              rows={3}
              value={statusForm.message}
              onChange={(event) =>
                setStatusForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              placeholder="Optional status message..."
              className="mt-4 w-full resize-none rounded-xl border border-[#2A1810]/15 bg-[#FFFCF7] p-4 text-sm outline-none focus:border-[#A45A3A]"
            />

            <button
              type="submit"
              disabled={updatingStatus}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#2A1810] text-[9px] font-bold uppercase tracking-[0.13em] text-white disabled:opacity-60"
            >
              <FiCheckCircle />
              {updatingStatus ? "Updating..." : "Update status"}
            </button>
          </form>

          {/* Quote */}

          <form
            onSubmit={handleQuoteSubmit}
            className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6"
          >
            <div className="flex items-center gap-3">
              <FiDollarSign className="text-[#A45A3A]" />

              <h2 className="font-serif text-2xl text-[#2A1810]">Quotation</h2>
            </div>

            <div className="mt-5 space-y-4">
              <label>
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Estimated price
                </span>

                <input
                  name="estimatedPrice"
                  value={quoteForm.estimatedPrice}
                  onChange={handleQuoteChange}
                  className={inputClass(quoteErrors.estimatedPrice)}
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Completion days
                </span>

                <input
                  name="estimatedCompletionDays"
                  value={quoteForm.estimatedCompletionDays}
                  onChange={handleQuoteChange}
                  className={inputClass(quoteErrors.estimatedCompletionDays)}
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Valid until
                </span>

                <input
                  type="date"
                  name="validUntil"
                  value={quoteForm.validUntil}
                  onChange={handleQuoteChange}
                  className={inputClass()}
                />
              </label>

              <textarea
                name="quoteMessage"
                rows={4}
                value={quoteForm.quoteMessage}
                onChange={handleQuoteChange}
                placeholder="Quotation details for the customer..."
                className="w-full resize-none rounded-xl border border-[#2A1810]/15 bg-[#FFFCF7] p-4 text-sm outline-none focus:border-[#A45A3A]"
              />
            </div>

            {quoteForm.estimatedPrice && (
              <p className="mt-4 rounded-xl bg-[#F4ECE0] p-3 text-center font-serif text-xl text-[#2A1810]">
                {formatPrice(quoteForm.estimatedPrice)}
              </p>
            )}

            <button
              type="submit"
              disabled={updatingQuote}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#A45A3A] text-[9px] font-bold uppercase tracking-[0.13em] text-white disabled:opacity-60"
            >
              <FiSave />
              {updatingQuote ? "Saving..." : "Save quotation"}
            </button>
          </form>

          {/* Admin note */}

          <form
            onSubmit={handleNoteSubmit}
            className="rounded-[1.75rem] border border-[#D9B477]/30 bg-[#FFF7E8] p-6"
          >
            <h2 className="font-serif text-2xl text-[#2A1810]">
              Private admin note
            </h2>

            <p className="mt-2 text-xs leading-5 text-[#756157]">
              This note is only visible to administrators.
            </p>

            <textarea
              rows={6}
              maxLength={2000}
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              className="mt-5 w-full resize-none rounded-xl border border-[#D9B477]/40 bg-white p-4 text-sm outline-none focus:border-[#A45A3A]"
            />

            <button
              type="submit"
              disabled={updatingNote}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#2A1810] text-[9px] font-bold uppercase tracking-[0.13em] text-white disabled:opacity-60"
            >
              <FiSave />
              {updatingNote ? "Saving..." : "Save private note"}
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
};

export default AdminEnquiryDetails;
