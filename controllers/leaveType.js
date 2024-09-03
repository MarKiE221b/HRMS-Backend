import { db } from "../connect.js";

export const getLeaveTypes = (req, res) => {
  const LEAVETYPEQUERY = "SELECT * FROM leave_type";

  db.query(LEAVETYPEQUERY, (err, leaveType) => {
    if (err) return res.status(500).json({ message: "Server Error" });

    res.status(200).json(leaveType);
  });
};
