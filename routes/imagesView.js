import express from "express";
import { authenticateToken } from "../utils/authMiddleware.js";
import {
  getOfficersSignature,
  getSignature,
  postSignatureApplication,
} from "../controllers/imagesView.js";

const router = express.Router();

router.get("/imgSignature", authenticateToken, getSignature);
router.get("/officersSignatures", authenticateToken, getOfficersSignature);
router.post(
  "/postImgSignatureApplicant",
  authenticateToken,
  postSignatureApplication
);

export default router;
