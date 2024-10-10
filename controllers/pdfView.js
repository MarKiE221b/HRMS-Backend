import { db } from "../connect.js";
import path from "path";
import { fileURLToPath } from "url";
import { executeQuery } from "../utils/dbUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getPdf = async (req, res) => {
  const PDFFILEQUERY =
    "SELECT filename FROM cto_certificate WHERE certificate_id = ?";
  try {
    const [pdf] = await executeQuery(PDFFILEQUERY, [req.body.id]);

    const filePath = path.join(__dirname, `../uploads/${pdf.filename}`);
    res.sendFile(filePath);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getPdfUploadLeave = async (req, res) => {
  try {
    const PDFFILEQUERY =
      "SELECT filename FROM leave_documents WHERE document_id = ?";

    const [pdf] = await executeQuery(PDFFILEQUERY, [req.body.id]);

    const filePath = path.join(__dirname, `../uploads/leaveFormFiles/${pdf.filename}`);
    res.sendFile(filePath);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
