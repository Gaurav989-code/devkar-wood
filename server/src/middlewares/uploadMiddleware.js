import multer from "multer";

import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new ApiError(400, "Only JPG, PNG and WebP images are allowed"),
      false,
    );
  }

  callback(null, true);
};

const createUploader = (limits = {}) => {
  return multer({
    storage,
    fileFilter,

    limits: {
      fileSize: 5 * 1024 * 1024,
      fields: 20,
      ...limits,
    },
  });
};

/*
|--------------------------------------------------------------------------
| Product images
|--------------------------------------------------------------------------
| Field name: images
| Maximum: 10
|--------------------------------------------------------------------------
*/

export const uploadProductImages = createUploader({
  files: 10,
}).array("images", 10);

/*
|--------------------------------------------------------------------------
| Category cover image
|--------------------------------------------------------------------------
| Field name: image
| Maximum: 1
|--------------------------------------------------------------------------
*/

export const uploadCategoryImage = createUploader({
  files: 1,
}).single("image");

/*
|--------------------------------------------------------------------------
| Enquiry reference images
|--------------------------------------------------------------------------
| Field name: referenceImages
| Maximum: 5
|--------------------------------------------------------------------------
*/

export const uploadEnquiryImages = createUploader({
  files: 5,
}).array("referenceImages", 5);
