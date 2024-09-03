import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import { getCTOLedger, postUploadCTO } from "../controllers/cto.js";
import { authenticateToken } from "./../utils/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Please upload only PDF files"), false);
  }
};

const uploadsDir = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get("/getctoledger", authenticateToken, getCTOLedger);
router.post(
  "/uploadCTO",
  authenticateToken,
  upload.single("file"),
  postUploadCTO
);

export default router;
