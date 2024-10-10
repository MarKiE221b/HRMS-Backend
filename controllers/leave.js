import { db } from "../connect.js";
import { executeQuery, generateUniqueId } from "../utils/dbUtils.js";

// Helper function to format date to YYYY-MM-DD
const getFormattedDate = () => {
  const date = new Date();
  const [month, day, year] = date
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/");
  return `${year}-${month}-${day}`;
};

// Update employee leave for OIC
export const updateEmployeeLeaveOIC = (req, res) => {
  const { id, OICStatus, CEPSStatus, approvedStatus, remarks } = req.body;
  const query = `
    UPDATE application_leave 
    SET OICStatus = ?, OICStatusDate = ?, 
        CEPSStatus = ?, CEPSStatusDate = ?, 
        approvedStatus = ?, approvedDateModified = ?, 
        notedDetails = ? 
    WHERE app_id = ?
  `;
  const formattedDate = getFormattedDate();

  db.query(
    query,
    [
      OICStatus,
      formattedDate,
      CEPSStatus,
      formattedDate,
      approvedStatus,
      formattedDate,
      remarks,
      id,
    ],
    (err, response) => {
      if (err) return res.status(500).json({ message: "Server Error" });
      res.status(200).json(response);
    }
  );
};

// Update employee leave for CEPS
export const updateEmployeeLeaveCEPS = (req, res) => {
  const { id, CEPSStatus, approvedStatus, remarks } = req.body;
  const query = `
    UPDATE application_leave 
    SET CEPSStatus = ?, CEPSStatusDate = ?, 
        approvedStatus = ?, approvedDateModified = ?, 
        notedDetails = ? 
    WHERE app_id = ?
  `;
  const formattedDate = getFormattedDate();

  db.query(
    query,
    [CEPSStatus, formattedDate, approvedStatus, formattedDate, remarks, id],
    (err, response) => {
      if (err) return res.status(500).json({ message: "Server Error" });
      res.status(200).json(response);
    }
  );
};

