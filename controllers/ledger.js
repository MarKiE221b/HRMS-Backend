import { db } from "../connect.js";

export const getAllLedger = (req, res) => {
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
    COALESCE(cc.certificate_id, '') AS certificate_id
FROM employees e
LEFT JOIN leave_credits l
	ON e.emp_id = l.emp_id
LEFT JOIN cto_certificate cc 
    ON l.certificate_id =cc.certificate_id
WHERE e.emp_id = ?`;

  db.query(GETLEDGERQUERY, [EMP_ID], (err, response) => {
    if (err)
      return res.status(500).json({ message: "Server Error", error: err });

    res.status(200).json(response);
  });
};
