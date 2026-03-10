import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../config/bcrypt.js";

const adminSchema = new mongoose.Schema(
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
    name: String,
  },
  { timestamps: true },
);

// Hash password before saving
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await hashPassword(this.password);
});

// Compare password using shared utility
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await comparePassword(candidatePassword, this.password);
};

export default mongoose.model("Admin", adminSchema);
