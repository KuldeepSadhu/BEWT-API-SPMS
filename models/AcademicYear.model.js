import mongoose from "mongoose";

const academicYearSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: true,
      unique: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },
  },
  { timestamps: true },
);

export default mongoose.model("AcademicYear", academicYearSchema);