// Update employee leave for RD
export const updateEmployeeLeaveRD = async (req, res) => {
  try {
    const { id, approvedStatus, remarks, payType } = req.body;
    const formattedDate = getFormattedDate();
    const payTypeClean = payType ? parseInt(payType) : null;

    console.log(payType);
    const updateStatusQuery = `
      UPDATE application_leave 
      SET approvedStatus = ?, approvedDateModified = ?, 
          approvedDetails = ?, leavePayType = ? 
      WHERE app_id = ?
    `;

    await executeQuery(updateStatusQuery, [
      approvedStatus,
      formattedDate,
      remarks,
      payTypeClean,
      id,
    ]);

    if (approvedStatus === "Declined") {
      return res.status(200).json({ message: "Declined Status" });
    }

    const leaveResult = await executeQuery(
      `
      SELECT emp_id, type_id, inclusive_dates, minus_vacation, minus_sick, minus_CTO 
      FROM application_leave WHERE app_id = ?
    `,
      [id]
    );

    if (!leaveResult.length) {
      return res.status(404).json({ message: "Leave application not found" });
    }

    const {
      emp_id,
      type_id,
      inclusive_dates,
      minus_vacation,
      minus_sick,
      minus_CTO,
    } = leaveResult[0];

    const creditIdResult = await executeQuery(
      `
      SELECT MAX(credit_id) AS max_id 
      FROM leave_credits
    `,
      []
    );
    const nextCreditId = (creditIdResult[0].max_id || 0) + 1;

    const creditResult = await executeQuery(
      `
      SELECT credit_id, vacation_balance, sick_balance, CTO_balance 
      FROM leave_credits 
      WHERE emp_id = ? 
      ORDER BY credit_id DESC
    `,
      [emp_id]
    );

    if (!creditResult.length) {
      return res.status(404).json({ message: "Leave credits not found" });
    }

    const { vacation_balance, sick_balance, CTO_balance } = creditResult[0];
    let newVacationBalance = vacation_balance - minus_vacation;
    let newSickBalance = sick_balance - minus_sick;
    let newCTOBalance = CTO_balance - minus_CTO;

    console.log(newVacationBalance, vacation_balance, minus_vacation);
    const particulars = minus_CTO
      ? `CTO - ${minus_CTO}`
      : minus_vacation
      ? `VL - ${minus_vacation}`
      : minus_sick
      ? `SL - ${minus_sick}`
      : `${type_id.split("0")[0]} - ${no_days}`;

    const updateBalQuery = `
      INSERT INTO leave_credits
      (credit_id, emp_id, period, particulars, 
       vacation_AUpay, vacation_AUwopay, vacation_balance, 
       sick_AUpay, sick_AUwopay, sick_balance, CTO_consumed, CTO_balance)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await executeQuery(updateBalQuery, [
      nextCreditId,
      emp_id,
      inclusive_dates,
      particulars,
      payTypeClean === 0 ? minus_vacation : 0,
      payTypeClean === 1 ? minus_vacation : 0,
      newVacationBalance,
      payTypeClean === 0 ? minus_sick : 0,
      payTypeClean === 1 ? minus_sick : 0,
      newSickBalance,
      minus_CTO,
      newCTOBalance,
    ]);

    res.status(200).json({ message: "Leave and credit updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Upload leave form.
export const uploadLeaveForms = async (req, res) => {
  try {
    const {
      inclusiveDates,
      noRender,
      particulars,
      employee,
      leaveType,
      payCheck,
    } = JSON.parse(req.body.form);

    // file variables
    const fileId = generateUniqueId();
    const fileDate = new Date().toISOString().split("T")[0];

    // file insert query
    const FILEUPINSERTQUERY =
      "INSERT INTO leave_documents(document_id, filename, date_uploaded) VALUES (?, ?, ?)";

    // file query execution
    await executeQuery(FILEUPINSERTQUERY, [
      fileId,
      req.file.filename,
      fileDate,
    ]);

    // query latest id execution
    const creditIdResult = await executeQuery(
      `
      SELECT MAX(credit_id) AS max_id 
      FROM leave_credits
    `,
      []
    );

    // credit id variable
    const nextCreditId = (creditIdResult[0].max_id || 0) + 1;

    // latest balance query execution
    const creditResult = await executeQuery(
      `
      SELECT credit_id, vacation_balance, sick_balance, CTO_balance 
      FROM leave_credits 
      WHERE emp_id = ? 
      ORDER BY credit_id DESC
    `,
      [employee]
    );

    // credit insert query
    const LEAVEINSERTQUERY =
      "INSERT INTO leave_credits(credit_id, emp_id, document_id, period, particulars, vacation_AUpay, vacation_AUwopay, vacation_balance, sick_AUpay, sick_AUwopay, sick_balance, CTO_consumed, CTO_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    //  balance variables
    const { vacation_balance, sick_balance, CTO_balance } = creditResult[0];
    let newVacationBal =
      leaveType === "VC001" ? vacation_balance - noRender : vacation_balance;
    let newSickBal =
      leaveType === "SL003" ? sick_balance - noRender : sick_balance;
    let newCTOBal =
      leaveType === "CTO001" ? CTO_balance - noRender : CTO_balance;

    // leave insert execution
    await executeQuery(LEAVEINSERTQUERY, [
      nextCreditId,
      employee,
      fileId,
      `${inclusiveDates.map((date) => date).join(", ")}`,
      particulars,
      leaveType === "VC001" && payCheck === "true" ? noRender : 0,
      leaveType === "VC001" && payCheck === "false" ? noRender : 0,
      newVacationBal,
      leaveType === "SL003" && payCheck === "true" ? noRender : 0,
      leaveType === "SL003" && payCheck === "false" ? noRender : 0,
      newSickBal,
      leaveType === "CTO001" ? noRender : 0,
      newCTOBal,
    ]);

    res.status(200).json({ message: "Leave and credit updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getLeaveFormsUpload = async (req, res) => {
  try {
    const QUERY = `SELECT CONCAT_WS(' ', e.lastname, e.firstname, IFNULL(e.middlename, ''), e.ext_name) AS full_name, c.period, c.particulars, c.document_id FROM leave_credits c LEFT JOIN employees e ON c.emp_id = e.emp_id WHERE c.document_id <> ''`;
    const response = await executeQuery(QUERY, []);

    res
      .status(200)
      .json({ values: response, message: "Successfully Retrieved Data" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
