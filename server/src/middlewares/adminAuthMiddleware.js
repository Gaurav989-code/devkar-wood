import jwt from "jsonwebtoken";

import Admin from "../models/Admin.js";
import { env } from "../configs/env.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protectAdmin = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.adminToken;

  const authorization = req.headers.authorization;

  if (!token && authorization?.startsWith("Bearer ")) {
    token = authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Admin authentication is required");
  }

  const decoded = jwt.verify(token, env.jwtSecret, {
    algorithms: ["HS256"],
    issuer: "devkar-wood-api",
    audience: "devkar-wood-admin",
  });

  const admin = await Admin.findById(decoded.adminId).select(
    "+passwordChangedAt",
  );

  if (!admin) {
    throw new ApiError(401, "The administrator account no longer exists");
  }

  if (!admin.isActive) {
    throw new ApiError(403, "This administrator account is inactive");
  }

  if (admin.changedPasswordAfter(decoded.iat)) {
    throw new ApiError(
      401,
      "Password was recently changed. Please log in again",
    );
  }

  req.admin = admin;

  next();
});
