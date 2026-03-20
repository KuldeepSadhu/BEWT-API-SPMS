import { configDotenv } from "dotenv";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.model.js";
import Student from "../models/Student.model.js";
import Faculty from "../models/Faculty.model.js";
import Staff from "../models/Staff.model.js";
import AcademicYear from "../models/AcademicYear.model.js";
import ProjectType from "../models/ProjectType.model.js";
import Project from "../models/Project.model.js";
import Proposal from "../models/Proporsal.model.js";
import Group from "../models/Group.model.js";
import Meeting from "../models/Meeting.model.js";
import Submission from "../models/Submssion.model.js";
import {
  dummyAcademicYears,
  dummyFaculty,
  dummyGroups,
  dummyMeetings,
  dummyProjectTypes,
  dummyStaff,
  dummyStudents,
  dummySubmissions,
} from "./dummySeedData.js";

configDotenv();

const collections = [
  Submission,
  Meeting,
  Group,
  Proposal,
  Project,
  ProjectType,
  AcademicYear,
  Staff,
  Student,
  Faculty,
  Admin,
];

let seedInFlight = null;

const mapProposalStatus = (status) => {
  if (status === "Approved") return "Approved";
  if (status === "Rejected") return "Rejected";
  return "Pending";
};

export const seedDummyData = async ({ reset = true } = {}) => {
  if (seedInFlight) {
    return seedInFlight;
  }

  seedInFlight = (async () => {
    await connectDB();

    if (reset) {
      for (const model of collections) {
        await model.deleteMany({});
      }
    }

    const academicYears = [];
    for (const ay of dummyAcademicYears) {
      const created = await AcademicYear.create({
        year: ay.year,
        startDate: new Date(ay.startDate),
        endDate: new Date(ay.endDate),
        isCurrent: ay.isCurrent,
        status: ay.status,
      });
      academicYears.push(created);
    }

    const projectTypes = [];
    for (const type of dummyProjectTypes) {
      const created = await ProjectType.create(type);
      projectTypes.push(created);
    }

    const admin = await Admin.create({
      name: "Admin User",
      email: "admin@college.edu",
      password: "password123",
    });

    const facultyMap = new Map();
    for (const faculty of dummyFaculty) {
      const created = await Faculty.create({
        ...faculty,
        password: "password123",
      });
      facultyMap.set(created.name, created);
    }

    const studentMap = new Map();
    for (const student of dummyStudents) {
      const created = await Student.create({
        ...student,
        password: "password123",
        role: "student",
      });
      studentMap.set(created.name, created);
    }

    const staffDocs = [];
    for (const staff of dummyStaff) {
      const created = await Staff.create({
        ...staff,
        password: "password123",
        lastLogin: new Date(staff.lastLogin),
      });
      staffDocs.push(created);
    }

    const projects = [];
    for (const [index, group] of dummyGroups.entries()) {
      const primaryStudent = studentMap.get(group.students[0]);
      const guide = facultyMap.get(group.guide);
      const created = await Project.create({
        title: group.project,
        description: `${group.project} project seeded from dummy data.`,
        department: primaryStudent?.department || guide?.department || "N/A",
        student: primaryStudent?._id,
        faculty: guide?._id,
        status: group.status,
        academicYear: academicYears[0]?._id,
        projectType: projectTypes[index % projectTypes.length]?._id,
      });
      projects.push(created);
    }

    const projectByTitle = new Map(projects.map((p) => [p.title, p]));

    const proposals = [];
    for (const submission of dummySubmissions) {
      const student = studentMap.get(submission.student);
      const project = projects.find((p) => p.student?.toString() === student?._id?.toString()) || projects[0];
      const faculty = project?.faculty;

      const created = await Proposal.create({
        projectName: submission.title,
        description: `${submission.title} seeded proposal`,
        department: student?.department || "N/A",
        student: student?._id,
        faculty,
        project: project?._id,
        status: mapProposalStatus(submission.status),
        remarks: submission.remarks,
        academicYear: academicYears[0]?._id,
      });

      proposals.push(created);
    }

    const groups = [];
    for (const group of dummyGroups) {
      const project = projectByTitle.get(group.project);
      const students = group.students
        .map((name) => studentMap.get(name)?._id)
        .filter(Boolean);
      const guide = facultyMap.get(group.guide);

      const created = await Group.create({
        groupID: group.groupID,
        project: project?._id,
        students,
        guide: guide?._id,
        status: group.status,
        progress: group.progress,
        academicYear: academicYears[0]?._id,
      });

      groups.push(created);

      if (project) {
        project.group = created._id;
        await project.save();
      }
    }

    for (const [index, meeting] of dummyMeetings.entries()) {
      const group = groups[index % groups.length];
      const project = projects[index % projects.length];

      await Meeting.create({
        title: meeting.title,
        date: new Date(meeting.date),
        time: meeting.time,
        type: meeting.type,
        status: meeting.status,
        group: group?._id,
        project: project?._id,
        faculty: project?.faculty,
        notes: `Seeded note for ${meeting.title}.`,
        attendance: (group?.students || []).map((studentId) => ({
          student: studentId,
          present: true,
        })),
        academicYear: academicYears[0]?._id,
      });
    }

    for (const submission of dummySubmissions) {
      const student = studentMap.get(submission.student);
      const project = projects.find((p) => p.student?.toString() === student?._id?.toString()) || projects[0];

      await Submission.create({
        title: submission.title,
        project: project?._id,
        student: student?._id,
        faculty: project?.faculty,
        submittedAt: new Date(submission.date),
        remarks: submission.remarks,
        status: submission.status,
        fileName: `${submission.title.toLowerCase().replace(/\s+/g, "_")}.pdf`,
        fileUrl: `/files/${submission.title.toLowerCase().replace(/\s+/g, "-")}`,
        grade:
          submission.status === "Approved"
            ? "A"
            : submission.status === "Rejected"
              ? "C"
              : "B+",
        academicYear: academicYears[0]?._id,
      });
    }

    const summary = {
      admin: admin.email,
      students: await Student.countDocuments(),
      faculty: await Faculty.countDocuments(),
      staff: await Staff.countDocuments(),
      projects: await Project.countDocuments(),
      proposals: await Proposal.countDocuments(),
      groups: await Group.countDocuments(),
      meetings: await Meeting.countDocuments(),
      submissions: await Submission.countDocuments(),
    };

    return summary;
  })();

  try {
    return await seedInFlight;
  } finally {
    seedInFlight = null;
  }
};

export const ensureSeedData = async () => {
  await connectDB();

  const [studentCount, projectCount] = await Promise.all([
    Student.countDocuments(),
    Project.countDocuments(),
  ]);

  if (studentCount > 0 || projectCount > 0) {
    return null;
  }

  return seedDummyData({ reset: false });
};

const runSeed = async () => {
  try {
    const summary = await seedDummyData({ reset: true });
    console.log("Dummy data seeded successfully.");
    console.log(summary);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

const entryFileUrl = process.argv[1] ? new URL(`file:///${process.argv[1].replace(/\\/g, "/")}`).href : "";

if (import.meta.url === entryFileUrl) {
  runSeed();
}
