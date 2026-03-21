import express from "express";
import {
  getDashboardStats,
  getRecentProposals,
  getAllStudents,
  createStudent,
  getAllFaculty,
  getAllStaff,
  getAllProjects,
  getMasterConfigs,
} from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// All admin routes are protected: user must be logged in and role = admin
router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/proposals/recent", getRecentProposals);
router.get("/students", getAllStudents);
router.post("/students", createStudent);
router.get("/faculty", getAllFaculty);
router.get("/staff", getAllStaff);
router.get("/projects", getAllProjects);
router.get("/config/master", getMasterConfigs);

export default router;
