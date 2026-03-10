import Student from "../models/Student.model.js";
import Faculty from "../models/Faculty.model.js";
import Project from "../models/Project.model.js";
import Group from "../models/Group.model.js";
import AcademicYear from "../models/AcademicYear.model.js";
import ProjectType from "../models/ProjectType.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const pendingApprovals = await Project.countDocuments({
      status: "Pending",
    });
    const activeGroups = await Group.countDocuments({ status: "Approved" });
    const totalFaculty = await Faculty.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalProjects,
        pendingApprovals,
        activeGroups,
        totalFaculty,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecentProposals = async (req, res) => {
  try {
    const recentProposals = await Project.find()
      .populate("student", "name department")
      .populate("faculty", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({ success: true, proposals: recentProposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.status(200).json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find().select("-password");
    res.status(200).json({ success: true, faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("student", "name rollNumber department")
      .populate("faculty", "name")
      .populate("academicYear", "year");
    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMasterConfigs = async (req, res) => {
  try {
    const academicYears = await AcademicYear.find();
    const projectTypes = await ProjectType.find();
    res.status(200).json({ success: true, academicYears, projectTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
