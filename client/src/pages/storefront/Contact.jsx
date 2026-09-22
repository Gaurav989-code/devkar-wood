import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";
import {
  FiArrowRight,
  FiCheckCircle,
  FiImage,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiSearch,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import { createGuestEnquiry } from "../../services/enquiryService.js";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "Maharashtra",
  carvingType: "",
  description: "",
  preferredWood: "",
  height: "",
  width: "",
  depth: "",
  dimensionUnit: "inch",
  budgetRange: "not-sure",
  requiredBy: "",
  preferredContactMethod: "whatsapp",
  customerNote: "",
};

const inputClass = (hasError) => {
  return `h-13 w-full rounded-xl border bg-[#FFF9EF] px-4 text-sm text-[#2A1810] outline-none transition ${
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-[#2A1810]/15 focus:border-[#A45A3A]"
  }`;
};

const Contact = () => {
  const [formData, setFormData] = useState(initialFormData);

  const [referenceImages, setReferenceImages] = useState([]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);

  const imagesRef = useRef([]);

  useEffect(() => {
    imagesRef.current = referenceImages;
  }, [referenceImages]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    let cleanedValue = value;

    if (name === "phone") {
      cleanedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (["height", "width", "depth"].includes(name)) {
      cleanedValue = value.replace(/[^0-9.]/g, "");
    }

    setFormData((current) => ({
      ...current,
      [name]: cleanedValue,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.name.trim()) {
      validationErrors.name = "Full name is required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      validationErrors.email = "Enter a valid email address";
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      validationErrors.phone = "Enter a valid 10-digit Indian phone number";
    }

    if (!formData.carvingType.trim()) {
      validationErrors.carvingType = "Select a carving type";
    }

    if (formData.description.trim().length < 20) {
      validationErrors.description =
        "Describe your idea using at least 20 characters";
    }

    if (formData.requiredBy) {
      const selectedDate = new Date(`${formData.requiredBy}T00:00:00`);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        validationErrors.requiredBy = "Required date cannot be in the past";
      }
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleImageSelection = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    event.target.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    if (referenceImages.length + selectedFiles.length > MAX_IMAGES) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images`);

      return;
    }

    const validImages = [];

    for (const file of selectedFiles) {
      if (!acceptedImageTypes.includes(file.type)) {
        toast.error(`${file.name} must be JPG, PNG or WebP`);

        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} must be smaller than 5 MB`);

        continue;
      }

      const isDuplicate =
        referenceImages.some(
          (image) =>
            image.file.name === file.name &&
            image.file.size === file.size &&
            image.file.lastModified === file.lastModified,
        ) ||
        validImages.some(
          (image) =>
            image.file.name === file.name &&
            image.file.size === file.size &&
            image.file.lastModified === file.lastModified,
        );

      if (isDuplicate) {
        toast.error(`${file.name} is already selected`);

        continue;
      }

      validImages.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setReferenceImages((current) => [...current, ...validImages]);
  };

  const removeReferenceImage = (imageId) => {
    setReferenceImages((current) => {
      const removedImage = current.find((image) => image.id === imageId);

      if (removedImage) {
        URL.revokeObjectURL(removedImage.preview);
      }

      return current.filter((image) => image.id !== imageId);
    });
  };

  const resetForm = () => {
    referenceImages.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });

    setFormData(initialFormData);
    setReferenceImages([]);
    setErrors({});
    setUploadProgress(0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (!validateForm()) {
      toast.error("Please correct the enquiry form");

      return;
    }

    const requestData = new FormData();

    requestData.append("name", formData.name.trim());

    requestData.append("email", formData.email.trim().toLowerCase());

    requestData.append("phone", formData.phone);

    requestData.append("city", formData.city.trim());

    requestData.append("state", formData.state.trim());

    requestData.append("carvingType", formData.carvingType.trim());

    requestData.append("description", formData.description.trim());

    requestData.append("preferredWood", formData.preferredWood);

    requestData.append("height", formData.height);

    requestData.append("width", formData.width);

    requestData.append("depth", formData.depth);

    requestData.append("dimensionUnit", formData.dimensionUnit);

    requestData.append("budgetRange", formData.budgetRange);

    requestData.append(
      "preferredContactMethod",
      formData.preferredContactMethod,
    );

    requestData.append("customerNote", formData.customerNote.trim());

    if (formData.requiredBy) {
      requestData.append("requiredBy", formData.requiredBy);
    }

    referenceImages.forEach((image) => {
      requestData.append("referenceImages", image.file);
    });

    try {
      setSubmitting(true);
      setUploadProgress(0);

      const response = await createGuestEnquiry(requestData, setUploadProgress);

      const enquiry = response?.data?.enquiry;

      if (!enquiry?.enquiryNumber) {
        throw new Error("Enquiry information was not returned");
      }

      setSubmittedEnquiry(enquiry);

      toast.success("Your custom-carving enquiry was submitted");

      resetForm();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to submit your enquiry",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Success screen
  |--------------------------------------------------------------------------
  */

  if (submittedEnquiry) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#F7F0E5] px-5 py-16">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.94,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full max-w-2xl rounded-[2.5rem] border border-[#2A1810]/10 bg-[#FFF9EF] px-6 py-14 text-center shadow-[0_24px_70px_rgba(42,24,16,0.1)] sm:px-12"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <FiCheckCircle size={36} />
          </div>

          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.22em] text-[#A45A3A]">
            Enquiry received
          </p>

          <h1 className="mt-4 font-serif text-4xl text-[#2A1810] sm:text-5xl">
            Let’s create something meaningful
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#6F5A4E]">
            Thank you,{" "}
            <strong className="text-[#2A1810]">
              {submittedEnquiry.customer?.name}
            </strong>
            . We have received your idea and will contact you using your
            preferred method.
          </p>

          <div className="mt-7 rounded-2xl bg-[#F1E5D3] p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8A642D]">
              Save your enquiry number
            </p>

            <p className="mt-2 break-all font-serif text-2xl font-semibold text-[#2A1810]">
              {submittedEnquiry.enquiryNumber}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link
              to="/track-enquiry"
              state={{
                enquiryNumber: submittedEnquiry.enquiryNumber,

                email: submittedEnquiry.customer?.email || "",

                phone: submittedEnquiry.customer?.phone || "",
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2A1810] px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#A45A3A]"
            >
              <FiSearch />
              Track enquiry
            </Link>

            <button
              type="button"
              onClick={() => setSubmittedEnquiry(null)}
              className="rounded-full border border-[#2A1810]/20 px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A]"
            >
              New enquiry
            </button>

            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#2A1810]/20 px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A]"
            >
              Shop
              <FiArrowRight />
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F0E5]">
      {/* Header */}

      <section className="relative overflow-hidden bg-[#21130E] px-5 py-20 text-[#FFF9EF] sm:px-6 lg:px-10 lg:py-28">
        <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-[#A45A3A]/25 blur-[120px]" />

        <motion.div
          initial={{
            opacity: 0,
            y: 28,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative mx-auto max-w-[1440px]"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D9B477]">
            Made for your space
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.98] sm:text-6xl lg:text-8xl">
            Begin your custom
            <span className="italic text-[#D9B477]"> carving.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-[#D8C9B8] sm:text-base">
            Share your idea, dimensions and reference images. Our team will
            review the details and contact you with the next steps.
          </p>
        </motion.div>
      </section>

      <section className="px-5 py-14 sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1fr_340px] xl:gap-20">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact details */}

            <section className="rounded-[2rem] bg-[#FFF9EF] p-6 sm:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A45A3A]">
                Step 01
              </p>

              <h2 className="mt-2 font-serif text-3xl text-[#2A1810]">
                Your contact details
              </h2>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Full name *
                  </span>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    className={inputClass(errors.name)}
                  />

                  {errors.name && (
                    <span className="mt-1 block text-xs text-red-600">
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
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    className={inputClass(errors.email)}
                  />

                  {errors.email && (
                    <span className="mt-1 block text-xs text-red-600">
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
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass(errors.phone)}
                  />

                  {errors.phone && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.phone}
                    </span>
                  )}
                </label>

                <label>
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    City
                  </span>

                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    autoComplete="address-level2"
                    className={inputClass(false)}
                  />
                </label>
              </div>
            </section>

            {/* Carving details */}

            <section className="rounded-[2rem] bg-[#FFF9EF] p-6 sm:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A45A3A]">
                Step 02
              </p>

              <h2 className="mt-2 font-serif text-3xl text-[#2A1810]">
                Describe your carving
              </h2>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Carving type *
                  </span>

                  <select
                    name="carvingType"
                    value={formData.carvingType}
                    onChange={handleChange}
                    className={inputClass(errors.carvingType)}
                  >
                    <option value="">Select carving type</option>

                    <option value="Wooden sculpture">Wooden sculpture</option>

                    <option value="Wall panel">Wall panel</option>

                    <option value="Temple carving">Temple carving</option>

                    <option value="Wooden frame">Wooden frame</option>

                    <option value="Architectural carving">
                      Architectural carving
                    </option>

                    <option value="Other">Other</option>
                  </select>

                  {errors.carvingType && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.carvingType}
                    </span>
                  )}
                </label>

                <label>
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Preferred wood
                  </span>

                  <select
                    name="preferredWood"
                    value={formData.preferredWood}
                    onChange={handleChange}
                    className={inputClass(false)}
                  >
                    <option value="">Let the artisan suggest</option>

                    <option value="Teak Wood">Teak Wood</option>

                    <option value="Sheesham Wood">Sheesham Wood</option>

                    <option value="Mango Wood">Mango Wood</option>

                    <option value="Walnut Wood">Walnut Wood</option>

                    <option value="Sandalwood">Sandalwood</option>
                  </select>
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Describe your idea *
                  </span>

                  <textarea
                    name="description"
                    rows={6}
                    maxLength={3000}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the subject, style, details and intended placement..."
                    className={`w-full resize-none rounded-xl border bg-[#FFF9EF] p-4 text-sm text-[#2A1810] outline-none transition ${
                      errors.description
                        ? "border-red-500"
                        : "border-[#2A1810]/15 focus:border-[#A45A3A]"
                    }`}
                  />

                  <div className="mt-1 flex justify-between">
                    <span className="text-xs text-red-600">
                      {errors.description || ""}
                    </span>

                    <span className="text-[10px] text-[#8C786A]">
                      {formData.description.length}
                      /3000
                    </span>
                  </div>
                </label>

                <label>
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Budget
                  </span>

                  <select
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleChange}
                    className={inputClass(false)}
                  >
                    <option value="not-sure">Not sure</option>

                    <option value="under-10000">Under ₹10,000</option>

                    <option value="10000-25000">₹10,000 – ₹25,000</option>

                    <option value="25000-50000">₹25,000 – ₹50,000</option>

                    <option value="50000-100000">₹50,000 – ₹1,00,000</option>

                    <option value="above-100000">Above ₹1,00,000</option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Required by
                  </span>

                  <input
                    type="date"
                    name="requiredBy"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.requiredBy}
                    onChange={handleChange}
                    className={inputClass(errors.requiredBy)}
                  />

                  {errors.requiredBy && (
                    <span className="mt-1 block text-xs text-red-600">
                      {errors.requiredBy}
                    </span>
                  )}
                </label>
              </div>

              {/* Dimensions */}

              <div className="mt-7">
                <p className="text-xs font-semibold text-[#5F4A3F]">
                  Approximate dimensions
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {["height", "width", "depth"].map((field) => (
                    <label key={field}>
                      <span className="mb-2 block text-[9px] uppercase tracking-[0.13em] text-[#7A675C]">
                        {field}
                      </span>

                      <input
                        name={field}
                        inputMode="decimal"
                        value={formData[field]}
                        onChange={handleChange}
                        className={inputClass(false)}
                      />
                    </label>
                  ))}

                  <label>
                    <span className="mb-2 block text-[9px] uppercase tracking-[0.13em] text-[#7A675C]">
                      Unit
                    </span>

                    <select
                      name="dimensionUnit"
                      value={formData.dimensionUnit}
                      onChange={handleChange}
                      className={inputClass(false)}
                    >
                      <option value="inch">Inch</option>

                      <option value="cm">CM</option>

                      <option value="feet">Feet</option>
                    </select>
                  </label>
                </div>
              </div>
            </section>

            {/* Reference images */}

            <section className="rounded-[2rem] bg-[#FFF9EF] p-6 sm:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A45A3A]">
                Step 03
              </p>

              <h2 className="mt-2 font-serif text-3xl text-[#2A1810]">
                Reference images
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#6F5A4E]">
                Upload up to five JPG, PNG or WebP images. Each image must be
                smaller than 5 MB.
              </p>

              <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#A45A3A]/40 bg-[#A45A3A]/5 px-5 py-10 text-center transition hover:border-[#A45A3A]">
                <FiUploadCloud size={30} className="text-[#A45A3A]" />

                <span className="mt-3 text-sm font-semibold text-[#2A1810]">
                  Select reference images
                </span>

                <span className="mt-1 text-xs text-[#7A675C]">
                  {referenceImages.length}/{MAX_IMAGES} images selected
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={referenceImages.length >= MAX_IMAGES || submitting}
                  onChange={handleImageSelection}
                  className="hidden"
                />
              </label>

              <AnimatePresence>
                {referenceImages.length > 0 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5"
                  >
                    {referenceImages.map((image) => (
                      <motion.div
                        layout
                        exit={{
                          opacity: 0,
                          scale: 0.85,
                        }}
                        key={image.id}
                        className="relative aspect-square overflow-hidden rounded-xl bg-[#E9DDCC]"
                      >
                        <img
                          src={image.preview}
                          alt="Reference preview"
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeReferenceImage(image.id)}
                          disabled={submitting}
                          aria-label="Remove image"
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#21130E]/80 text-white backdrop-blur-sm"
                        >
                          <FiX />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Contact preference */}

            <section className="rounded-[2rem] bg-[#FFF9EF] p-6 sm:p-8">
              <h2 className="font-serif text-3xl text-[#2A1810]">
                How should we contact you?
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    value: "whatsapp",
                    label: "WhatsApp",
                    icon: FiMessageCircle,
                  },
                  {
                    value: "phone",
                    label: "Phone",
                    icon: FiPhone,
                  },
                  {
                    value: "email",
                    label: "Email",
                    icon: FiMail,
                  },
                ].map((method) => {
                  const Icon = method.icon;

                  const selected =
                    formData.preferredContactMethod === method.value;

                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() =>
                        setFormData((current) => ({
                          ...current,

                          preferredContactMethod: method.value,
                        }))
                      }
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-4 text-sm font-semibold transition ${
                        selected
                          ? "border-[#A45A3A] bg-[#A45A3A] text-white"
                          : "border-[#2A1810]/15 text-[#2A1810] hover:border-[#A45A3A]"
                      }`}
                    >
                      <Icon />
                      {method.label}
                    </button>
                  );
                })}
              </div>

              <textarea
                name="customerNote"
                rows={3}
                maxLength={500}
                value={formData.customerNote}
                onChange={handleChange}
                placeholder="Preferred contact time or other information..."
                className="mt-5 w-full resize-none rounded-xl border border-[#2A1810]/15 bg-[#FFF9EF] p-4 text-sm text-[#2A1810] outline-none focus:border-[#A45A3A]"
              />
            </section>

            {/* Upload progress */}

            {submitting && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#5F4A3F]">
                  <span>Submitting enquiry</span>

                  <span>{uploadProgress}%</span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#DDCEBA]">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${uploadProgress}%`,
                    }}
                    className="h-full rounded-full bg-[#A45A3A]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#2A1810] px-8 text-xs font-bold uppercase tracking-[0.17em] text-white transition hover:bg-[#A45A3A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit enquiry
                  <FiArrowRight />
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-xs text-[#7A675C]">
                Already submitted a custom-carving request?
              </p>

              <Link
                to="/track-enquiry"
                className="mt-3 inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#A45A3A] transition hover:text-[#7D422B]"
              >
                <FiSearch />
                Track an existing enquiry
              </Link>
            </div>
          </form>

          {/* Sidebar */}

          <aside>
            <div className="sticky top-32 rounded-[2rem] bg-[#21130E] p-7 text-[#FFF9EF]">
              <FiImage size={25} className="text-[#D9B477]" />

              <h2 className="mt-5 font-serif text-3xl">What happens next?</h2>

              <ol className="mt-7 space-y-6">
                {[
                  "We review your idea and reference images.",
                  "Our team contacts you to discuss materials and details.",
                  "You receive an estimated price and timeline.",
                  "Work begins after you approve the quotation.",
                ].map((step, index) => (
                  <li
                    key={step}
                    className="flex gap-3 text-sm leading-6 text-[#C8B6A3]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D9B477] text-[10px] font-bold text-[#21130E]">
                      {index + 1}
                    </span>

                    {step}
                  </li>
                ))}
              </ol>

              <div className="mt-8 border-t border-white/15 pt-7">
                <p className="flex items-center gap-3 text-sm text-[#C8B6A3]">
                  <FiMapPin className="text-[#D9B477]" />
                  Sangamner, Maharashtra
                </p>

                <a
                  href="mailto:hello@devkarwood.com"
                  className="mt-4 flex items-center gap-3 text-sm text-[#C8B6A3] transition hover:text-[#D9B477]"
                >
                  <FiMail className="text-[#D9B477]" />
                  hello@devkarwood.com
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Contact;
