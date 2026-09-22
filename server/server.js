import { env } from "./src/configs/env.js";
import { connectDB, disconnectDB } from "./src/configs/db.js";
import app from "./src/app.js";

let server = null;
let shuttingDown = false;

/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(env.port, () => {
      console.log(
        `🚀 Devkar Wood API running in ${env.nodeEnv} mode on port ${env.port}`,
      );
    });

    server.keepAliveTimeout = 65_000;
    server.headersTimeout = 66_000;
    server.requestTimeout = 30_000;
  } catch (error) {
    console.error("❌ Server startup failed:", error?.message || error);

    process.exit(1);
  }
};

/*
|--------------------------------------------------------------------------
| Graceful shutdown
|--------------------------------------------------------------------------
*/

const gracefulShutdown = async (signal, exitCode = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(`\n${signal} received. Shutting down gracefully...`);

  const forceShutdownTimer = setTimeout(() => {
    console.error("❌ Graceful shutdown timed out. Forcing shutdown.");

    if (server && typeof server.closeAllConnections === "function") {
      server.closeAllConnections();
    }

    process.exit(1);
  }, env.shutdownTimeoutMs);

  forceShutdownTimer.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    }

    await disconnectDB();

    clearTimeout(forceShutdownTimer);

    console.log("✅ Server shut down successfully.");

    process.exit(exitCode);
  } catch (error) {
    clearTimeout(forceShutdownTimer);

    console.error("❌ Error during server shutdown:", error?.message || error);

    process.exit(1);
  }
};

/*
|--------------------------------------------------------------------------
| Process events
|--------------------------------------------------------------------------
*/

process.once("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

process.on("unhandledRejection", (error) => {
  console.error(
    "❌ Unhandled promise rejection:",
    error?.stack || error?.message || error,
  );

  void gracefulShutdown("UNHANDLED_REJECTION", 1);
});

process.on("uncaughtException", (error) => {
  console.error(
    "❌ Uncaught exception:",
    error?.stack || error?.message || error,
  );

  void gracefulShutdown("UNCAUGHT_EXCEPTION", 1);
});

void startServer();
