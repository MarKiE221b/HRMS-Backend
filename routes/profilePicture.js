import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import { authenticateToken } from "../utils/authMiddleware.js";
import { postUploadAvatar, viewAvatar } from "../controllers/profilePicture.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/pictures/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Please upload only image files"), false);
  }
};

const uploadsDir = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get("/getUploadAvatar", authenticateToken, viewAvatar);
router.post(
  "/uploadAvatar",
  authenticateToken,
  upload.single("file"),
  postUploadAvatar
);

export default router;
