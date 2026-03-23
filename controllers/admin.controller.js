import Student from "../models/Student.model.js";
import Faculty from "../models/Faculty.model.js";
import Project from "../models/Project.model.js";
import Group from "../models/Group.model.js";
import AcademicYear from "../models/AcademicYear.model.js";
import ProjectType from "../models/ProjectType.model.js";
import Meeting from "../models/Meeting.model.js";
import Submission from "../models/Submssion.model.js";

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
      .populate("faculty", "name department")
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

export const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      department,
      year,
      status = "Active",
      designation = "",
      expertise = "",
    } = req.body;

    if (!name || !email || !password || !rollNumber || !department || !year) {
      return res.status(400).json({
        success: false,
        message: "name, email, password, rollNumber, department and year are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRollNumber = String(rollNumber).trim();
    const normalizedStatus = status === "Inactive" ? "Inactive" : "Active";

    const existingStudent = await Student.findOne({
      $or: [{ email: normalizedEmail }, { rollNumber: normalizedRollNumber }],
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Student with this email or roll number already exists.",
      });
    }

    const createdStudent = await Student.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      rollNumber: normalizedRollNumber,
      department: String(department).trim(),
      year: String(year).trim(),
      status: normalizedStatus,
      designation: String(designation || "").trim(),
      expertise: String(expertise || "").trim(),
      role: "student",
    });

    const studentResponse = createdStudent.toObject();
    delete studentResponse.password;

    return res.status(201).json({
      success: true,
      message: "Student created successfully.",
      student: studentResponse,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate student record found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create student.",
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStudent = await Student.findByIdAndDelete(id).select("-password");

    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully.",
      student: deletedStudent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete student.",
    });
  }
};

export const createFaculty = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      department,
      designation = "",
      expertise = "",
    } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: "name, email, password and department are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingFaculty = await Faculty.findOne({ email: normalizedEmail });

    if (existingFaculty) {
      return res.status(409).json({
        success: false,
        message: "Faculty with this email already exists.",
      });
    }

    const createdFaculty = await Faculty.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      department: String(department).trim(),
      designation: String(designation || "").trim(),
      expertise: String(expertise || "").trim(),
      role: "faculty",
    });

    const facultyResponse = createdFaculty.toObject();
    delete facultyResponse.password;

    return res.status(201).json({
      success: true,
      message: "Faculty created successfully.",
      faculty: facultyResponse,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate faculty record found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create faculty.",
    });
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

export const getAllStaff = async (req, res) => {
  try {
    const staff = await Faculty.find().select("-password");
    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("student", "name rollNumber department")
      .populate("faculty", "name department")
      .populate("academicYear", "year")
      .populate("projectType", "type semester credits");
    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMasterConfigs = async (req, res) => {
  try {
    const academicYears = await AcademicYear.find();
    const projectTypes = await ProjectType.find();
    const staff = await Faculty.find().select("-password");
    res.status(200).json({ success: true, academicYears, projectTypes, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password").sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicStaff = async (req, res) => {
  try {
    const staff = await Faculty.find().select("-password").sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicProjectTypes = async (req, res) => {
  try {
    const projectTypes = await ProjectType.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: projectTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicAcademicYears = async (req, res) => {
  try {
    const academicYears = await AcademicYear.find().sort({ startDate: -1 });
    res.status(200).json({ success: true, data: academicYears });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate({
        path: "group",
        populate: [
          { path: "students", select: "name" },
          { path: "guide", select: "name department" },
        ],
      })
      .populate("project", "title department")
      .populate("faculty", "name department")
      .sort({ date: 1 });
    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("student", "name rollNumber department")
      .populate("project", "title department status")
      .populate("faculty", "name department")
      .sort({ submittedAt: -1 });
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
