import express from "express";
import { authenticateToken } from "../utils/authMiddleware.js";
import { getAllLedger } from "../controllers/ledger.js";

const router = express.Router();

router.get("/getLedger", authenticateToken, getAllLedger);

export default router;
