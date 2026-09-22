import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";

import { env } from "./configs/env.js";

import ApiResponse from "./utils/ApiResponse.js";

import notFoundMiddleware from "./middlewares/notFoundMiddleware.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Proxy and application security
|--------------------------------------------------------------------------
*/

app.disable("x-powered-by");

if (env.trustProxy > 0) {
  app.set("trust proxy", env.trustProxy);
}

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

app.use(compression());

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server requests, Postman and similar clients.
    if (!origin) {
      return callback(null, true);
    }

    if (env.clientUrls.includes(origin)) {
      return callback(null, true);
    }

    const corsError = new Error("This origin is not allowed by CORS");

    corsError.statusCode = 403;

    return callback(corsError);
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Request parsers
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: env.requestBodyLimit,
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: env.requestBodyLimit,
  }),
);

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Request logging
|--------------------------------------------------------------------------
*/

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

/*
|--------------------------------------------------------------------------
| Rate limiting
|--------------------------------------------------------------------------
*/

const createRateLimitHandler = (message) => {
  return (req, res) => {
    return res.status(429).json(new ApiResponse(429, null, message));
  };
};

const apiLimiter = rateLimit({
  windowMs: env.apiRateLimitWindowMs,

  limit: env.apiRateLimitMax,

  standardHeaders: true,

  legacyHeaders: false,

  skip: (req) => req.method === "OPTIONS",

  handler: createRateLimitHandler("Too many requests. Please try again later"),
});

const adminAuthLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMs,

  limit: env.authRateLimitMax,

  standardHeaders: true,

  legacyHeaders: false,

  skipSuccessfulRequests: false,

  skip: (req) => req.method === "OPTIONS",

  handler: createRateLimitHandler(
    "Too many authentication attempts. Please try again later",
  ),
});

const orderLimiter = rateLimit({
  windowMs: env.orderRateLimitWindowMs,

  limit: env.orderRateLimitMax,

  standardHeaders: true,

  legacyHeaders: false,

  skip: (req) => req.method === "OPTIONS",

  handler: createRateLimitHandler(
    "Too many order requests. Please wait and try again",
  ),
});

const enquiryLimiter = rateLimit({
  windowMs: env.enquiryRateLimitWindowMs,

  limit: env.enquiryRateLimitMax,

  standardHeaders: true,

  legacyHeaders: false,

  skip: (req) => req.method === "OPTIONS",

  handler: createRateLimitHandler(
    "Too many enquiry requests. Please wait and try again",
  ),
});

app.use("/api", apiLimiter);

app.use("/api/v1/admin/auth/login", adminAuthLimiter);

app.use("/api/v1/orders", orderLimiter);

app.use("/api/v1/enquiries", enquiryLimiter);

/*
|--------------------------------------------------------------------------
| Public status routes
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        environment: env.nodeEnv,
      },
      "Devkar Wood Carvings API is running",
    ),
  );
});

app.get("/api/v1/health", (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: "healthy",
        environment: env.nodeEnv,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      "Server is healthy",
    ),
  );
});

/*
|--------------------------------------------------------------------------
| API routes
|--------------------------------------------------------------------------
*/

app.use("/api/v1/admin/auth", adminAuthRoutes);

app.use("/api/v1/admin/dashboard", adminDashboardRoutes);

app.use("/api/v1/categories", categoryRoutes);

app.use("/api/v1/products", productRoutes);

app.use("/api/v1/orders", orderRoutes);

app.use("/api/v1/enquiries", enquiryRoutes);

/*
|--------------------------------------------------------------------------
| Error handling
|--------------------------------------------------------------------------
| These must be registered once and only after every application route.
|--------------------------------------------------------------------------
*/

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;
