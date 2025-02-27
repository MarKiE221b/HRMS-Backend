import { db } from "./../connect.js";
import cron from "node-cron";

const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const getMaxCreditId = async () => {
  const MAXCREDITIDQUERY = "SELECT MAX(credit_id) AS max_id FROM leave_credits";
  const [result] = await executeQuery(MAXCREDITIDQUERY);

  return (result.max_id || 0) + 1;
};

const getEmployeeBalances = async () => {
  const CREDITBALQUERY = `
    SELECT employees.emp_id, 
           COALESCE(MAX(leave_credits.vacation_balance), 0) AS vacation_balance, 
           COALESCE(MAX(leave_credits.sick_balance), 0) AS sick_balance,
           COALESCE(MAX(leave_credits.CTO_balance), 0) AS CTO_balance,
           COALESCE(MAX(leave_credits.personal_balance), 0) AS personal_balance,
           COALESCE(MAX(leave_credits.forced_balance), 0) AS forced_balance
    FROM employees 
    LEFT JOIN leave_credits ON employees.emp_id = leave_credits.emp_id 
    GROUP BY employees.emp_id`;

  return executeQuery(CREDITBALQUERY);
};

const insertCreditBalance = async (creditId, employeeData) => {
  const INSERTQUERYBALANCE = `REPLACE INTO leave_credits (
  credit_id, emp_id, period, particulars, remarks, vacation_earned, vacation_AUpay, vacation_AUwopay, 
  vacation_balance, sick_earned, sick_AUpay, sick_AUwopay, sick_balance, personal_AUpay, personal_AUwopay, personal_balance, forced_AUpay, forced_AUwopay, forced_balance, CTO_balance
) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? FROM employees e WHERE e.emp_id != '001' AND e.emp_id != '002'`;

  const {
    emp_id,
    vacation_balance,
    sick_balance,
    personal_balance,
    forced_balance,
    CTO_balance,
  } = employeeData;
  const currentDate = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const period = `${currentMonthName} ${currentDate.getFullYear()}`;

  const values = [
    creditId,
    emp_id,
    "October 2024",
    "Credits Earned",
    "Automated monthly update",
    1.25,
    0,
    0,
    vacation_balance + 1.25,
    1.25,
    0,
    0,
    sick_balance + 1.25,
    0,
    0,
    personal_balance,
    0,
    0,
    forced_balance,
    CTO_balance,
  ];

  return executeQuery(INSERTQUERYBALANCE, values);
};

const creditAdd = async () => {
  try {
    let nextCreditId = await getMaxCreditId();
    const employeeBalances = await getEmployeeBalances();

    await Promise.all(
      employeeBalances.map((row) => {
        console.log(nextCreditId++, row);

        insertCreditBalance(nextCreditId++, row);
      })
    );
  } catch (err) {
    console.error("Error during credit update", err);
  }
};

export const creditScheduler = () => {
  cron.schedule("59 23 28-31 * *", () => {
    const now = new Date();
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    if (now.getDate() === lastDayOfMonth) {
      creditAdd();
    }
  });
};
