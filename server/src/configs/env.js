import dotenv from "dotenv";

dotenv.config();

/*
|--------------------------------------------------------------------------
| Environment helpers
|--------------------------------------------------------------------------
*/

const normalizeText = (value) => {
  return String(value || "").trim();
};

const normalizeUrl = (value) => {
  return normalizeText(value).replace(/\/+$/, "");
};

const parsePositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

const parseNonNegativeInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    return fallback;
  }

  return parsedValue;
};

const parseClientUrls = (value) => {
  return normalizeText(value)
    .split(",")
    .map((url) => normalizeUrl(url))
    .filter(Boolean);
};

const parseSameSite = (value, fallback) => {
  const normalizedValue = normalizeText(value).toLowerCase();

  if (["lax", "strict", "none"].includes(normalizedValue)) {
    return normalizedValue;
  }

  return fallback;
};

/*
|--------------------------------------------------------------------------
| Required variables
|--------------------------------------------------------------------------
*/

const REQUIRED_ENV_VARS = [
  "MONGODB_URL",
  "JWT_SECRET",
  "CLIENT_URL",

  "EMAIL",
  "EMAIL_PASSWORD",

  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_URL_ENDPOINT",

  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
];

const missingVars = REQUIRED_ENV_VARS.filter((key) => {
  return !normalizeText(process.env[key]);
});

if (missingVars.length > 0) {
  console.error(
    "❌ Configuration error: Required environment variables are missing.",
  );

  console.error(`Missing variables: ${missingVars.join(", ")}`);

  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| Validate environment name
|--------------------------------------------------------------------------
*/

const nodeEnv = normalizeText(process.env.NODE_ENV) || "development";

const allowedNodeEnvironments = ["development", "test", "production"];

if (!allowedNodeEnvironments.includes(nodeEnv)) {
  console.error(
    `❌ NODE_ENV must be one of: ${allowedNodeEnvironments.join(", ")}`,
  );

  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| Client URLs
|--------------------------------------------------------------------------
| Multiple URLs may be provided as a comma-separated list.
|--------------------------------------------------------------------------
*/

const clientUrls = parseClientUrls(process.env.CLIENT_URL);

if (clientUrls.length === 0) {
  console.error("❌ CLIENT_URL must contain at least one valid URL");

  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| Authentication configuration
|--------------------------------------------------------------------------
*/

const jwtSecret = normalizeText(process.env.JWT_SECRET);

const adminCookieSameSite = parseSameSite(
  process.env.ADMIN_COOKIE_SAME_SITE,
  nodeEnv === "production" ? "none" : "lax",
);

const adminCookieDomain = normalizeText(process.env.ADMIN_COOKIE_DOMAIN);

/*
|--------------------------------------------------------------------------
| Production validation
|--------------------------------------------------------------------------
*/

if (nodeEnv === "production" && jwtSecret.length < 32) {
  console.error(
    "❌ JWT_SECRET must contain at least 32 characters in production",
  );

  process.exit(1);
}

if (
  nodeEnv === "production" &&
  clientUrls.some((url) => !url.startsWith("https://"))
) {
  console.error("❌ Every production CLIENT_URL must use HTTPS");

  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| Development warnings
|--------------------------------------------------------------------------
*/

if (nodeEnv !== "production" && adminCookieSameSite === "none") {
  console.warn(
    "⚠️ ADMIN_COOKIE_SAME_SITE=none normally requires HTTPS. Use lax for local development.",
  );
}

/*
|--------------------------------------------------------------------------
| Environment configuration
|--------------------------------------------------------------------------
*/

export const env = {
  /*
  |--------------------------------------------------------------------------
  | Application
  |--------------------------------------------------------------------------
  */

  nodeEnv,

  isProduction: nodeEnv === "production",

  port: parsePositiveInteger(process.env.PORT, 5000),

  clientUrl: clientUrls[0],

  clientUrls,

  requestBodyLimit: normalizeText(process.env.REQUEST_BODY_LIMIT) || "1mb",

  trustProxy: parseNonNegativeInteger(
    process.env.TRUST_PROXY,
    nodeEnv === "production" ? 1 : 0,
  ),

  shutdownTimeoutMs: parsePositiveInteger(
    process.env.SHUTDOWN_TIMEOUT_MS,
    10_000,
  ),

  /*
  |--------------------------------------------------------------------------
  | Database
  |--------------------------------------------------------------------------
  */

  mongodbUrl: normalizeText(process.env.MONGODB_URL),

  /*
  |--------------------------------------------------------------------------
  | Admin authentication
  |--------------------------------------------------------------------------
  */

  jwtSecret,

  jwtExpire: normalizeText(process.env.JWT_EXPIRE) || "7d",

  jwtCookieExpire: parsePositiveInteger(process.env.JWT_COOKIE_EXPIRE, 7),

  adminCookieSameSite,

  adminCookieDomain,

  /*
  |--------------------------------------------------------------------------
  | Email
  |--------------------------------------------------------------------------
  */

  email: normalizeText(process.env.EMAIL),

  emailPassword: normalizeText(process.env.EMAIL_PASSWORD),

  emailFromName:
    normalizeText(process.env.EMAIL_FROM_NAME) || "Devkar Wood Carvings",

  /*
  |--------------------------------------------------------------------------
  | ImageKit
  |--------------------------------------------------------------------------
  */

  imagekitPrivateKey: normalizeText(process.env.IMAGEKIT_PRIVATE_KEY),

  imagekitUrlEndpoint: normalizeUrl(process.env.IMAGEKIT_URL_ENDPOINT),

  /*
  |--------------------------------------------------------------------------
  | Razorpay
  |--------------------------------------------------------------------------
  */

  razorpayKeyId: normalizeText(process.env.RAZORPAY_KEY_ID),

  razorpayKeySecret: normalizeText(process.env.RAZORPAY_KEY_SECRET),

  razorpayWebhookSecret: normalizeText(process.env.RAZORPAY_WEBHOOK_SECRET),

  /*
  |--------------------------------------------------------------------------
  | Rate limits
  |--------------------------------------------------------------------------
  */

  apiRateLimitWindowMs: parsePositiveInteger(
    process.env.API_RATE_LIMIT_WINDOW_MS,
    15 * 60 * 1000,
  ),

  apiRateLimitMax: parsePositiveInteger(process.env.API_RATE_LIMIT_MAX, 300),

  authRateLimitWindowMs: parsePositiveInteger(
    process.env.AUTH_RATE_LIMIT_WINDOW_MS,
    15 * 60 * 1000,
  ),

  authRateLimitMax: parsePositiveInteger(process.env.AUTH_RATE_LIMIT_MAX, 10),

  orderRateLimitWindowMs: parsePositiveInteger(
    process.env.ORDER_RATE_LIMIT_WINDOW_MS,
    15 * 60 * 1000,
  ),

  orderRateLimitMax: parsePositiveInteger(process.env.ORDER_RATE_LIMIT_MAX, 60),

  enquiryRateLimitWindowMs: parsePositiveInteger(
    process.env.ENQUIRY_RATE_LIMIT_WINDOW_MS,
    15 * 60 * 1000,
  ),

  enquiryRateLimitMax: parsePositiveInteger(
    process.env.ENQUIRY_RATE_LIMIT_MAX,
    30,
  ),
};

console.log(
  `✅ Environment variables loaded successfully in ${env.nodeEnv} mode.`,
);
