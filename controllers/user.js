import { db } from "../connect.js";
import bcrypt from "bcryptjs";

export const getUserInfo = async (req, res) => {
  const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  try {
    const EMP_ID = req.user.emp_id;
    const USERFINDQUERY = `SELECT e.lastname, e.firstname, e.middlename, e.ext_name, e.unit, e.division,
         ROUND(COALESCE(l.vacation_balance, 0), 2) AS vacation_balance,
         ROUND(COALESCE(l.sick_balance, 0), 2) AS sick_balance,
         ROUND(COALESCE(l.CTO_balance, 0), 2) AS CTO_balance
  FROM employees e
  LEFT JOIN leave_credits l 
      ON e.emp_id = l.emp_id 
  WHERE e.emp_id = ?
  ORDER BY l.credit_id DESC`;

    const [user] = await executeQuery(USERFINDQUERY, [EMP_ID]);

    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getUsername = (req, res) => {
  const EMP_ID = req.user.emp_id;
  const USERFINDQUERY = "SELECT username FROM users WHERE emp_id = ?";

  db.query(USERFINDQUERY, [EMP_ID], (err, user) => {
    if (err) return res.status(500).json({ message: "Server Error" });

    res.status(200).json(user[0]);
  });
};

export const updateUsername = (req, res) => {
  const EMP_ID = req.user.emp_id;
  const USERNAME = req.body.username;
  const GETUSERUSERNAMEQUERY = "SELECT * FROM users WHERE username = ?";
  const USERUPDATEQUERY = "UPDATE users SET username = ? WHERE emp_id = ?";

  db.query(GETUSERUSERNAMEQUERY, [USERNAME], (err, response) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    if (!USERNAME)
      return res
        .status(400)
        .json({ message: "Empty input! Please don't leave blank input." });
    if (response.length)
      return res
        .status(409)
        .json({ message: "Username already taken, please input another." });

    db.query(USERUPDATEQUERY, [USERNAME, EMP_ID], (err, update) => {
      if (err) return res.status(500).json({ message: "Server Error" });

      res.status(200).json({ message: "Username updated!" });
    });
  });
};

export const updatePassword = (req, res) => {
  const EMP_ID = req.user.emp_id;
  const { old_pwd, new_pwd } = req.body;
  const GETUSERPWDQUERY = "SELECT pwd FROM users WHERE emp_id = ?";
  const USERUPDATEQUERY = "UPDATE users SET pwd = ? WHERE emp_id = ?";

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(new_pwd, salt);

  db.query(GETUSERPWDQUERY, [EMP_ID], (err, response) => {
    if (err) return res.status(500).json({ message: "Server Error" });

    const isPwdValid = bcrypt.compareSync(old_pwd, response[0].pwd);

    if (!isPwdValid)
      return res.status(401).json({ message: "Invalid Password!" });

    db.query(USERUPDATEQUERY, [hashedPassword, EMP_ID], (err, update) => {
      if (err) return res.status(500).json({ message: "Server Error" });

      res.status(200).json({ message: "Password Updated!" });
    });
  });
};

export const verifyCredential = (req, res) => {
  const USERID = req.user.id;
  const USERFINDQUERY = "SELECT * FROM users WHERE user_id = ?";

  db.query(USERFINDQUERY, [USERID], (err, user) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    if (user.length === 0)
      return res.status(404).json({ message: "User not found!" });

    res.status(200).json(user[0].role);
  });
};
