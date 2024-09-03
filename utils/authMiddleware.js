import jwt from "jsonwebtoken";
import { secretKey } from "../config/jwtConfig.js";

export const authenticateToken = (req, res, next) => {
  const token = req.cookies["accessToken"];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing Token" });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    req.user = user;
    next();
  });
};
