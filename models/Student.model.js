import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../config/bcrypt.js";

const studentSchema = new mongoose.Schema(
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
    rollNumber: {
      type: String,
      unique: true,
    },
    department: String,
    year: String,
    status: {
      type: String,
      default: "Active",
    },
    designation: String,
    expertise: String,
    role: {
      type: String,
      default: "student",
    },
  },
  { timestamps: true },
);

// Hash password before saving
studentSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await hashPassword(this.password);
});

// Compare password using shared utility
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await comparePassword(candidatePassword, this.password);
};

export default mongoose.model("Student", studentSchema);
