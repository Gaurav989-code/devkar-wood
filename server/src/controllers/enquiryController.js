import Enquiry from "../models/Enquiry.js";

import {
  deleteImageFromImageKit,
  uploadEnquiryImageToImageKit,
} from "../services/imagekitService.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phoneRegex = /^[6-9]\d{9}$/;

const allowedBudgetRanges = [
  "",
  "under-10000",
  "10000-25000",
  "25000-50000",
  "50000-100000",
  "above-100000",
  "not-sure",
];

const allowedContactMethods = ["phone", "email", "whatsapp"];

/*
|--------------------------------------------------------------------------
| Safely parse JSON form-data fields
|--------------------------------------------------------------------------
*/

const parseJsonObject = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    return {};
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    throw new ApiError(400, `${fieldName} must be a valid object`);
  }

  try {
    const parsedValue = JSON.parse(value);

    if (
      typeof parsedValue !== "object" ||
      parsedValue === null ||
      Array.isArray(parsedValue)
    ) {
      throw new Error("Invalid object");
    }

    return parsedValue;
  } catch {
    throw new ApiError(400, `${fieldName} must contain valid JSON`);
  }
};

const cleanString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const cleanPhone = (value) => {
  return cleanString(value).replace(/\D/g, "");
};

/*
|--------------------------------------------------------------------------
| Create guest custom-carving enquiry
|--------------------------------------------------------------------------
| POST /api/v1/enquiries
| Public
| Content-Type: multipart/form-data
|--------------------------------------------------------------------------
*/

