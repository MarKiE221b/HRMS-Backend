import { db } from "../connect.js";

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

// Helper function to execute a query with a promise
const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
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
