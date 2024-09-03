import { db } from "../connect.js";

export const getCTOLedger = (req, res) => {
  const GETCTOQUERY = `SELECT e.lastname, e.firstname, e.middlename, e.ext_name, l.period, l.CTO_earned, cc.certificate_id, cc.date_uploaded 
FROM leave_credits l 
LEFT JOIN employees e 
	ON l.emp_id = e.emp_id
RIGHT JOIN cto_certificate cc
	ON l.certificate_id = cc.certificate_id`;

  db.query(GETCTOQUERY, (err, response) => {
    if (err) return res.status(500).json({ message: "Server Error" });

    const formattedResults = response.map((row) => {
      const { lastname, firstname, middlename, ext_name, ...others } = row;
      const fullname = `${lastname}, ${firstname} ${
        middlename ? middlename + " " : ""
      }${ext_name || ""}`;
      return { fullname, ...others };
    });

    res.status(200).json(formattedResults);
  });
};

export const postUploadCTO = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded or file is not a PDF.");
  }

  // Helper function to execute a query and return a promise
  const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  let employees = [];
  let inputs = {};

  try {
    employees = req.body.array ? JSON.parse(req.body.array) : [];
    inputs = req.body.inputs ? JSON.parse(req.body.inputs) : {};
  } catch (err) {
    return res.status(400).send("Invalid input data.");
  }

  const today = new Date();
  const date = today.toISOString().split("T")[0];

  const CERTIFICATEUPLOADQUERY =
    "INSERT INTO cto_certificate(certificate_id, filename, date_uploaded) VALUES (?, ?, ?)";

  try {
    // Insert certificate record
    await executeQuery(CERTIFICATEUPLOADQUERY, [
      inputs.ROMO_No,
      req.file.filename,
      date,
    ]);

    // Retrieve the highest current credit_id from the database
    const MAXCREDITIDQUERY =
      "SELECT MAX(credit_id) AS max_id FROM leave_credits";
    const [maxCreditIdResult] = await executeQuery(MAXCREDITIDQUERY, []);
    let nextCreditId = (maxCreditIdResult.max_id || 0) + 1;

    // Process employees sequentially
    for (const employee of employees) {
      const calculatedCredits = parseFloat(inputs.hour) / 8;
      const CTOCredits = parseFloat(calculatedCredits.toFixed(2));

      // Get previous credits
      const BALANCEQUERY = `SELECT l.vacation_balance, l.sick_balance, l.CTO_balance 
      FROM employees e
      LEFT JOIN leave_credits l 
        ON e.emp_id = l.emp_id 
      WHERE e.emp_id = ? 
      ORDER BY l.credit_id DESC`;

      const [balanceResult] = await executeQuery(BALANCEQUERY, [
        employee.value,
      ]);

      const CTOBalance = balanceResult
        ? balanceResult.CTO_balance + CTOCredits
        : CTOCredits;

      // Insert into cto_credits
      const CTOCREDITINSERTQUERY = `INSERT INTO leave_credits(credit_id, emp_id, certificate_id, period, particulars, remarks, vacation_balance, sick_balance, CTO_earned, CTO_balance) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await executeQuery(CTOCREDITINSERTQUERY, [
        nextCreditId,
        employee.value,
        inputs.ROMO_No,
        inputs.period,
        "CTO Credit",
        inputs.remarks,
        balanceResult.vacation_balance,
        balanceResult.sick_balance,
        CTOCredits,
        CTOBalance,
      ]);

      // Increment the credit_id for the next iteration
      nextCreditId++;
    }

    res.status(200).json("Success");
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
