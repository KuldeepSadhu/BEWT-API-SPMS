import Group from "../models/Group.model.js";
import Project from "../models/Project.model.js";
import Student from "../models/Student.model.js";
import Faculty from "../models/Faculty.model.js";
import AcademicYear from "../models/AcademicYear.model.js";
import { ensureSeedData } from "../scripts/seedFromDummyData.js";

const GROUP_ID_REGEX = /^G-(\d{4})-(\d+)$/;
const ALLOWED_GROUP_STATUSES = ["Approved", "Pending", "Rejected"];
const ALLOWED_GROUPING_MODES = new Set([
  "none",
  "department",
  "year",
  "departmentYear",
]);

const populateGroupById = (id) =>
  Group.findById(id)
    .populate("project", "title description department remarks")
    .populate("students", "name email rollNumber department year status")
    .populate("guide", "name email department designation expertise")
    .populate("academicYear", "year status");

const normalizeProgress = (value) => {
  const numeric = Number(value ?? 0);
  if (Number.isNaN(numeric)) {
    return 0;
  }

  return Math.max(0, Math.min(100, numeric));
};

const normalizeStatus = (status) =>
  ALLOWED_GROUP_STATUSES.includes(status) ? status : "Pending";

const parseSequenceForYear = (groupID, year) => {
  const match = String(groupID || "").match(GROUP_ID_REGEX);
  if (!match) {
    return null;
  }

  const parsedYear = Number(match[1]);
  const sequence = Number(match[2]);

  if (parsedYear !== year || Number.isNaN(sequence)) {
    return null;
  }

  return sequence;
};

const getMaxSequenceForYear = (groups, year) =>
  groups.reduce((max, group) => {
    const sequence = parseSequenceForYear(group.groupID, year);
    return sequence ? Math.max(max, sequence) : max;
  }, 0);

const formatGroupID = (year, sequence) =>
  `G-${year}-${String(sequence).padStart(3, "0")}`;

const resolveAcademicYear = async (academicYearId) => {
  if (academicYearId) {
    return AcademicYear.findById(academicYearId);
  }

  return AcademicYear.findOne({ isCurrent: true });
};

const createProjectAndGroup = async ({
  groupID,
  projectTitle,
  projectDescription,
  remarks,
  studentDocs,
  guideDoc,
  academicYear,
  status,
  progress,
}) => {
  const department = studentDocs[0]?.department || guideDoc.department || "N/A";
  const normalizedStatus = normalizeStatus(status);

  const project = await Project.create({
    title: projectTitle,
    description: projectDescription || `${projectTitle} project created from admin panel.`,
    department,
    student: studentDocs[0]._id,
    faculty: guideDoc._id,
    status: normalizedStatus,
    academicYear: academicYear?._id,
    remarks: remarks || "",
  });

  const createdGroup = await Group.create({
    groupID,
    project: project._id,
    students: studentDocs.map((student) => student._id),
    guide: guideDoc._id,
    status: normalizedStatus,
    progress: normalizeProgress(progress),
    academicYear: academicYear?._id,
  });

  project.group = createdGroup._id;
  await project.save();

  return populateGroupById(createdGroup._id);
};

const toGroupingValue = (value, fallback = "N/A") => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
};

const getGroupingKey = (student, mode) => {
  const department = toGroupingValue(student.department);
  const year = toGroupingValue(student.year);

  switch (mode) {
    case "department":
      return department;
    case "year":
      return year;
    case "departmentYear":
      return `${department} :: ${year}`;
    case "none":
    default:
      return "All Students";
  }
};

const splitIntoChunks = (items, chunkSize) => {
  const chunks = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
};

const buildGuidePicker = (facultyDocs) => {
  const facultyByDepartment = new Map();
  const departmentIndexes = new Map();
  let fallbackIndex = 0;

  facultyDocs.forEach((member) => {
    const key = toGroupingValue(member.department);
    if (!facultyByDepartment.has(key)) {
      facultyByDepartment.set(key, []);
    }
    facultyByDepartment.get(key).push(member);
  });

  return (department) => {
    const normalizedDepartment = toGroupingValue(department);
    const departmentFaculty = facultyByDepartment.get(normalizedDepartment);

    if (departmentFaculty?.length) {
      const currentIndex = departmentIndexes.get(normalizedDepartment) || 0;
      departmentIndexes.set(normalizedDepartment, currentIndex + 1);
      return departmentFaculty[currentIndex % departmentFaculty.length];
    }

    const guide = facultyDocs[fallbackIndex % facultyDocs.length];
    fallbackIndex += 1;
    return guide;
  };
};

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
  try {
    const {
      groupID,
      projectTitle,
      projectDescription,
      remarks,
      studentIds,
      guideId,
      academicYearId,
      status,
      progress,
    } = req.body;

    if (!projectTitle || !guideId || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        message: "projectTitle, guideId and at least one student are required.",
      });
    }

    const uniqueStudentIds = [...new Set(studentIds.map((id) => String(id)))];
    const requestedGroupID =
      typeof groupID === "string" && groupID.trim() ? groupID.trim() : "";

    if (requestedGroupID) {
      const existingGroup = await Group.findOne({ groupID: requestedGroupID });
      if (existingGroup) {
        return res.status(409).json({ message: "Group ID already exists." });
      }
    }

    const existingStudentGroup = await Group.findOne({
      students: { $in: uniqueStudentIds },
    });
    if (existingStudentGroup) {
      return res.status(409).json({
        message: "One or more selected students are already assigned to another group.",
      });
    }

    const [students, guide, academicYear, existingGroups] = await Promise.all([
      Student.find({ _id: { $in: uniqueStudentIds } }),
      Faculty.findById(guideId),
      resolveAcademicYear(academicYearId),
      requestedGroupID
        ? Promise.resolve([])
        : Group.find().select("groupID").lean(),
    ]);

    if (students.length !== uniqueStudentIds.length) {
      return res.status(400).json({ message: "Some selected students were not found." });
    }

    if (!guide) {
      return res.status(400).json({ message: "Selected guide was not found." });
    }

    if (academicYearId && !academicYear) {
      return res.status(400).json({ message: "Selected academic year was not found." });
    }

    const currentYear = new Date().getFullYear();
    const generatedGroupID = requestedGroupID
      || formatGroupID(
        currentYear,
        getMaxSequenceForYear(existingGroups, currentYear) + 1,
      );

    const populatedGroup = await createProjectAndGroup({
      groupID: generatedGroupID,
      projectTitle: projectTitle.trim(),
      projectDescription: projectDescription?.trim(),
      remarks: remarks?.trim(),
      studentDocs: students,
      guideDoc: guide,
      academicYear,
      status,
      progress,
    });

    res.status(201).json({ success: true, group: populatedGroup });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.groupID) {
      return res.status(409).json({ message: "Generated group ID already exists. Please retry." });
    }

    res.status(409).json({ message: error.message });
  }
};

