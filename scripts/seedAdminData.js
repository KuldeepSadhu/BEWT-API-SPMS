import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import Student from "../models/Student.model.js";
import Faculty from "../models/Faculty.model.js";
import Admin from "../models/Admin.model.js";
import Project from "../models/Project.model.js";
import Group from "../models/Group.model.js";
import AcademicYear from "../models/AcademicYear.model.js";
import ProjectType from "../models/ProjectType.model.js";
import connectDB from "../config/db.js";

configDotenv();
connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await Student.deleteMany();
    await Faculty.deleteMany();
    await Admin.deleteMany();
    await Project.deleteMany();
    await Group.deleteMany();
    await AcademicYear.deleteMany();
    await ProjectType.deleteMany();

    console.log("Database cleared.");

    // 1. Seed Academic Years
    const academicYears = await AcademicYear.insertMany([
      {
        year: "2025-2026",
        startDate: new Date("2025-07-01"),
        endDate: new Date("2026-06-30"),
        isCurrent: true,
        status: "Active",
      },
      {
        year: "2024-2025",
        startDate: new Date("2024-07-01"),
        endDate: new Date("2025-06-30"),
        isCurrent: false,
        status: "Closed",
      },
    ]);

    // 2. Seed Project Types
    const projectTypes = await ProjectType.insertMany([
      {
        type: "Minor Project",
        semester: "6th Sem",
        credits: 2,
        description: "Small scale project for third year students.",
      },
      {
        type: "Major Project",
        semester: "8th Sem",
        credits: 8,
        description: "Final year capstone project.",
      },
      {
        type: "Internship Project",
        semester: "8th Sem",
        credits: 6,
        description: "Industrial training project.",
      },
    ]);

    // 3. Seed Admin
    const admin = await Admin.create({
      name: "Admin User",
      email: "admin@college.edu",
      password: "adminpassword123", // Will be hashed by pre-save hook
    });

    // 4. Seed Faculty
    const facultyMembers = await Faculty.insertMany([
      {
        name: "Prof. Rajesh Sharma",
        designation: "HOD",
        department: "Computer Science",
        email: "rajesh@college.edu",
        expertise: "AI/ML",
        password: "faculty123",
      },
      {
        name: "Dr. Anjali Verma",
        designation: "Professor",
        department: "Information Technology",
        email: "anjali@college.edu",
        expertise: "Cloud Computing",
        password: "faculty123",
      },
      {
        name: "Prof. Amit Kumar",
        designation: "Assistant Professor",
        department: "Computer Science",
        email: "amit@college.edu",
        expertise: "Blockchain",
        password: "faculty123",
      },
    ]);

    // 5. Seed Students
    const students = await Student.insertMany([
      {
        name: "Kuldeep Sadhu",
        rollNumber: "CS2021001",
        email: "kuldeep@example.com",
        department: "Computer Science",
        year: "Final Year",
        status: "Active",
        password: "student123",
      },
      {
        name: "Sarah Smith",
        rollNumber: "IT2021005",
        email: "sarah@example.com",
        department: "Information Technology",
        year: "Final Year",
        status: "Active",
        password: "student123",
      },
      {
        name: "Mike Ross",
        rollNumber: "CS2021012",
        email: "mike@example.com",
        department: "Computer Science",
        year: "Third Year",
        status: "Active",
        password: "student123",
      },
      {
        name: "Rachel Zane",
        rollNumber: "IT2021018",
        email: "rachel@example.com",
        department: "Information Technology",
        year: "Final Year",
        status: "Active",
        password: "student123",
      },
      {
        name: "Harvey Specter",
        rollNumber: "CS2021025",
        email: "harvey@example.com",
        department: "Computer Science",
        year: "Final Year",
        status: "Inactive",
        password: "student123",
      },
    ]);

    // 6. Seed Projects
    const projects = await Project.insertMany([
      {
        title: "Smart Attendance System",
        description: "A biometric based attendance system.",
        department: "Computer Science",
        student: students[0]._id,
        faculty: facultyMembers[0]._id,
        status: "Pending",
        academicYear: academicYears[0]._id,
      },
      {
        title: "AI Resume Parser",
        description: "Extracting data from resumes using NLP.",
        department: "Information Technology",
        student: students[1]._id,
        faculty: facultyMembers[1]._id,
        status: "Approved",
        academicYear: academicYears[0]._id,
      },
      {
        title: "Blockchain Voting",
        description: "Secure voting system using Ethereum.",
        department: "Computer Science",
        student: students[2]._id,
        faculty: facultyMembers[2]._id,
        status: "Rejected",
        academicYear: academicYears[0]._id,
      },
    ]);

    // 7. Seed Groups
    await Group.insertMany([
      {
        groupID: "G-2024-001",
        project: "Smart Attendance System",
        students: ["Kuldeep Sadhu", "Harvey Specter"],
        guide: "Prof. Rajesh Sharma",
        status: "Approved",
        progress: 75,
      },
      {
        groupID: "G-2024-002",
        project: "AI Resume Parser",
        students: ["Sarah Smith", "Rachel Zane"],
        guide: "Dr. Anjali Verma",
        status: "Approved",
        progress: 40,
      },
      {
        groupID: "G-2024-003",
        project: "Blockchain Voting",
        students: ["Mike Ross"],
        guide: "Prof. Amit Kumar",
        status: "Pending",
        progress: 0,
      },
      {
        groupID: "G-2024-004",
        project: "Smart Healthcare App",
        students: ["Kuldeep Sadhu", "Sarah Smith"],
        guide: "Dr. Anjali Verma",
        status: "Pending",
        progress: 0,
      },
      {
        groupID: "G-2024-005",
        project: "College ERP System",
        students: ["Rachel Zane", "Harvey Specter"],
        guide: "Prof. Rajesh Sharma",
        status: "Pending",
        progress: 0,
      },
    ]);

    console.log("Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
