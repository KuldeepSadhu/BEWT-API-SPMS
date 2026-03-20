import Group from "../models/Group.model.js";
import { ensureSeedData } from "../scripts/seedFromDummyData.js";

export const getGroups = async (req, res) => {
  try {
    await ensureSeedData();
    const groups = await Group.find()
      .populate("project", "title description department remarks")
      .populate("students", "name email rollNumber department year status")
      .populate("guide", "name email department designation expertise")
      .populate("academicYear", "year status");

    res.status(200).json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGroup = async (req, res) => {
  const group = req.body;
  const newGroup = new Group(group);
  try {
    await newGroup.save();
    res.status(201).json({ success: true, group: newGroup });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateGroupStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "Approved" or "Rejected"

  if (!["Approved", "Rejected"].includes(status)) {
    return res
      .status(400)
      .json({ message: "Status must be 'Approved' or 'Rejected'." });
  }

  try {
    const group = await Group.findByIdAndUpdate(id, { status }, { new: true });
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }
    return res.status(200).json({ success: true, group });
  } catch (error) {
    console.error("Update group status error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
