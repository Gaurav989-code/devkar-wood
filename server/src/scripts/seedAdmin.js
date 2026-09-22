import { connectDB, disconnectDB } from "../configs/db.js";
import Admin from "../models/Admin.js";

const seedAdmin = async () => {
  try {
    await connectDB();

    const name = process.env.ADMIN_NAME?.trim();

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required",
      );
    }

    if (name.length < 2) {
      throw new Error("Admin name must contain at least 2 characters");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please provide a valid admin email address");
    }

    if (password.length < 8) {
      throw new Error("Admin password must contain at least 8 characters");
    }

    const existingAdmin = await Admin.findOne({
      email,
    });

    if (existingAdmin) {
      console.log(`ℹ️ Admin already exists: ${existingAdmin.email}`);

      return;
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: "admin",
      isActive: true,
    });

    console.log("✅ Admin created successfully");
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
  } catch (error) {
    console.error(`❌ Admin creation failed: ${error.message}`);

    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

seedAdmin();
