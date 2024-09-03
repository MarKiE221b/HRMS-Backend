import express from "express";
import {
  application,
  getAllApplication,
  getApplication,
  getEmployeeApplication,
  leaveFormApplication,
  pendingCountApprovedNotif,
  pendingNotifCount,
} from "../controllers/application.js";
import { authenticateToken } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/application", authenticateToken, application);
router.get("/getApplications", authenticateToken, getApplication);
router.get("/getAllApplications", authenticateToken, getAllApplication);
router.get(
  "/getEmployeeApplications",
  authenticateToken,
  getEmployeeApplication
);
router.get("/getPendingNotifCount", authenticateToken, pendingNotifCount);
router.get("/getCountApproved", authenticateToken, pendingCountApprovedNotif);
router.post("/leaveApplicationForm", authenticateToken, leaveFormApplication);

export default router;
