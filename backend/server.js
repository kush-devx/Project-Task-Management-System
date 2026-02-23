require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const projectRoutes = require("./routes/projectRoutes.js");
const taskRoutes = require("./routes/taskRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const errorHandler = require("./middleware/errorHandler.js");
const authRoutes = require("./routes/authRoutes.js");
const app = express();

/* -------------------- DATABASE CONNECTION -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

/* -------------------- ROUTES -------------------- */
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/messages", messageRoutes);

/* -------------------- TEST ROUTE -------------------- */
app.get("/", (req, res) => {
  res.send("API Running Successfully 🚀");
});
/* -------------------- GLOBAL ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Server Error"
  });
});

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});