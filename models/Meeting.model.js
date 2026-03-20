import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // e.g. "10:00 AM"
      required: true,
    },
    type: {
      type: String,
      enum: ["Review", "Progress Check", "Inception", "Final", "Other"],
      default: "Review",
    },
    status: {
      type: String,
      enum: ["Scheduled", "Upcoming", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
    },
    // attendance: array of students who attended
    attendance: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
        present: {
          type: Boolean,
          default: false,
        },
      },
    ],
    notes: {
      type: String,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Meeting", meetingSchema);
