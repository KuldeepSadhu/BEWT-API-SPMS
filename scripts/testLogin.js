import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/Admin.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected");

    const email = "admin@example.com";
    const password = "admin123";

    const user = await Admin.findOne({ email });
    if (!user) {
      console.log("Admin user not found!");
      process.exit(1);
    }

    console.log("Admin found:", user.email);
    console.log("Hashed password from DB:", user.password);

    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      console.log(
        " Password comparison SUCCESSFUL: Raw password matches hashed password.",
      );
    } else {
      console.log(" Password comparison FAILED.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit();
};

testLogin();
