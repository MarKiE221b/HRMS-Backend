import express from "express";
import { getLeaveTypes } from "../controllers/leaveType.js";
import { authenticateToken } from "../utils/authMiddleware.js";

const router = express.Router();

router.get("/getLeaveType", authenticateToken, getLeaveTypes);

export default router;
