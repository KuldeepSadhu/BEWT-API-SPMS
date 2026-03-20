import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
configDotenv();
import connectDB from "./config/db.js";
// import createAdmin from "./config/adminCreate.js";
import groupRoutes from "./routes/group.route.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/Admin.route.js";
import {
  getPublicAcademicYears,
  getPublicMeetings,
  getPublicProjectTypes,
  getPublicStaff,
  getPublicStudents,
  getPublicSubmissions,
} from "./controllers/admin.controller.js";

connectDB();

// createAdmin();  => for my Admin Creation
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // front-end
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/groups", groupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/students", getPublicStudents);
app.get("/api/staff", getPublicStaff);
app.get("/api/project-types", getPublicProjectTypes);
app.get("/api/academic-years", getPublicAcademicYears);
app.get("/api/meetings", getPublicMeetings);
app.get("/api/submissions", getPublicSubmissions);
// Test route & Fake connection checker route
app.get("/", (req, res) => res.send("Backend API is running!"));
app.get("/api/status", (req, res) =>
  res.json({ status: "ok", message: "Backend is connected to Frontend!" }),
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
