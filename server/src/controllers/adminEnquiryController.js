import mongoose from "mongoose";

import Enquiry from "../models/Enquiry.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const allowedStatuses = [
  "new",
  "contacted",
  "quoted",
  "accepted",
  "completed",
  "closed",
];

const statusMessages = {
  new: "Enquiry marked as new",
  contacted: "Customer has been contacted",
  quoted: "Quotation has been prepared",
  accepted: "Quotation accepted by customer",
  completed: "Custom carving enquiry completed",
  closed: "Custom carving enquiry closed",
};

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const cleanString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

/*
|--------------------------------------------------------------------------
| Get all enquiries
|--------------------------------------------------------------------------
| GET /api/v1/enquiries/admin/all
| Admin only
|--------------------------------------------------------------------------
*/

export const getAdminEnquiries = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status,
    contactMethod,
    budgetRange,
    sort = "newest",
  } = req.query;

  const pageNumber = Math.max(Number(page) || 1, 1);

  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const skip = (pageNumber - 1) * limitNumber;

  const filter = {};

  if (status && allowedStatuses.includes(status)) {
    filter.status = status;
  }

  if (contactMethod && ["phone", "email", "whatsapp"].includes(contactMethod)) {
    filter.preferredContactMethod = contactMethod;
  }

  if (budgetRange) {
    filter.budgetRange = budgetRange;
  }

  const cleanedSearch = cleanString(search);

  if (cleanedSearch) {
    const safeSearch = escapeRegex(cleanedSearch);

    const searchRegex = new RegExp(safeSearch, "i");

    filter.$or = [
      {
        enquiryNumber: searchRegex,
      },
      {
        "customer.name": searchRegex,
      },
      {
        "customer.email": searchRegex,
      },
      {
        "customer.phone": searchRegex,
      },
      {
        carvingType: searchRegex,
      },
    ];
  }

  const sortOptions = {
    newest: {
      createdAt: -1,
    },

    oldest: {
      createdAt: 1,
    },

    budgetHighToLow: {
      quotedAmount: -1,
    },

    budgetLowToHigh: {
      quotedAmount: 1,
    },

    status: {
      status: 1,
      createdAt: -1,
    },
  };

  const selectedSort = sortOptions[sort] || sortOptions.newest;

  const [enquiries, totalEnquiries] = await Promise.all([
    Enquiry.find(filter)
      .select("+adminNote")
      .sort(selectedSort)
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Enquiry.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalEnquiries / limitNumber);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        enquiries,

        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalEnquiries,
          limit: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPreviousPage: pageNumber > 1,
        },
      },
      "Enquiries fetched successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Get one enquiry
|--------------------------------------------------------------------------
| GET /api/v1/enquiries/admin/:id
| Admin only
|--------------------------------------------------------------------------
*/

export const getAdminEnquiryById = asyncHandler(async (req, res) => {
  const identifier = cleanString(req.params.id);

  let enquiry;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    enquiry = await Enquiry.findById(identifier).select("+adminNote");
  } else {
    enquiry = await Enquiry.findOne({
      enquiryNumber: identifier.toUpperCase(),
    }).select("+adminNote");
  }

  if (!enquiry) {
    throw new ApiError(404, "Enquiry not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        enquiry,
      },
      "Enquiry fetched successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Update enquiry status
|--------------------------------------------------------------------------
| PATCH /api/v1/enquiries/admin/:id/status
| Admin only
|--------------------------------------------------------------------------
*/

export const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const status = cleanString(req.body.status).toLowerCase();

  const customMessage = cleanString(req.body.message);

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid enquiry status");
  }

  const enquiry = await Enquiry.findById(req.params.id).select("+adminNote");

  if (!enquiry) {
    throw new ApiError(404, "Enquiry not found");
  }

  if (enquiry.status === status) {
    throw new ApiError(400, `Enquiry is already ${status}`);
  }

  enquiry.status = status;

  enquiry.statusHistory.push({
    status,

    message: customMessage || statusMessages[status],

    changedBy: req.admin?._id || null,

    changedAt: new Date(),
  });

  await enquiry.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        enquiry,
      },
      `Enquiry status updated to ${status}`,
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Save or update quotation
|--------------------------------------------------------------------------
| PATCH /api/v1/enquiries/admin/:id/quote
| Admin only
|--------------------------------------------------------------------------
*/

