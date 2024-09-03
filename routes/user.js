import express from "express";
import {
  verifyCredential,
  getUserInfo,
  getUsername,
  updateUsername,
  updatePassword,
} from "../controllers/user.js";
import { authenticateToken } from "./../utils/authMiddleware.js";

const router = express.Router();

router.get("/verifyuser", authenticateToken, verifyCredential);
router.get("/getuserinfo", authenticateToken, getUserInfo);
router.get("/getusername", authenticateToken, getUsername);
router.put("/updateusername", authenticateToken, updateUsername);
router.put("/updatepwd", authenticateToken, updatePassword);

export default router;
