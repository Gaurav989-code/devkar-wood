import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  FiBox,
  FiCheck,
  FiChevronLeft,
  FiDollarSign,
  FiFileText,
  FiLayers,
  FiPackage,
  FiSave,
  FiTag,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const WOOD_TYPES = [
  "Teak Wood",
  "Sheesham Wood",
  "Mango Wood",
  "Walnut Wood",
  "Sandalwood",
  "Other",
];

const PRODUCT_STATUSES = [
  {
    value: "draft",
    label: "Draft",
    description: "Keep the product hidden while preparing it.",
  },
  {
    value: "active",
    label: "Active",
    description: "Make the product visible in the storefront.",
  },
  {
    value: "archived",
    label: "Archived",
    description: "Remove the product from the active catalogue.",
  },
];

export const emptyProductForm = {
  name: "",
  sku: "",
  category: "",

  shortDescription: "",
  description: "",

  price: "",
  salePrice: "",

  woodType: "",
  finish: "",
  carvingStyle: "",

  dimensions: {
    height: "",
    width: "",
    depth: "",
    unit: "inch",
  },

  stock: "0",
  trackInventory: true,

  status: "draft",

  isFeatured: false,
  isBestseller: false,
  isNewArrival: false,

  careInstructions: [""],
  tags: [],
};

const normalizeInitialValues = (values) => {
  if (!values) {
    return emptyProductForm;
  }

  return {
    ...emptyProductForm,
    ...values,

    category:
      typeof values.category === "object"
        ? values.category?._id || ""
        : values.category || "",

    price:
      values.price === null || values.price === undefined
        ? ""
        : String(values.price),

    salePrice:
      values.salePrice === null || values.salePrice === undefined
        ? ""
        : String(values.salePrice),

    stock:
      values.stock === null || values.stock === undefined
        ? "0"
        : String(values.stock),

    dimensions: {
      ...emptyProductForm.dimensions,
      ...(values.dimensions || {}),

      height:
        values.dimensions?.height === null ||
        values.dimensions?.height === undefined
          ? ""
          : String(values.dimensions.height),

      width:
        values.dimensions?.width === null ||
        values.dimensions?.width === undefined
          ? ""
          : String(values.dimensions.width),

      depth:
        values.dimensions?.depth === null ||
        values.dimensions?.depth === undefined
          ? ""
          : String(values.dimensions.depth),
    },

    careInstructions:
      Array.isArray(values.careInstructions) &&
      values.careInstructions.length > 0
        ? values.careInstructions
        : [""],

    tags: Array.isArray(values.tags) ? values.tags : [],
  };
};

const inputClass = (hasError = false) => {
  return [
    "h-12 w-full rounded-xl border bg-[#FFFCF7] px-4",
    "text-sm text-[#2A1810] outline-none transition",
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-[#2A1810]/12 focus:border-[#A45A3A]",
  ].join(" ");
};

const textareaClass = (hasError = false) => {
  return [
    "w-full resize-none rounded-xl border bg-[#FFFCF7] p-4",
    "text-sm leading-6 text-[#2A1810] outline-none transition",
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-[#2A1810]/12 focus:border-[#A45A3A]",
  ].join(" ");
};

const FieldError = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <span className="mt-1.5 block text-xs font-medium text-red-600">
      {message}
    </span>
  );
};

const SectionHeading = ({ icon: Icon, step, title, description }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#A45A3A]/10 text-[#A45A3A]">
        <Icon />
      </div>

      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A45A3A]">
          Step {step}
        </p>

        <h2 className="mt-1 font-serif text-2xl text-[#2A1810] sm:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-[#756157]">{description}</p>
        )}
      </div>
    </div>
  );
};

