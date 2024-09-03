import express from "express";

import { authenticateToken } from "./../utils/authMiddleware.js";
import {
  updateEmployeeLeaveCEPS,
  updateEmployeeLeaveOIC,
  updateEmployeeLeaveRD,
} from "../controllers/leave.js";

const router = express.Router();

router.put("/updateLeaveOIC", authenticateToken, updateEmployeeLeaveOIC);
router.put("/updateLeaveCEPS", authenticateToken, updateEmployeeLeaveCEPS);
router.put("/updateLeaveRD", authenticateToken, updateEmployeeLeaveRD);

export default router;
