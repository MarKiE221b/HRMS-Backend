import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import {
  getEmpDetails,
  getEmployeesCount,
  getEmployeesList,
  uploadSignature,
} from "../controllers/employees.js";
import { authenticateToken } from "../utils/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/signatures/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Please upload only png image"), false);
  }
};

const uploadsDir = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get("/getEmployeesCount", authenticateToken, getEmployeesCount);
router.get("/getEmployeesList", authenticateToken, getEmployeesList);
router.post("/getEmployeeDetails", authenticateToken, getEmpDetails);
router.put("/uploadSignature", authenticateToken, upload.single("file"), uploadSignature);

export default router;