const AdminProductForm = ({
  initialValues = emptyProductForm,
  categories = [],
  categoriesLoading = false,
  submitting = false,
  submitLabel = "Save product",
  heading = "Product details",
  description = "Enter the product information shown in the storefront.",
  onSubmit,
}) => {
  const normalizedValues = useMemo(
    () => normalizeInitialValues(initialValues),
    [initialValues],
  );

  const [formData, setFormData] = useState(normalizedValues);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setFormData(normalizedValues);
    setErrors({});
    setTagInput("");
  }, [normalizedValues]);

  /*
  |--------------------------------------------------------------------------
  | Basic field changes
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    let cleanedValue = type === "checkbox" ? checked : value;

    if (["price", "salePrice", "stock"].includes(name)) {
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

  const handleDimensionChange = (event) => {
    const { name, value } = event.target;

    const cleanedValue =
      name === "unit" ? value : value.replace(/[^0-9.]/g, "");

    setFormData((current) => ({
      ...current,

      dimensions: {
        ...current.dimensions,
        [name]: cleanedValue,
      },
    }));

    setErrors((current) => ({
      ...current,
      [`dimensions.${name}`]: "",
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Care instructions
  |--------------------------------------------------------------------------
  */

  const updateCareInstruction = (index, value) => {
    setFormData((current) => ({
      ...current,

      careInstructions: current.careInstructions.map(
        (instruction, instructionIndex) =>
          instructionIndex === index ? value : instruction,
      ),
    }));
  };

  const addCareInstruction = () => {
    setFormData((current) => ({
      ...current,
      careInstructions: [...current.careInstructions, ""],
    }));
  };

  const removeCareInstruction = (index) => {
    setFormData((current) => {
      const updatedInstructions = current.careInstructions.filter(
        (_, instructionIndex) => instructionIndex !== index,
      );

      return {
        ...current,
        careInstructions:
          updatedInstructions.length > 0 ? updatedInstructions : [""],
      };
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Tags
  |--------------------------------------------------------------------------
  */

  const addTag = () => {
    const normalizedTag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");

    if (!normalizedTag) {
      return;
    }

    if (formData.tags.includes(normalizedTag)) {
      setTagInput("");
      return;
    }

    if (formData.tags.length >= 15) {
      setErrors((current) => ({
        ...current,
        tags: "A product can have a maximum of 15 tags",
      }));

      return;
    }

    setFormData((current) => ({
      ...current,
      tags: [...current.tags, normalizedTag],
    }));

    setTagInput("");

    setErrors((current) => ({
      ...current,
      tags: "",
    }));
  };

  const handleTagKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.name.trim()) {
      validationErrors.name = "Product name is required";
    } else if (formData.name.trim().length < 2) {
      validationErrors.name = "Product name must contain at least 2 characters";
    }

    if (!formData.sku.trim()) {
      validationErrors.sku = "SKU is required";
    }

    if (!formData.category) {
      validationErrors.category = "Please select a category";
    }

    if (!formData.shortDescription.trim()) {
      validationErrors.shortDescription = "Short description is required";
    }

    if (!formData.description.trim()) {
      validationErrors.description = "Product description is required";
    }

    const price = Number(formData.price);

    if (!formData.price || !Number.isFinite(price) || price <= 0) {
      validationErrors.price = "Enter a valid product price";
    }

    if (formData.salePrice !== "") {
      const salePrice = Number(formData.salePrice);

      if (!Number.isFinite(salePrice) || salePrice < 0) {
        validationErrors.salePrice = "Enter a valid sale price";
      } else if (salePrice >= price) {
        validationErrors.salePrice =
          "Sale price must be lower than the regular price";
      }
    }

    if (!formData.woodType.trim()) {
      validationErrors.woodType = "Wood type is required";
    }

    if (!formData.finish.trim()) {
      validationErrors.finish = "Finish is required";
    }

    if (formData.trackInventory) {
      const stock = Number(formData.stock);

      if (formData.stock === "" || !Number.isInteger(stock) || stock < 0) {
        validationErrors.stock = "Stock must be a non-negative whole number";
      }
    }

    for (const field of ["height", "width", "depth"]) {
      const value = formData.dimensions[field];

      if (value !== "") {
        const parsedValue = Number(value);

        if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
          validationErrors[`dimensions.${field}`] = `Enter a valid ${field}`;
        }
      }
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  /*
  |--------------------------------------------------------------------------
  | Prepare backend payload
  |--------------------------------------------------------------------------
  */

  const buildPayload = () => {
    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      category: formData.category,

      shortDescription: formData.shortDescription.trim(),
      description: formData.description.trim(),

      price: Number(formData.price),

      salePrice: formData.salePrice === "" ? null : Number(formData.salePrice),

      woodType: formData.woodType.trim(),
      finish: formData.finish.trim(),

      carvingStyle: formData.carvingStyle.trim(),

      dimensions: {
        unit: formData.dimensions.unit,
      },

      trackInventory: Boolean(formData.trackInventory),

      stock: formData.trackInventory ? Number(formData.stock) : 0,

      status: formData.status,

      isFeatured: Boolean(formData.isFeatured),
      isBestseller: Boolean(formData.isBestseller),
      isNewArrival: Boolean(formData.isNewArrival),

      careInstructions: formData.careInstructions
        .map((instruction) => instruction.trim())
        .filter(Boolean),

      tags: formData.tags,
    };

    for (const field of ["height", "width", "depth"]) {
      if (formData.dimensions[field] !== "") {
        payload.dimensions[field] = Number(formData.dimensions[field]);
      }
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting || !validateForm()) {
      return;
    }

    await onSubmit(buildPayload());
  };

  return (
    <form onSubmit={handleSubmit} className="p-2">
      {/* Page heading */}

      <div className="flex flex-col gap-5 border-b border-[#2A1810]/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#A45A3A] transition hover:text-[#7D422B]"
          >
            <FiChevronLeft />
            Back to products
          </Link>

          <h1 className="mt-4 font-serif text-4xl text-[#2A1810] sm:text-5xl">
            {heading}
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#756157]">{description}</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="hidden h-12 items-center justify-center gap-2 rounded-full bg-[#2A1810] px-7 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:bg-[#A45A3A] disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </>
          ) : (
            <>
              <FiSave />
              {submitLabel}
            </>
          )}
        </button>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {/* Basic information */}

          <motion.section
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 shadow-[0_16px_45px_rgba(42,24,16,0.04)] sm:p-8"
          >
            <SectionHeading
              icon={FiFileText}
              step="01"
              title="Basic information"
              description="Add the primary catalogue details for this product."
            />

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Product name *
                </span>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={120}
                  placeholder="Example: Hand-Carved Krishna Sculpture"
                  className={inputClass(errors.name)}
                />

                <FieldError message={errors.name} />
              </label>

              <label>
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  SKU *
                </span>

                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  maxLength={50}
                  placeholder="DWC-SCULPTURE-001"
                  className={inputClass(errors.sku)}
                />

                <FieldError message={errors.sku} />
              </label>

              <label>
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Category *
                </span>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={categoriesLoading}
                  className={inputClass(errors.category)}
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <FieldError message={errors.category} />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Short description *
                </span>

                <textarea
                  name="shortDescription"
                  rows={3}
                  maxLength={300}
                  value={formData.shortDescription}
                  onChange={handleChange}
                  placeholder="A concise description displayed on product cards and near the title."
                  className={textareaClass(errors.shortDescription)}
                />

                <div className="mt-1.5 flex justify-between gap-4">
                  <FieldError message={errors.shortDescription} />

                  <span className="ml-auto text-[10px] text-[#8A7569]">
                    {formData.shortDescription.length}/300
                  </span>
                </div>
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Full description *
                </span>

                <textarea
                  name="description"
                  rows={8}
                  maxLength={5000}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the carving, inspiration, craftsmanship and ideal placement..."
                  className={textareaClass(errors.description)}
                />

                <div className="mt-1.5 flex justify-between gap-4">
                  <FieldError message={errors.description} />

                  <span className="ml-auto text-[10px] text-[#8A7569]">
                    {formData.description.length}/5000
                  </span>
                </div>
              </label>
            </div>
          </motion.section>

          {/* Pricing */}

          <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 shadow-[0_16px_45px_rgba(42,24,16,0.04)] sm:p-8">
            <SectionHeading
              icon={FiDollarSign}
              step="02"
              title="Pricing and inventory"
              description="Configure the selling price and available stock."
            />

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Regular price *
                </span>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#8A7569]">
                    ₹
                  </span>

                  <input
                    type="text"
                    name="price"
                    inputMode="decimal"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    className={`${inputClass(errors.price)} pl-8`}
                  />
                </div>

                <FieldError message={errors.price} />
              </label>

              <label>
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Sale price
                </span>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#8A7569]">
                    ₹
                  </span>

                  <input
                    type="text"
                    name="salePrice"
                    inputMode="decimal"
                    value={formData.salePrice}
                    onChange={handleChange}
                    placeholder="Optional"
                    className={`${inputClass(errors.salePrice)} pl-8`}
                  />
                </div>

                <FieldError message={errors.salePrice} />
              </label>

              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#2A1810]/10 bg-[#FAF6EF] p-4">
                  <input
                    type="checkbox"
                    name="trackInventory"
                    checked={formData.trackInventory}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 accent-[#A45A3A]"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-[#2A1810]">
                      Track inventory
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-[#756157]">
                      Automatically prevent orders when this product runs out of
                      stock.
                    </span>
                  </span>
                </label>
              </div>

              {formData.trackInventory && (
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                    Available stock *
                  </span>

                  <input
                    type="text"
                    name="stock"
                    inputMode="numeric"
                    value={formData.stock}
                    onChange={handleChange}
                    className={inputClass(errors.stock)}
                  />

                  <FieldError message={errors.stock} />
                </label>
              )}
            </div>
          </section>

          {/* Craftsmanship */}

          <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 shadow-[0_16px_45px_rgba(42,24,16,0.04)] sm:p-8">
            <SectionHeading
              icon={FiLayers}
              step="03"
              title="Craftsmanship details"
              description="Describe the material, finish, style and dimensions."
            />

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Wood type *
                </span>

                <select
                  name="woodType"
                  value={formData.woodType}
                  onChange={handleChange}
                  className={inputClass(errors.woodType)}
                >
                  <option value="">Select wood type</option>

                  {WOOD_TYPES.map((woodType) => (
                    <option key={woodType} value={woodType}>
                      {woodType}
                    </option>
                  ))}
                </select>

                <FieldError message={errors.woodType} />
              </label>

              <label>
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Finish *
                </span>

                <input
                  type="text"
                  name="finish"
                  value={formData.finish}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Natural matte finish"
                  className={inputClass(errors.finish)}
                />

                <FieldError message={errors.finish} />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-xs font-semibold text-[#5F4A3F]">
                  Carving style
                </span>

                <input
                  type="text"
                  name="carvingStyle"
                  value={formData.carvingStyle}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Traditional Indian, floral, temple style..."
                  className={inputClass(false)}
                />
              </label>
            </div>

            <div className="mt-7 border-t border-[#2A1810]/10 pt-7">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2A1810]">
                Dimensions
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {["height", "width", "depth"].map((field) => (
                  <label key={field}>
                    <span className="mb-2 block text-[10px] font-semibold capitalize text-[#756157]">
                      {field}
                    </span>

                    <input
                      type="text"
                      name={field}
                      inputMode="decimal"
                      value={formData.dimensions[field]}
                      onChange={handleDimensionChange}
                      placeholder="0"
                      className={inputClass(errors[`dimensions.${field}`])}
                    />

                    <FieldError message={errors[`dimensions.${field}`]} />
                  </label>
                ))}

                <label>
                  <span className="mb-2 block text-[10px] font-semibold text-[#756157]">
                    Unit
                  </span>

                  <select
                    name="unit"
                    value={formData.dimensions.unit}
                    onChange={handleDimensionChange}
                    className={inputClass(false)}
                  >
                    <option value="inch">Inch</option>
                    <option value="cm">Centimetre</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          {/* Care instructions */}

          <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 shadow-[0_16px_45px_rgba(42,24,16,0.04)] sm:p-8">
            <SectionHeading
              icon={FiCheck}
              step="04"
              title="Care instructions"
              description="Help customers preserve the carving properly."
            />

            <div className="mt-7 space-y-3">
              {formData.careInstructions.map((instruction, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A45A3A]/10 text-[10px] font-bold text-[#A45A3A]">
                    {index + 1}
                  </span>

                  <input
                    type="text"
                    value={instruction}
                    onChange={(event) =>
                      updateCareInstruction(index, event.target.value)
                    }
                    maxLength={250}
                    placeholder="Keep away from direct moisture"
                    className={inputClass(false)}
                  />

                  <button
                    type="button"
                    onClick={() => removeCareInstruction(index)}
                    aria-label={`Remove care instruction ${index + 1}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg text-[#8A7569] transition hover:bg-red-50 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCareInstruction}
              className="mt-4 rounded-full border border-[#2A1810]/15 px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#2A1810] transition hover:border-[#A45A3A] hover:text-[#A45A3A]"
            >
              Add instruction
            </button>
          </section>

          {/* Tags */}

          <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 shadow-[0_16px_45px_rgba(42,24,16,0.04)] sm:p-8">
            <SectionHeading
              icon={FiTag}
              step="05"
              title="Search tags"
              description="Tags help with product discovery and organisation."
            />

            <div className="mt-7 flex gap-3">
              <input
                type="text"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagKeyDown}
                maxLength={40}
                placeholder="Example: temple-carving"
                className={inputClass(errors.tags)}
              />

              <button
                type="button"
                onClick={addTag}
                className="shrink-0 rounded-xl bg-[#2A1810] px-5 text-[10px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#A45A3A]"
              >
                Add
              </button>
            </div>

            <FieldError message={errors.tags} />

            {formData.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full bg-[#A45A3A]/10 px-3 py-2 text-[10px] font-semibold text-[#A45A3A] transition hover:bg-[#A45A3A] hover:text-white"
                  >
                    #{tag} ×
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}

        <aside className="space-y-6">
          <section className="rounded-[1.75rem] border border-[#2A1810]/10 bg-white p-6 shadow-[0_16px_45px_rgba(42,24,16,0.04)] xl:sticky xl:top-28">
            <div className="flex items-center gap-3">
              <FiPackage className="text-[#A45A3A]" />

              <h2 className="font-serif text-2xl text-[#2A1810]">Publishing</h2>
            </div>

            <div className="mt-6 space-y-3">
              {PRODUCT_STATUSES.map((status) => {
                const selected = formData.status === status.value;

                return (
                  <label
                    key={status.value}
                    className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${
                      selected
                        ? "border-[#A45A3A] bg-[#A45A3A]/5"
                        : "border-[#2A1810]/10 hover:border-[#A45A3A]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={selected}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-[#A45A3A]"
                    />

                    <span>
                      <span className="block text-sm font-semibold text-[#2A1810]">
                        {status.label}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#756157]">
                        {status.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-7 border-t border-[#2A1810]/10 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#2A1810]">
                Product labels
              </h3>

              <div className="mt-4 space-y-3">
                {[
                  {
                    name: "isFeatured",
                    label: "Featured product",
                  },
                  {
                    name: "isBestseller",
                    label: "Bestseller",
                  },
                  {
                    name: "isNewArrival",
                    label: "New arrival",
                  },
                ].map((option) => (
                  <label
                    key={option.name}
                    className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-[#FAF6EF] px-4 py-3"
                  >
                    <span className="text-sm font-medium text-[#5F4A3F]">
                      {option.label}
                    </span>

                    <input
                      type="checkbox"
                      name={option.name}
                      checked={formData[option.name]}
                      onChange={handleChange}
                      className="h-4 w-4 accent-[#A45A3A]"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-7 rounded-2xl bg-[#F4ECE0] p-4">
              <div className="flex gap-3">
                <FiBox className="mt-0.5 shrink-0 text-[#A45A3A]" />

                <p className="text-xs leading-5 text-[#756157]">
                  Product images can be uploaded after the product has been
                  created.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2A1810] px-6 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#A45A3A] disabled:cursor-not-allowed disabled:opacity-60 sm:hidden xl:flex"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave />
                  {submitLabel}
                </>
              )}
            </button>
          </section>
        </aside>
      </div>

      <div className="mt-8 flex justify-end border-t border-[#2A1810]/10 pt-7 xl:hidden">
        <button
          type="submit"
          disabled={submitting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2A1810] px-7 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#A45A3A] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </>
          ) : (
            <>
              <FiSave />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AdminProductForm;
