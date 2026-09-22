import Category from "../models/Category.js";

import {
  deleteImageFromImageKit,
  uploadCategoryImageToImageKit,
} from "../services/imagekitService.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/*
|--------------------------------------------------------------------------
| Upload or replace category image
|--------------------------------------------------------------------------
| POST /api/v1/categories/:id/image
| Admin only
|--------------------------------------------------------------------------
*/

export const uploadCategoryCoverImage = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (!req.file) {
    throw new ApiError(400, "Please select a category image");
  }

  const altText =
    typeof req.body.altText === "string" && req.body.altText.trim()
      ? req.body.altText.trim()
      : category.name;

  const oldFileId = category.image?.fileId || "";

  const uploaded = await uploadCategoryImageToImageKit(
    req.file,
    category._id.toString(),
  );

  try {
    category.image = {
      fileId: uploaded.fileId,
      url: uploaded.url,
      thumbnailUrl: uploaded.thumbnailUrl || "",
      altText,
    };

    await category.save();
  } catch (error) {
    await Promise.allSettled([deleteImageFromImageKit(uploaded.fileId)]);

    throw error;
  }

  /*
      The new image is saved first. Only then is the
      previous ImageKit file removed.
    */

  if (oldFileId && oldFileId !== uploaded.fileId) {
    try {
      await deleteImageFromImageKit(oldFileId);
    } catch (error) {
      console.error(
        `Unable to delete old category image ${oldFileId}:`,
        error.message,
      );
    }
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        category,
        image: category.image,
      },
      oldFileId
        ? "Category image replaced successfully"
        : "Category image uploaded successfully",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| Remove category image
|--------------------------------------------------------------------------
| DELETE /api/v1/categories/:id/image
| Admin only
|--------------------------------------------------------------------------
*/

export const removeCategoryCoverImage = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const fileId = category.image?.fileId || "";

  if (!fileId) {
    throw new ApiError(404, "Category image not found");
  }

  /*
      Clear MongoDB first so the storefront stops
      referencing the image immediately.
    */

  category.image = {
    fileId: "",
    url: "",
    thumbnailUrl: "",
    altText: "",
  };

  await category.save();

  try {
    await deleteImageFromImageKit(fileId);
  } catch (error) {
    console.error(
      `Unable to delete category image ${fileId} from ImageKit:`,
      error.message,
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        category,
        image: category.image,
      },
      "Category image removed successfully",
    ),
  );
});
