import express from "express";
import {
  getGroups,
  createGroup,
  updateGroupStatus,
} from "../controllers/group.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getGroups);
router.post("/", protect, authorize("admin"), createGroup);
router.patch("/:id/status", protect, authorize("admin"), updateGroupStatus);

export default router;
