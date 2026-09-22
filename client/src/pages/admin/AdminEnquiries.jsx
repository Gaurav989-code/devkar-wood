import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEye,
  FiImage,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiTool,
  FiUser,
  FiX,
} from "react-icons/fi";

import { fetchAdminEnquiries } from "../../features/adminEnquiries/adminEnquirySlice.js";

const STATUS_OPTIONS = [
  {
    value: "",
    label: "All statuses",
  },
  {
    value: "new",
    label: "New",
  },
  {
    value: "contacted",
    label: "Contacted",
  },
  {
    value: "reviewing",
    label: "Reviewing",
  },
  {
    value: "quoted",
    label: "Quoted",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "in-progress",
    label: "In progress",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
  {
    value: "closed",
    label: "Closed",
  },
];

const CONTACT_METHOD_OPTIONS = [
  {
    value: "",
    label: "All contact methods",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
  },
  {
    value: "phone",
    label: "Phone",
  },
  {
    value: "email",
    label: "Email",
  },
];

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest first",
  },
  {
    value: "oldest",
    label: "Oldest first",
  },
  {
    value: "requiredDate",
    label: "Required date",
  },
];

const formatDate = (date) => {
  if (!date) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const formatShortDate = (date) => {
  if (!date) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
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

const getContactIcon = (method) => {
  const icons = {
    whatsapp: FiMessageCircle,
    phone: FiPhone,
    email: FiMail,
  };

  return icons[method] || FiUser;
};

const getReferenceImages = (enquiry) => {
  if (Array.isArray(enquiry.referenceImages)) {
    return enquiry.referenceImages;
  }

  return [];
};

const AdminEnquiries = () => {
  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );

  const { enquiries, pagination, enquiriesLoading, enquiriesError } =
    useSelector((state) => state.adminEnquiries);

  const currentPage = Math.max(Number(searchParams.get("page")) || 1, 1);

  const selectedStatus = searchParams.get("status") || "";

  const selectedContactMethod =
    searchParams.get("preferredContactMethod") || "";

  const selectedSort = searchParams.get("sort") || "newest";

  /*
  |--------------------------------------------------------------------------
  | API parameters
  |--------------------------------------------------------------------------
  */

  const requestParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: 10,
      sort: selectedSort,
    };

    const search = searchParams.get("search");

    if (search) {
      params.search = search;
    }

    if (selectedStatus) {
      params.status = selectedStatus;
    }

    if (selectedContactMethod) {
      params.preferredContactMethod = selectedContactMethod;
    }

    return params;
  }, [
    currentPage,
    searchParams,
    selectedContactMethod,
    selectedSort,
    selectedStatus,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Load enquiries
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(fetchAdminEnquiries(requestParams));
  }, [dispatch, requestParams]);

  /*
  |--------------------------------------------------------------------------
  | URL filters
  |--------------------------------------------------------------------------
  */

  const updateFilter = (key, value) => {
    const updatedParams = new URLSearchParams(searchParams);

    if (value === "" || value === null || value === undefined) {
      updatedParams.delete(key);
    } else {
      updatedParams.set(key, String(value));
    }

    if (key !== "page") {
      updatedParams.set("page", "1");
    }

    setSearchParams(updatedParams);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    updateFilter("search", searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const totalPages = Number(pagination?.totalPages) || 0;

  const totalEnquiries =
    pagination?.totalEnquiries ?? pagination?.totalItems ?? enquiries.length;

  const activeFilterCount = [
    searchParams.get("search"),
    selectedStatus,
    selectedContactMethod,
  ].filter(Boolean).length;

  return (
    <main>
      {/* Heading */}

      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A45A3A]">
            Custom carving requests
          </p>

          <h1 className="mt-2 font-serif text-4xl text-[#2A1810] sm:text-5xl">
            Enquiries
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#756157]">
            Review customer ideas, reference images and quotation progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(fetchAdminEnquiries(requestParams))}
          disabled={enquiriesLoading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#2A1810]/15 bg-white px-6 text-[10px] font-bold uppercase tracking-[0.15em] text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A] disabled:opacity-50"
        >
          <FiRefreshCw className={enquiriesLoading ? "animate-spin" : ""} />
          Refresh enquiries
        </button>
      </section>

      {/* Summary */}

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.5rem] border border-[#2A1810]/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <FiTool className="text-[#A45A3A]" />

            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8A7569]">
              Results
            </span>
          </div>

          <p className="mt-5 font-serif text-4xl text-[#2A1810]">
            {totalEnquiries}
          </p>

          <p className="mt-1 text-xs text-[#756157]">Matching enquiries</p>
        </div>

        <div className="rounded-[1.5rem] border border-[#2A1810]/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <FiClock className="text-blue-600" />

            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8A7569]">
              New
            </span>
          </div>

          <p className="mt-5 font-serif text-4xl text-[#2A1810]">
            {enquiries.filter((enquiry) => enquiry.status === "new").length}
          </p>

          <p className="mt-1 text-xs text-[#756157]">New on this page</p>
        </div>

        <div className="rounded-[1.5rem] border border-[#2A1810]/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <FiMessageCircle className="text-purple-600" />

            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8A7569]">
              Quoted
            </span>
          </div>

          <p className="mt-5 font-serif text-4xl text-[#2A1810]">
            {enquiries.filter((enquiry) => enquiry.status === "quoted").length}
          </p>

          <p className="mt-1 text-xs text-[#756157]">Quoted on this page</p>
        </div>
      </section>

      {/* Filters */}

      <section className="mt-6 rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-4 shadow-[0_16px_45px_rgba(42,24,16,0.05)] sm:p-5">
        <form onSubmit={handleSearch} className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7569]" />

          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search enquiry number, customer, email or phone..."
            className="h-12 w-full rounded-full border border-[#2A1810]/10 bg-[#FAF6EF] pl-11 pr-24 text-sm text-[#2A1810] outline-none transition focus:border-[#A45A3A]"
          />

          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-[#2A1810] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white"
          >
            Search
          </button>
        </form>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <select
            value={selectedStatus}
            onChange={(event) => updateFilter("status", event.target.value)}
            className="h-11 rounded-full border border-[#2A1810]/10 bg-[#FAF6EF] px-4 text-xs font-semibold text-[#2A1810] outline-none focus:border-[#A45A3A]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={selectedContactMethod}
            onChange={(event) =>
              updateFilter("preferredContactMethod", event.target.value)
            }
            className="h-11 rounded-full border border-[#2A1810]/10 bg-[#FAF6EF] px-4 text-xs font-semibold text-[#2A1810] outline-none focus:border-[#A45A3A]"
          >
            {CONTACT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={selectedSort}
            onChange={(event) => updateFilter("sort", event.target.value)}
            className="h-11 rounded-full border border-[#2A1810]/10 bg-[#FAF6EF] px-4 text-xs font-semibold text-[#2A1810] outline-none focus:border-[#A45A3A]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {activeFilterCount > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#2A1810]/8 pt-4">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8A7569]">
              Active filters
            </span>

            {searchParams.get("search") && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateFilter("search", "");
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#A45A3A]/10 px-3 py-1.5 text-[9px] font-semibold text-[#A45A3A]"
              >
                Search: {searchParams.get("search")}
                <FiX />
              </button>
            )}

            {selectedStatus && (
              <button
                type="button"
                onClick={() => updateFilter("status", "")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#A45A3A]/10 px-3 py-1.5 text-[9px] font-semibold capitalize text-[#A45A3A]"
              >
                {selectedStatus}
                <FiX />
              </button>
            )}

            {selectedContactMethod && (
              <button
                type="button"
                onClick={() => updateFilter("preferredContactMethod", "")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#A45A3A]/10 px-3 py-1.5 text-[9px] font-semibold capitalize text-[#A45A3A]"
              >
                {selectedContactMethod}
                <FiX />
              </button>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#756157] transition hover:text-[#A45A3A]"
            >
              Clear all
            </button>
          </div>
        )}
      </section>

      {/* Loading */}

      {enquiriesLoading && (
        <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-[#2A1810]/10 bg-white">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse items-center gap-4 border-b border-[#2A1810]/8 p-5 last:border-b-0"
            >
              <div className="h-12 w-12 rounded-full bg-[#E7D9C5]" />

              <div className="flex-1">
                <div className="h-4 w-48 rounded bg-[#E7D9C5]" />
                <div className="mt-3 h-3 w-32 rounded bg-[#EFE5D7]" />
              </div>

              <div className="hidden h-4 w-24 rounded bg-[#E7D9C5] sm:block" />
            </div>
          ))}
        </section>
      )}

      {/* Error */}

      {!enquiriesLoading && enquiriesError && (
        <section className="mt-6 rounded-[1.75rem] border border-red-200 bg-red-50 px-6 py-16 text-center">
          <FiTool size={32} className="mx-auto text-red-500" />

          <h2 className="mt-4 font-serif text-3xl text-[#2A1810]">
            Enquiries could not be loaded
          </h2>

          <p className="mt-3 text-sm text-red-700">{enquiriesError}</p>

          <button
            type="button"
            onClick={() => dispatch(fetchAdminEnquiries(requestParams))}
            className="mt-6 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
          >
            Try again
          </button>
        </section>
      )}

      {/* Desktop table */}

      {!enquiriesLoading && !enquiriesError && enquiries.length > 0 && (
        <section className="mt-6 hidden overflow-hidden rounded-[1.75rem] border border-[#2A1810]/10 bg-white shadow-[0_16px_45px_rgba(42,24,16,0.04)] lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-[#F4ECE0]">
                <tr className="text-left text-[9px] font-bold uppercase tracking-[0.16em] text-[#756157]">
                  <th className="px-6 py-4">Enquiry</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Carving</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {enquiries.map((enquiry) => {
                  const ContactIcon = getContactIcon(
                    enquiry.preferredContactMethod,
                  );

                  const referenceImages = getReferenceImages(enquiry);

                  return (
                    <tr
                      key={enquiry._id}
                      className="border-t border-[#2A1810]/8 transition hover:bg-[#FCF8F2]"
                    >
                      <td className="px-6 py-5">
                        <p className="font-serif text-lg font-semibold text-[#2A1810]">
                          {enquiry.enquiryNumber}
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-[9px] uppercase tracking-[0.12em] text-[#8A7569]">
                          <FiImage />
                          {referenceImages.length} reference image
                          {referenceImages.length === 1 ? "" : "s"}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <p className="max-w-48 truncate text-sm font-semibold text-[#2A1810]">
                          {enquiry.customer?.name || "Guest customer"}
                        </p>

                        <p className="mt-1 max-w-48 truncate text-[10px] text-[#756157]">
                          {enquiry.customer?.phone || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="max-w-48 truncate text-sm font-semibold text-[#2A1810]">
                          {enquiry.carvingType || "Custom carving"}
                        </p>

                        <p className="mt-1 max-w-48 truncate text-[10px] text-[#756157]">
                          {enquiry.preferredWood || "Wood not specified"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#F4ECE0] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#5F4A3F]">
                          <ContactIcon />
                          {enquiry.preferredContactMethod || "Not specified"}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] ${getStatusClasses(
                            enquiry.status,
                          )}`}
                        >
                          {enquiry.status}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-xs text-[#756157]">
                          {formatDate(enquiry.createdAt)}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end">
                          <Link
                            to={`/admin/enquiries/${enquiry._id}`}
                            className="flex h-10 items-center gap-2 rounded-full border border-[#2A1810]/10 px-4 text-[8px] font-bold uppercase tracking-[0.11em] text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A]"
                          >
                            <FiEye />
                            View enquiry
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Mobile cards */}

      {!enquiriesLoading && !enquiriesError && enquiries.length > 0 && (
        <section className="mt-6 grid gap-4 lg:hidden">
          {enquiries.map((enquiry, index) => {
            const ContactIcon = getContactIcon(enquiry.preferredContactMethod);

            return (
              <motion.article
                key={enquiry._id}
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: Math.min(index, 5) * 0.04,
                }}
                className="rounded-[1.5rem] border border-[#2A1810]/10 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-xl font-semibold text-[#2A1810]">
                      {enquiry.enquiryNumber}
                    </p>

                    <p className="mt-1 text-[10px] text-[#756157]">
                      {formatDate(enquiry.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${getStatusClasses(
                      enquiry.status,
                    )}`}
                  >
                    {enquiry.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 border-y border-[#2A1810]/8 py-4">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#8A7569]">
                      Customer
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-[#2A1810]">
                      {enquiry.customer?.name || "Guest customer"}
                    </p>

                    <p className="mt-1 text-[10px] text-[#756157]">
                      {enquiry.customer?.phone || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#8A7569]">
                      Carving
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-[#2A1810]">
                      {enquiry.carvingType || "Custom carving"}
                    </p>

                    <p className="mt-1 text-[10px] text-[#756157]">
                      {enquiry.preferredWood || "Wood not specified"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#F4ECE0] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#5F4A3F]">
                    <ContactIcon />
                    {enquiry.preferredContactMethod || "Not specified"}
                  </span>

                  <Link
                    to={`/admin/enquiries/${enquiry._id}`}
                    className="flex h-10 items-center gap-2 rounded-full bg-[#2A1810] px-4 text-[8px] font-bold uppercase tracking-[0.11em] text-white"
                  >
                    <FiEye />
                    View
                  </Link>
                </div>

                {enquiry.requiredBy && (
                  <p className="mt-4 text-[10px] text-[#756157]">
                    Required by:{" "}
                    <strong className="text-[#2A1810]">
                      {formatShortDate(enquiry.requiredBy)}
                    </strong>
                  </p>
                )}
              </motion.article>
            );
          })}
        </section>
      )}

      {/* Empty */}

      {!enquiriesLoading && !enquiriesError && enquiries.length === 0 && (
        <section className="mt-6 rounded-[1.75rem] border border-[#2A1810]/10 bg-white px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#A45A3A]/10 text-[#A45A3A]">
            {activeFilterCount > 0 ? (
              <FiSearch size={27} />
            ) : (
              <FiTool size={27} />
            )}
          </div>

          <h2 className="mt-5 font-serif text-3xl text-[#2A1810]">
            No enquiries found
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#756157]">
            {activeFilterCount > 0
              ? "No enquiries match the selected search and filters."
              : "New custom-carving enquiries will appear here."}
          </p>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-full bg-[#2A1810] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
            >
              Clear filters
            </button>
          )}
        </section>
      )}

      {/* Pagination */}

      {!enquiriesLoading && totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[1.5rem] border border-[#2A1810]/10 bg-white px-5 py-4 sm:flex-row">
          <p className="text-xs text-[#756157]">
            Page <strong className="text-[#2A1810]">{currentPage}</strong> of{" "}
            <strong className="text-[#2A1810]">{totalPages}</strong>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => updateFilter("page", currentPage - 1)}
              className="flex h-10 items-center gap-2 rounded-full border border-[#2A1810]/10 px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2A1810] transition hover:bg-[#2A1810] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiChevronLeft />
              Previous
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => updateFilter("page", currentPage + 1)}
              className="flex h-10 items-center gap-2 rounded-full border border-[#2A1810]/10 px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2A1810] transition hover:bg-[#2A1810] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminEnquiries;
