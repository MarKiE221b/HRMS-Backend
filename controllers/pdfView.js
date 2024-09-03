import { db } from "../connect.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export const getPdf = async (req, res) => {
  const PDFFILEQUERY =
    "SELECT filename FROM cto_certificate WHERE certificate_id = ?";

  console.log(req.body);
  try {
    const [pdf] = await executeQuery(PDFFILEQUERY, [req.body.id]);

    const filePath = path.join(__dirname, `../uploads/${pdf.filename}`);
    res.sendFile(filePath);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
