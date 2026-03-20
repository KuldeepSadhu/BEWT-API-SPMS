import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupID: {
      type: String,
      required: true,
      unique: true, // e.g. "G-2024-001"
    },
    project: {
      // Changed from String → ObjectId ref to Project
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    students: [
      {
        // Changed from String → ObjectId ref to Student
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    guide: {
      // Changed from String → ObjectId ref to Faculty
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    status: {
      type: String,
      enum: ["Approved", "Pending", "Rejected"],
      default: "Pending",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
    },
  },
  { timestamps: true },
);

// Virtual so frontend gets 'id' = groupID when needed
groupSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Group", groupSchema);
