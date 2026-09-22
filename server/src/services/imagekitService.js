import { toFile } from "@imagekit/nodejs";

import imagekit from "../configs/imagekit.js";

const sanitizeFileName = (fileName = "wood-carving-image") => {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop().toLowerCase()
    : "jpg";

  const nameWithoutExtension = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${Date.now()}-${
    nameWithoutExtension || "wood-carving-image"
  }.${extension}`;
};

const uploadFileToImageKit = async ({ file, folder, tags }) => {
  if (!file?.buffer) {
    throw new Error("Image buffer is missing");
  }

  const fileName = sanitizeFileName(file.originalname);

  const uploadedImage = await imagekit.files.upload({
    file: await toFile(file.buffer, fileName),

    fileName,
    folder,
    useUniqueFileName: true,
    tags,
  });

  return {
    fileId: uploadedImage.fileId,
    url: uploadedImage.url,
    thumbnailUrl: uploadedImage.thumbnailUrl || "",
    name: uploadedImage.name || fileName,
  };
};

/*
|--------------------------------------------------------------------------
| Upload product image
|--------------------------------------------------------------------------
*/

export const uploadImageToImageKit = async (file, productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  return uploadFileToImageKit({
    file,
    folder: `/devkar-wood/products/${productId}`,
    tags: ["product", String(productId)],
  });
};

/*
|--------------------------------------------------------------------------
| Upload category image
|--------------------------------------------------------------------------
*/

export const uploadCategoryImageToImageKit = async (file, categoryId) => {
  if (!categoryId) {
    throw new Error("Category ID is required");
  }

  return uploadFileToImageKit({
    file,
    folder: `/devkar-wood/categories/${categoryId}`,
    tags: ["category", String(categoryId)],
  });
};

/*
|--------------------------------------------------------------------------
| Upload enquiry reference image
|--------------------------------------------------------------------------
*/

export const uploadEnquiryImageToImageKit = async (file, enquiryId) => {
  if (!enquiryId) {
    throw new Error("Enquiry ID is required");
  }

  return uploadFileToImageKit({
    file,
    folder: `/devkar-wood/enquiries/${enquiryId}`,
    tags: ["enquiry", "reference-image", String(enquiryId)],
  });
};

/*
|--------------------------------------------------------------------------
| Delete an ImageKit image
|--------------------------------------------------------------------------
*/

export const deleteImageFromImageKit = async (fileId) => {
  if (!fileId) {
    throw new Error("ImageKit file ID is required");
  }

  await imagekit.files.delete(fileId);
};
