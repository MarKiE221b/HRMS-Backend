import mysql from "mysql";

export const db = mysql.createPool({
  host: "mysql.db.mdbgo.com",
  // host: "localhost",
  port: "3306",
  user: "markie0223_cheddb",
  // user: "root",
  password: "Elijah143!",
  // password: "",
  // database: "mamark12x_testhrms",
  database: "markie0223_chedhrmsdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

setInterval(() => {
  db.query("SELECT 1", (err) => {
    if (err) {
      console.error("Keep-alive query error:", err);
    }
  });
}, 120000);
