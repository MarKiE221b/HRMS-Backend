import { executeQuery } from "../utils/dbUtils.js";
import path from "path";
import { fileURLToPath } from "url";

export const postUploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded or file is not an image.");
  }

  const EMP_ID = req.user.emp_id;

  const QUERY = "UPDATE users SET profileURL = ? WHERE emp_id = ?";

  try {
    await executeQuery(QUERY, [req.file.filename, EMP_ID]);

    res.status(200).json({ message: "Profile picture successfully uploaded!" });
  } catch (error) {
    res.status(500).json({ message: "System Error!", error: error });
  }
};

export const viewAvatar = async (req, res) => {
  const EMP_ID = req.user.emp_id;
  const QUERY = "SELECT profileURL FROM users WHERE emp_id = ?";

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  try {
    const [avatar] = await executeQuery(QUERY, [EMP_ID]);

    const filePath = path.join(
      __dirname,
      `../uploads/pictures/${avatar.profileURL}`
    );
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: "System Error!", error: error });
  }
};
