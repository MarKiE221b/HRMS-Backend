import express from "express";
import { authenticateToken } from "../utils/authMiddleware.js";
import { getAllLedger, getLedgerPerEmployee } from "../controllers/ledger.js";

const router = express.Router();

router.get("/getLedger", authenticateToken, getAllLedger);
router.put("/getLedgerPerEmployee", authenticateToken, getLedgerPerEmployee);



export default router;
