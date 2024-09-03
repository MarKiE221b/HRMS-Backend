import { db } from "../connect.js";
import { formatDate, getCurrentFormattedDate } from "../utils/dateUtils.js";
import { executeQuery } from "../utils/dbUtils.js";

export const application = (req, res) => {
  const EMP_ID = req.user.emp_id;
  const { type_id, details, inclusive_dates, detailsRadio, division } =
    req.body;

  const leaveTypes = {
    SL003: "minus_sick",
    VC001: "minus_vacation",
    CTO001: "minus_CTO",
  };

  const leaveBalance = {
    minus_vacation: 0,
    minus_sick: 0,
    minus_CTO: 0,
    [leaveTypes[type_id]]: inclusive_dates.length,
  };

  const INSERTAPPQUERY = `
    INSERT INTO application_leave (
      emp_id, type_id, detailsOption, details, no_days, inclusive_dates,
      minus_vacation, minus_sick, minus_CTO, OICStatus, OICStatusDate,
      CEPSStatus, CEPSStatusDate, approvedStatus, approvedDateModified, dateFiling
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const currentDate = getCurrentFormattedDate();

  db.query(
    INSERTAPPQUERY,
    [
      EMP_ID,
      type_id,
      detailsRadio,
      details,
      inclusive_dates.length,
      `${inclusive_dates.map((date) => date).join(", ")}`,
      leaveBalance.minus_vacation,
      leaveBalance.minus_sick,
      leaveBalance.minus_CTO,
      "Pending",
      currentDate,
      division === "Technical" ? "Pending" : "",
      division === "Technical" ? currentDate : "",
      "Pending",
      currentDate,
      currentDate,
    ],
    (err) => {
      if (err)
        return res.status(500).json({ message: "Server Error", error: err });
      res.status(200).json({ message: "Successfully submitted!" });
    }
  );
};

export const getApplication = (req, res) => {
  const EMP_ID = req.user.emp_id;
  const GETAPPLICANTSQUERY = `
    SELECT a.app_id, t.type, a.no_days, a.inclusive_dates, a.details,
           a.OICStatus, a.OICStatusDate, a.CEPSStatus, a.CEPSStatusDate,
           a.approvedStatus, a.approvedDateModified, e.division
    FROM application_leave a
    LEFT JOIN leave_type t ON a.type_id = t.type_id
    LEFT JOIN employees e ON a.emp_id = e.emp_id
    WHERE e.emp_id = ?;
  `;

  db.query(GETAPPLICANTSQUERY, [EMP_ID], (err, response) => {
    if (err)
      return res.status(500).json({ message: "Server Error", error: err });

    const formattedResponse = response.map((applicant) => ({
      ...applicant,
      OICStatusDate: formatDate(applicant.OICStatusDate),
      CEPSStatusDate: formatDate(applicant.CEPSStatusDate),
      approvedDateModified: formatDate(applicant.approvedDateModified),
    }));

    res.status(200).json(formattedResponse);
  });
};

export const getEmployeeApplication = (req, res) => {
  const EMP_ID = req.user.emp_id;
  const CONFIRMDIV = "SELECT division FROM employees WHERE emp_id = ?";
  const GETAPPLICANTIONQUERY = `
    SELECT a.app_id, CONCAT_WS(' ', e.lastname, e.firstname, IFNULL(e.middlename, ''), e.ext_name) AS full_name,
           e.division, t.type, a.no_days, a.inclusive_dates, a.OICStatus, a.OICStatusDate,
           a.CEPSStatus, a.CEPSStatusDate, a.approvedStatus, a.approvedDateModified
    FROM application_leave a
    LEFT JOIN leave_type t ON a.type_id = t.type_id
    LEFT JOIN employees e ON a.emp_id = e.emp_id
    WHERE e.division = ?
    ORDER BY app_id DESC;
  `;
  const APPLICATIONQUERYFORADMIN = `
    SELECT a.app_id, CONCAT_WS(' ', e.lastname, e.firstname, IFNULL(e.middlename, ''), e.ext_name) AS full_name,
           e.division, t.type, a.no_days, a.inclusive_dates, a.OICStatus, a.OICStatusDate,
           a.CEPSStatus, a.CEPSStatusDate, a.approvedStatus, a.approvedDateModified
    FROM application_leave a
    LEFT JOIN leave_type t ON a.type_id = t.type_id
    LEFT JOIN employees e ON a.emp_id = e.emp_id
    ORDER BY app_id DESC;
  `;

  db.query(CONFIRMDIV, [EMP_ID], (err, divisionResult) => {
    if (err)
      return res.status(500).json({ message: "Server Error", error: err });

    const query =
      divisionResult[0].division === "Admin"
        ? APPLICATIONQUERYFORADMIN
        : GETAPPLICANTIONQUERY;
    const params =
      divisionResult[0].division === "Admin"
        ? []
        : [divisionResult[0].division];

    db.query(query, params, (err, response) => {
      if (err)
        return res.status(500).json({ message: "Server Error", error: err });

      const formattedResponse = response.map((applicant) => ({
        ...applicant,
        OICStatusDate: formatDate(applicant.OICStatusDate),
        CEPSStatusDate: formatDate(applicant.CEPSStatusDate),
        approvedDateModified: formatDate(applicant.approvedDateModified),
      }));

      res.status(200).json(formattedResponse);
    });
  });
};

export const getAllApplication = (req, res) => {
  const GETALLQUERY = `
    SELECT a.app_id, CONCAT_WS(' ', e.lastname, e.firstname, IFNULL(e.middlename, ''), e.ext_name) AS full_name,
           e.division, t.type, a.no_days, a.inclusive_dates, a.details,
           a.OICStatus, a.OICStatusDate, a.CEPSStatus, a.CEPSStatusDate,
           a.approvedStatus, a.approvedDateModified
    FROM application_leave a
    LEFT JOIN leave_type t ON a.type_id = t.type_id
    LEFT JOIN employees e ON a.emp_id = e.emp_id;
  `;

  db.query(GETALLQUERY, (err, response) => {
    if (err) return res.status(500).json({ message: "Server Error" });

    const formattedResponse = response.map((applicant) => ({
      ...applicant,
      OICStatusDate: formatDate(applicant.OICStatusDate),
      CEPSStatusDate: formatDate(applicant.CEPSStatusDate),
      approvedDateModified: formatDate(applicant.approvedDateModified),
    }));

    res.status(200).json(formattedResponse);
  });
};

export const pendingNotifCount = async (req, res) => {
  const emp_id = req.user.emp_id;
  const divisionMap = {
    2024001: "Admin",
    2024012: "Technical",
  };
  const division = divisionMap[emp_id] || "";

  const COUNTOICQUERY = `
    SELECT COUNT(app_id) AS notifCount
    FROM application_leave
    WHERE OICStatus = "Pending";
  `;

  const COUNTCEPSQUERY = `
    SELECT COUNT(app_id) AS notifCount
    FROM application_leave 
    LEFT JOIN employees ON application_leave.emp_id = employees.emp_id
    WHERE employees.division = "Technical" AND CEPSStatus = "Pending";
  `;

  try {
    if (division === "Admin") {
      const [OICCountResponse] = await executeQuery(COUNTOICQUERY);
      return res.status(200).json(OICCountResponse);
    } else {
      const [CEPSCountResponse] = await executeQuery(COUNTCEPSQUERY);
      return res.status(200).json(CEPSCountResponse);
    }
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const pendingCountApprovedNotif = async (req, res) => {
  const GETCOUNTQUERY = `
    SELECT COUNT(app_id) AS countApproved
    FROM application_leave
    WHERE approvedStatus = "Pending";
  `;

  try {
    const [response] = await executeQuery(GETCOUNTQUERY);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const leaveFormApplication = (req, res) => {
  const QUERY = `
    SELECT e.emp_id, e.unit, e.division, e.lastname, e.firstname, e.middlename, a.type_id, a.detailsOption,
           a.details, a.no_days, a.inclusive_dates, a.minus_vacation, a.minus_sick, a.minus_CTO,
           a.OICStatus, a.OICStatusDate, a.CEPSStatus, a.CEPSStatusDate, a.notedDetails, 
           a.approvedStatus, a.approvedDateModified, a.approvedDetails, a.leavePayType, 
           a.dateFiling, c.vacation_balance, c.sick_balance, c.CTO_balance
    FROM application_leave a
    LEFT JOIN employees e ON a.emp_id = e.emp_id
    LEFT JOIN leave_credits c ON e.emp_id = c.emp_id AND c.credit_id = (
      SELECT MAX(credit_id) FROM leave_credits WHERE emp_id = e.emp_id
    )
    WHERE a.app_id = ?;
  `;

  const { id } = req.body;

  db.query(QUERY, [id], (err, response) => {
    if (err)
      return res.status(500).json({ message: "Server Error", error: err });

    const formattedResponse = response.map((applicant) => ({
      ...applicant,
      OICStatusDate: formatDate(applicant.OICStatusDate),
      CEPSStatusDate: formatDate(applicant.CEPSStatusDate),
      approvedDateModified: formatDate(applicant.approvedDateModified),
      dateFiling: formatDate(applicant.dateFiling),
    }));

    res.status(200).json(formattedResponse[0]);
  });
};
