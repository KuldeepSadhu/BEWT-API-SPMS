import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    department: {
      type: String,
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
    },
    remarks: String,
  },
  { timestamps: true },
);

export default mongoose.model("Project", projectSchema);
