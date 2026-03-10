import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../config/bcrypt.js";

const facultySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    department: String,
    designation: String,
    expertise: String,
    role: {
      type: String,
      default: "faculty",
    },
  },
  { timestamps: true },
);

// Hash password before saving
facultySchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await hashPassword(this.password);
});

// Compare password using shared utility
facultySchema.methods.comparePassword = async function (candidatePassword) {
  return await comparePassword(candidatePassword, this.password);
};

export default mongoose.model("Faculty", facultySchema);
