import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import { authenticateToken } from "./../utils/authMiddleware.js";
import {
  getLeaveFormsUpload,
  updateEmployeeLeaveCEPS,
  updateEmployeeLeaveOIC,
  updateEmployeeLeaveRD,
  uploadLeaveForms,
} from "../controllers/leave.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/leaveFormFiles/");
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

router.get("/getUploadLeaveForms", authenticateToken, getLeaveFormsUpload);

router.put("/updateLeaveOIC", authenticateToken, updateEmployeeLeaveOIC);
router.put("/updateLeaveCEPS", authenticateToken, updateEmployeeLeaveCEPS);
router.put("/updateLeaveRD", authenticateToken, updateEmployeeLeaveRD);

router.post(
  "/uploadLeaveForms",
  authenticateToken,
  upload.single("file"),
  uploadLeaveForms
);

export default router;
