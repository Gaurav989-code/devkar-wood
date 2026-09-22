import { env } from "../configs/env.js";

const errorMiddleware = (error, req, res, next) => {
  let statusCode = error.statusCode || error.status || 500;

  let message = error.message || "Internal server error";

  let errors = error.errors || [];

  /*
  |--------------------------------------------------------------------------
  | Invalid MongoDB ObjectId
  |--------------------------------------------------------------------------
  */

  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
  }

  /*
  |--------------------------------------------------------------------------
  | Mongoose validation error
  |--------------------------------------------------------------------------
  */

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";

    errors = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  /*
  |--------------------------------------------------------------------------
  | MongoDB duplicate-field error
  |--------------------------------------------------------------------------
  */

  if (error.code === 11000) {
    statusCode = 409;

    const fields = Object.keys(error.keyValue || {});

    message = `${fields.length ? fields.join(", ") : "Field"} already exists`;
  }

  /*
  |--------------------------------------------------------------------------
  | Invalid JWT
  |--------------------------------------------------------------------------
  */

  if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  /*
  |--------------------------------------------------------------------------
  | Expired JWT
  |--------------------------------------------------------------------------
  */

  if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired";
  }

  /*
  |--------------------------------------------------------------------------
  | Multer upload errors
  |--------------------------------------------------------------------------
  */

  if (error.name === "MulterError") {
    statusCode = 400;

    if (error.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      message = "Each image must be smaller than 5 MB";
    } else if (error.code === "LIMIT_FILE_COUNT") {
      message = "A maximum of 10 images is allowed";
    } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected image field or too many images";
    } else if (error.code === "LIMIT_FIELD_COUNT") {
      message = "Too many form fields were submitted";
    } else if (error.code === "LIMIT_PART_COUNT") {
      message = "Too many form parts were submitted";
    } else {
      message = error.message || "Image upload failed";
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Invalid JSON body
  |--------------------------------------------------------------------------
  */

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    statusCode = 400;
    message = "Invalid JSON request body";
  }

  /*
  |--------------------------------------------------------------------------
  | Request body too large
  |--------------------------------------------------------------------------
  */

  if (error.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large";
  }

  /*
  |--------------------------------------------------------------------------
  | Cloudinary errors
  |--------------------------------------------------------------------------
  */

  if (error.http_code && Number.isInteger(error.http_code)) {
    statusCode =
      error.http_code >= 400 && error.http_code <= 599 ? error.http_code : 500;

    message =
      env.nodeEnv === "development"
        ? error.message
        : "Image service operation failed";
  }

  /*
  |--------------------------------------------------------------------------
  | Log development errors
  |--------------------------------------------------------------------------
  */

  if (env.nodeEnv === "development") {
    console.error(error);
  }

  /*
  |--------------------------------------------------------------------------
  | Prepare final error response
  |--------------------------------------------------------------------------
  */

  const response = {
    success: false,
    message,
  };

  if (Array.isArray(errors) && errors.length > 0) {
    response.errors = errors;
  }

  if (env.nodeEnv === "development" && error.stack) {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};

export default errorMiddleware;