export const updateEnquiryQuote = asyncHandler(async (req, res) => {
  const { quotedAmount, message = "" } = req.body;

  const parsedAmount = Number(quotedAmount);

  if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
    throw new ApiError(400, "Quoted amount must be a non-negative number");
  }

  const enquiry = await Enquiry.findById(req.params.id).select("+adminNote");

  if (!enquiry) {
    throw new ApiError(404, "Enquiry not found");
  }

  const statusChanged = enquiry.status !== "quoted";

  enquiry.quotedAmount = parsedAmount;

  enquiry.status = "quoted";

  enquiry.statusHistory.push({
    status: "quoted",

    message:
      cleanString(message) ||
      `Quotation of ₹${parsedAmount.toLocaleString("en-IN")} prepared`,

    changedBy: req.admin?._id || null,

    changedAt: new Date(),
  });

  await enquiry.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        enquiry,
        statusChanged,
      },
      "Enquiry quotation updated successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Update private admin note
|--------------------------------------------------------------------------
| PATCH /api/v1/enquiries/admin/:id/note
| Admin only
|--------------------------------------------------------------------------
*/

export const updateEnquiryAdminNote = asyncHandler(async (req, res) => {
  const adminNote = cleanString(req.body.adminNote);

  if (adminNote.length > 2000) {
    throw new ApiError(400, "Admin note cannot exceed 2000 characters");
  }

  const enquiry = await Enquiry.findById(req.params.id).select("+adminNote");

  if (!enquiry) {
    throw new ApiError(404, "Enquiry not found");
  }

  enquiry.adminNote = adminNote;

  await enquiry.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        enquiry,
      },
      adminNote
        ? "Admin note updated successfully"
        : "Admin note removed successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Update customer contact information
|--------------------------------------------------------------------------
| PATCH /api/v1/enquiries/admin/:id/customer
| Admin only
|--------------------------------------------------------------------------
*/

export const updateEnquiryCustomer = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id).select("+adminNote");

  if (!enquiry) {
    throw new ApiError(404, "Enquiry not found");
  }

  const { name, email, phone, city, state, preferredContactMethod } = req.body;

  if (name !== undefined) {
    const cleanedName = cleanString(name);

    if (!cleanedName) {
      throw new ApiError(400, "Customer name cannot be empty");
    }

    enquiry.customer.name = cleanedName;
  }

  if (email !== undefined) {
    const cleanedEmail = cleanString(email).toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
      throw new ApiError(400, "Please provide a valid email address");
    }

    enquiry.customer.email = cleanedEmail;
  }

  if (phone !== undefined) {
    const cleanedPhone = cleanString(phone).replace(/\D/g, "");

    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      throw new ApiError(
        400,
        "Please provide a valid 10-digit Indian phone number",
      );
    }

    enquiry.customer.phone = cleanedPhone;
  }

  if (city !== undefined) {
    enquiry.customer.city = cleanString(city);
  }

  if (state !== undefined) {
    enquiry.customer.state = cleanString(state);
  }

  if (preferredContactMethod !== undefined) {
    const cleanedContactMethod = cleanString(preferredContactMethod);

    if (!["phone", "email", "whatsapp"].includes(cleanedContactMethod)) {
      throw new ApiError(400, "Invalid preferred contact method");
    }

    enquiry.preferredContactMethod = cleanedContactMethod;
  }

  await enquiry.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        enquiry,
      },
      "Customer information updated successfully",
    ),
  );
});
