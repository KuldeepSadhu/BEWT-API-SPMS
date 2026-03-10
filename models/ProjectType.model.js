import mongoose from "mongoose";

const projectTypeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      unique: true,
    },
    semester: {
      type: String,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    description: String,
  },
  { timestamps: true },
);

export default mongoose.model("ProjectType", projectTypeSchema);
