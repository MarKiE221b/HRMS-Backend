import { db } from "../connect.js";

// export const getCreditInfo = (req, res) => {
//   const EMP_ID = req.user.emp_id;
//   const USERVACCREDQUERY =
//     "SELECT period, particulars, vacation_earned FROM leave_credits WHERE emp_id = ? ORDER BY credit_id DESC";

//   db.query(USERVACCREDQUERY, [EMP_ID], (err, cred_vac) => {
//     if (err) return res.status(500).json({ message: "Server Error" });

//     const USERSICKCREDQUERY =
//       "SELECT period, particulars, sick_earned FROM leave_credits WHERE emp_id = ? ORDER BY credit_id DESC";
//     db.query(USERSICKCREDQUERY, [EMP_ID], (err, cred_sick) => {
//       if (err) return res.status(500).json({ message: "Server Error" });

//       // Merge the two arrays
//       const combinedResult = [...cred_vac, ...cred_sick];

//       // Sort the combined result by period and particulars
//       combinedResult.sort((a, b) => {
//         if (a.period === b.period) {
//           return a.particulars.localeCompare(b.particulars);
//         }
//         return a.period.localeCompare(b.period);
//       });

//       res.status(200).json(combinedResult);
//     });
//   });
// };
