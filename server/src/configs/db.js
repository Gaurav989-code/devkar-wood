import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.mongodbUrl);

    console.log(`✅ MongoDB connected: successfully connected to .......... ${connection.connection.host}`);

    return connection;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);

    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();

      console.log("✅ MongoDB connection closed.");
    }
  } catch (error) {
    console.error(`❌ Error closing MongoDB connection: ${error.message}`);
  }
};
