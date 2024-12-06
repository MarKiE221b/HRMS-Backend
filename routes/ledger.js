import express from "express";
import { authenticateToken } from "../utils/authMiddleware.js";
import {
  autoUpdateLedger,
  getAllLedger,
  getLedgerPerEmployee,
} from "../controllers/ledger.js";

const router = express.Router();

router.get("/getLedger", authenticateToken, getAllLedger);
router.put("/getLedgerPerEmployee", authenticateToken, getLedgerPerEmployee);
router.post("/autoUpdateLedger", authenticateToken, autoUpdateLedger);

export default router;
