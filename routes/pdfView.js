import express from "express";
import { authenticateToken } from "../utils/authMiddleware.js";
import { getPdf } from "../controllers/pdfView.js";

const router = express.Router();

router.post("/pdffile", authenticateToken, getPdf);

export default router;