export const createGuestEnquiry = asyncHandler(async (req, res) => {
  const customerInput = parseJsonObject(req.body.customer, "customer");

  const dimensionsInput = parseJsonObject(
    req.body.approximateDimensions,
    "approximateDimensions",
  );

  /*
      Support both JSON customer data and individual
      form-data fields for easier Postman testing.
    */

  const customer = {
    name: cleanString(customerInput.name || req.body.name),

    email: cleanString(customerInput.email || req.body.email).toLowerCase(),

    phone: cleanPhone(customerInput.phone || req.body.phone),

    city: cleanString(customerInput.city || req.body.city),

    state: cleanString(customerInput.state || req.body.state) || "Maharashtra",
  };

  const carvingType = cleanString(req.body.carvingType);

  const description = cleanString(req.body.description);

  const preferredWood = cleanString(req.body.preferredWood);

  const preferredContactMethod =
    cleanString(req.body.preferredContactMethod) || "whatsapp";

  const budgetRange = cleanString(req.body.budgetRange) || "not-sure";

  const customerNote = cleanString(req.body.customerNote);

  /*
    |--------------------------------------------------------------------------
    | Validate customer information
    |--------------------------------------------------------------------------
    */

  if (!customer.name) {
    throw new ApiError(400, "Customer name is required");
  }

  if (customer.name.length > 100) {
    throw new ApiError(400, "Customer name cannot exceed 100 characters");
  }

  if (!emailRegex.test(customer.email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (!phoneRegex.test(customer.phone)) {
    throw new ApiError(
      400,
      "Please provide a valid 10-digit Indian phone number",
    );
  }

  if (!carvingType) {
    throw new ApiError(400, "Carving type is required");
  }

  if (carvingType.length > 100) {
    throw new ApiError(400, "Carving type cannot exceed 100 characters");
  }

  if (description.length < 20) {
    throw new ApiError(
      400,
      "Please describe your carving idea using at least 20 characters",
    );
  }

  if (description.length > 3000) {
    throw new ApiError(400, "Description cannot exceed 3000 characters");
  }

  if (!allowedBudgetRanges.includes(budgetRange)) {
    throw new ApiError(400, "Invalid budget range");
  }

  if (!allowedContactMethods.includes(preferredContactMethod)) {
    throw new ApiError(400, "Invalid preferred contact method");
  }

  /*
    |--------------------------------------------------------------------------
    | Normalize dimensions
    |--------------------------------------------------------------------------
    */

  const dimensionUnit =
    cleanString(dimensionsInput.unit || req.body.dimensionUnit) || "inch";

  if (!["inch", "cm", "feet"].includes(dimensionUnit)) {
    throw new ApiError(400, "Invalid dimension unit");
  }

  const normalizeDimension = (value, fieldName) => {
    if (value === undefined || value === null || value === "") {
      return 0;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      throw new ApiError(400, `${fieldName} must be a non-negative number`);
    }

    return parsedValue;
  };

  const approximateDimensions = {
    height: normalizeDimension(
      dimensionsInput.height ?? req.body.height,
      "Height",
    ),

    width: normalizeDimension(dimensionsInput.width ?? req.body.width, "Width"),

    depth: normalizeDimension(dimensionsInput.depth ?? req.body.depth, "Depth"),

    unit: dimensionUnit,
  };

  /*
    |--------------------------------------------------------------------------
    | Validate required date
    |--------------------------------------------------------------------------
    */

  let requiredBy = null;

  if (req.body.requiredBy) {
    const parsedRequiredDate = new Date(req.body.requiredBy);

    if (Number.isNaN(parsedRequiredDate.getTime())) {
      throw new ApiError(400, "Please provide a valid required date");
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (parsedRequiredDate < today) {
      throw new ApiError(400, "Required date cannot be in the past");
    }

    requiredBy = parsedRequiredDate;
  }

  /*
    |--------------------------------------------------------------------------
    | Validate reference images
    |--------------------------------------------------------------------------
    */

  const files = Array.isArray(req.files) ? req.files : [];

  if (files.length > 5) {
    throw new ApiError(400, "A maximum of 5 reference images is allowed");
  }

  /*
    |--------------------------------------------------------------------------
    | Generate MongoDB ID before uploading
    |--------------------------------------------------------------------------
    */

  const enquiry = new Enquiry({
    customer,
    carvingType,
    description,
    preferredWood,
    approximateDimensions,
    budgetRange,
    requiredBy,
    preferredContactMethod,
    customerNote,
    source: "website",
    status: "new",

    statusHistory: [
      {
        status: "new",
        message: "Custom carving enquiry submitted",
        changedAt: new Date(),
      },
    ],
  });

  const uploadedImages = [];

  /*
    |--------------------------------------------------------------------------
    | Upload reference images
    |--------------------------------------------------------------------------
    */

  if (files.length > 0) {
    const uploadResults = await Promise.allSettled(
      files.map((file) =>
        uploadEnquiryImageToImageKit(file, enquiry._id.toString()),
      ),
    );

    uploadResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        uploadedImages.push({
          fileId: result.value.fileId,
          url: result.value.url,
          thumbnailUrl: result.value.thumbnailUrl || "",
          name: result.value.name || files[index].originalname,
        });
      }
    });

    const failedUpload = uploadResults.find(
      (result) => result.status === "rejected",
    );

    if (failedUpload) {
      if (uploadedImages.length > 0) {
        await Promise.allSettled(
          uploadedImages.map((image) => deleteImageFromImageKit(image.fileId)),
        );
      }

      throw new ApiError(
        500,
        failedUpload.reason?.message ||
          "One or more reference images could not be uploaded",
      );
    }
  }

  enquiry.referenceImages = uploadedImages;

  /*
    |--------------------------------------------------------------------------
    | Save enquiry
    |--------------------------------------------------------------------------
    */

  try {
    await enquiry.save();
  } catch (error) {
    if (uploadedImages.length > 0) {
      await Promise.allSettled(
        uploadedImages.map((image) => deleteImageFromImageKit(image.fileId)),
      );
    }

    throw error;
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        enquiry: {
          id: enquiry._id,
          enquiryNumber: enquiry.enquiryNumber,
          customer: {
            name: enquiry.customer.name,
            email: enquiry.customer.email,
            phone: enquiry.customer.phone,
          },
          carvingType: enquiry.carvingType,
          status: enquiry.status,
          referenceImages: enquiry.referenceImages,
          createdAt: enquiry.createdAt,
        },
      },
      "Custom carving enquiry submitted successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Track guest enquiry
|--------------------------------------------------------------------------
| POST /api/v1/enquiries/track
| Public
|--------------------------------------------------------------------------
*/

export const trackGuestEnquiry = asyncHandler(async (req, res) => {
  const enquiryNumber = cleanString(req.body.enquiryNumber).toUpperCase();

  const email = cleanString(req.body.email).toLowerCase();

  const phone = cleanPhone(req.body.phone);

  if (!enquiryNumber || !email || !phone) {
    throw new ApiError(
      400,
      "Enquiry number, email and phone number are required",
    );
  }

  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (!phoneRegex.test(phone)) {
    throw new ApiError(
      400,
      "Please provide a valid 10-digit Indian phone number",
    );
  }

  const enquiry = await Enquiry.findOne({
    enquiryNumber,
    "customer.email": email,
    "customer.phone": phone,
  }).select(
    [
      "enquiryNumber",
      "customer.name",
      "carvingType",
      "description",
      "preferredWood",
      "approximateDimensions",
      "budgetRange",
      "requiredBy",
      "referenceImages",
      "preferredContactMethod",
      "status",
      "quotedAmount",
      "statusHistory",
      "createdAt",
      "updatedAt",
    ].join(" "),
  );

  if (!enquiry) {
    throw new ApiError(404, "Enquiry not found. Please check your details");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        enquiry,
      },
      "Enquiry details fetched successfully",
    ),
  );
});
