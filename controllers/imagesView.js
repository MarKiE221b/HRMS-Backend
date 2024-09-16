import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { executeQuery } from "../utils/dbUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getSignature = async (req, res) => {
  const EMP_ID = req.user.emp_id;
  const QUERY = "SELECT signature FROM employees WHERE emp_id = ?";

  try {
    const [img] = await executeQuery(QUERY, [EMP_ID]);

    const filePath = path.join(
      __dirname,
      `../uploads/signatures/${img.signature}`
    );
    res.sendFile(filePath);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const postSignatureApplication = async (req, res) => {
  const _id = req.body.id;
  const QUERY = "SELECT signature FROM employees WHERE emp_id = ?";

  try {
    const [img] = await executeQuery(QUERY, [_id]);

    const filePath = path.join(
      __dirname,
      `../uploads/signatures/${img.signature}`
    );
    res.sendFile(filePath);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getOfficersSignature = async (req, res) => {
  const QUERY = `SELECT 
    emp_id, signature, unit 
  FROM 
    employees 
  WHERE 
    unit = "Chief Administrative Officer" OR unit = "Chief Education Program Specialist" OR unit = "Director IV"`;

  try {
    const imgResults = await executeQuery(QUERY);

    if (imgResults.length === 0) {
      return res.status(404).json({ message: "No signatures found" });
    }

    const signatures = imgResults.map((img) => {
      const filePath = path.join(
        __dirname,
        `../uploads/signatures/${img.signature}`
      );

      // Read the file and convert it to base64
      const image = fs.readFileSync(filePath, { encoding: "base64" });
      const mimeType = "image/png"; // Replace with actual mime type if different

      return {
        emp_id: img.emp_id,
        unit: img.unit,
        base64: `data:${mimeType};base64,${image}`,
      };
    });

    res.json({ signatures });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
