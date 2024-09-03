import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routes
import authenticationRoutes from "./routes/authentication.js";
import userRoutes from "./routes/user.js";
import creditHistoryRoutes from "./routes/creditHistory.js";
import leaveTypeRoutes from "./routes/leaveType.js";
import applicationRoutes from "./routes/application.js";
import employeesRoutes from "./routes/employees.js";
import leaveRoutes from "./routes/leave.js";
import ledgerRoutes from "./routes/ledger.js";
import ctoRoutes from "./routes/cto.js";
import pdfViewRoutes from "./routes/pdfView.js";
import imagesViewRoutes from "./routes/imagesView.js";

import { creditScheduler } from "./utils/creditAutoAdd.js";

const app = express();
const port = 3000;

// middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://10.40.1.50:4173",
  "http://10.40.1.50:5173",
  "https://hrms-ched.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(new URL(origin).origin)) {
      callback(null, true); // Allow the request if the origin is in the allowed list or not present (same-origin, server-to-server requests)
    } else {
      callback(new Error("Not allowed by CORS")); // Otherwise reject
    }
  },
  credentials: true, // Allow cookies and other credentials
  methods: ["GET", "POST", "PUT"], // Explicitly allow these methods
};

app.use(cors(corsOptions));

app.use("/api/auth/", authenticationRoutes);
app.use("/api/", userRoutes);
app.use("/api/", creditHistoryRoutes);
app.use("/api/", leaveTypeRoutes);
app.use("/api/", applicationRoutes);
app.use("/api/", employeesRoutes);
app.use("/api/", leaveRoutes);
app.use("/api/", ledgerRoutes);
app.use("/api/", ctoRoutes);
app.use("/api/", pdfViewRoutes);
app.use("/api/", imagesViewRoutes);

creditScheduler();

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the Express server
app.listen(port, "10.40.1.50", () => {
  console.log(`API working on port ${port}`);
});
