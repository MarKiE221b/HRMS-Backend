import express from "express";
import { authenticateToken } from "../utils/authMiddleware.js";
import { getPdf, getPdfUploadLeave } from "../controllers/pdfView.js";

const router = express.Router();

router.post("/pdffile", authenticateToken, getPdf);
router.post("/leaveFormPdfFile", authenticateToken, getPdfUploadLeave);

export default router;
