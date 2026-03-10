import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/Admin.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const createAdmin = async () => {
  await connectDB();
  try {
    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }
    
    const admin = await Admin.create({
      email: "admin@example.com",
      password: "admin123", // Will be hashed by pre-save hook
      name: "Super Admin",
    });
    console.log("Admin created successfully:", admin.email);
  } catch (error) {
    console.error("Error creating admin:", error);
  }
  process.exit();
};

createAdmin();
