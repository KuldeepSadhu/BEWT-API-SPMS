import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    groupID: {
      type: String, // Changed from 'id' to 'groupID' to avoid conflict with default _id, but sending 'id' in toJSON might be better. Let's keep it simple 'id' in frontend mapped to 'groupID' here or just 'id'.
      required: true,
      unique: true,
    },
    project: {
      type: String,
      required: true,
    },
    students: [
      {
        type: String,
      },
    ],
    guide: {
      type: String,
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
    },
  },
  { timestamps: true },
);

const Group = mongoose.model("Group", groupSchema);

export default Group;
