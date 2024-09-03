import express from "express";
// import { getCreditInfo } from "../controllers/creditHistory.js";
import { authenticateToken } from "./../utils/authMiddleware.js";

const router = express.Router();

// router.get("/getCreditInfo", authenticateToken, getCreditInfo);

export default router;