export const createDynamicGroups = async (req, res) => {
  try {
    const {
      groupSize = 3,
      groupingMode = "departmentYear",
      academicYearId,
      projectTitlePrefix = "Auto Project",
      projectDescription,
      remarks,
      includeInactive = false,
      status,
      progress,
    } = req.body;

    const parsedGroupSize = Number(groupSize);
    if (!Number.isInteger(parsedGroupSize) || parsedGroupSize < 1 || parsedGroupSize > 10) {
      return res.status(400).json({ message: "groupSize must be an integer between 1 and 10." });
    }

    if (!ALLOWED_GROUPING_MODES.has(groupingMode)) {
      return res.status(400).json({
        message: "groupingMode must be one of: none, department, year, departmentYear.",
      });
    }

    const existingGroups = await Group.find().select("groupID students").lean();
    const assignedStudentIds = new Set();
    existingGroups.forEach((group) => {
      (group.students || []).forEach((studentId) => {
        assignedStudentIds.add(String(studentId));
      });
    });

    const studentQuery =
      assignedStudentIds.size > 0
        ? { _id: { $nin: Array.from(assignedStudentIds) } }
        : {};

    let unassignedStudents = await Student.find(studentQuery).sort({
      department: 1,
      year: 1,
      rollNumber: 1,
      name: 1,
    });

    if (!includeInactive) {
      unassignedStudents = unassignedStudents.filter(
        (student) => String(student.status || "").toLowerCase() !== "inactive",
      );
    }

    if (unassignedStudents.length === 0) {
      return res.status(400).json({ message: "No unassigned students available for dynamic grouping." });
    }

    const [facultyDocs, academicYear] = await Promise.all([
      Faculty.find().sort({ department: 1, name: 1 }),
      resolveAcademicYear(academicYearId),
    ]);

    if (!facultyDocs.length) {
      return res.status(400).json({ message: "No faculty members available to assign as guides." });
    }

    if (academicYearId && !academicYear) {
      return res.status(400).json({ message: "Selected academic year was not found." });
    }

    const bucketMap = new Map();
    unassignedStudents.forEach((student) => {
      const key = getGroupingKey(student, groupingMode);
      if (!bucketMap.has(key)) {
        bucketMap.set(key, []);
      }
      bucketMap.get(key).push(student);
    });

    const groupedChunks = [];
    Array.from(bucketMap.keys())
      .sort((left, right) => left.localeCompare(right))
      .forEach((key) => {
        splitIntoChunks(bucketMap.get(key), parsedGroupSize).forEach((chunk) => {
          groupedChunks.push(chunk);
        });
      });

    if (!groupedChunks.length) {
      return res.status(400).json({ message: "Unable to build dynamic groups from current data." });
    }

    const currentYear = new Date().getFullYear();
    let nextSequence = getMaxSequenceForYear(existingGroups, currentYear) + 1;
    const pickGuide = buildGuidePicker(facultyDocs);
    const normalizedPrefix = toGroupingValue(projectTitlePrefix, "Auto Project");

    const createdGroups = [];
    for (const studentChunk of groupedChunks) {
      const groupID = formatGroupID(currentYear, nextSequence);
      nextSequence += 1;

      const department = studentChunk[0]?.department;
      const assignedGuide = pickGuide(department);
      const projectTitle = `${normalizedPrefix} ${groupID}`;

      const createdGroup = await createProjectAndGroup({
        groupID,
        projectTitle,
        projectDescription: projectDescription?.trim(),
        remarks: remarks?.trim(),
        studentDocs: studentChunk,
        guideDoc: assignedGuide,
        academicYear,
        status,
        progress,
      });

      createdGroups.push(createdGroup);
    }

    return res.status(201).json({
      success: true,
      createdCount: createdGroups.length,
      groupedStudents: unassignedStudents.length,
      groups: createdGroups,
    });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.groupID) {
      return res.status(409).json({ message: "Group ID conflict occurred during dynamic grouping. Please retry." });
    }

    return res.status(500).json({ message: error.message || "Failed to create dynamic groups." });
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
    const projectStatus = status === "Approved" ? "Approved" : "Rejected";
    await Project.findByIdAndUpdate(group.project, { status: projectStatus });
    const populatedGroup = await populateGroupById(group._id);
    return res.status(200).json({ success: true, group: populatedGroup });
  } catch (error) {
    console.error("Update group status error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
