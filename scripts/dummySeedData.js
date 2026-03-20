export const dummyStudents = [
  { name: "Kuldeep Sadhu", rollNumber: "CS2021001", email: "kuldeep@example.com", department: "Computer Science", year: "Final Year", status: "Active" },
  { name: "Sarah Smith", rollNumber: "IT2021005", email: "sarah@example.com", department: "Information Technology", year: "Final Year", status: "Active" },
  { name: "Mike Ross", rollNumber: "CS2021012", email: "mike@example.com", department: "Computer Science", year: "Third Year", status: "Active" },
  { name: "Rachel Zane", rollNumber: "IT2021018", email: "rachel@example.com", department: "Information Technology", year: "Final Year", status: "Active" },
  { name: "Harvey Specter", rollNumber: "CS2021025", email: "harvey@example.com", department: "Computer Science", year: "Final Year", status: "Inactive" },
];

export const dummyFaculty = [
  { name: "Prof. Rajesh Sharma", designation: "HOD", department: "Computer Science", email: "rajesh@college.edu", expertise: "AI/ML" },
  { name: "Dr. Anjali Verma", designation: "Professor", department: "Information Technology", email: "anjali@college.edu", expertise: "Cloud Computing" },
  { name: "Prof. Amit Kumar", designation: "Assistant Professor", department: "Computer Science", email: "amit@college.edu", expertise: "Blockchain" },
];

export const dummyGroups = [
  { groupID: "G-2024-001", project: "Smart Attendance System", students: ["Kuldeep Sadhu", "Harvey Specter"], guide: "Prof. Rajesh Sharma", status: "Approved", progress: 75 },
  { groupID: "G-2024-002", project: "AI Resume Parser", students: ["Sarah Smith", "Rachel Zane"], guide: "Dr. Anjali Verma", status: "Approved", progress: 40 },
  { groupID: "G-2024-003", project: "Blockchain Voting", students: ["Mike Ross"], guide: "Prof. Amit Kumar", status: "Pending", progress: 0 },
];

export const dummyProjectTypes = [
  { type: "Minor Project", semester: "6th Sem", credits: 2, description: "Small scale project for third year students." },
  { type: "Major Project", semester: "8th Sem", credits: 8, description: "Final year capstone project." },
  { type: "Internship Project", semester: "8th Sem", credits: 6, description: "Industrial training project." },
];

export const dummyAcademicYears = [
  { year: "2025-2026", startDate: "2025-07-01", endDate: "2026-06-30", isCurrent: true, status: "Active" },
  { year: "2024-2025", startDate: "2024-07-01", endDate: "2025-06-30", isCurrent: false, status: "Closed" },
];

export const dummyStaff = [
  { name: "Admin User", role: "Super Admin", email: "admin.staff@college.edu", department: "Administration", lastLogin: "2025-10-12T10:30:00.000Z" },
  { name: "Coordinator", role: "Project Coordinator", email: "coord@college.edu", department: "Computer Science", lastLogin: "2025-10-11T14:15:00.000Z" },
];

export const dummyMeetings = [
  { date: "2025-10-25", time: "10:00 AM", title: "Project Inception", type: "Review", status: "Completed" },
  { date: "2025-11-15", time: "02:00 PM", title: "Phase 1 Update", type: "Progress Check", status: "Scheduled" },
  { date: "2025-12-05", time: "11:30 AM", title: "Design Review", type: "Review", status: "Upcoming" },
];

export const dummySubmissions = [
  { title: "Project Proposal", date: "2025-08-15", student: "Kuldeep Sadhu", status: "Approved", remarks: "Good scope." },
  { title: "SRS Document", date: "2025-09-10", student: "Sarah Smith", status: "Pending Review", remarks: "-" },
  { title: "Design Document", date: "2025-10-01", student: "Kuldeep Sadhu", status: "Rejected", remarks: "Needs more diagrams." },
];
