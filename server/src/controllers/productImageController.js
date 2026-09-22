import Product from "../models/Product.js";

import {
  deleteImageFromImageKit,
  uploadImageToImageKit,
} from "../services/imagekitService.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

/*
|--------------------------------------------------------------------------
| Add product images
|--------------------------------------------------------------------------
| POST /api/v1/products/:id/images
| Admin only
*/

export const addProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "Please select at least one image");
  }

  const currentImageCount = product.images.length;
  const newImageCount = req.files.length;

  if (currentImageCount + newImageCount > 10) {
    throw new ApiError(
      400,
      `A product can have a maximum of 10 images. You can upload only ${
        10 - currentImageCount
      } more image(s)`,
    );
  }

  const uploadedImages = [];

  try {
    for (const file of req.files) {
      const uploaded = await uploadImageToImageKit(
        file,
        product._id.toString(),
      );

      uploadedImages.push({
        fileId: uploaded.fileId,
        url: uploaded.url,
        thumbnailUrl: uploaded.thumbnailUrl,
        altText: product.name,
        isPrimary: false,
      });
    }

    const hasPrimaryImage = product.images.some((image) => image.isPrimary);

    if (!hasPrimaryImage && uploadedImages.length > 0) {
      uploadedImages[0].isPrimary = true;
    }

    product.images.push(...uploadedImages);

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product images uploaded successfully",
      data: {
        images: product.images,
      },
    });
  } catch (error) {
    // Remove images from ImageKit if MongoDB saving fails.
    if (uploadedImages.length > 0) {
      await Promise.allSettled(
        uploadedImages.map((image) => deleteImageFromImageKit(image.fileId)),
      );
    }

    throw error;
  }
});

/*
|--------------------------------------------------------------------------
| Set primary product image
|--------------------------------------------------------------------------
| PATCH /api/v1/products/:id/images/primary
| Body: { "fileId": "imagekit_file_id" }
*/

export const setPrimaryProductImage = asyncHandler(async (req, res) => {
  const { fileId } = req.body;

  if (!fileId) {
    throw new ApiError(400, "Image fileId is required");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const imageExists = product.images.some((image) => image.fileId === fileId);

  if (!imageExists) {
    throw new ApiError(404, "Product image not found");
  }

  product.images.forEach((image) => {
    image.isPrimary = image.fileId === fileId;
  });

  await product.save();

  res.status(200).json({
    success: true,
    message: "Primary image updated successfully",
    data: {
      images: product.images,
    },
  });
});

/*
|--------------------------------------------------------------------------
| Remove product image
|--------------------------------------------------------------------------
| DELETE /api/v1/products/:id/images
| Body: { "fileId": "imagekit_file_id" }
*/

export const removeProductImage = asyncHandler(async (req, res) => {
  const { fileId } = req.body;

  if (!fileId) {
    throw new ApiError(400, "Image fileId is required");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const imageIndex = product.images.findIndex(
    (image) => image.fileId === fileId,
  );

  if (imageIndex === -1) {
    throw new ApiError(404, "Product image not found");
  }

  const removedImageWasPrimary = product.images[imageIndex].isPrimary;

  // Delete the actual file from ImageKit.
  await deleteImageFromImageKit(fileId);

  // Delete its information from MongoDB.
  product.images.splice(imageIndex, 1);

  // Assign another primary image when required.
  if (removedImageWasPrimary && product.images.length > 0) {
    product.images[0].isPrimary = true;
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product image removed successfully",
    data: {
      images: product.images,
    },
  });
});
