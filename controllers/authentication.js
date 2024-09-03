import bcrypt from "bcryptjs";
import { db } from "../connect.js";
import { generateToken } from "../utils/authUtils.js";

export const login = (req, res) => {
  const { user_id, pwd } = req.body;

  const USERFINDQUERY = "SELECT * FROM users WHERE username = ?";
  db.query(USERFINDQUERY, [user_id], (err, user) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    if (user.length === 0)
      return res.status(404).json({ message: "User not found!" });

    const isPwdValid = bcrypt.compareSync(pwd, user[0].pwd);

    if (!isPwdValid) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = generateToken(user[0]);
    const { emp_id, role } = user[0];
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: false,
        // sameSite: "none",
        path: "/",
      })
      .status(200)
      .json({ user: { emp_id, role } });
  });
};

export const logout = (req, res) => {
  res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      // sameSite: "none",
      path: "/",
    })
    .status(200)
    .json({ message: "Logout!" });
};
