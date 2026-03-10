import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    fileUrl: {
      type: String, // URL or path to the uploaded file
    },
    remarks: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Submitted", "Reviewed", "Approved", "Rejected"],
      default: "Submitted",
    },
    grade: {
      type: String, // e.g. "A", "B+", optional
    },
  },
  { timestamps: true },
);

export default mongoose.model("Submission", submissionSchema);
