import Admin from "../models/Admin.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateAdminToken from "../utils/generateAdminToken.js";

import {
  getAdminCookieOptions,
  getAdminClearCookieOptions,
} from "../utils/adminCookieOptions.js";

const prepareAdminResponse = (admin) => {
  return {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    avatar: admin.avatar,
    role: admin.role,
    isActive: admin.isActive,
    lastLoginAt: admin.lastLoginAt,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
};

/*
|--------------------------------------------------------------------------
| Admin login
|--------------------------------------------------------------------------
| POST /api/v1/admin/auth/login
*/

export const loginAdmin = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();

  const password = String(req.body.password || "");

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await Admin.findOne({
    email,
  }).select("+password +passwordChangedAt");

  if (!admin) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await admin.comparePassword(password);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!admin.isActive) {
    throw new ApiError(403, "This administrator account is inactive");
  }

  admin.lastLoginAt = new Date();

  await admin.save({
    validateBeforeSave: false,
  });

  const token = generateAdminToken(admin._id.toString());

  return res
    .status(200)
    .cookie("adminToken", token, getAdminCookieOptions())
    .json(
      new ApiResponse(
        200,
        {
          admin: prepareAdminResponse(admin),
        },
        "Admin logged in successfully",
      ),
    );
});

/*
|--------------------------------------------------------------------------
| Current admin
|--------------------------------------------------------------------------
| GET /api/v1/admin/auth/me
*/

export const getCurrentAdmin = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        admin: prepareAdminResponse(req.admin),
      },
      "Admin profile fetched successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Admin logout
|--------------------------------------------------------------------------
| POST /api/v1/admin/auth/logout
*/

export const logoutAdmin = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("adminToken", getAdminClearCookieOptions())
    .json(new ApiResponse(200, null, "Admin logged out successfully"));
});
