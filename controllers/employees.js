import { db } from "../connect.js";

export const getEmployeesCount = (req, res) => {
  const GETCOUNTQUERY = "SELECT COUNT(*) as no_employees FROM employees";

  db.query(GETCOUNTQUERY, (err, response) => {
    if (err) return res.status(500).json({ message: "Server Error" });

    res.status(200).json(response);
  });
};

export const getEmployeesList = (req, res) => {
  const GETCOUNTQUERY =
    "SELECT emp_id, CONCAT_WS(' ', e.lastname, e.firstname, IF(e.middlename IS NOT NULL, e.middlename, ''), e.ext_name) AS full_name, unit, division FROM employees e";

  db.query(GETCOUNTQUERY, (err, response) => {
    if (err) return res.status(500).json({ message: "Server Error" });

    res.status(200).json(response);
  });
};

export const getEmpDetails = (req, res) => {
  const GETDETAILQUERY = "SELECT * FROM employees WHERE emp_id = ?";

  db.query(GETDETAILQUERY, [req.body.id], (err, response) => {
    if (err) return res.status(500).json({ message: "Server Error" });

    res.status(200).json(response);
  });
};

export const uploadSignature = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded or file is not a png.");
  }

  const EMP_ID = req.user.emp_id;
  const QUERY = "UPDATE employees SET signature = ? WHERE emp_id = ?";

  const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  try {
    await executeQuery(QUERY, [req.file.filename, EMP_ID]);

    res.status(200).json("Upload successfully saved!");
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
