import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    // Title was missing in original — needed by frontend submissions list
    title: {
      type: String,
      required: true, // e.g. "Project Proposal", "SRS Document"
    },
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
      type: String, // URL or path to uploaded file
    },
    fileName: {
      type: String, // original file name for display
    },
    remarks: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Submitted", "Pending Review", "Reviewed", "Approved", "Rejected"],
      default: "Submitted",
    },
    grade: {
      type: String, // e.g. "A", "B+", optional
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Submission", submissionSchema);
