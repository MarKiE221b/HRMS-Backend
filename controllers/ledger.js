import { db } from "../connect.js";
import { executeQuery } from "../utils/dbUtils.js";
import { parseDateString, recalculateBalances } from "../utils/sortingUtils.js";

export const getAllLedger = async (req, res) => {
  try {
    const EMP_ID = req.user.emp_id;
    const GETLEDGERQUERY = `SELECT 
       l.period, l.particulars, l.remarks,
      ROUND(COALESCE(l.vacation_earned, 0), 2) AS vacation_earned,
      ROUND(COALESCE(l.vacation_AUpay, 0), 2) AS vacation_AUpay,
      ROUND(COALESCE(l.vacation_balance, 0), 2) AS vacation_balance,
      ROUND(COALESCE(l.vacation_AUwopay, 0), 2) AS vacation_AUwopay,
      ROUND(COALESCE(l.sick_earned, 0), 2) AS sick_earned,
      ROUND(COALESCE(l.sick_AUpay, 0), 2) AS sick_AUpay,
      ROUND(COALESCE(l.sick_balance, 0), 2) AS sick_balance,
      ROUND(COALESCE(l.sick_AUwopay, 0), 2) AS sick_AUwopay,
      ROUND(COALESCE(l.CTO_earned, 0), 2) AS CTO_earned,
      ROUND(COALESCE(l.CTO_consumed, 0), 2) AS CTO_consumed,
      ROUND(COALESCE(l.CTO_balance, 0), 2) AS CTO_balance,
      COALESCE(cc.certificate_id, '') AS certificate_id,
      COALESCE(dd.document_id, '') AS document_id
  FROM employees e
  LEFT JOIN leave_credits l
    ON e.emp_id = l.emp_id
  LEFT JOIN cto_certificate cc 
      ON l.certificate_id =cc.certificate_id
  LEFT JOIN leave_documents dd
      ON l.document_id = dd.document_id
  WHERE e.emp_id = ?`;

    const response = await executeQuery(GETLEDGERQUERY, [EMP_ID]);

    response.sort((a, b) => {
      const dateA = parseDateString(a.period);
      const dateB = parseDateString(b.period);

      return dateA - dateB; // Ascending order
    });

    const updatedResponse = recalculateBalances(response);

    res.status(200).json(updatedResponse);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getLedgerPerEmployee = async (req, res) => {
  try {
    const EMP_ID = req.body.emp_id;
    const GETLEDGERQUERY = `SELECT 
       l.credit_id, l.period, l.particulars, l.remarks,
      ROUND(COALESCE(l.vacation_earned, 0), 2) AS vacation_earned,
      ROUND(COALESCE(l.vacation_AUpay, 0), 2) AS vacation_AUpay,
      ROUND(COALESCE(l.vacation_balance, 0), 2) AS vacation_balance,
      ROUND(COALESCE(l.vacation_AUwopay, 0), 2) AS vacation_AUwopay,
      ROUND(COALESCE(l.sick_earned, 0), 2) AS sick_earned,
      ROUND(COALESCE(l.sick_AUpay, 0), 2) AS sick_AUpay,
      ROUND(COALESCE(l.sick_balance, 0), 2) AS sick_balance,
      ROUND(COALESCE(l.sick_AUwopay, 0), 2) AS sick_AUwopay,
      ROUND(COALESCE(l.CTO_earned, 0), 2) AS CTO_earned,
      ROUND(COALESCE(l.CTO_consumed, 0), 2) AS CTO_consumed,
      ROUND(COALESCE(l.CTO_balance, 0), 2) AS CTO_balance,
      COALESCE(cc.certificate_id, '') AS certificate_id,
      COALESCE(dd.document_id, '') AS document_id
  FROM employees e
  LEFT JOIN leave_credits l
    ON e.emp_id = l.emp_id
  LEFT JOIN cto_certificate cc 
      ON l.certificate_id =cc.certificate_id
  LEFT JOIN leave_documents dd
      ON l.document_id = dd.document_id
  WHERE e.emp_id = ?`;

    const response = await executeQuery(GETLEDGERQUERY, [EMP_ID]);

    response.sort((a, b) => {
      const dateA = parseDateString(a.period);
      const dateB = parseDateString(b.period);

      return dateA - dateB; // Ascending order
    });

    const updatedResponse = recalculateBalances(response);

    res.status(200).json(updatedResponse);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const autoUpdateLedger = async (req, res) => {
  const EMP_ID = req.body.emp_id;
  const GETLEDGERQUERY = `SELECT 
       l.credit_id, l.period, l.particulars, l.remarks,
      ROUND(COALESCE(l.vacation_earned, 0), 2) AS vacation_earned,
      ROUND(COALESCE(l.vacation_AUpay, 0), 2) AS vacation_AUpay,
      ROUND(COALESCE(l.vacation_balance, 0), 2) AS vacation_balance,
      ROUND(COALESCE(l.vacation_AUwopay, 0), 2) AS vacation_AUwopay,
      ROUND(COALESCE(l.sick_earned, 0), 2) AS sick_earned,
      ROUND(COALESCE(l.sick_AUpay, 0), 2) AS sick_AUpay,
      ROUND(COALESCE(l.sick_balance, 0), 2) AS sick_balance,
      ROUND(COALESCE(l.sick_AUwopay, 0), 2) AS sick_AUwopay,
      ROUND(COALESCE(l.CTO_earned, 0), 2) AS CTO_earned,
      ROUND(COALESCE(l.CTO_consumed, 0), 2) AS CTO_consumed,
      ROUND(COALESCE(l.CTO_balance, 0), 2) AS CTO_balance,
      COALESCE(cc.certificate_id, '') AS certificate_id,
      COALESCE(dd.document_id, '') AS document_id
  FROM employees e
  LEFT JOIN leave_credits l
    ON e.emp_id = l.emp_id
  LEFT JOIN cto_certificate cc 
      ON l.certificate_id =cc.certificate_id
  LEFT JOIN leave_documents dd
      ON l.document_id = dd.document_id
  WHERE e.emp_id = ?`;

  try {
    const response = await executeQuery(GETLEDGERQUERY, [EMP_ID]);

    response.sort((a, b) => {
      const dateA = parseDateString(a.period);
      const dateB = parseDateString(b.period);

      return dateA - dateB; // Ascending order
    });

    const updatedResponse = recalculateBalances(response);

    const sortedResponse = response.sort((a, b) => a.credit_id - b.credit_id);

    // Merge the updated balances with the sorted credit_ids
    const mergedRecords = sortedResponse.map((record, index) => ({
      credit_id: record.credit_id,
      vacation_balance: updatedResponse[index].vacation_balance,
      sick_balance: updatedResponse[index].sick_balance,
      CTO_balance: updatedResponse[index].CTO_balance,
    }));

    for (const record of mergedRecords) {
      const { vacation_balance, sick_balance, CTO_balance, credit_id } = record;
      const UPDATELEDGERQUERY = `UPDATE leave_credits SET vacation_balance = ?, sick_balance = ?, CTO_balance = ? WHERE credit_id = ?`;
      await executeQuery(UPDATELEDGERQUERY, [
        vacation_balance,
        sick_balance,
        CTO_balance,
        credit_id,
      ]);
    }

    res.status(200).json(updatedResponse);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
